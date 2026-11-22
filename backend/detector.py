"""
Machine Learning Inference Engine for NetGuard AI.
Loads trained Random Forest classifier and preprocessor, runs real-time inference on flows,
extracts true predictive confidence from predict_proba, and generates evidence.
"""

from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import joblib
import numpy as np
from backend.config import settings
from backend.models.preprocessing import CICIDSPreprocessor

SEVERITY_MAPPING = {
    "BENIGN": "NORMAL",
    "PortScan": "MEDIUM",
    "Bot": "HIGH",
    "Web Attack": "HIGH",
    "DoS": "HIGH",
    "DDoS": "CRITICAL",
    "Infiltration": "CRITICAL",
}


class ThreatDetector:
    def __init__(self, model_dir: Optional[str] = None):
        self.model_dir = Path(model_dir or settings.MODEL_DIR)
        self.model = None
        self.preprocessor: Optional[CICIDSPreprocessor] = None
        self.is_loaded = False
        self.load_model()

    def load_model(self) -> bool:
        """Load trained model and preprocessor from disk."""
        model_path = self.model_dir / "model.joblib"
        preproc_path = self.model_dir / "preprocessor.joblib"

        if not model_path.exists() or not preproc_path.exists():
            print(f"[!] Warning: Trained model or preprocessor not found in {self.model_dir}")
            self.is_loaded = False
            return False

        try:
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preproc_path)
            self.is_loaded = True
            print(f"[✓] ML Threat Detector loaded successfully with classes: {self.model.classes_}")
            return True
        except Exception as e:
            print(f"[!] Error loading model: {e}")
            self.is_loaded = False
            return False

    def predict_flow(self, flow_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run genuine ML inference on single network flow dictionary.
        Returns true predicted class, real model confidence, severity, and flow evidence.
        """
        now_ts = datetime.now(timezone.utc).isoformat()

        if not self.is_loaded:
            return {
                "threat_detected": False,
                "threat_class": "MODEL_NOT_TRAINED",
                "confidence": 0.0,
                "severity": "NORMAL",
                "evidence": {"status": "Model not trained. Run backend/models/train.py first."},
                "model_name": "None",
                "timestamp": now_ts,
            }

        try:
            # Transform features using fitted preprocessor
            X_scaled = self.preprocessor.transform(flow_dict)

            # Predict probabilities
            probabilities = self.model.predict_proba(X_scaled)[0]
            max_idx = int(np.argmax(probabilities))
            predicted_class = str(self.model.classes_[max_idx])
            confidence = float(probabilities[max_idx])

            threat_detected = predicted_class != "BENIGN"
            severity = SEVERITY_MAPPING.get(predicted_class, "HIGH" if threat_detected else "NORMAL")

            evidence = self.preprocessor.extract_evidence(flow_dict)

            return {
                "threat_detected": threat_detected,
                "threat_class": predicted_class,
                "confidence": round(confidence, 4),
                "severity": severity,
                "evidence": evidence,
                "model_name": "RandomForestClassifier-v1",
                "timestamp": now_ts,
            }
        except Exception as e:
            print(f"[!] Inference error on flow: {e}")
            return {
                "threat_detected": False,
                "threat_class": "INFERENCE_ERROR",
                "confidence": 0.0,
                "severity": "NORMAL",
                "evidence": {"error": str(e)},
                "model_name": "RandomForestClassifier-v1",
                "timestamp": now_ts,
            }


detector = ThreatDetector()
