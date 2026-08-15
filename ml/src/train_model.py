import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, average_precision_score
from xgboost import XGBClassifier
import joblib

DATA_PATH = "ml/data/rockfall_dataset.csv"

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Shape:", df.shape)

TARGET = "rockfall_event"

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

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))

negative_count = (y_train == 0).sum()
positive_count = (y_train == 1).sum()
scale_pos_weight = negative_count / positive_count

print("\nClass imbalance:")
print("No Rockfall:", negative_count)
print("Rockfall:", positive_count)
print("Scale Pos Weight:", round(scale_pos_weight, 2))

model = XGBClassifier(
    n_estimators=400,
    max_depth=5,
    learning_rate=0.04,
    subsample=0.85,
    colsample_bytree=0.85,
    scale_pos_weight=scale_pos_weight,
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42
)

print("\nTraining XGBoost Model V3...")
model.fit(X_train, y_train)
print("Model training completed!")

y_probability = model.predict_proba(X_test)[:, 1]

threshold = 0.50
y_pred = (y_probability >= threshold).astype(int)

print("\n======================================")
print(" ROCKGUARD AI MODEL V3")
print("======================================")

print("\nThreshold:", threshold)

print("\nClassification Report:")
print(classification_report(
    y_test,
    y_pred,
    target_names=["No Rockfall", "Rockfall"],
    zero_division=0
))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

roc_auc = roc_auc_score(y_test, y_probability)
pr_auc = average_precision_score(y_test, y_probability)

print("\nROC-AUC:", round(roc_auc, 4))
print("PR-AUC:", round(pr_auc, 4))

print("\n======================================")
print(" THRESHOLD ANALYSIS")
print("======================================")

for threshold_value in [0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10]:
    predictions = (y_probability >= threshold_value).astype(int)

    report = classification_report(
        y_test,
        predictions,
        output_dict=True,
        zero_division=0
    )

    print("\nThreshold:", threshold_value)
    print("Rockfall Precision:", round(report["1"]["precision"], 3))
    print("Rockfall Recall:", round(report["1"]["recall"], 3))
    print("Rockfall F1:", round(report["1"]["f1-score"], 3))

print("\n======================================")
print(" FEATURE IMPORTANCE")
print("======================================")

importance = pd.DataFrame({
    "feature": FEATURES,
    "importance": model.feature_importances_
})

importance = importance.sort_values(
    by="importance",
    ascending=False
)

print(importance)

print("\n======================================")
print(" TOP 5 FEATURES")
print("======================================")

for _, row in importance.head(5).iterrows():
    print(row["feature"], "->", round(row["importance"], 4))

MODEL_PATH = "ml/models/rockfall_xgboost_model.pkl"

joblib.dump(model, MODEL_PATH)

print("\n======================================")
print(" MODEL V3 SAVED SUCCESSFULLY")
print("======================================")

print("\nModel path:")
print(MODEL_PATH)
