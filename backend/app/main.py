from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(
    title="RockGuard AI API",
    description="AI-powered rockfall prediction and alert system",
    version="1.0.0"
)


# ==============================
# MODEL PATH
# ==============================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = PROJECT_ROOT / "ml" / "models" / "rockfall_xgboost_model.pkl"


# ==============================
# LOAD MODEL
# ==============================

model = joblib.load(MODEL_PATH)


# ==============================
# FEATURES
# ==============================

FEATURES = [
    "rainfall",
    "temperature",
    "humidity",
    "soil_moisture",
    "vibration",
    "deformation",
    "slope_angle",
    "slope_height",
    "blast_activity",
    "crack_growth",
    "previous_events"
]


# ==============================
# INPUT DATA MODEL
# ==============================

class SensorData(BaseModel):

    rainfall: float
    temperature: float
    humidity: float
    soil_moisture: float
    vibration: float
    deformation: float
    slope_angle: float
    slope_height: float
    blast_activity: float
    crack_growth: float
    previous_events: float


# ==============================
# ROOT ENDPOINT
# ==============================

@app.get("/")
def root():

    return {
        "message": "RockGuard AI API is running",
        "status": "online"
    }


# ==============================
# HEALTH CHECK
# ==============================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "model_loaded": True
    }


# ==============================
# PREDICTION ENDPOINT
# ==============================

@app.post("/predict")
def predict(data: SensorData):

    input_data = pd.DataFrame(
        [[
            data.rainfall,
            data.temperature,
            data.humidity,
            data.soil_moisture,
            data.vibration,
            data.deformation,
            data.slope_angle,
            data.slope_height,
            data.blast_activity,
            data.crack_growth,
            data.previous_events
        ]],
        columns=FEATURES
    )


    # Get rockfall probability

    probability = float(
        model.predict_proba(input_data)[0][1]
    )


    # Convert probability to percentage

    probability_percentage = round(
        probability * 100,
        2
    )


    # Determine risk level

    if probability >= 0.60:

        risk_level = "HIGH"

    elif probability >= 0.30:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"


    # Rockfall prediction

    rockfall_prediction = (
        probability >= 0.30
    )


    return {

        "rockfall_probability": probability_percentage,

        "risk_level": risk_level,

        "rockfall_prediction": rockfall_prediction,

        "message": (
            "Rockfall risk detected"
            if rockfall_prediction
            else "No significant rockfall risk detected"
        )
    }