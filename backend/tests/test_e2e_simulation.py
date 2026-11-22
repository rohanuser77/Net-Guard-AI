"""
End-to-End Simulation Integration Test for NetGuard AI.
Verifies Scenario A (Normal traffic streaming) and Scenario B (Attack injection, ML inference, and alert generation).
"""

import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.services.traffic_service import traffic_replayer


@pytest.mark.anyio
async def test_scenario_a_normal_traffic_simulation():
    """Scenario A: Benign network flow streaming."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Reset simulation to clean state
        res_reset = await ac.post("/api/replay/reset")
        assert res_reset.status_code == 200

        # 2. Check initial stats
        res_stats = await ac.get("/api/stats")
        assert res_stats.status_code == 200
        assert res_stats.json()["active_threat_level"] == "NORMAL"

        # 3. Step benign flows
        await traffic_replayer.step(count=5)

        # 4. Check that benign flows have been processed
        res_active = await ac.get("/api/stats")
        stats_data = res_active.json()
        assert stats_data["total_flows"] >= 5
        assert stats_data["total_threats"] == 0
        assert stats_data["active_threat_level"] == "NORMAL"

        # 5. Stop replay
        await ac.post("/api/replay/stop")


@pytest.mark.anyio
async def test_scenario_b_attack_injection_and_ml_detection():
    """Scenario B: Inject attack traffic, evaluate ML inference, verify persistent alerts and evidence."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Start simulation
        await ac.post("/api/replay/start", json={"speed": 5.0})

        # 2. Inject DDoS attack burst
        res_inject = await ac.post("/api/replay/attack", json={"attack_type": "DDoS", "burst_count": 5})
        assert res_inject.status_code == 200

        # Allow replayer loop to process injected flows through Random Forest
        await traffic_replayer.step(count=5)

        # 3. Verify threat status updated
        res_stats = await ac.get("/api/stats")
        stats_data = res_stats.json()
        assert stats_data["total_threats"] > 0
        assert stats_data["active_threat_level"] == "ATTACK"
        assert "DDoS" in stats_data["threat_distribution"]

        # 4. Fetch persistent alerts from SQLite
        res_alerts = await ac.get("/api/alerts?limit=10")
        assert res_alerts.status_code == 200
        alerts_data = res_alerts.json()
        assert alerts_data["total"] > 0
        assert len(alerts_data["alerts"]) > 0

        latest_alert = alerts_data["alerts"][0]
        assert latest_alert["threat_category"] == "DDoS"
        assert latest_alert["severity"] == "CRITICAL"
        assert latest_alert["confidence_score"] > 0.8
        assert "evidence" in latest_alert
        assert "destination_port" in latest_alert

        # 5. Fetch individual alert detail by ID
        res_detail = await ac.get(f"/api/alerts/{latest_alert['id']}")
        assert res_detail.status_code == 200
        detail = res_detail.json()
        assert detail["id"] == latest_alert["id"]
        assert detail["threat_category"] == "DDoS"

        # 6. Stop and reset
        await ac.post("/api/replay/stop")
        await ac.post("/api/replay/reset")

        res_post_reset = await ac.get("/api/stats")
        assert res_post_reset.json()["total_flows"] == 0
        assert res_post_reset.json()["total_threats"] == 0
