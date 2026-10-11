"""
config.py — Central Configuration for AuraOS.
Manages swarm parameters, Tree-of-Thought search depth, model routing,
and telemetry streaming settings.
"""

import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

class Settings(BaseModel):
    APP_NAME: str = "AuraOS: Autonomous Spatial Agentic Operating System"
    VERSION: str = "3.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
    # Optional Provider Keys (Zero-Friction: works with or without keys)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Swarm Topology & Planning Controls
    TOT_MAX_BRANCHES: int = 3
    TOT_PRUNING_THRESHOLD: float = 0.60
    SYNAPSE_PARTICLE_SPEED: float = 2.4
    COGNITIVE_HEARTBEAT_MS: int = 120

settings = Settings()
