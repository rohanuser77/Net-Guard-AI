"""
Feature preprocessing pipeline for CICIDS-2017 network flow classification.
Ensures identical transformations between model training and real-time inference.
"""

from typing import List, Optional, Union
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer


# Top predictive network flow features selected from CICIDS-2017
FEATURE_COLUMNS: List[str] = [
    "destination_port",
    "flow_duration",
    "total_fwd_packets",
    "total_backward_packets",
    "total_length_of_fwd_packets",
    "total_length_of_bwd_packets",
    "fwd_packet_length_max",
    "fwd_packet_length_min",
    "fwd_packet_length_mean",
    "fwd_packet_length_std",
    "bwd_packet_length_max",
    "bwd_packet_length_min",
    "bwd_packet_length_mean",
    "bwd_packet_length_std",
    "flow_bytes_s",
    "flow_packets_s",
    "flow_iat_mean",
    "flow_iat_std",
    "flow_iat_max",
    "flow_iat_min",
    "fwd_iat_total",
    "fwd_iat_mean",
    "fwd_iat_std",
    "fwd_iat_max",
    "fwd_iat_min",
    "bwd_iat_total",
    "bwd_iat_mean",
    "bwd_iat_std",
    "bwd_iat_max",
    "bwd_iat_min",
    "fwd_header_length",
    "bwd_header_length",
    "fwd_packets_s",
    "bwd_packets_s",
    "min_packet_length",
    "max_packet_length",
    "packet_length_mean",
    "packet_length_std",
    "packet_length_variance",
    "fin_flag_count",
    "syn_flag_count",
    "rst_flag_count",
    "psh_flag_count",
    "ack_flag_count",
    "urg_flag_count",
    "down_up_ratio",
    "average_packet_size",
    "subflow_fwd_packets",
    "subflow_fwd_bytes",
    "subflow_bwd_packets",
    "subflow_bwd_bytes",
    "init_win_bytes_forward",
    "init_win_bytes_backward",
    "act_data_pkt_fwd",
    "min_seg_size_forward",
]


class CICIDSPreprocessor:
    """Preprocessor pipeline for tabular network flow features."""

    def __init__(self, feature_columns: Optional[List[str]] = None):
        self.feature_columns = feature_columns or FEATURE_COLUMNS
        self.imputer = SimpleImputer(strategy="median")
        self.scaler = StandardScaler()
        self.classes_: List[str] = []
        self.is_fitted = False

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None):
        """Fit imputer and scaler on training features without data leakage."""
        X_features = self._extract_features(X)
        X_imputed = self.imputer.fit_transform(X_features)
        self.scaler.fit(X_imputed)

        if y is not None:
            self.classes_ = sorted(list(y.unique()))

        self.is_fitted = True
        return self

    def transform(self, X: Union[pd.DataFrame, dict, list]) -> np.ndarray:
        """Transform network flow input into scaled numeric array."""
        if not self.is_fitted:
            raise RuntimeError("Preprocessor has not been fitted yet.")

        X_df = self._extract_features(X)
        X_imputed = self.imputer.transform(X_df)
        X_scaled = self.scaler.transform(X_imputed)
        return X_scaled

    def fit_transform(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> np.ndarray:
        return self.fit(X, y).transform(X)

    def _extract_features(self, X: Union[pd.DataFrame, dict, list]) -> pd.DataFrame:
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        elif isinstance(X, list):
            X = pd.DataFrame(X)
        elif not isinstance(X, pd.DataFrame):
            raise TypeError(f"Unsupported input type: {type(X)}")

        # Ensure all required columns exist, fill missing with 0
        df = pd.DataFrame(index=X.index)
        for col in self.feature_columns:
            if col in X.columns:
                df[col] = pd.to_numeric(X[col], errors="coerce")
            else:
                df[col] = 0.0

        return df

    def extract_evidence(self, flow: dict, top_n: int = 5) -> dict:
        """Extract key feature evidence for SOC analysts."""
        evidence_keys = [
            "flow_duration",
            "total_fwd_packets",
            "total_backward_packets",
            "flow_bytes_s",
            "flow_packets_s",
            "syn_flag_count",
            "psh_flag_count",
            "ack_flag_count",
            "average_packet_size",
            "destination_port",
        ]
        evidence = {}
        for k in evidence_keys:
            if k in flow:
                val = flow[k]
                evidence[k] = float(val) if isinstance(val, (int, float, np.number)) else str(val)
        return evidence
