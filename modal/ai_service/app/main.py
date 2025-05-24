from fastapi import FastAPI, HTTPException
from app.model import forecast_stock
from pydantic import BaseModel

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
