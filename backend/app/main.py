from pathlib import Path

import joblib
import pandas as pd
import shap
from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(
    title="RockGuard AI API",
    description="AI-powered rockfall prediction and explainability system",
    version="1.1.0"
)


# ==============================
# PROJECT PATH
# ==============================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "rockfall_xgboost_model.pkl"
)


# ==============================
# LOAD MODEL
# ==============================

model = joblib.load(MODEL_PATH)

explainer = shap.TreeExplainer(model)


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
        "model_loaded": True,
        "shap_loaded": True
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


    # ==============================
    # MODEL PREDICTION
    # ==============================

    probability = float(
        model.predict_proba(input_data)[0][1]
    )

    probability_percentage = round(
        probability * 100,
        2
    )


    # ==============================
    # RISK LEVEL
    # ==============================

    if probability >= 0.60:

        risk_level = "HIGH"

    elif probability >= 0.30:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"


    rockfall_prediction = probability >= 0.30


    # ==============================
    # SHAP EXPLANATION
    # ==============================

    shap_values = explainer.shap_values(input_data)

    if isinstance(shap_values, list):

        shap_values = shap_values[1]


    shap_values = shap_values[0]


    explanation = pd.DataFrame({
        "feature": FEATURES,
        "shap_value": shap_values
    })


    # Positive SHAP values push prediction
    # towards rockfall.

    positive_features = explanation[
        explanation["shap_value"] > 0
    ].sort_values(
        by="shap_value",
        ascending=False
    )


    top_risk_factors = (
        positive_features
        .head(5)["feature"]
        .tolist()
    )


    # If there are not enough positive features,
    # use strongest overall contributors.

    if len(top_risk_factors) == 0:

        top_risk_factors = (
            explanation.assign(
                absolute_shap=explanation["shap_value"].abs()
            )
            .sort_values(
                by="absolute_shap",
                ascending=False
            )
            .head(5)["feature"]
            .tolist()
        )


    # ==============================
    # RESPONSE MESSAGE
    # ==============================

    if risk_level == "HIGH":

        message = "Rockfall risk detected"

    elif risk_level == "MEDIUM":

        message = "Moderate rockfall risk detected"

    else:

        message = "No significant rockfall risk detected"


    # ==============================
    # API RESPONSE
    # ==============================

    return {

        "rockfall_probability": probability_percentage,

        "risk_level": risk_level,

        "rockfall_prediction": rockfall_prediction,

        "top_risk_factors": top_risk_factors,

        "message": message
    }