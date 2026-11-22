"""
Asynchronous Network Traffic Replayer.
Replays benign flows continuously, handles attack injections on demand,
and passes every flow to the detection engine without blocking FastAPI.
"""

import asyncio
from datetime import datetime, timezone
import random
from pathlib import Path
from typing import Optional, Dict, Any, List
import pandas as pd
from backend.config import settings
from backend.detector import ThreatDetector
from backend.alert_store import AlertStore
from backend.services.statistics_service import StatisticsService
from backend.websocket_manager import WebSocketManager


class TrafficReplayer:
    def __init__(
        self,
        dataset_path: Optional[str] = None,
        detector: Optional[ThreatDetector] = None,
        alert_store: Optional[AlertStore] = None,
        stats_service: Optional[StatisticsService] = None,
        ws_manager: Optional[WebSocketManager] = None,
    ):
        self.dataset_path = Path(dataset_path or settings.DATASET_PATH)
        self.detector = detector
        self.alert_store = alert_store
        self.stats = stats_service
        self.ws_manager = ws_manager

        self.df: Optional[pd.DataFrame] = None
        self.benign_indices: List[int] = []
        self.attack_indices_by_class: Dict[str, List[int]] = {}

        self.is_running: bool = False
        self.current_mode: str = "STOPPED"  # "STOPPED", "BENIGN", "ATTACK"
        self.active_attack_type: Optional[str] = None
        self.speed_factor: float = 1.0
        self.base_interval_sec: float = settings.DEFAULT_REPLAY_INTERVAL_SEC
        self.flows_replayed: int = 0

        # Queue for injecting specific attack flows immediately
        self.injection_queue: asyncio.Queue = asyncio.Queue()
        self._replay_task: Optional[asyncio.Task] = None
        self._benign_cursor: int = 0

        self.load_dataset()

    def load_dataset(self):
        """Load and index processed dataset flows for rapid streaming."""
        if not self.dataset_path.exists():
            print(f"[!] Warning: Processed dataset not found at {self.dataset_path}")
            return

        try:
            self.df = pd.read_csv(self.dataset_path)
            labels = self.df["label"].astype(str)

            self.benign_indices = self.df.index[labels == "BENIGN"].tolist()
            self.attack_indices_by_class = {}

            for lbl in labels.unique():
                if lbl != "BENIGN":
                    self.attack_indices_by_class[lbl] = self.df.index[labels == lbl].tolist()

            print(
                f"[✓] Replayer loaded {len(self.df)} flows. "
                f"Benign: {len(self.benign_indices)}, Attack Classes: {list(self.attack_indices_by_class.keys())}"
            )
        except Exception as e:
            print(f"[!] Error loading replayer dataset: {e}")

    @property
    def available_attack_classes(self) -> List[str]:
        return sorted(list(self.attack_indices_by_class.keys()))

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "mode": self.current_mode,
            "active_attack_type": self.active_attack_type,
            "speed_factor": self.speed_factor,
            "interval_seconds": self.base_interval_sec / self.speed_factor,
            "flows_replayed": self.flows_replayed,
            "total_dataset_rows": len(self.df) if self.df is not None else 0,
            "available_attack_types": self.available_attack_classes,
        }

    async def start(self, speed: float = 1.0):
        """Start benign traffic replay task."""
        if self.is_running:
            self.set_speed(speed)
            return

        if self.df is None or len(self.benign_indices) == 0:
            self.load_dataset()
            if self.df is None:
                raise RuntimeError("Processed dataset unavailable for replayer.")

        self.speed_factor = max(0.1, min(10.0, float(speed)))
        self.is_running = True
        self.current_mode = "BENIGN"
        self._replay_task = asyncio.create_task(self._replay_loop())
        print(f"[*] Traffic Replay started at {self.speed_factor}x speed.")

    async def stop(self):
        """Stop replay task cleanly."""
        self.is_running = False
        self.current_mode = "STOPPED"
        self.active_attack_type = None

        if self._replay_task and not self._replay_task.done():
            self._replay_task.cancel()
            try:
                await self._replay_task
            except asyncio.CancelledError:
                pass
            self._replay_task = None
        print("[*] Traffic Replay stopped.")

    async def reset(self):
        """Reset replayer and statistics."""
        await self.stop()
        self.flows_replayed = 0
        self._benign_cursor = 0
        while not self.injection_queue.empty():
            try:
                self.injection_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        if self.stats:
            self.stats.reset()
        print("[*] Traffic Replayer and statistics reset.")

    def set_speed(self, speed: float):
        self.speed_factor = max(0.1, min(10.0, float(speed)))

    async def inject_attack(self, attack_type: str, burst_count: int = 25):
        """Queue a burst of attack flows for real-time injection."""
        if attack_type not in self.attack_indices_by_class:
            valid = list(self.attack_indices_by_class.keys())
            raise ValueError(f"Unknown attack class '{attack_type}'. Available classes: {valid}")

        indices = self.attack_indices_by_class[attack_type]
        sampled_indices = random.choices(indices, k=burst_count)

        for idx in sampled_indices:
            row_dict = self.df.iloc[idx].to_dict()
            await self.injection_queue.put((attack_type, row_dict))

        self.active_attack_type = attack_type
        self.current_mode = "ATTACK"

        # If replayer is currently stopped, auto-start it to stream the injected attack
        if not self.is_running:
            await self.start(self.speed_factor)

        print(f"[*] Injected burst of {burst_count} {attack_type} flows into replay queue.")

    async def step(self, count: int = 1):
        """Process count flows immediately (supports deterministic testing)."""
        for _ in range(count):
            flow_data = None
            if not self.injection_queue.empty():
                injected_attack, flow_data = await self.injection_queue.get()
                self.current_mode = "ATTACK"
                self.active_attack_type = injected_attack
            else:
                if self.benign_indices:
                    idx = self.benign_indices[self._benign_cursor % len(self.benign_indices)]
                    self._benign_cursor += 1
                    flow_data = self.df.iloc[idx].to_dict()
                if self.current_mode == "ATTACK" and self.injection_queue.empty():
                    self.current_mode = "BENIGN"
                    self.active_attack_type = None

            if flow_data is not None:
                await self._process_flow(flow_data)

    async def _replay_loop(self):
        """Main non-blocking async replay loop."""
        try:
            while self.is_running:
                delay = self.base_interval_sec / self.speed_factor
                flow_data = None
                injected_attack = None

                # Check if high-priority attack flows are queued
                if not self.injection_queue.empty():
                    injected_attack, flow_data = await self.injection_queue.get()
                    self.current_mode = "ATTACK"
                    self.active_attack_type = injected_attack
                else:
                    # Stream next benign flow
                    if self.benign_indices:
                        idx = self.benign_indices[self._benign_cursor % len(self.benign_indices)]
                        self._benign_cursor += 1
                        flow_data = self.df.iloc[idx].to_dict()
                    if self.current_mode == "ATTACK" and self.injection_queue.empty():
                        self.current_mode = "BENIGN"
                        self.active_attack_type = None

                if flow_data is not None:
                    await self._process_flow(flow_data)

                await asyncio.sleep(delay)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"[!] Error in replay loop: {e}")
            self.is_running = False
            self.current_mode = "STOPPED"

    async def _process_flow(self, flow_data: dict):
        """Run ML prediction on flow, record stats, store alert if threat, and broadcast update."""
        self.flows_replayed += 1

        # Run genuine ML inference
        pred = self.detector.predict_flow(flow_data) if self.detector else {
            "threat_detected": False,
            "threat_class": "BENIGN",
            "confidence": 0.99,
            "severity": "NORMAL",
            "evidence": {},
            "model_name": "None",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        is_threat = pred["threat_detected"]
        threat_class = pred["threat_class"]
        confidence = pred["confidence"]
        severity = pred["severity"]
        evidence = pred["evidence"]

        # Record in statistics service
        if self.stats:
            self.stats.record_flow(is_threat, threat_class, confidence)

        new_alert = None
        if is_threat and self.alert_store:
            # Generate realistic flow metadata
            port = int(flow_data.get("destination_port", 80))
            src_ip = f"192.168.1.{random.randint(10, 240)}"
            dst_ip = f"10.0.0.{random.randint(2, 50)}"
            proto = "TCP" if port in [80, 443, 8080, 22] else "UDP"

            new_alert = self.alert_store.save_alert(
                threat_category=threat_class,
                severity=severity,
                confidence_score=confidence,
                evidence=evidence,
                model_name=pred.get("model_name", "RandomForestClassifier"),
                source_ip=src_ip,
                destination_ip=dst_ip,
                destination_port=port,
                protocol=proto,
                timestamp=pred.get("timestamp"),
            )

        # Broadcast live event via WebSocket
        if self.ws_manager and self.ws_manager.client_count > 0:
            stats_snap = self.stats.get_stats_snapshot() if self.stats else {}
            broadcast_msg = {
                "type": "TRAFFIC_UPDATE",
                "stats": stats_snap,
                "replay": self.get_status(),
                "latest_flow": {
                    "is_threat": is_threat,
                    "threat_class": threat_class,
                    "confidence": confidence,
                    "severity": severity,
                    "destination_port": int(flow_data.get("destination_port", 80)),
                },
                "new_alert": new_alert,
            }
            await self.ws_manager.broadcast(broadcast_msg)
