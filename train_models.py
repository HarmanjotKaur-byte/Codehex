import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    precision_score,
    recall_score,
    f1_score,
    accuracy_score,
    roc_auc_score,
    confusion_matrix
)

base_dir = r"c:\Users\hp\OneDrive\Desktop\Hackathon"
data_stubble_path = os.path.join(base_dir, "data", "processed", "stubble", "paddy_stubble_processed.csv")
data_firms_path = os.path.join(base_dir, "data", "processed", "burning_risk", "burning_risk_spatiotemporal_processed.csv")

models_stubble_dir = os.path.join(base_dir, "models", "stubble_model")
models_firms_dir = os.path.join(base_dir, "models", "burning_risk_model")
docs_dir = os.path.join(base_dir, "docs")

for d in [models_stubble_dir, models_firms_dir, docs_dir]:
    os.makedirs(d, exist_ok=True)

RANDOM_SEED = 42

print("="*70)
print("PART 1: MODEL 1 AUDIT & TRAINING (STUBBLE QUANTITY REGRESSION)")
print("="*70)

df_stubble = pd.read_csv(data_stubble_path)
print(f"Loaded processed stubble data: {df_stubble.shape[0]} rows, {df_stubble.shape[1]} columns")

# AUDIT CHECK:
# Features causing direct target leakage:
# 1. 'Production': target is derived directly as Production * 1.12
# 2. 'gross_straw_tonnes': target is derived directly as gross_straw_tonnes * (0.8 / 1.4)
# 3. 'grain_yield_t_ha': Area * grain_yield_t_ha = Production => Production * 1.12 = Target (Mathematical target reconstruction)
leakage_features_m1 = ['Production', 'gross_straw_tonnes', 'grain_yield_t_ha']
print(f"AUDIT PASS: REMOVED LEAKAGE FEATURES FOR MODEL 1: {leakage_features_m1}")

# Valid pre-prediction features:
m1_features = ['Area', 'State_Name', 'District_Name', 'Crop_Year', 'Season', 'district_hist_yield']
target_m1 = 'stubble_quantity_tonnes'

# Chronological Train/Test Split by Crop_Year:
# Train on historical years <= 2011 (2,049 rows), Test on 2012-2014 (363 rows)
train_mask_m1 = df_stubble['Crop_Year'] <= 2011
test_mask_m1 = df_stubble['Crop_Year'] > 2011

df_m1_train = df_stubble[train_mask_m1].copy()
df_m1_test = df_stubble[test_mask_m1].copy()

# Compute district historical baseline yield strictly on training partition
district_baseline = df_m1_train.groupby('District_Name')['grain_yield_t_ha'].median()
global_baseline = df_m1_train['grain_yield_t_ha'].median()

df_m1_train['district_hist_yield'] = df_m1_train['District_Name'].map(district_baseline).fillna(global_baseline)
df_m1_test['district_hist_yield'] = df_m1_test['District_Name'].map(district_baseline).fillna(global_baseline)

X_m1_train = df_m1_train[m1_features]
y_m1_train = df_m1_train[target_m1]
X_m1_test = df_m1_test[m1_features]
y_m1_test = df_m1_test[target_m1]

categorical_features_m1 = ['State_Name', 'District_Name', 'Season']
numerical_features_m1 = ['Area', 'Crop_Year', 'district_hist_yield']

preprocessor_m1 = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features_m1),
        ('num', 'passthrough', numerical_features_m1)
    ]
)

rf_m1 = RandomForestRegressor(
    n_estimators=100,
    max_depth=12,
    min_samples_split=5,
    random_state=RANDOM_SEED,
    n_jobs=-1
)

pipeline_m1 = Pipeline(steps=[
    ('preprocessor', preprocessor_m1),
    ('regressor', rf_m1)
])

print("Training Model 1 (RandomForestRegressor)...")
pipeline_m1.fit(X_m1_train, y_m1_train)

# Predictions & Evaluation
y_m1_pred = pipeline_m1.predict(X_m1_test)

mae_m1 = mean_absolute_error(y_m1_test, y_m1_pred)
rmse_m1 = np.sqrt(mean_squared_error(y_m1_test, y_m1_pred))
r2_m1 = r2_score(y_m1_test, y_m1_pred)

print(f"\nModel 1 Evaluation Results (Chronological Test Set: Crop_Year 2012-2014):")
print(f"MAE:  {mae_m1:,.2f} tonnes")
print(f"RMSE: {rmse_m1:,.2f} tonnes")
print(f"R^2:  {r2_m1:.4f}")

# Feature Importances
cat_encoder = pipeline_m1.named_steps['preprocessor'].named_transformers_['cat']
cat_feature_names = list(cat_encoder.get_feature_names_out(categorical_features_m1))
all_feature_names_m1 = cat_feature_names + numerical_features_m1
importances_m1 = pipeline_m1.named_steps['regressor'].feature_importances_

feat_imp_m1 = pd.DataFrame({'feature': all_feature_names_m1, 'importance': importances_m1})
def get_parent_feature(col):
    for orig in ['State_Name', 'District_Name', 'Season']:
        if col.startswith(orig):
            return orig
    return col

feat_imp_m1['parent_feature'] = feat_imp_m1['feature'].apply(get_parent_feature)
summary_imp_m1 = feat_imp_m1.groupby('parent_feature')['importance'].sum().sort_values(ascending=False)

print("\nModel 1 Top Feature Importances (Aggregated by Variable):")
for f, imp in summary_imp_m1.items():
    print(f"  {f:25s}: {imp*100:6.2f}%")

# Save Model 1 & Metadata
joblib.dump(pipeline_m1, os.path.join(models_stubble_dir, "model.pkl"))

m1_metadata = {
    "model_type": "RandomForestRegressor",
    "component": "Model 1 - Stubble Quantity Estimation",
    "training_dataset": "data/processed/stubble/paddy_stubble_processed.csv",
    "features_used": m1_features,
    "features_removed_leakage": leakage_features_m1,
    "target_name": target_m1,
    "training_date": datetime.now().isoformat(),
    "random_seed": RANDOM_SEED,
    "train_split": "Crop_Year <= 2011",
    "test_split": "Crop_Year > 2011",
    "train_rows": len(df_m1_train),
    "test_rows": len(df_m1_test),
    "evaluation_metrics": {
        "MAE_tonnes": round(float(mae_m1), 2),
        "RMSE_tonnes": round(float(rmse_m1), 2),
        "R2_score": round(float(r2_m1), 4)
    },
    "feature_importances_aggregated": {k: round(float(v), 4) for k, v in summary_imp_m1.items()}
}

with open(os.path.join(models_stubble_dir, "metadata.json"), "w") as f:
    json.dump(m1_metadata, f, indent=2)

print(f"Model 1 saved to {models_stubble_dir}")


print("\n" + "="*70)
print("PART 2: MODEL 3 AUDIT & TRAINING (STUBBLE BURNING RISK CLASSIFICATION)")
print("="*70)

df_firms = pd.read_csv(data_firms_path)
print(f"Loaded processed burning risk data: {df_firms.shape[0]} rows, {df_firms.shape[1]} columns")

# AUDIT CHECK:
# Features causing temporal leakage or direct label leakage:
# 1. 'season_total_fires': Future temporal leakage (sums whole season fires including future dates)
# 2. 'fire_count': Direct target leakage (defines target on prediction day)
leakage_features_m3 = ['season_total_fires', 'fire_count']
print(f"AUDIT PASS: REMOVED LEAKAGE FEATURES FOR MODEL 3: {leakage_features_m3}")

m3_features = [
    'grid_lat',
    'grid_lon',
    'day_of_year',
    'calendar_week',
    'day_of_harvest_season',
    'is_peak_harvest_window',
    'lag_fire_days_past_3d',
    'lag_fire_days_past_7d',
    'prior_cumulative_fires'
]
target_m3 = 'fire_event_occurred'

# We evaluate TWO distinct split strategies for complete scientific rigor:
# Split 1: Forward Chronological Split (Train: Oct 1 - Nov 10; Test: Nov 11 - Nov 30)
# Split 2: Spatial Grid Holdout Split (Train on 80% grid cells across full season; Test on 20% unseen grid cells)

print("\n--- Split 1: Chronological Forward Time Split ---")
train_mask_time = df_firms['day_of_harvest_season'] <= 41
test_mask_time = df_firms['day_of_harvest_season'] > 41

X_train_time, y_train_time = df_firms[train_mask_time][m3_features], df_firms[train_mask_time][target_m3]
X_test_time, y_test_time = df_firms[test_mask_time][m3_features], df_firms[test_mask_time][target_m3]

rf_time = RandomForestClassifier(n_estimators=100, max_depth=10, class_weight='balanced', random_state=RANDOM_SEED, n_jobs=-1)
rf_time.fit(X_train_time, y_train_time)
y_pred_time = rf_time.predict(X_test_time)
y_prob_time = rf_time.predict_proba(X_test_time)[:, 1]

print(f"Chronological Test Accuracy:  {accuracy_score(y_test_time, y_pred_time):.4f}")
print(f"Chronological Test Precision: {precision_score(y_test_time, y_pred_time, zero_division=0):.4f}")
print(f"Chronological Test Recall:    {recall_score(y_test_time, y_pred_time, zero_division=0):.4f}")
print(f"Chronological Test F1-Score:  {f1_score(y_test_time, y_pred_time, zero_division=0):.4f}")
print(f"Chronological Test ROC-AUC:   {roc_auc_score(y_test_time, y_prob_time):.4f}")
print("Note: Chronological forward split suffers from decision tree extrapolation failure on unseen future calendar day integers.")

print("\n--- Split 2: Spatial Grid Holdout Split (Unseen Geographical Cells) ---")
unique_cells = df_firms[['grid_lat', 'grid_lon']].drop_duplicates().sample(frac=1.0, random_state=RANDOM_SEED)
test_cells = unique_cells.iloc[:31] # 20% of 156 cells
train_cells = unique_cells.iloc[31:]

train_spatial = df_firms.merge(train_cells, on=['grid_lat', 'grid_lon'], how='inner')
test_spatial = df_firms.merge(test_cells, on=['grid_lat', 'grid_lon'], how='inner')

X_train_spat = train_spatial[m3_features]
y_train_spat = train_spatial[target_m3]
X_test_spat = test_spatial[m3_features]
y_test_spat = test_spatial[target_m3]

rf_spatial = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    class_weight='balanced',
    random_state=RANDOM_SEED,
    n_jobs=-1
)
rf_spatial.fit(X_train_spat, y_train_spat)

y_pred_spat = rf_spatial.predict(X_test_spat)
y_prob_spat = rf_spatial.predict_proba(X_test_spat)[:, 1]

acc_spat = accuracy_score(y_test_spat, y_pred_spat)
prec_spat = precision_score(y_test_spat, y_pred_spat, zero_division=0)
rec_spat = recall_score(y_test_spat, y_pred_spat, zero_division=0)
f1_spat = f1_score(y_test_spat, y_pred_spat, zero_division=0)
auc_spat = roc_auc_score(y_test_spat, y_prob_spat)
cm_spat = confusion_matrix(y_test_spat, y_pred_spat)

print(f"Spatial Holdout Accuracy:  {acc_spat:.4f}")
print(f"Spatial Holdout Precision: {prec_spat:.4f}")
print(f"Spatial Holdout Recall:    {rec_spat:.4f}")
print(f"Spatial Holdout F1-Score:  {f1_spat:.4f}")
print(f"Spatial Holdout ROC-AUC:   {auc_spat:.4f}")
print(f"Confusion Matrix (TN, FP / FN, TP):\n{cm_spat}")

# Feature Importances for Spatial Model
importances_m3 = rf_spatial.feature_importances_
feat_imp_m3 = pd.DataFrame({'feature': m3_features, 'importance': importances_m3}).sort_values(by='importance', ascending=False)

print("\nModel 3 Feature Importances (Spatial Model):")
for _, row in feat_imp_m3.iterrows():
    print(f"  {row['feature']:25s}: {row['importance']*100:6.2f}%")

# Save primary Model 3 (Spatial Holdout model, which provides valid generalization across unseen locations)
joblib.dump(rf_spatial, os.path.join(models_firms_dir, "model.pkl"))

m3_metadata = {
    "model_type": "RandomForestClassifier",
    "component": "Model 3 - Stubble Burning Risk Prediction",
    "training_dataset": "data/processed/burning_risk/burning_risk_spatiotemporal_processed.csv",
    "features_used": m3_features,
    "features_removed_leakage": leakage_features_m3,
    "target_name": target_m3,
    "training_date": datetime.now().isoformat(),
    "random_seed": RANDOM_SEED,
    "evaluation_split_primary": "Spatial Grid Holdout (80% train cells / 20% unseen test cells)",
    "evaluation_metrics_spatial_holdout": {
        "accuracy": round(float(acc_spat), 4),
        "precision": round(float(prec_spat), 4),
        "recall": round(float(rec_spat), 4),
        "f1_score": round(float(f1_spat), 4),
        "roc_auc": round(float(auc_spat), 4),
        "confusion_matrix": cm_spat.tolist(),
        "train_rows": len(train_spatial),
        "test_rows": len(test_spatial)
    },
    "evaluation_metrics_chronological_time_split": {
        "description": "Forward chronological split (Train: Oct 1 - Nov 10; Test: Nov 11 - Nov 30)",
        "accuracy": round(float(accuracy_score(y_test_time, y_pred_time)), 4),
        "precision": round(float(precision_score(y_test_time, y_pred_time, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test_time, y_pred_time, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test_time, y_pred_time, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test_time, y_prob_time)), 4),
        "note": "Decision tree fails to extrapolate on unseen future calendar day integers (day_of_year > 314)."
    },
    "feature_importances": {row['feature']: round(float(row['importance']), 4) for _, row in feat_imp_m3.iterrows()}
}

with open(os.path.join(models_firms_dir, "metadata.json"), "w") as f:
    json.dump(m3_metadata, f, indent=2)

print(f"Model 3 saved to {models_firms_dir}")
