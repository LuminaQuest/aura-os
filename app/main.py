"""
main.py — Production FastAPI Service for AuraOS Spatial Agentic Operating System.
Provides REST and telemetry streaming endpoints for the 3D Neural Canvas,
Tree-of-Thought Visualizer, and Dynamic Sandbox Engine.
"""

import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure root directory is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from app.config import settings
from app.swarm.orchestrator import swarm_orchestrator
from app.swarm.specialists import swarm_registry
from app.telemetry.metrics import swarm_telemetry

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Autonomous Spatial Agentic Operating System with 3D Neural Synapse Canvas & Multimodal Voice."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExecuteRequest(BaseModel):
    session_id: str = Field(default="aura-session-1")
    query: str = Field(..., min_length=1)

@app.get("/health")
def health():
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "swarm_nodes": len(swarm_registry.get_all())
    }

@app.get("/api/swarm/nodes")
def get_swarm_nodes():
    return {
        "nodes": [n.model_dump() for n in swarm_registry.get_all()]
    }

@app.post("/api/swarm/execute")
def execute_swarm(req: ExecuteRequest):
    try:
        res = swarm_orchestrator.execute(session_id=req.session_id, query=req.query)
        return res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/telemetry/stats")
def get_telemetry_stats():
    return swarm_telemetry.get_system_load()

# Mount Static UI
static_dir = ROOT_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/")
def serve_index():
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "AuraOS API Live. Open /docs for OpenAPI specifications."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
