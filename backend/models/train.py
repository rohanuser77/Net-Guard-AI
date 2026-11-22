"""
Model training pipeline for NetGuard AI.
Trains a RandomForestClassifier on processed CICIDS-2017 flow data
with zero data leakage, saves trained artifacts, and records evaluation metrics.
"""

import sys
import json
from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report,
)

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.models.preprocessing import CICIDSPreprocessor, FEATURE_COLUMNS
from scripts.prepare_dataset import main as prepare_dataset_main

DATASET_PATH = BASE_DIR / "data" / "processed" / "cicids2017_sample.csv"
MODEL_DIR = BASE_DIR / "backend" / "models" / "trained"
EVAL_DIR = BASE_DIR / "backend" / "models" / "evaluation"


def train_model():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    EVAL_DIR.mkdir(parents=True, exist_ok=True)

    if not DATASET_PATH.exists():
        print(f"[*] Dataset not found at {DATASET_PATH}. Running dataset preparation...")
        prepare_dataset_main()

    print(f"[*] Loading processed dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)

    if "label" not in df.columns:
        raise ValueError("Dataset does not contain 'label' column.")

    print(f"[*] Total dataset size: {len(df)} samples across {df['label'].nunique()} classes")

    # Features and labels
    X = df.drop(columns=["label"])
    y = df["label"]

    # Stratified Train-Test Split (Prevent Data Leakage)
    print("[*] Splitting dataset into train (80%) and test (20%) sets with stratification...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Initialize and fit Preprocessor on train set ONLY
    print("[*] Fitting preprocessing pipeline on training data...")
    preprocessor = CICIDSPreprocessor(feature_columns=FEATURE_COLUMNS)
    X_train_scaled = preprocessor.fit_transform(X_train, y_train)
    X_test_scaled = preprocessor.transform(X_test)

    classes = list(preprocessor.classes_)
    print(f"[*] Detected {len(classes)} target classes: {classes}")

    # Train Random Forest Classifier
    print("[*] Training RandomForestClassifier (n_estimators=100, class_weight='balanced')...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=18,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train_scaled, y_train)

    # Evaluation on Hold-Out Test Set
    print("[*] Evaluating model on hold-out test set...")
    y_pred = clf.predict(X_test_scaled)
    y_prob = clf.predict_proba(X_test_scaled)

    acc = float(accuracy_score(y_test, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)

    # Per-class metrics
    p_class, r_class, f1_class, support = precision_recall_fscore_support(y_test, y_pred, labels=classes, zero_division=0)
    per_class_metrics = {}
    for i, cls_name in enumerate(classes):
        per_class_metrics[cls_name] = {
            "precision": round(float(p_class[i]), 4),
            "recall": round(float(r_class[i]), 4),
            "f1_score": round(float(f1_class[i]), 4),
            "support": int(support[i]),
        }

    cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()

    # Feature Importance
    importances = clf.feature_importances_
    top_feature_indices = importances.argsort()[::-1][:10]
    top_features = [
        {"feature": FEATURE_COLUMNS[i], "importance": round(float(importances[i]), 4)}
        for i in top_feature_indices
    ]

    metrics_summary = {
        "model_name": "RandomForestClassifier",
        "dataset": "CICIDS-2017",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "classes": classes,
        "overall_metrics": {
            "accuracy": round(acc, 4),
            "macro_precision": round(float(p_macro), 4),
            "macro_recall": round(float(r_macro), 4),
            "macro_f1": round(float(f1_macro), 4),
            "weighted_f1": round(float(f1_weighted), 4),
        },
        "per_class_metrics": per_class_metrics,
        "top_features": top_features,
    }

    # Save model and preprocessor artifacts
    model_file = MODEL_DIR / "model.joblib"
    preproc_file = MODEL_DIR / "preprocessor.joblib"
    joblib.dump(clf, model_file)
    joblib.dump(preprocessor, preproc_file)
    print(f"[✓] Model saved: {model_file}")
    print(f"[✓] Preprocessor saved: {preproc_file}")

    # Save metrics JSONs
    metrics_file = EVAL_DIR / "metrics.json"
    cm_file = EVAL_DIR / "confusion_matrix.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)

    with open(cm_file, "w", encoding="utf-8") as f:
        json.dump({"classes": classes, "matrix": cm}, f, indent=2)

    print(f"[✓] Evaluation metrics saved: {metrics_file}")
    print(f"[✓] Confusion matrix saved: {cm_file}")

    print("\n" + "=" * 50)
    print("NETGUARD AI MODEL EVALUATION REPORT (TEST SET)")
    print("=" * 50)
    print(classification_report(y_test, y_pred, target_names=classes, zero_division=0))
    print(f"Overall Accuracy: {acc * 100:.2f}%")
    print(f"Macro F1-Score:   {f1_macro * 100:.2f}%")
    print("=" * 50 + "\n")

    return metrics_summary


if __name__ == "__main__":
    train_model()
