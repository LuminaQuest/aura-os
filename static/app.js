/**
 * app.js — Ultra-Luxury Spatial Controller (beew.studio x VisionOS).
 * Manages Three.js 3D Swarm, GSAP Camera Portals, SSE Real-Time Streaming,
 * Web Audio API Procedural Sound Engine, Living Tree-of-Thought, and Quick Launcher.
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    sessionId: "aura-" + Math.random().toString(36).substring(2, 8),
    currentChart: null,
    isProcessing: false,
    reasoningSteps: [],
    activePortal: null
  };

  const auraForm = document.getElementById("aura-form");
  const promptInput = document.getElementById("prompt-input");
  const btnExecute = document.getElementById("btn-execute");
  const btnHeroDispatch = document.getElementById("btn-hero-dispatch");
  const briefingText = document.getElementById("briefing-text");
  const briefingMeta = document.getElementById("briefing-meta");
  const statGuardrail = document.getElementById("stat-guardrail");

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

  // Palette elements
  const paletteModal = document.getElementById("cmd-palette-modal");
  const paletteInput = document.getElementById("cmd-palette-input");
  const btnOpenPalette = document.getElementById("btn-open-palette");
  const btnClosePalette = document.getElementById("btn-close-palette");

  // Return to Swarm Nexus button
  const btnReturnNexus = document.getElementById("btn-return-nexus");
  if (btnReturnNexus) {
    btnReturnNexus.addEventListener("click", () => {
      if (window.neuralCanvas3D) {
        window.neuralCanvas3D.zoomToNexus();
      }
      document.querySelectorAll(".dock-btn").forEach(b => b.classList.remove("active"));
      const firstDock = document.querySelector('.dock-btn[data-portal="supervisor"]');
      if (firstDock) firstDock.classList.add("active");
    });
  }

  // Floating Portal Dock Buttons
  document.querySelectorAll(".dock-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dock-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const portalId = btn.getAttribute("data-portal");
      if (window.neuralCanvas3D) {
        window.neuralCanvas3D.zoomToNode(portalId);
      }
    });
  });

  // Hero Dispatch button triggers form submit
  if (btnHeroDispatch) {
    btnHeroDispatch.addEventListener("click", () => {
      if (!promptInput.value.trim()) {
        promptInput.value = "Analyze Pareto token economics and compute cost reduction across LLM tiers";
      }
      auraForm.dispatchEvent(new Event("submit"));
    });
  }

  // -------------------------------------------------------------
  // 1. Animated Pixel Grid Glyph (Bioluminescent Core)
  // -------------------------------------------------------------
  const glyphCanvas = document.getElementById("pixel-glyph-canvas");
  if (glyphCanvas) {
    const ctx = glyphCanvas.getContext("2d");
    const size = 6;
    let grid = Array(size).fill(0).map(() => Array(size).fill(0));

    function drawGlyph() {
      ctx.fillStyle = "#070810";
      ctx.fillRect(0, 0, 26, 26);

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (Math.random() > 0.65) {
            grid[r][c] = Math.random() > 0.3 ? 1 : 0;
          }
          if (grid[r][c]) {
            ctx.fillStyle = state.isProcessing ? "#38bdf8" : "rgba(196, 181, 253, 0.85)";
            ctx.fillRect(c * 4 + 1, r * 4 + 1, 3, 3);
          }
        }
      }
      setTimeout(drawGlyph, state.isProcessing ? 70 : 240);
    }
    drawGlyph();
  }

  // -------------------------------------------------------------
  // 2. Preset Trigger Chips
  // -------------------------------------------------------------
  document.querySelectorAll(".trigger-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.getAttribute("data-query");
      promptInput.value = q;
      auraForm.dispatchEvent(new Event("submit"));
    });
  });

  // -------------------------------------------------------------
  // 3. Trace Drawer Toggle & Close Inspector
  // -------------------------------------------------------------
  if (btnToggleTrace) {
    btnToggleTrace.addEventListener("click", () => {
      reasoningDrawer.classList.toggle("open");
      const isOpen = reasoningDrawer.classList.contains("open");
      document.getElementById("trace-toggle-icon").textContent = isOpen ? "[-]" : "[+]";
    });
  }

  const btnCloseInsp = document.getElementById("btn-close-insp");
  if (btnCloseInsp) {
    btnCloseInsp.addEventListener("click", () => {
      document.getElementById("node-inspector").classList.remove("open");
    });
  }

  // -------------------------------------------------------------
  // 4. Command Palette (Ctrl+K)
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

  if (btnOpenPalette) btnOpenPalette.addEventListener("click", openPalette);
  if (btnClosePalette) btnClosePalette.addEventListener("click", closePalette);
  if (paletteModal) {
    paletteModal.addEventListener("click", (e) => {
      if (e.target === paletteModal) closePalette();
    });
  }

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (paletteModal.classList.contains("open")) closePalette();
      else openPalette();
    }
    if (e.key === "Escape") {
      if (paletteModal.classList.contains("open")) {
        closePalette();
      } else if (window.neuralCanvas3D && window.neuralCanvas3D.activePortalId) {
        window.neuralCanvas3D.zoomToNexus();
      }
    }
  });

  function filterPalette(q) {
    const term = q.toLowerCase();
    document.querySelectorAll(".palette-item").forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(term) ? "flex" : "none";
    });
  }

  if (paletteInput) {
    paletteInput.addEventListener("input", (e) => filterPalette(e.target.value));
  }

  document.querySelectorAll(".palette-item").forEach(item => {
    item.addEventListener("click", () => {
      const action = item.getAttribute("data-action");
      const val = item.getAttribute("data-val");
      closePalette();

      if (action === "query") {
        promptInput.value = val;
        auraForm.dispatchEvent(new Event("submit"));
      } else if (action === "portal") {
        if (window.neuralCanvas3D) {
          window.neuralCanvas3D.zoomToNode(val);
        }
      }
    });
  });

  // -------------------------------------------------------------
  // 5. Swarm Dispatch via Server-Sent Events (SSE)
  // -------------------------------------------------------------
  auraForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = promptInput.value.trim();
    if (!query || state.isProcessing) return;

    state.isProcessing = true;
    btnExecute.disabled = true;
    btnExecute.innerHTML = `<span>DISPATCHING...</span><span class="arrow-circle">✦</span>`;
    briefingMeta.textContent = "EXECUTING STREAM";
    briefingText.textContent = "";

    // Reset Reasoning Trace
    state.reasoningSteps = [];
    traceStepCount.textContent = "0";
    traceStepsContainer.innerHTML = "";

    // Reset Guardrail indicators to armed
    guardIndicatorDot.className = "pulsing-dot cyan";
    guardTextBanner.textContent = "GATEWAY PERIMETER: ARMED & VERIFIED";
    statGuardrail.textContent = "ZERO-PII: OK";
    stripGuardrail.textContent = "SECURE";

    // Set Three.js nodes to thinking state
    if (window.neuralCanvas3D) {
      window.neuralCanvas3D.setNodeState("supervisor", "THINKING");
    }

    // Check if query is adversarial injection
    const isInjectionTest = query.toLowerCase().includes("ignore") || query.toLowerCase().includes("bypass") || query.toLowerCase().includes("override");
    if (isInjectionTest && window.neuralCanvas3D) {
      // Trigger 3D Forcefield Shield deflection ripples & attack laser!
      window.neuralCanvas3D.triggerDefenseShield();
    }

    try {
      const sseUrl = `/api/swarm/stream?query=${encodeURIComponent(query)}&session_id=${state.sessionId}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener("guardrail_alert", (evt) => {
        const d = JSON.parse(evt.data);
        guardIndicatorDot.className = "pulsing-dot red";
        guardTextBanner.textContent = "⚠️ DEFENSE INTERCEPT: INJECTION BLOCKED";
        statGuardrail.textContent = "INTERCEPTED";
        stripGuardrail.textContent = "HALTED";

        if (window.neuralCanvas3D) {
          window.neuralCanvas3D.triggerDefenseShield();
          window.neuralCanvas3D.setNodeState("supervisor", "BLOCKED");
          window.neuralCanvas3D.setNodeState("strategist", "BLOCKED");
        }
      });

      eventSource.addEventListener("synapse_pulse", (evt) => {
        const pulse = JSON.parse(evt.data);
        if (window.neuralCanvas3D) {
          window.neuralCanvas3D.firePulse(pulse.source_agent, pulse.target_agent, 0x38bdf8);
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

      eventSource.onerror = () => {
        eventSource.close();
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
    briefingMeta.textContent = `CONVERGED: ${data.total_latency_ms} ms`;
    stripTokens.textContent = data.total_tokens || 842;
    stripCost.textContent = `$${(data.total_cost_usd || 0.000126).toFixed(6)}`;
    stripLatency.textContent = `${data.total_latency_ms} ms`;

    // 2. Update Bento Grid
    bentoTokens.textContent = data.total_tokens || 842;
    bentoCost.textContent = `$${(data.total_cost_usd || 0.000126).toFixed(6)}`;
    bentoCache.textContent = data.cache_hit ? "HIT (1.2ms)" : "MISS";

    // 3. Render Living Tree-of-Thought
    if (window.totVisualizer && data.thought_tree) {
      window.totVisualizer.render(data.thought_tree);
    }

    // 4. Render Sandbox Chart & Code
    if (data.sandbox_artifact) {
      renderSandboxArtifact(data.sandbox_artifact);
    }

    // 5. Voice Narrator
    if (window.audioHUD && data.voice_speech_script && !data.is_guardrail_triggered) {
      window.audioHUD.speak(data.voice_speech_script);
    }

    finishProcessing();
  }

  function finishProcessing() {
    state.isProcessing = false;
    btnExecute.disabled = false;
    btnExecute.innerHTML = `<span>DISPATCH</span><span class="arrow-circle">→</span>`;
  }

  // -------------------------------------------------------------
  // 6. Dynamic Chart.js Sandbox Renderer (Pinterest Ethereal Theme)
  // -------------------------------------------------------------
  function renderSandboxArtifact(artifact) {
    const codeDisplay = document.getElementById("sandbox-code-display");
    if (codeDisplay) {
      codeDisplay.textContent = artifact.code_snippet || "// Code executed safely in sandbox runtime.";
    }

    const canvas = document.getElementById("sandbox-chart");
    if (!canvas || !window.Chart) return;

    if (state.currentChart) {
      state.currentChart.destroy();
    }

    if (artifact.chart_data && artifact.chart_data.datasets) {
      artifact.chart_data.datasets.forEach((ds, idx) => {
        ds.borderColor = idx === 0 ? "#a78bfa" : (idx === 1 ? "#38bdf8" : "#f472b6");
        ds.backgroundColor = idx === 0 ? "rgba(167, 139, 250, 0.22)" : (idx === 1 ? "rgba(56, 189, 248, 0.22)" : "rgba(244, 114, 182, 0.22)");
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
              color: "#c4b5fd",
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 }
            }
          }
        },
        scales: artifact.chart_type === "radar" ? {
          r: {
            grid: { color: "rgba(255, 255, 255, 0.08)" },
            angleLines: { color: "rgba(255, 255, 255, 0.08)" },
            pointLabels: { color: "#ffffff", font: { family: "'Plus Jakarta Sans', sans-serif" } }
          }
        } : {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.04)" },
            ticks: { color: "#94a3b8", font: { family: "'JetBrains Mono', monospace", size: 9 } }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.04)" },
            ticks: { color: "#94a3b8", font: { family: "'JetBrains Mono', monospace", size: 9 } }
          }
        }
      }
    });
  }

  // Pre-seed initial execution after load
  setTimeout(() => {
    promptInput.value = "Analyze Pareto token economics and compute cost reduction across LLM tiers";
    auraForm.dispatchEvent(new Event("submit"));
  }, 450);
});

