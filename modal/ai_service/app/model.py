import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    LSTM, Dense, Dropout, BatchNormalization, Input, 
    MultiHeadAttention, LayerNormalization, Add, 
    Conv1D, Concatenate, Bidirectional
)
from tensorflow.keras.callbacks import (
    EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, TensorBoard
)
from tensorflow.keras.regularizers import l2
from tensorflow.keras.optimizers import Adam
from datetime import timedelta
import io
import os
from typing import Tuple
from .redis_client import redis_client
from datetime import datetime, timedelta


os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # Disable GPU for consistency

# Technical Indicator Calculations
def compute_rsi(series, window=14):
    delta = series.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    
    avg_gain = gain.rolling(window, min_periods=1).mean()
    avg_loss = loss.rolling(window, min_periods=1).mean()
    
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def compute_macd(series, slow=26, fast=12, signal=9):
    ema_fast = series.ewm(span=fast, min_periods=1).mean()
    ema_slow = series.ewm(span=slow, min_periods=1).mean()
    macd = ema_fast - ema_slow
    signal_line = macd.ewm(span=signal, min_periods=1).mean()
    return macd, signal_line

def create_model(input_shape, future_steps, num_features):
    inputs = Input(shape=input_shape)
    
    # Bidirectional LSTM with residual connection
    x = Bidirectional(LSTM(128, return_sequences=True))(inputs)
    x = LayerNormalization()(x)
    res = x
    
    # Temporal Attention with skip connection
    attn = MultiHeadAttention(num_heads=4, key_dim=64)(x, x)
    attn = LayerNormalization()(attn + x)
    
    # Convolutional processing
    conv = Conv1D(128, 3, activation='swish', padding='same')(attn)
    conv = BatchNormalization()(conv)
    
    # Final LSTM processing
    lstm_out = LSTM(128, return_sequences=False)(conv)
    lstm_out = BatchNormalization()(lstm_out)
    lstm_out = Dropout(0.3)(lstm_out)
    
    # Multi-horizon forecasting
    outputs = []
    for _ in range(future_steps):
        h = Dense(64, activation='swish')(lstm_out)
        h = BatchNormalization()(h)
        outputs.append(Dense(1)(h))
    
    output = Concatenate()(outputs)
    model = Model(inputs=inputs, outputs=output)
    
    model.compile(optimizer=Adam(0.001), 
                 loss='huber',
                 metrics=['mae'])
    return model

def forecast_stock(symbol: str, days: int) -> pd.DataFrame:
    try:
        # 1. Data Loading
        redis_key = f"quotes:{symbol}"
        raw_data = redis_client.get(redis_key)
        
        if not raw_data:
            raise ValueError(f"No data found for {symbol}")
        
        df = pd.read_json(io.StringIO(raw_data.decode("utf-8")))

        # 2. Data Cleaning
        df.rename(columns={"date": "ds", "adjclose": "y"}, inplace=True)
        df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)
        df = df.sort_values("ds").drop_duplicates("ds")
        df.set_index("ds", inplace=True)
        df["y"] = df["y"].interpolate(method="time").bfill()
        df.reset_index(inplace=True)

        if len(df) < 200:
            raise ValueError("Insufficient historical data (need at least 200 days)")
        
        # 3. Feature Engineering
        df['returns'] = df['y'].pct_change(fill_method=None)
        df['log_returns'] = np.log1p(df['returns'])
        df['volatility'] = df['returns'].rolling(5, min_periods=1).std()
        df['momentum'] = df['y'] - df['y'].shift(5)
        df['rsi'] = compute_rsi(df['y'])
        df['macd'], df['signal'] = compute_macd(df['y'])
        
        for window in [5, 10, 20]:
            df[f'sma_{window}'] = df['y'].rolling(window, min_periods=1).mean()
            df[f'min_{window}'] = df['y'].rolling(window, min_periods=1).min()
            df[f'max_{window}'] = df['y'].rolling(window, min_periods=1).max()
            df[f'volatility_{window}'] = df['returns'].rolling(window, min_periods=1).std()

        if 'volume' in df.columns:
            df['volume_pct'] = df['volume'].pct_change(fill_method=None)
            df['volume_ma'] = df['volume'].rolling(5, min_periods=1).mean()

        # Handle remaining NaN/inf values
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        df.fillna(method='ffill', inplace=True)
        df.fillna(method='bfill', inplace=True)
        df.fillna(0, inplace=True)  # For any remaining NaNs at start
        
        # 4. Feature Selection
        feature_columns = [
            'y', 'returns', 'log_returns', 'volatility', 'momentum', 'rsi',
            'macd', 'signal', 'sma_5', 'sma_10', 'sma_20',
            'min_5', 'min_10', 'min_20', 'max_5', 'max_10', 'max_20',
            'volatility_5', 'volatility_10', 'volatility_20'
        ]
        
        if 'volume' in df.columns:
            feature_columns.extend(['volume_pct', 'volume_ma'])

        # 5. Scaling
        scalers = {}
        feature_columns = [col for col in df.columns if col != 'y']
        for col in feature_columns:
            scaler = RobustScaler()
            df[col] = scaler.fit_transform(df[col].values.reshape(-1, 1))
            scalers[col] = scaler

        # Scale y separately
        y_scaler = RobustScaler()
        df["y"] = y_scaler.fit_transform(df["y"].values.reshape(-1, 1))
        scalers['y'] = y_scaler

        # 6. Sequence Creation
        SEQ_LEN = 60
        FUTURE_STEPS = days
        
        def create_sequences(data, targets, seq_length):
            X, y = [], []
            for i in range(seq_length, len(data) - FUTURE_STEPS + 1):
                X.append(data[i-seq_length:i])
                y.append(targets[i:i+FUTURE_STEPS])
            return np.array(X), np.array(y)
        
        scaled_data = df[feature_columns].values
        target_data = df["y"].values
        
        X, y = create_sequences(scaled_data, target_data, SEQ_LEN)
        train_size = int(0.7 * len(X))
        val_size = int(0.15 * len(X))
        
        X_train, y_train = X[:train_size], y[:train_size]
        X_val, y_val = X[train_size:train_size+val_size], y[train_size:train_size+val_size]
        X_test, y_test = X[train_size+val_size:], y[train_size+val_size:]

        # 7. Model Training
        model = create_model(
            input_shape=(SEQ_LEN, len(feature_columns)),
            future_steps=FUTURE_STEPS,
            num_features=len(feature_columns))
        
        callbacks = [
            EarlyStopping(patience=15, restore_best_weights=True),
            ReduceLROnPlateau(factor=0.5, patience=5),
            # ModelCheckpoint(f'best_model_{symbol}.h5', save_best_only=True)
        ]
        
        history = model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=100,
            batch_size=32,
            callbacks=callbacks,
            verbose=1
        )
        
        # 8. Forecasting
        last_sequence = scaled_data[-SEQ_LEN:]
        predictions = model.predict(last_sequence[np.newaxis, ...])
        predictions = scalers['y'].inverse_transform(predictions.reshape(-1, 1)).flatten()
        # mean_pred = np.mean(predictions, axis=0)
        # std_pred = np.std(predictions, axis=0)

        # 9. Format Results
        # last_date = df["ds"].iloc[-1]
        last_date = pd.to_datetime(df['ds'].iloc[-1]).replace(tzinfo=None)
        print(df[['ds', 'y']].tail(10))

        if isinstance(last_date, float):
            # If float is a UNIX timestamp (seconds), convert it:
            last_date = datetime.fromtimestamp(last_date)
        elif isinstance(last_date, str):
            # Parse string date
            last_date = datetime.fromisoformat(last_date)
        forecast_dates = [last_date + timedelta(days=i+1) for i in range(FUTURE_STEPS)]
        
        forecast_df = pd.DataFrame({
            "ds": forecast_dates,
            "yhat": predictions,
             "yhat_lower":  predictions - 1.96 * 0.02, 
            "yhat_upper":  predictions + 1.96 * 0.02  
        })
        
        # 10. Evaluation
        test_pred = model.predict(X_test)
        test_pred = scalers['y'].inverse_transform(test_pred)
        test_actual = scalers['y'].inverse_transform(y_test[:, 0].reshape(-1, 1))
        
        mae = mean_absolute_error(test_actual, test_pred[:, 0])
        rmse = np.sqrt(mean_squared_error(test_actual, test_pred[:, 0]))
        
        print(f"\nTest Metrics for {symbol}:")
        print(f"MAE: {mae:.2f}")
        print(f"RMSE: {rmse:.2f}")
        print("Original y range:", df['y'].min(), df['y'].max())
        print("Predicted values range (after inverse transform):", predictions.min(), predictions.max())

        return forecast_df
    
    except Exception as e:
        raise RuntimeError(f"Forecasting failed for {symbol}: {str(e)}")
    
def forecast_until(symbol: str, target_date_str: str) -> pd.DataFrame:
    try:
        # 1. Parse target date (date only)
        target_date = pd.to_datetime(target_date_str).date()
        print(f"Target date: {target_date}")
        
        # 2. Load Redis data
        redis_key = f"quotes:{symbol}"
        raw_data = redis_client.get(redis_key)

        if not raw_data:
            raise ValueError(f"No data found for {symbol}")
        print(raw_data.decode("utf-8")[:1000])  # Check for "adjclose" values

        df = pd.read_json(io.StringIO(raw_data.decode("utf-8")))
        df.rename(columns={"date": "ds", "adjclose": "y"}, inplace=True)
        
        # Convert to datetime first for proper sorting
        df["ds"] = pd.to_datetime(df["ds"])
        df = df.sort_values("ds").drop_duplicates("ds")
        
        # Set datetime index for interpolation
        df.set_index("ds", inplace=True)
        
        # Use linear interpolation instead of time-based
        df["y"] = df["y"].interpolate(method="linear").bfill()
        
        # Convert back to date objects after interpolation
        df.reset_index(inplace=True)
        df["ds"] = df["ds"].dt.date

        if df.empty:
            raise ValueError("No valid historical data found.")
        
        # 3. Determine last available date
        last_date = df["ds"].max()
        print(f"Last available data date: {last_date}")
        
        # 4. Handle different cases
        if target_date < last_date:
            # Historical data request
            historical_data = df[df["ds"] == target_date]
            if not historical_data.empty:
                return historical_data[["ds", "y"]].rename(columns={"y": "yhat"})
            raise ValueError(f"No historical data for {target_date}")
        elif target_date == last_date:
            # Return last available data
            return df[df["ds"] == last_date][["ds", "y"]].rename(columns={"y": "yhat"})
        else:
            # Future forecast request
            days_ahead = (target_date - last_date).days
            forecast_df = forecast_stock(symbol, days=days_ahead)
            
            # Convert forecast dates to date objects for comparison
            forecast_df["ds"] = pd.to_datetime(forecast_df["ds"]).dt.date
            result = forecast_df[forecast_df["ds"] == target_date]
            
            if result.empty:
                raise ValueError(f"No forecast for {target_date}")
            
            return result.reset_index(drop=True)

    except Exception as e:
        last_date_str = last_date.strftime('%Y-%m-%d') if 'last_date' in locals() else 'N/A'
        error_msg = (f"Failed to forecast until {target_date_str} for {symbol}. "
                   f"Last available data date: {last_date_str}. "
                   f"Error: {str(e)}")
        raise RuntimeError(error_msg)