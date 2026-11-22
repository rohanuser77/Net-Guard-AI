"""
Detection service encapsulating threat prediction and model metrics retrieval.
"""

import json
from pathlib import Path
from typing import Dict, Any
from backend.config import settings
from backend.detector import detector

EVAL_PATH = Path(settings.EVAL_DIR) / "metrics.json"


class DetectionService:
    @staticmethod
    def inspect_flow(flow: Dict[str, Any]) -> Dict[str, Any]:
        return detector.predict_flow(flow)

    @staticmethod
    def get_model_performance() -> Dict[str, Any]:
        if not EVAL_PATH.exists():
            return {
                "model_loaded": detector.is_loaded,
                "model_name": "RandomForestClassifier",
                "dataset": "CICIDS-2017",
                "training_samples": 0,
                "test_samples": 0,
                "classes": list(detector.model.classes_) if detector.is_loaded else [],
                "overall_metrics": {
                    "accuracy": 0.0,
                    "macro_precision": 0.0,
                    "macro_recall": 0.0,
                    "macro_f1": 0.0,
                    "weighted_f1": 0.0,
                },
                "per_class_metrics": {},
                "top_features": [],
            }

        try:
            with open(EVAL_PATH, "r", encoding="utf-8") as f:
                metrics = json.load(f)
            metrics["model_loaded"] = detector.is_loaded
            return metrics
        except Exception as e:
            return {"error": str(e), "model_loaded": detector.is_loaded}


detection_service = DetectionService()
