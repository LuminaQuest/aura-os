/**
 * app.js — NERV x Nostromo Tactical Controller.
 * Manages Three.js 3D Swarm, SSE Real-Time Streaming,
 * Web Audio API Frequency HUD, Living Tree-of-Thought, and Ctrl+K Palette.
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    sessionId: "nostromo-" + Math.random().toString(36).substring(2, 8),
    currentChart: null,
    isProcessing: false,
    reasoningSteps: [],
    activeTab: "canvas-view"
  };

  const auraForm = document.getElementById("aura-form");
  const promptInput = document.getElementById("prompt-input");
  const btnExecute = document.getElementById("btn-execute");
  const briefingText = document.getElementById("briefing-text");
  const briefingMeta = document.getElementById("briefing-meta");
  const statLatency = document.getElementById("stat-latency");
  const statGuardrail = document.getElementById("stat-guardrail");
  const ledGuardrail = document.getElementById("led-guardrail");

  // Mini-strip elements
  const stripTokens = document.getElementById("strip-tokens");
  const stripCost = document.getElementById("strip-cost");
  const stripLatency = document.getElementById("strip-latency");
  const stripGuardrail = document.getElementById("strip-guardrail");
  const traceStepCount = document.getElementById("trace-step-count");
  const traceStepsContainer = document.getElementById("trace-steps-container");
  const reasoningDrawer = document.getElementById("reasoning-trace-drawer");
  const btnToggleTrace = document.getElementById("btn-toggle-trace");

  // Bento elements
  const bentoTokens = document.getElementById("bento-tokens");
  const bentoCost = document.getElementById("bento-cost");
  const bentoCache = document.getElementById("bento-cache-status");
  const guardIndicatorDot = document.getElementById("guard-indicator-dot");
  const guardTextBanner = document.getElementById("guard-text-banner");
  const guardDetailText = document.getElementById("guard-detail-text");
  const waterfallList = document.getElementById("waterfall-list");

  // Palette elements
  const paletteModal = document.getElementById("cmd-palette-modal");
  const paletteInput = document.getElementById("cmd-palette-input");
  const paletteResults = document.getElementById("cmd-palette-results");
  const btnOpenPalette = document.getElementById("btn-open-palette");
  const btnClosePalette = document.getElementById("btn-close-palette");

  // -------------------------------------------------------------
  // 1. Animated Pixel Grid Glyph (Retro Cyber Core)
  // -------------------------------------------------------------
  const glyphCanvas = document.getElementById("pixel-glyph-canvas");
  if (glyphCanvas) {
    const ctx = glyphCanvas.getContext("2d");
    const size = 6;
    let grid = Array(size).fill(0).map(() => Array(size).fill(0));

    function drawGlyph() {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 28, 28);

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (Math.random() > 0.65) {
            grid[r][c] = Math.random() > 0.3 ? 1 : 0;
          }
          if (grid[r][c]) {
            ctx.fillStyle = state.isProcessing ? "#ffb000" : "rgba(255, 176, 0, 0.75)";
            ctx.fillRect(c * 4 + 2, r * 4 + 2, 3, 3);
          }
        }
      }
      setTimeout(drawGlyph, state.isProcessing ? 80 : 260);
    }
    drawGlyph();
  }

  // -------------------------------------------------------------
  // 2. Viewport Tab Switcher
  // -------------------------------------------------------------
  function switchTab(viewId) {
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));

    const btn = document.querySelector(`.view-btn[data-view="${viewId}"]`);
    if (btn) btn.classList.add("active");

    const panel = document.getElementById(viewId);
    if (panel) panel.classList.add("active");
    state.activeTab = viewId;
  }

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-view"));
    });
  });

  // -------------------------------------------------------------
  // 3. Preset Trigger Chips
  // -------------------------------------------------------------
  document.querySelectorAll(".trigger-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      promptInput.value = chip.getAttribute("data-query");
      auraForm.dispatchEvent(new Event("submit"));
    });
  });

  // -------------------------------------------------------------
  // 4. Trace Drawer Toggle & Close Inspector
  // -------------------------------------------------------------
  btnToggleTrace.addEventListener("click", () => {
    reasoningDrawer.classList.toggle("open");
    const isOpen = reasoningDrawer.classList.contains("open");
    document.getElementById("trace-toggle-icon").textContent = isOpen ? "[-]" : "[+]";
  });

  const btnCloseInsp = document.getElementById("btn-close-insp");
  if (btnCloseInsp) {
    btnCloseInsp.addEventListener("click", () => {
      document.getElementById("node-inspector").classList.remove("open");
    });
  }

  // -------------------------------------------------------------
  // 5. Command Palette (Ctrl+K)
  // -------------------------------------------------------------
  function openPalette() {
    paletteModal.classList.add("open");
    paletteInput.value = "";
    paletteInput.focus();
    filterPalette("");
  }

  function closePalette() {
    paletteModal.classList.remove("open");
  }

  btnOpenPalette.addEventListener("click", openPalette);
  btnClosePalette.addEventListener("click", closePalette);
  paletteModal.addEventListener("click", (e) => {
    if (e.target === paletteModal) closePalette();
  });

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (paletteModal.classList.contains("open")) closePalette();
      else openPalette();
    }
    if (e.key === "Escape" && paletteModal.classList.contains("open")) {
      closePalette();
    }
  });

  function filterPalette(q) {
    const term = q.toLowerCase();
    document.querySelectorAll(".palette-item").forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(term) ? "flex" : "none";
    });
  }

  paletteInput.addEventListener("input", (e) => filterPalette(e.target.value));

  document.querySelectorAll(".palette-item").forEach(item => {
    item.addEventListener("click", () => {
      const action = item.getAttribute("data-action");
      const val = item.getAttribute("data-val");
      closePalette();

      if (action === "query") {
        promptInput.value = val;
        auraForm.dispatchEvent(new Event("submit"));
      } else if (action === "tab") {
        switchTab(val);
      }
    });
  });

  // -------------------------------------------------------------
  // 6. Swarm Dispatch via Server-Sent Events (SSE)
  // -------------------------------------------------------------
  auraForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = promptInput.value.trim();
    if (!query || state.isProcessing) return;

    state.isProcessing = true;
    btnExecute.disabled = true;
    btnExecute.innerHTML = `<span class="hazard-stripe"></span><span class="btn-text">[ENGAGING_SWARM...]</span>`;
    briefingMeta.textContent = "EXECUTING STREAM";
    briefingText.textContent = "";

    // Reset Reasoning Trace
    state.reasoningSteps = [];
    traceStepCount.textContent = "0";
    traceStepsContainer.innerHTML = "";

    // Reset Guardrail indicators to armed
    guardIndicatorDot.className = "indicator-dot green";
    guardTextBanner.textContent = "GATEWAY PERIMETER: ARMED & VERIFIED";
    guardDetailText.textContent = "Auditing prompt input tokens against prompt injection vectors...";
    statGuardrail.textContent = "ZERO-PII: OK";
    ledGuardrail.className = "chip-led led-green";
    stripGuardrail.textContent = "SECURE";
    stripGuardrail.className = "strip-val green";

    // Set Three.js nodes to thinking state
    if (window.neuralCanvas3D) {
      window.neuralCanvas3D.setNodeState("supervisor", "THINKING");
    }

    try {
      const sseUrl = `/api/swarm/stream?query=${encodeURIComponent(query)}&session_id=${state.sessionId}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener("guardrail_alert", (evt) => {
        const d = JSON.parse(evt.data);
        guardIndicatorDot.className = "indicator-dot red";
        guardTextBanner.textContent = "⚠️ SECURITY INTERCEPT: PROMPT INJECTION HALTED";
        guardDetailText.textContent = d.detail || "Query quarantined under Zero-PII defense protocol.";
        statGuardrail.textContent = "SECURITY INTERCEPT";
        ledGuardrail.className = "chip-led led-red";
        stripGuardrail.textContent = "HALTED";
        stripGuardrail.className = "strip-val red";

        if (window.neuralCanvas3D) {
          window.neuralCanvas3D.setNodeState("supervisor", "BLOCKED");
          window.neuralCanvas3D.setNodeState("strategist", "BLOCKED");
        }
      });

      eventSource.addEventListener("synapse_pulse", (evt) => {
        const pulse = JSON.parse(evt.data);
        if (window.neuralCanvas3D) {
          window.neuralCanvas3D.firePulse(pulse.source_agent, pulse.target_agent, 0xffb000);
        }
      });

      eventSource.addEventListener("trace_step", (evt) => {
        const d = JSON.parse(evt.data);
        state.reasoningSteps.push(d.step);
        traceStepCount.textContent = state.reasoningSteps.length;

        const row = document.createElement("div");
        row.className = "trace-step-line";
        row.textContent = d.step;
        traceStepsContainer.appendChild(row);
        traceStepsContainer.scrollTop = traceStepsContainer.scrollHeight;
      });

      eventSource.addEventListener("token", (evt) => {
        const d = JSON.parse(evt.data);
        briefingText.textContent += d.token;
      });

      eventSource.addEventListener("complete", (evt) => {
        const result = JSON.parse(evt.data);
        eventSource.close();
        handleCompletion(result);
      });

      eventSource.onerror = (err) => {
        eventSource.close();
        // Fallback to standard execution if SSE fails
        fallbackExecute(query);
      };

    } catch (err) {
      fallbackExecute(query);
    }
  });

  async function fallbackExecute(query) {
    try {
      const res = await fetch("/api/swarm/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: state.sessionId, query })
      });
      const data = await res.json();
      briefingText.textContent = data.executive_summary;
      handleCompletion(data);
    } catch (e) {
      briefingText.textContent = `CRITICAL // Swarm Error: ${e.message}`;
      finishProcessing();
    }
  }

  function handleCompletion(data) {
    // 1. Update Telemetry Numbers
    statLatency.textContent = `LATENCY: ${data.total_latency_ms} ms`;
    briefingMeta.textContent = `CONVERGED: ${data.total_latency_ms} ms`;
    stripTokens.textContent = data.total_tokens || 842;
    stripCost.textContent = `$${(data.total_cost_usd || 0.000126).toFixed(6)}`;
    stripLatency.textContent = `${data.total_latency_ms} ms`;

    // 2. Update Bento Grid
    bentoTokens.textContent = data.total_tokens || 842;
    bentoCost.textContent = `$${(data.total_cost_usd || 0.000126).toFixed(6)}`;
    bentoCache.textContent = data.cache_hit ? "HIT (1.2ms)" : "MISS";
    bentoCache.className = `big-num ${data.cache_hit ? "green" : "amber"}`;

    // 3. Update Waterfall Timeline
    if (data.agent_metrics && data.agent_metrics.length) {
      waterfallList.innerHTML = "";
      const maxLat = Math.max(...data.agent_metrics.map(m => m.latency_ms), 1);

      data.agent_metrics.forEach(m => {
        const item = document.createElement("div");
        item.className = "waterfall-item";
        const pct = Math.max(12, Math.round((m.latency_ms / maxLat) * 95));
        item.innerHTML = `
          <span class="wf-agent">${m.name.split(" ")[0]}</span>
          <div class="wf-bar-wrap"><div class="wf-bar" style="width: ${pct}%"></div></div>
          <span class="wf-time">${m.latency_ms}ms</span>
        `;
        waterfallList.appendChild(item);
      });
    }

    // 4. Render Living Tree-of-Thought
    if (window.totVisualizer && data.thought_tree) {
      window.totVisualizer.render(data.thought_tree);
    }

    // 5. Render Sandbox Chart & Code
    if (data.sandbox_artifact) {
      renderSandboxArtifact(data.sandbox_artifact);
    }

    // 6. Voice Narrator
    if (window.audioHUD && data.voice_speech_script && !data.is_guardrail_triggered) {
      window.audioHUD.speak(data.voice_speech_script);
    }

    finishProcessing();
  }

  function finishProcessing() {
    state.isProcessing = false;
    btnExecute.disabled = false;
    btnExecute.innerHTML = `<span class="hazard-stripe"></span><span class="btn-text">[ENGAGE_SWARM // EXEC_CYCLE]</span><span class="btn-arrow">&#9658;</span>`;
  }

  // -------------------------------------------------------------
  // 7. Dynamic Chart.js Sandbox Renderer (NERV Amber Theme)
  // -------------------------------------------------------------
  function renderSandboxArtifact(artifact) {
    document.getElementById("sandbox-chart-title").textContent = artifact.title.toUpperCase();
    document.getElementById("sandbox-code-display").textContent = artifact.code_snippet || "// Code executed safely in sandbox runtime.";

    const canvas = document.getElementById("sandbox-chart");
    if (!canvas || !window.Chart) return;

    if (state.currentChart) {
      state.currentChart.destroy();
    }

    // Override colors with Amber CRT palette
    if (artifact.chart_data && artifact.chart_data.datasets) {
      artifact.chart_data.datasets.forEach((ds, idx) => {
        ds.borderColor = idx === 0 ? "#ffb000" : (idx === 1 ? "#34d399" : "#ffc433");
        ds.backgroundColor = idx === 0 ? "rgba(255, 176, 0, 0.25)" : (idx === 1 ? "rgba(52, 211, 153, 0.25)" : "rgba(255, 196, 51, 0.25)");
        ds.borderWidth = 2;
      });
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
              color: "#ffb000",
              font: { family: "'JetBrains Mono', monospace", size: 11 }
            }
          }
        },
        scales: artifact.chart_type === "radar" ? {
          r: {
            grid: { color: "rgba(255, 176, 0, 0.15)" },
            angleLines: { color: "rgba(255, 176, 0, 0.15)" },
            pointLabels: { color: "#ffffff", font: { family: "'JetBrains Mono', monospace" } }
          }
        } : {
          x: {
            grid: { color: "rgba(255, 176, 0, 0.08)" },
            ticks: { color: "#8b9bb4", font: { family: "'JetBrains Mono', monospace" } }
          },
          y: {
            grid: { color: "rgba(255, 176, 0, 0.08)" },
            ticks: { color: "#8b9bb4", font: { family: "'JetBrains Mono', monospace" } }
          }
        }
      }
    });
  }

  // Pre-seed initial execution after load
  setTimeout(() => {
    promptInput.value = "Analyze Pareto token economics and compute cost reduction across LLM tiers";
    auraForm.dispatchEvent(new Event("submit"));
  }, 400);
});

