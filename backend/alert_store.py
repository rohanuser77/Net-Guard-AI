"""
SQLite-backed persistent alert storage.
Thread-safe and supports quick queries for alerts, stats, and historical timelines.
"""

import sqlite3
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Dict, Any
from backend.config import settings


class AlertStore:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or settings.DB_PATH
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Initialize the alerts database table and indexes."""
        with self.get_connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS alerts (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    source_ip TEXT NOT NULL,
                    destination_ip TEXT NOT NULL,
                    destination_port INTEGER NOT NULL,
                    protocol TEXT NOT NULL,
                    threat_category TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    evidence_json TEXT NOT NULL,
                    model_name TEXT NOT NULL
                )
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts (timestamp DESC)"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts (threat_category)"
            )
            conn.commit()

    def save_alert(
        self,
        threat_category: str,
        severity: str,
        confidence_score: float,
        evidence: Dict[str, Any],
        model_name: str,
        source_ip: str = "192.168.10.50",
        destination_ip: str = "172.16.0.1",
        destination_port: int = 80,
        protocol: str = "TCP",
        timestamp: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Save a newly detected threat alert."""
        alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        ts = timestamp or datetime.now(timezone.utc).isoformat()

        evidence_str = json.dumps(evidence)

        with self.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO alerts (
                    id, timestamp, source_ip, destination_ip, destination_port,
                    protocol, threat_category, severity, confidence_score,
                    evidence_json, model_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    alert_id,
                    ts,
                    source_ip,
                    destination_ip,
                    int(destination_port),
                    protocol,
                    threat_category,
                    severity,
                    float(confidence_score),
                    evidence_str,
                    model_name,
                ),
            )
            conn.commit()

        return {
            "id": alert_id,
            "timestamp": ts,
            "source_ip": source_ip,
            "destination_ip": destination_ip,
            "destination_port": destination_port,
            "protocol": protocol,
            "threat_category": threat_category,
            "severity": severity,
            "confidence_score": confidence_score,
            "evidence": evidence,
            "model_name": model_name,
        }

    def get_alerts(
        self, limit: int = 50, offset: int = 0, threat_category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch latest alerts ordered by timestamp descending."""
        with self.get_connection() as conn:
            if threat_category:
                cursor = conn.execute(
                    """
                    SELECT * FROM alerts 
                    WHERE threat_category = ? 
                    ORDER BY timestamp DESC 
                    LIMIT ? OFFSET ?
                    """,
                    (threat_category, limit, offset),
                )
            else:
                cursor = conn.execute(
                    """
                    SELECT * FROM alerts 
                    ORDER BY timestamp DESC 
                    LIMIT ? OFFSET ?
                    """,
                    (limit, offset),
                )
            rows = cursor.fetchall()

        alerts = []
        for r in rows:
            alerts.append({
                "id": r["id"],
                "timestamp": r["timestamp"],
                "source_ip": r["source_ip"],
                "destination_ip": r["destination_ip"],
                "destination_port": r["destination_port"],
                "protocol": r["protocol"],
                "threat_category": r["threat_category"],
                "severity": r["severity"],
                "confidence_score": round(r["confidence_score"], 4),
                "evidence": json.loads(r["evidence_json"]),
                "model_name": r["model_name"],
            })
        return alerts

    def get_alert_by_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
            r = cursor.fetchone()
            if not r:
                return None
            return {
                "id": r["id"],
                "timestamp": r["timestamp"],
                "source_ip": r["source_ip"],
                "destination_ip": r["destination_ip"],
                "destination_port": r["destination_port"],
                "protocol": r["protocol"],
                "threat_category": r["threat_category"],
                "severity": r["severity"],
                "confidence_score": round(r["confidence_score"], 4),
                "evidence": json.loads(r["evidence_json"]),
                "model_name": r["model_name"],
            }

    def get_count(self) -> int:
        with self.get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM alerts")
            return cursor.fetchone()[0]

    def get_threat_distribution(self) -> Dict[str, int]:
        with self.get_connection() as conn:
            cursor = conn.execute(
                "SELECT threat_category, COUNT(*) as count FROM alerts GROUP BY threat_category"
            )
            return {row["threat_category"]: row["count"] for row in cursor.fetchall()}

    def clear_all(self):
        with self.get_connection() as conn:
            conn.execute("DELETE FROM alerts")
            conn.commit()


alert_store = AlertStore()
