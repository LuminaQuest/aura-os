/**
 * app.js — Central Client Coordinator for AuraOS Spatial Agentic Operating System.
 * Connects swarm dispatching, neural canvas particle pulses, Tree-of-Thought rendering,
 * Chart.js dynamic sandbox generation, and voice narration.
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    sessionId: "aura-" + Math.random().toString(36).substring(2, 8),
    currentChart: null,
    isProcessing: false
  };

  const auraForm = document.getElementById("aura-form");
  const promptInput = document.getElementById("prompt-input");
  const btnExecute = document.getElementById("btn-execute");
  const briefingText = document.getElementById("briefing-text");
  const briefingMeta = document.getElementById("briefing-meta");
  const statLatency = document.getElementById("stat-latency");

  // -------------------------------------------------------------
  // Viewport Tab Switcher
  // -------------------------------------------------------------
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-view");
      document.getElementById(targetId).classList.add("active");

      // Re-trigger canvas size calculation if switching back to canvas
      if (targetId === "canvas-view" && window.neuralCanvas) {
        window.neuralCanvas.initCanvasSize();
      }
    });
  });

  // -------------------------------------------------------------
  // Preset Chips
  // -------------------------------------------------------------
  document.querySelectorAll(".trigger-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      promptInput.value = chip.getAttribute("data-query");
      auraForm.dispatchEvent(new Event("submit"));
    });
  });

  // -------------------------------------------------------------
  // Swarm Dispatch & Orchestration
  // -------------------------------------------------------------
  auraForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = promptInput.value.trim();
    if (!query || state.isProcessing) return;

    state.isProcessing = true;
    btnExecute.disabled = true;
    btnExecute.innerHTML = "<span>ORCHESTRATING...</span>";
    briefingMeta.textContent = "Swarm Active";
    briefingText.textContent = `Analyzing objective: "${query}"... Disptaching Tree-of-Thought planner and firing neural synapses.`;

    try {
      const res = await fetch("/api/swarm/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: state.sessionId, query: query })
      });

      const data = await res.json();

      // 1. Update Executive Briefing
      briefingText.textContent = data.executive_summary;
      briefingMeta.textContent = `Converged in ${data.total_latency_ms} ms`;
      statLatency.textContent = `LATENCY: ${data.total_latency_ms} ms`;

      // 2. Fire Neural Synapse Canvas Particle Pulses
      if (window.neuralCanvas && data.synapse_pulses) {
        window.neuralCanvas.fireSynapsePulses(data.synapse_pulses);
      }

      // 3. Render Tree-of-Thought Visualizer
      if (window.totVisualizer && data.thought_tree) {
        window.totVisualizer.render(data.thought_tree);
      }

      // 4. Render Dynamic Sandbox Chart & Code
      if (data.sandbox_artifact) {
        renderSandboxArtifact(data.sandbox_artifact);
      }

      // 5. Speak Executive Briefing
      if (window.audioHUD && data.voice_speech_script) {
        window.audioHUD.speak(data.voice_speech_script);
      }

    } catch (err) {
      briefingText.textContent = `System error executing swarm: ${err.message}`;
    } finally {
      state.isProcessing = false;
      btnExecute.disabled = false;
      btnExecute.innerHTML = `<span>DISPATCH SWARM</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
    }
  });

  // -------------------------------------------------------------
  // Dynamic Chart.js Sandbox Renderer
  // -------------------------------------------------------------
  function renderSandboxArtifact(artifact) {
    document.getElementById("sandbox-chart-title").textContent = artifact.title;
    document.getElementById("sandbox-metric-val").textContent = artifact.summary_metric;
    document.getElementById("sandbox-code-display").textContent = artifact.code_snippet || "// Code executed safely in sandbox.";

    const canvas = document.getElementById("sandbox-chart");
    if (!canvas || !window.Chart) return;

    if (state.currentChart) {
      state.currentChart.destroy();
    }

    const ctx = canvas.getContext("2d");
    state.currentChart = new Chart(ctx, {
      type: artifact.chart_type,
      data: artifact.chart_data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#94a3b8",
              font: { family: "'Space Grotesk', sans-serif" }
            }
          }
        },
        scales: artifact.chart_type === "radar" ? {
          r: {
            grid: { color: "rgba(255, 255, 255, 0.08)" },
            angleLines: { color: "rgba(255, 255, 255, 0.08)" },
            pointLabels: { color: "#e2e8f0" }
          }
        } : {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8" }
          }
        }
      }
    });
  }

  // Pre-seed initial execution on startup so the UI is immediately alive
  setTimeout(() => {
    promptInput.value = "Analyze Pareto token economics and compute cost reduction across LLM tiers";
    auraForm.dispatchEvent(new Event("submit"));
  }, 350);
});
