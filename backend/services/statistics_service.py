"""
Real-time traffic and threat statistics service for NetGuard AI.
Maintains sliding-window counters, flows-per-second, and time-series history for charts.
"""

from collections import deque
from datetime import datetime, timezone
import time
from typing import Dict, List, Any


class StatisticsService:
    def __init__(self, history_seconds: int = 60):
        self.total_flows: int = 0
        self.normal_flows: int = 0
        self.total_threats: int = 0
        self.confidence_sum: float = 0.0

        # Sliding window for flows-per-second calculation
        self.flow_timestamps = deque(maxlen=2000)

        # 60-second time-series bucket history for Recharts
        self.history_seconds = history_seconds
        # Dict mapping second timestamp (epoch int) -> {"normal": int, "threat": int}
        self.buckets: Dict[int, Dict[str, int]] = {}

        # Threat distribution cache
        self.threat_distribution: Dict[str, int] = {}
        self.last_threat: Dict[str, Any] = {}
        self.system_status: str = "NORMAL"  # "NORMAL" or "ATTACK"
        self.last_attack_time: float = 0.0

    def record_flow(self, is_threat: bool, threat_class: str, confidence: float):
        """Record a single network flow classification event."""
        now = time.time()
        now_sec = int(now)

        self.total_flows += 1
        self.confidence_sum += confidence
        self.flow_timestamps.append(now)

        # Bucket per second for 60s chart
        if now_sec not in self.buckets:
            self.buckets[now_sec] = {"normal": 0, "threat": 0}

        if is_threat:
            self.total_threats += 1
            self.buckets[now_sec]["threat"] += 1
            self.threat_distribution[threat_class] = self.threat_distribution.get(threat_class, 0) + 1
            self.system_status = "ATTACK"
            self.last_attack_time = now
            self.last_threat = {
                "threat_class": threat_class,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "confidence": confidence,
            }
        else:
            self.normal_flows += 1
            self.buckets[now_sec]["normal"] += 1

            # Auto-revert status to NORMAL if no threat detected in the last 15 seconds
            if self.system_status == "ATTACK" and (now - self.last_attack_time) > 15:
                self.system_status = "NORMAL"

        # Prune buckets older than history_seconds
        cutoff = now_sec - self.history_seconds
        expired = [sec for sec in self.buckets.keys() if sec < cutoff]
        for sec in expired:
            del self.buckets[sec]

    def get_flows_per_second(self) -> float:
        """Calculate real flows per second over the last 3-second window."""
        now = time.time()
        recent_cutoff = now - 3.0
        recent_count = sum(1 for t in self.flow_timestamps if t >= recent_cutoff)
        return round(recent_count / 3.0, 1)

    def get_average_confidence(self) -> float:
        if self.total_flows == 0:
            return 0.0
        return round(self.confidence_sum / self.total_flows, 4)

    def get_time_series_history(self) -> List[Dict[str, Any]]:
        """Get 60-second time-series for the frontend Recharts line/area chart."""
        now_sec = int(time.time())
        history = []
        for s in range(now_sec - self.history_seconds + 1, now_sec + 1):
            bucket = self.buckets.get(s, {"normal": 0, "threat": 0})
            dt_str = datetime.fromtimestamp(s, tz=timezone.utc).strftime("%H:%M:%S")
            history.append({
                "time": dt_str,
                "timestamp": s,
                "normal": bucket["normal"],
                "threat": bucket["threat"],
                "total": bucket["normal"] + bucket["threat"],
            })
        return history

    def get_stats_snapshot(self) -> Dict[str, Any]:
        """Generate a complete statistics snapshot for REST API and WebSocket broadcast."""
        # Auto-revert to NORMAL if 15 seconds have passed with no new threat
        if self.system_status == "ATTACK" and (time.time() - self.last_attack_time) > 15:
            self.system_status = "NORMAL"

        return {
            "total_flows": self.total_flows,
            "flows_per_second": self.get_flows_per_second(),
            "total_threats": self.total_threats,
            "normal_flows": self.normal_flows,
            "average_confidence": self.get_average_confidence(),
            "active_threat_level": self.system_status,
            "threat_distribution": dict(self.threat_distribution),
            "recent_history": self.get_time_series_history(),
            "last_threat": self.last_threat,
        }

    def reset(self):
        """Reset all traffic statistics counters and historical buckets."""
        self.total_flows = 0
        self.normal_flows = 0
        self.total_threats = 0
        self.confidence_sum = 0.0
        self.flow_timestamps.clear()
        self.buckets.clear()
        self.threat_distribution.clear()
        self.last_threat = {}
        self.system_status = "NORMAL"
        self.last_attack_time = 0.0


stats_service = StatisticsService()
