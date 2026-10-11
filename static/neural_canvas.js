/**
 * neural_canvas.js — Physics-Based Spatial Neural Synapse Canvas.
 * Simulates floating agent nodes with spring forces, curved synapse connections,
 * and glowing energy particle pulses that travel along synapse wires.
 */

class NeuralSynapseCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.nodes = [];
    this.particles = [];
    this.draggedNode = null;
    this.hoveredNode = null;
    this.isFiring = false;

    this.initCanvasSize();
    window.addEventListener("resize", () => this.initCanvasSize());
    this.setupInteractivity();
    this.setupNodes();
    this.startRenderLoop();
  }

  initCanvasSize() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
    if (this.nodes.length) this.repositionNodes();
  }

  setupNodes() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const r = Math.min(cx, cy) * 0.65;

    const baseData = [
      { id: "supervisor", name: "Aura Prime", role: "Swarm Supervisor & Gatekeeper", icon: "🧠", color: "#00f3ff", angle: -Math.PI / 2 },
      { id: "strategist", name: "Nexus Strategist", role: "ToT Plan Architect", icon: "🎯", color: "#818cf8", angle: -Math.PI / 2 + 1.25 },
      { id: "data_engineer", name: "Vector & Code", role: "Sandbox Execution Specialist", icon: "⚡", color: "#00ff88", angle: -Math.PI / 2 + 2.5 },
      { id: "vision_analyst", name: "Spatial Visionary", role: "Topology & UI Specialist", icon: "👁️", color: "#f472b6", angle: -Math.PI / 2 + 3.75 },
      { id: "executive_synthesizer", name: "Executive Voice", role: "Multimodal Voice Narrator", icon: "🎙️", color: "#fbbf24", angle: -Math.PI / 2 + 5.0 }
    ];

    this.nodes = baseData.map(d => ({
      ...d,
      x: cx + r * Math.cos(d.angle),
      y: cy + r * Math.sin(d.angle),
      baseX: cx + r * Math.cos(d.angle),
      baseY: cy + r * Math.sin(d.angle),
      vx: 0,
      vy: 0,
      radius: 28,
      pulseRing: 0
    }));

    // Define synapse connections
    this.connections = [
      ["supervisor", "strategist"],
      ["supervisor", "data_engineer"],
      ["supervisor", "executive_synthesizer"],
      ["strategist", "data_engineer"],
      ["strategist", "vision_analyst"],
      ["data_engineer", "executive_synthesizer"],
      ["vision_analyst", "executive_synthesizer"]
    ];
  }

  repositionNodes() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const r = Math.min(cx, cy) * 0.65;

    this.nodes.forEach(n => {
      n.x = cx + r * Math.cos(n.angle);
      n.y = cy + r * Math.sin(n.angle);
      n.baseX = n.x;
      n.baseY = n.y;
    });
  }

  fireSynapsePulses(sequence) {
    if (!sequence || !sequence.length) return;
    
    sequence.forEach((p, idx) => {
      setTimeout(() => {
        const src = this.nodes.find(n => n.id === p.source_agent);
        const tgt = this.nodes.find(n => n.id === p.target_agent);
        if (src && tgt) {
          src.pulseRing = 1.0;
          this.createPhotonStream(src, tgt, p.color);
        }
      }, idx * 180);
    });
  }

  createPhotonStream(src, tgt, color = "#00f3ff") {
    const count = 8;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        src,
        tgt,
        progress: -i * 0.08,
        speed: 0.02 + Math.random() * 0.008,
        color: color,
        size: 3 + Math.random() * 2,
        tail: []
      });
    }
  }

  setupInteractivity() {
    this.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      this.nodes.forEach(n => {
        const dist = Math.hypot(n.x - mx, n.y - my);
        if (dist < n.radius) {
          this.draggedNode = n;
          this.selectNode(n);
        }
      });
    });

    window.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (this.draggedNode) {
        this.draggedNode.x = mx;
        this.draggedNode.y = my;
      } else {
        this.hoveredNode = null;
        this.nodes.forEach(n => {
          if (Math.hypot(n.x - mx, n.y - my) < n.radius) {
            this.hoveredNode = n;
          }
        });
        this.canvas.style.cursor = this.hoveredNode ? "pointer" : "default";
      }
    });

    window.addEventListener("mouseup", () => {
      this.draggedNode = null;
    });
  }

  selectNode(n) {
    const drawer = document.getElementById("node-inspector");
    if (!drawer) return;
    document.getElementById("insp-name").textContent = n.name;
    document.getElementById("insp-role").textContent = n.role;
    document.getElementById("insp-details").textContent = 
      `Agent ID: ${n.id} // Frequency: 132 Hz // Active Energy: 100% // Persona: Autonomous Specialist`;
    drawer.classList.add("open");
  }

  startRenderLoop() {
    const render = () => {
      this.updatePhysics();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  updatePhysics() {
    // Gentle floating orbit motion
    const t = performance.now() * 0.0015;
    this.nodes.forEach((n, idx) => {
      if (n !== this.draggedNode) {
        const floatOffset = Math.sin(t + idx * 1.3) * 6;
        n.x += (n.baseX + floatOffset - n.x) * 0.05;
        n.y += (n.baseY + Math.cos(t + idx * 1.5) * 6 - n.y) * 0.05;
      }
      if (n.pulseRing > 0) {
        n.pulseRing -= 0.02;
      }
    });

    // Update energy particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.progress += p.speed;
      if (p.progress > 0 && p.progress < 1) {
        // Record tail
        const curX = p.src.x + (p.tgt.x - p.src.x) * p.progress;
        const curY = p.src.y + (p.tgt.y - p.src.y) * p.progress;
        p.tail.unshift({ x: curX, y: curY });
        if (p.tail.length > 5) p.tail.pop();
      }
      if (p.progress >= 1) {
        p.tgt.pulseRing = 0.8;
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Synapse Connector Wires
    this.connections.forEach(([srcId, tgtId]) => {
      const src = this.nodes.find(n => n.id === srcId);
      const tgt = this.nodes.find(n => n.id === tgtId);
      if (src && tgt) {
        this.ctx.beginPath();
        this.ctx.moveTo(src.x, src.y);
        this.ctx.lineTo(tgt.x, tgt.y);
        this.ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      }
    });

    // 2. Draw Traveling Energy Particles with Glow
    this.particles.forEach(p => {
      if (p.progress >= 0 && p.progress <= 1) {
        const curX = p.src.x + (p.tgt.x - p.src.x) * p.progress;
        const curY = p.src.y + (p.tgt.y - p.src.y) * p.progress;

        // Tail
        p.tail.forEach((pt, idx) => {
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, p.size * (1 - idx / p.tail.length), 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(0, 243, 255, ${0.4 - idx * 0.08})`;
          this.ctx.fill();
        });

        // Photon Head
        this.ctx.beginPath();
        this.ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 14;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    });

    // 3. Draw Agent Nodes
    this.nodes.forEach(n => {
      // Pulse ring when active
      if (n.pulseRing > 0) {
        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, n.radius + (1 - n.pulseRing) * 30, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(0, 243, 255, ${n.pulseRing * 0.8})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      // Outer Glow circle
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(10, 16, 29, 0.9)";
      this.ctx.shadowColor = n.color;
      this.ctx.shadowBlur = (n === this.hoveredNode || n.pulseRing > 0) ? 22 : 10;
      this.ctx.fill();

      // Border ring
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = n.color;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // Icon & Label
      this.ctx.font = "18px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(n.icon, n.x, n.y);

      // Node Name Label
      this.ctx.font = "bold 11px 'Space Grotesk', sans-serif";
      this.ctx.fillStyle = "#f8fafc";
      this.ctx.fillText(n.name, n.x, n.y + n.radius + 16);

      // Node Role sub-label
      this.ctx.font = "9px 'JetBrains Mono', monospace";
      this.ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      this.ctx.fillText(n.role.split("&")[0], n.x, n.y + n.radius + 28);
    });
  }
}

// Global initialization
window.neuralCanvas = null;
document.addEventListener("DOMContentLoaded", () => {
  window.neuralCanvas = new NeuralSynapseCanvas("neural-canvas");
  
  const closeBtn = document.getElementById("btn-close-insp");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("node-inspector").classList.remove("open");
    });
  }
});
