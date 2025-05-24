import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (LSTM, Dense, Dropout, BatchNormalization, 
                                    Input, MultiHeadAttention, LayerNormalization)
from tensorflow.keras.callbacks import (EarlyStopping, ReduceLROnPlateau, 
                                       ModelCheckpoint, TensorBoard)
from tensorflow.keras.regularizers import l2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import backend as K
from datetime import timedelta
import tensorflow_probability as tfp
import io
import os
from typing import Tuple
from .redis_client import redis_client  # Assuming redis_client is defined in another module

# Disable GPU if you're having CUDA issues (remove if you want GPU acceleration)
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

tfd = tfp.distributions

class ProbabilisticOutputLayer(tf.keras.layers.Layer):
    def __init__(self, future_steps, **kwargs):
        super(ProbabilisticOutputLayer, self).__init__(**kwargs)
        self.future_steps = future_steps
        
    def build(self, input_shape):
        self.dense = Dense(2 * self.future_steps)
        super().build(input_shape)
        
    def call(self, inputs):
        params = self.dense(inputs)
        loc = params[..., :self.future_steps]
        scale = 1e-3 + tf.nn.softplus(params[..., self.future_steps:])
        return tf.stack([loc, scale], axis=-1)

def negative_log_likelihood(y_true, y_pred):
    """Negative log likelihood loss function for probabilistic output"""
    loc = y_pred[..., 0]
    scale = y_pred[..., 1]
    dist = tfd.Normal(loc=loc, scale=scale)
    return -dist.log_prob(y_true)

def forecast_stock(symbol: str, days: int) -> pd.DataFrame:
    """
    Forecast stock prices using a probabilistic LSTM model.
    
    Args:
        symbol: Stock symbol to forecast
        days: Number of days to forecast
        redis_client: Redis client instance for data access
        
    Returns:
        DataFrame with forecasted values and confidence intervals
    """
    redis_key = f"quotes:{symbol}"
    raw_data = redis_client.get(redis_key)
    
    if not raw_data:
        raise ValueError(f"No data found for {symbol}")
    
    try:
        df = pd.read_json(io.StringIO(raw_data.decode("utf-8")))
    except Exception as e:
        raise ValueError(f"Error parsing JSON data: {str(e)}")

    # Data preparation
    df.rename(columns={"date": "ds", "adjclose": "y"}, inplace=True)
    df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)
    df = df.sort_values("ds").drop_duplicates("ds")
    df.set_index("ds", inplace=True)
    df["y"] = df["y"].interpolate(method="time").bfill()
    df.reset_index(inplace=True)

    if len(df) < 200:
        raise ValueError("Insufficient historical data (need at least 200 days)")
    
    # Feature Engineering
    df['returns'] = df['y'].pct_change(fill_method=None)
    df['volatility'] = df['returns'].rolling(5).std()
    df['momentum'] = df['y'] - df['y'].shift(5)

    for window in [5, 10, 20]:
        df[f'sma_{window}'] = df['y'].rolling(window).mean()
        df[f'min_{window}'] = df['y'].rolling(window).min()
        df[f'max_{window}'] = df['y'].rolling(window).max()

    if 'volume' in df.columns:
        df['volume_pct'] = df['volume'].pct_change(fill_method=None)
        df['volume_ma'] = df['volume'].rolling(5).mean()

    df = df.dropna()
    
    # Feature Selection & Scaling
    feature_columns = [
        'y', 'returns', 'volatility', 'momentum',
        'sma_5', 'sma_10', 'sma_20',
        'min_5', 'min_10', 'min_20',
        'max_5', 'max_10', 'max_20'
    ]

    if 'volume' in df.columns:
        feature_columns.extend(['volume_pct', 'volume_ma'])

    scalers = {}
    for col in feature_columns:
        scaler = RobustScaler()
        values = df[col].values.reshape(-1, 1)
        values[np.isnan(values)] = 0
        values[np.isinf(values)] = 0
        df[f"scaled_{col}"] = scaler.fit_transform(values)
        scalers[col] = scaler

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    # Sequence Preparation
    SEQ_LEN = 60
    FUTURE_STEPS = days

    def create_sequences(data, targets, seq_length):
        X, y = [], []
        for i in range(seq_length, len(data) - FUTURE_STEPS + 1):
            X.append(data[i-seq_length:i])
            y.append(targets[i:i+FUTURE_STEPS])
        return np.array(X), np.array(y)

    scaled_data = df[[f"scaled_{col}" for col in feature_columns]].values
    target_data = df["scaled_y"].values

    X, y = create_sequences(scaled_data, target_data, SEQ_LEN)
    train_size = int(0.7 * len(X))
    val_size = int(0.15 * len(X))

    X_train, X_val, X_test = X[:train_size], X[train_size:train_size+val_size], X[train_size+val_size:]
    y_train, y_val, y_test = y[:train_size], y[train_size:train_size+val_size], y[train_size+val_size:]

    # Model Architecture
    def create_model(input_shape, future_steps, num_features):
        inputs = Input(shape=input_shape)
        
        # LSTM layers
        lstm1 = LSTM(256, return_sequences=True, kernel_regularizer=l2(0.01))(inputs)
        lstm1 = BatchNormalization()(lstm1)
        lstm1 = Dropout(0.3)(lstm1)

        lstm2 = LSTM(128, return_sequences=True, kernel_regularizer=l2(0.01))(lstm1)
        lstm2 = BatchNormalization()(lstm2)
        lstm2 = Dropout(0.3)(lstm2)

        # Attention mechanism
        attention = MultiHeadAttention(num_heads=4, key_dim=64)(lstm2, lstm2)
        attention = LayerNormalization()(attention + lstm2)

        lstm3 = LSTM(64, return_sequences=False, kernel_regularizer=l2(0.01))(attention)
        lstm3 = BatchNormalization()(lstm3)
        lstm3 = Dropout(0.3)(lstm3)

        # Dense layers
        dense1 = Dense(128, activation='swish')(lstm3)
        dense1 = BatchNormalization()(dense1)
        dense1 = Dropout(0.2)(dense1)

        dense2 = Dense(64, activation='swish')(dense1)
        dense2 = BatchNormalization()(dense2)
        dense2 = Dropout(0.2)(dense2)

        # Probabilistic output
        output = ProbabilisticOutputLayer(future_steps)(dense2)
        
        model = Model(inputs=inputs, outputs=output)
        model.compile(optimizer=Adam(learning_rate=0.001), loss=negative_log_likelihood)
        
        return model

    model = create_model(
        input_shape=(SEQ_LEN, len(feature_columns)),
        future_steps=FUTURE_STEPS,
        num_features=len(feature_columns)
    )

    # Callbacks
    callbacks = [
        EarlyStopping(patience=15, restore_best_weights=True, monitor='val_loss'),
        ReduceLROnPlateau(factor=0.5, patience=5, min_lr=1e-6),
        ModelCheckpoint(f'best_model_{symbol}.h5', save_best_only=True),
        TensorBoard(log_dir=f'./logs/{symbol}')
    ]

    # Model Training
    history = model.fit(
        X_train, y_train,
        epochs=100,
        batch_size=64,
        validation_data=(X_val, y_val),
        callbacks=callbacks,
        verbose=1
    )

    # Forecasting
    last_sequence = scaled_data[-SEQ_LEN:]
    num_samples = 100
    predictions = []

    for _ in range(num_samples):
        pred = model(last_sequence[np.newaxis, ...])
        # Extract location parameter (mean) from the distribution
        predictions.append(pred[..., 0].numpy()[0])

    predictions = np.array(predictions)
    predictions = scalers['y'].inverse_transform(predictions.reshape(-1, 1)).reshape(num_samples, FUTURE_STEPS)

    mean_predictions = np.mean(predictions, axis=0)
    std_predictions = np.std(predictions, axis=0)

    last_date = df["ds"].iloc[-1]
    forecast_dates = [last_date + timedelta(days=i+1) for i in range(FUTURE_STEPS)]

    forecast_df = pd.DataFrame({
        "ds": forecast_dates,
        "yhat": mean_predictions,
        "yhat_lower": mean_predictions - 1.96 * std_predictions,
        "yhat_upper": mean_predictions + 1.96 * std_predictions
    })

    # Evaluation
    test_pred = model(X_test)
    test_pred_mean = test_pred[..., 0].numpy()  # Get the mean predictions
    test_pred_mean = scalers['y'].inverse_transform(test_pred_mean.reshape(-1, 1)).reshape(-1, FUTURE_STEPS)

    from sklearn.metrics import mean_absolute_error, mean_squared_error
    test_actual = scalers['y'].inverse_transform(y_test[:, 0].reshape(-1, 1)).flatten()
    test_pred = test_pred_mean[:, 0]

    mae = mean_absolute_error(test_actual, test_pred)
    rmse = np.sqrt(mean_squared_error(test_actual, test_pred))

    print(f"\nTest Metrics for {symbol}:")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")

    return forecast_df