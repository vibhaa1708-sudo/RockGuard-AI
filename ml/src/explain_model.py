import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt

DATA_PATH = "ml/data/rockfall_dataset.csv"
MODEL_PATH = "ml/models/rockfall_xgboost_model.pkl"
OUTPUT_PATH = "ml/data/shap_feature_importance.csv"
PLOT_PATH = "ml/data/shap_summary.png"

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

print("======================================")
print(" ROCKGUARD AI SHAP EXPLAINABILITY")
print("======================================")

print("\nLoading dataset...")
df = pd.read_csv(DATA_PATH)
X = df[FEATURES]

print("Dataset shape:", X.shape)

print("\nLoading trained model...")
model = joblib.load(MODEL_PATH)
print("Model loaded successfully!")

print("\nCreating SHAP explainer...")
explainer = shap.TreeExplainer(model)

sample_size = min(3000, len(X))
X_sample = X.sample(n=sample_size, random_state=42)

print("Calculating SHAP values...")
shap_values = explainer.shap_values(X_sample)

if isinstance(shap_values, list):
    shap_values = shap_values[1]

print("SHAP calculation completed!")

mean_abs_shap = abs(shap_values).mean(axis=0)

importance = pd.DataFrame({
    "feature": FEATURES,
    "mean_abs_shap": mean_abs_shap
})

importance = importance.sort_values(
    by="mean_abs_shap",
    ascending=False
)

print("\n======================================")
print(" SHAP FEATURE IMPORTANCE")
print("======================================")

print(importance)

importance.to_csv(OUTPUT_PATH, index=False)

print("\nSHAP importance saved to:")
print(OUTPUT_PATH)

print("\n======================================")
print(" TOP 5 RISK FACTORS")
print("======================================")

for _, row in importance.head(5).iterrows():
    print(
        row["feature"],
        "->",
        round(row["mean_abs_shap"], 4)
    )

print("\nCreating SHAP summary plot...")

plt.figure(figsize=(10, 7))

shap.summary_plot(
    shap_values,
    X_sample,
    show=False
)

plt.tight_layout()

plt.savefig(
    PLOT_PATH,
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print("SHAP summary plot saved to:")
print(PLOT_PATH)

print("\n======================================")
print(" SHAP EXPLAINABILITY COMPLETE")
print("======================================")
