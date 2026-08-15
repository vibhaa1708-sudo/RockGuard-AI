import numpy as np
import pandas as pd
from datetime import datetime, timedelta

np.random.seed(42)

N = 15000

start_time = datetime(2026, 1, 1)

timestamps = [
start_time + timedelta(minutes=15 * i)
for i in range(N)
]

sectors = np.random.choice(
[
"A1", "A2", "A3",
"B1", "B2", "B3",
"C1", "C2", "C3"
],
size=N
)

rainfall = np.clip(
np.random.gamma(2.0, 5.0, N),
0,
80
)

temperature = np.clip(
np.random.normal(30, 5, N),
10,
45
)

humidity = np.clip(
np.random.normal(65, 15, N),
20,
100
)

soil_moisture = np.clip(
20
+ rainfall * 0.75
+ np.random.normal(0, 7, N),
5,
100
)

vibration = np.clip(
np.random.gamma(2.0, 0.20, N),
0.01,
2.0
)

deformation = np.clip(
np.random.gamma(2.0, 1.5, N),
0.1,
15
)

slope_angle = np.random.uniform(
35,
75,
N
)

slope_height = np.random.uniform(
30,
250,
N
)

blast_activity = np.random.binomial(
1,
0.15,
N
)

crack_growth = np.clip(
np.random.gamma(2.0, 1.3, N),
0,
12
)

previous_events = np.random.poisson(
0.8,
N
)

rainfall_risk = rainfall / 80

soil_risk = soil_moisture / 100

vibration_risk = vibration / 2.0

deformation_risk = deformation / 15

slope_risk = (slope_angle - 35) / 40

height_risk = (slope_height - 30) / 220

crack_risk = crack_growth / 12

history_risk = np.clip(
previous_events / 4,
0,
1
)

interaction_risk = (
rainfall_risk * soil_risk * 0.8
+ deformation_risk * crack_risk * 1.2
+ vibration_risk * deformation_risk * 1.0
+ slope_risk * deformation_risk * 1.0
+ blast_activity * 0.8
)

risk_score = (
rainfall_risk * 0.8
+ soil_risk * 0.6
+ vibration_risk * 0.8
+ deformation_risk * 1.3
+ slope_risk * 0.9
+ height_risk * 0.3
+ crack_risk * 1.1
+ history_risk * 0.6
+ interaction_risk
)

risk_score = (
risk_score
+ np.random.normal(0, 0.08, N)
)

risk_score = np.clip(
risk_score,
0,
6
)

rockfall_probability = (
1
/
(
1
+ np.exp(
-(risk_score - 2.8) * 2.2
)
)
)

rockfall_event = np.random.binomial(
1,
rockfall_probability
)

df = pd.DataFrame({
"timestamp": timestamps,
"sector": sectors,
"rainfall": rainfall,
"temperature": temperature,
"humidity": humidity,
"soil_moisture": soil_moisture,
"vibration": vibration,
"deformation": deformation,
"slope_angle": slope_angle,
"slope_height": slope_height,
"blast_activity": blast_activity,
"crack_growth": crack_growth,
"previous_events": previous_events,
"rockfall_event": rockfall_event
})

OUTPUT_PATH = "ml/data/rockfall_dataset.csv"

df.to_csv(
OUTPUT_PATH,
index=False
)

print("======================================")
print(" ROCKGUARD AI DATASET V2 GENERATED")
print("======================================")

print("\nRows:", len(df))

print("Columns:", len(df.columns))

print("\nColumns:")

for column in df.columns:
    print("-", column)

print("\nFirst 5 rows:")

print(df.head())

print("\nRockfall distribution:")

print(
df["rockfall_event"].value_counts()
)

print("\nRockfall percentage:")

print(
df["rockfall_event"].value_counts(
normalize=True
) * 100
)

print("\nDataset saved to:")

print(OUTPUT_PATH)