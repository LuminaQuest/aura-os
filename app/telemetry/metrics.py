"""
metrics.py — Swarm Telemetry & Particle Pulse Stream.
Simulates real-time energy flow, microsecond cognitive latency,
and synapse packet transport across agent nodes.
"""

import time
import random
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class SynapsePulse(BaseModel):
    model_config = {"protected_namespaces": ()}
    source_agent: str
    target_agent: str
    payload_type: str  # "plan", "code", "audit", "speech"
    energy_level: float = 1.0
    color: str = "#38bdf8"
    timestamp: float = Field(default_factory=time.time)

class SwarmTelemetry:
    def __init__(self):
        self.active_pulses: List[SynapsePulse] = []
        
    def generate_swarm_sequence(self) -> List[SynapsePulse]:
        # Coordinated sequence of synaptic firings for the canvas
        sequence = [
            SynapsePulse(source_agent="supervisor", target_agent="strategist", payload_type="plan", energy_level=1.0, color="#38bdf8"),
            SynapsePulse(source_agent="strategist", target_agent="data_engineer", payload_type="code", energy_level=0.9, color="#818cf8"),
            SynapsePulse(source_agent="data_engineer", target_agent="vision_analyst", payload_type="layout", energy_level=0.85, color="#34d399"),
            SynapsePulse(source_agent="vision_analyst", target_agent="executive_synthesizer", payload_type="audit", energy_level=0.95, color="#f472b6"),
            SynapsePulse(source_agent="executive_synthesizer", target_agent="supervisor", payload_type="speech", energy_level=1.0, color="#fbbf24")
        ]
        return sequence

    def get_system_load(self) -> Dict[str, Any]:
        return {
            "cognitive_load_pct": round(random.uniform(24.5, 38.2), 1),
            "synapse_frequency_hz": round(random.uniform(118.0, 142.0), 1),
            "active_agents": 5,
            "connected_synapses": 8,
            "stream_status": "OPTIMAL"
        }

swarm_telemetry = SwarmTelemetry()
