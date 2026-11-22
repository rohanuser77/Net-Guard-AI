"""
Pydantic data schemas for API requests, responses, and WebSocket payloads.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class DetectionEvidence(BaseModel):
    flow_duration: Optional[float] = None
    total_fwd_packets: Optional[int] = None
    total_backward_packets: Optional[int] = None
    flow_bytes_s: Optional[float] = None
    flow_packets_s: Optional[float] = None
    syn_flag_count: Optional[int] = None
    psh_flag_count: Optional[int] = None
    ack_flag_count: Optional[int] = None
    average_packet_size: Optional[float] = None
    destination_port: Optional[int] = None
    extra_features: Optional[Dict[str, Any]] = None


class DetectionResult(BaseModel):
    threat_detected: bool
    threat_class: str
    confidence: float
    severity: str  # "NORMAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"
    evidence: Dict[str, Any]
    model_name: str
    timestamp: str


class AlertModel(BaseModel):
    id: str
    timestamp: str
    source_ip: str
    destination_ip: str
    destination_port: int
    protocol: str
    threat_category: str
    severity: str
    confidence_score: float
    evidence: Dict[str, Any]
    model_name: str


class TrafficStats(BaseModel):
    total_flows: int = 0
    flows_per_second: float = 0.0
    total_threats: int = 0
    normal_flows: int = 0
    average_confidence: float = 0.0
    active_threat_level: str = "NORMAL"  # "NORMAL", "ATTACK"
    current_replay_status: str = "STOPPED"  # "STOPPED", "BENIGN", "ATTACK"
    threat_distribution: Dict[str, int] = {}
    recent_history: List[Dict[str, Any]] = []


class ReplayStatusResponse(BaseModel):
    is_running: bool
    mode: str  # "STOPPED", "BENIGN", "ATTACK"
    active_attack_type: Optional[str] = None
    speed_factor: float
    interval_seconds: float
    flows_replayed: int
    total_dataset_rows: int


class StartReplayRequest(BaseModel):
    speed: Optional[float] = Field(1.0, ge=0.1, le=10.0, description="Speed multiplier (0.1x to 10x)")


class AttackInjectionRequest(BaseModel):
    attack_type: str = Field(..., description="E.g. DoS, DDoS, PortScan, Bot, Web Attack, Infiltration")
    burst_count: int = Field(25, ge=1, le=500, description="Number of attack flows to inject")


class AlertListResponse(BaseModel):
    total: int
    alerts: List[AlertModel]


class ModelPerformanceResponse(BaseModel):
    model_loaded: bool
    model_name: str
    dataset: str
    training_samples: int
    test_samples: int
    classes: List[str]
    overall_metrics: Dict[str, float]
    per_class_metrics: Dict[str, Dict[str, Any]]
    top_features: List[Dict[str, Any]]
