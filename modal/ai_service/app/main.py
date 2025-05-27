from fastapi import FastAPI, HTTPException
from app.model import forecast_stock
from pydantic import BaseModel
from app.model import forecast_until

app = FastAPI()

class ForecastResponse(BaseModel):
    ds: str
    yhat: float
    yhat_lower: float
    yhat_upper: float

@app.get("/forecast/{symbol}", response_model=list[ForecastResponse])

async def get_forecast(symbol: str, days: int = 1):
    try:
        forecast_df = forecast_stock(symbol, days)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    result = forecast_df.to_dict(orient="records")
    for record in result:
        record["ds"] = record["ds"].isoformat()
    return result

@app.get("/forecast-until/" )
def get_forecast_until(symbol: str, target_date: str):
    result = forecast_until(symbol, target_date)
    return result.to_dict(orient="records")