"""
specialists.py — Specialist Agent Registry & Persona Behaviors.
Defines cognitive agents operating within the spatial synapse canvas:
1. Supervisor (Swarm Leader)
2. Strategist (Decomposition & Plan Architect)
3. DataEngineer (Sandbox Code & Chart Visualization Specialist)
4. VisionAnalyst (Spatial Topology & Layout Specialist)
5. ExecutiveSynthesizer (Voice Synthesis & Briefing Specialist)
"""

from typing import Dict, Any, List
from pydantic import BaseModel

class AgentSpecialist(BaseModel):
    model_config = {"protected_namespaces": ()}
    agent_id: str
    name: str
    role: str
    icon: str
    color_hex: str
    synapse_connections: List[str]

class SpecialistRegistry:
    def __init__(self):
        self.agents: Dict[str, AgentSpecialist] = {
            "supervisor": AgentSpecialist(
                agent_id="supervisor",
                name="Aura Prime",
                role="Swarm Supervisor & Cognitive Gatekeeper",
                icon="🧠",
                color_hex="#38bdf8",
                synapse_connections=["strategist", "data_engineer", "executive_synthesizer"]
            ),
            "strategist": AgentSpecialist(
                agent_id="strategist",
                name="Nexus Strategist",
                role="Strategic Decomposition & ToT Architect",
                icon="🎯",
                color_hex="#818cf8",
                synapse_connections=["supervisor", "data_engineer", "vision_analyst"]
            ),
            "data_engineer": AgentSpecialist(
                agent_id="data_engineer",
                name="Vector & Code Specialist",
                role="Sandbox Execution & Dynamic Chart Engine",
                icon="⚡",
                color_hex="#34d399",
                synapse_connections=["supervisor", "strategist", "executive_synthesizer"]
            ),
            "vision_analyst": AgentSpecialist(
                agent_id="vision_analyst",
                name="Spatial Visionary",
                role="Spatial Layout & Topology Auditor",
                icon="👁️",
                color_hex="#f472b6",
                synapse_connections=["strategist", "executive_synthesizer"]
            ),
            "executive_synthesizer": AgentSpecialist(
                agent_id="executive_synthesizer",
                name="Executive Voice",
                role="Multimodal Briefing & Speech Narrator",
                icon="🎙️",
                color_hex="#fbbf24",
                synapse_connections=["supervisor", "data_engineer", "vision_analyst"]
            )
        }

    def get_all(self) -> List[AgentSpecialist]:
        return list(self.agents.values())

    def get(self, agent_id: str) -> AgentSpecialist:
        return self.agents.get(agent_id)

swarm_registry = SpecialistRegistry()
