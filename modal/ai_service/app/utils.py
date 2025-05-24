import pandas as pd
from app.redis_client import redis_client
import json

def get_historic_data(symbol: str) -> pd.DataFrame:
    data = redis_client.get(symbol)
    if not data:
        raise ValueError(f"No data found for symbol: {symbol}")

    json_data = json.loads(data)

    df = pd.DataFrame(json_data)

    return df
