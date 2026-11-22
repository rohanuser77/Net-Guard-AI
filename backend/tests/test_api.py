"""
Unit and integration tests for NetGuard AI Backend.
Tests REST API endpoints, ML detector, replay controls, and SQLite alert store.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.alert_store import AlertStore
from backend.detector import ThreatDetector
from backend.services.statistics_service import StatisticsService


client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "NetGuard AI"
    assert data["detector_ready"] is True


def test_model_performance():
    response = client.get("/api/models/performance")
    assert response.status_code == 200
    data = response.json()
    assert data["model_loaded"] is True
    assert "accuracy" in data["overall_metrics"]
    assert data["overall_metrics"]["accuracy"] > 0.8
    assert "BENIGN" in data["classes"]
    assert "DoS" in data["classes"]


def test_traffic_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_flows" in data
    assert "flows_per_second" in data
    assert "active_threat_level" in data
    assert "recent_history" in data


def test_replay_lifecycle():
    # Check status
    res = client.get("/api/replay/status")
    assert res.status_code == 200
    status = res.json()
    assert "is_running" in status
    assert "available_attack_types" in status

    # Start replay
    res_start = client.post("/api/replay/start", json={"speed": 2.0})
    assert res_start.status_code == 200
    assert res_start.json()["status"]["is_running"] is True

    # Stop replay
    res_stop = client.post("/api/replay/stop")
    assert res_stop.status_code == 200
    assert res_stop.json()["status"]["is_running"] is False

    # Reset replay
    res_reset = client.post("/api/replay/reset")
    assert res_reset.status_code == 200


def test_attack_injection():
    # Inject valid attack
    res = client.post("/api/replay/attack", json={"attack_type": "DDoS", "burst_count": 5})
    assert res.status_code == 200
    assert "Successfully injected" in res.json()["message"]

    # Inject invalid attack class
    res_bad = client.post("/api/replay/attack", json={"attack_type": "UnknownAttackType123", "burst_count": 5})
    assert res_bad.status_code == 400

    # Clean up replay
    client.post("/api/replay/stop")


def test_alert_store_operations(tmp_path):
    db_file = tmp_path / "test_alerts.db"
    store = AlertStore(db_path=str(db_file))

    # Save an alert
    alert = store.save_alert(
        threat_category="DoS",
        severity="HIGH",
        confidence_score=0.985,
        evidence={"syn_flag_count": 45, "flow_duration": 500000},
        model_name="RandomForestClassifier-v1",
        source_ip="192.168.1.100",
        destination_ip="10.0.0.5",
        destination_port=80,
    )
    assert alert["id"].startswith("ALT-")
    assert alert["threat_category"] == "DoS"

    # Fetch alerts
    alerts = store.get_alerts()
    assert len(alerts) == 1
    assert alerts[0]["id"] == alert["id"]

    # Fetch by ID
    single = store.get_alert_by_id(alert["id"])
    assert single is not None
    assert single["confidence_score"] == 0.985

    # Threat distribution
    dist = store.get_threat_distribution()
    assert dist.get("DoS") == 1


def test_detector_inference():
    det = ThreatDetector()
    assert det.is_loaded is True

    # Benign flow sample
    sample_benign = {
        "destination_port": 80,
        "flow_duration": 85000,
        "total_fwd_packets": 8,
        "total_backward_packets": 10,
        "syn_flag_count": 1,
        "psh_flag_count": 3,
        "flow_bytes_s": 12000,
        "flow_packets_s": 200,
    }
    pred = det.predict_flow(sample_benign)
    assert "threat_detected" in pred
    assert "confidence" in pred
    assert 0.0 <= pred["confidence"] <= 1.0
    assert "evidence" in pred


def test_statistics_service():
    stats = StatisticsService(history_seconds=60)
    stats.record_flow(is_threat=False, threat_class="BENIGN", confidence=0.99)
    stats.record_flow(is_threat=True, threat_class="DDoS", confidence=0.95)

    assert stats.total_flows == 2
    assert stats.normal_flows == 1
    assert stats.total_threats == 1
    assert stats.system_status == "ATTACK"

    snapshot = stats.get_stats_snapshot()
    assert snapshot["total_flows"] == 2
    assert snapshot["total_threats"] == 1
    assert "DDoS" in snapshot["threat_distribution"]
