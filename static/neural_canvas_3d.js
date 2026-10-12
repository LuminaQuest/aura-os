/**
 * neural_canvas_3d.js — Three.js + GSAP 3D Spatial Swarm & Multi-Portal Director.
 * Elite Awwwards / VisionOS / Pinterest Luxury Tech:
 * - GSAP cinematic camera zoom-in fly-throughs into specialist portals
 * - Hyperspace stardust speed streak warp animation
 * - 3D Geodesic Forcefield Shield with real-time deflection shockwaves
 * - Liquid Chrome, Celestial Lilac, and Ice Cyan materials
 * - Procedural Web Audio sound triggers on navigation
 */

class NeuralCanvas3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.targetMouse = new THREE.Vector2();

    this.nodes = [];
    this.nodeMeshes = {};
    this.synapseLines = [];
    this.activePhotons = [];
    this.stardustParticles = null;
    this.hoveredNode = null;
    this.activePortalId = null;
    this.isTransitioning = false;
    this.warpSpeed = 0.0;

    // 3D Forcefield Shield
    this.shieldMesh = null;
    this.shieldShockwave = 0;

    // Laser attack rays for defense simulation
    this.attackLasers = [];

    this.isRunning = true;
    this.clock = new THREE.Clock();

    this.initScene();
    this.initStardust();
    this.initNodes();
    this.initForcefieldShield();
    this.initSynapses();
    this.initListeners();
    this.animate();
  }

  initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05060a, 0.035);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 11);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // Ethereal Dual Atmospheric Lighting (Celestial Lilac & Ice Cyan)
    const ambientLight = new THREE.AmbientLight(0xa78bfa, 0.65);
    this.scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 2.8, 35);
    cyanLight.position.set(4, 5, 6);
    this.scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xc084fc, 2.5, 35);
    violetLight.position.set(-4, -3, 5);
    this.scene.add(violetLight);
  }

  initStardust() {
    // 300 floating ambient stardust motes that stretch during hyperspace warp
    const count = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xa78bfa),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xf472b6),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.55
    });

    this.stardustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.stardustParticles);
  }

  initNodes() {
    this.nodeData = [
      { id: "supervisor", tag: "ORCH-01", name: "COGNITIVE GATEWAY", role: "Swarm Supervisor & Security Perimeter", pos: [0, 1.8, 0.2], color: 0xa78bfa, glowColor: 0xc4b5fd, portalView: "canvas-view" },
      { id: "strategist", tag: "PLAN-02", name: "BRANCH EXPLORER", role: "ToT Speculative Decomposition", pos: [-3.3, 0.5, 0.8], color: 0x38bdf8, glowColor: 0x7dd3fc, portalView: "tot-view" },
      { id: "data_engineer", tag: "EXEC-03", name: "SANDBOX RUNTIME", role: "Isolated Analytics & Dynamic Charts", pos: [3.3, 0.5, -0.4], color: 0x818cf8, glowColor: 0xa5b4fc, portalView: "sandbox-view" },
      { id: "vision_analyst", tag: "TOPO-04", name: "GRAPH AUDITOR", role: "Synapse Matrix & Memory Auditor", pos: [-2.1, -1.3, 0.6], color: 0xf472b6, glowColor: 0xf9a8d4, portalView: "canvas-view" },
      { id: "executive_synthesizer", tag: "COMM-05", name: "AUDIO TELEMETRY", role: "Multimodal Voice & Telemetry Stream", pos: [2.1, -1.3, -0.6], color: 0xf1f5f9, glowColor: 0xffffff, portalView: "sandbox-view" }
    ];

    this.nodeData.forEach(data => {
      const group = new THREE.Group();
      group.position.set(...data.pos);
      group.userData = { ...data, state: "IDLE", pulse: 0, orbitAngle: 0 };

      // 1. Crystal Core Sphere
      const coreGeo = new THREE.SphereGeometry(0.38, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({ color: data.color });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // 2. Translucent Geometric Outer Cage
      const shellGeo = new THREE.IcosahedronGeometry(0.62, 0);
      const shellMat = new THREE.MeshBasicMaterial({
        color: data.glowColor,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);
      group.add(shellMesh);

      // 3. Ethereal Halo Ripple Ring
      const ringGeo = new THREE.RingGeometry(0.72, 0.84, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: data.glowColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      // 4. Orbiting Stardust Satellite Bead
      const satGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.position.set(0.85, 0, 0);
      group.add(satMesh);

      this.scene.add(group);
      this.nodeMeshes[data.id] = { group, coreMesh, shellMesh, ringMesh, satMesh, data };
    });
  }

  initForcefieldShield() {
    // 3D Geodesic Forcefield Shield around Supervisor Node ORCH-01
    const supNode = this.nodeMeshes["supervisor"];
    if (!supNode) return;

    const shieldGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    supNode.group.add(this.shieldMesh);
  }

  initSynapses() {
    this.connections = [
      ["supervisor", "strategist"],
      ["supervisor", "data_engineer"],
      ["supervisor", "executive_synthesizer"],
      ["strategist", "data_engineer"],
      ["strategist", "vision_analyst"],
      ["data_engineer", "executive_synthesizer"],
      ["vision_analyst", "executive_synthesizer"]
    ];

    this.connections.forEach(([srcId, tgtId]) => {
      const srcNode = this.nodeMeshes[srcId];
      const tgtNode = this.nodeMeshes[tgtId];
      if (!srcNode || !tgtNode) return;

      const p1 = srcNode.group.position;
      const p2 = tgtNode.group.position;

      const points = [p1, p2];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.22,
        linewidth: 1
      });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);

      this.synapseLines.push({ srcId, tgtId, line, p1, p2, activePulse: 0 });
    });
  }

  /**
   * GSAP Smooth Camera Zoom Fly-Through into Agent Portal
   */
  zoomToNode(nodeId) {
    const nodeObj = this.nodeMeshes[nodeId];
    if (!nodeObj) return;

    this.activePortalId = nodeId;
    this.isTransitioning = true;
    this.warpSpeed = 1.0;

    // Trigger audio warp and portal entry sound effects
    if (window.audioHUD) {
      window.audioHUD.playWarpSweep();
      setTimeout(() => window.audioHUD.playPortalEntry(), 900);
    }

    const targetPos = nodeObj.group.position.clone();
    const focalPos = new THREE.Vector3(targetPos.x * 0.45, targetPos.y * 0.45, targetPos.z + 2.8);

    // Update floating return capsule dock
    const returnDock = document.getElementById("portal-return-dock");
    const portalLabel = document.getElementById("active-portal-label");
    if (returnDock) returnDock.classList.add("visible");
    if (portalLabel) portalLabel.textContent = `PORTAL // ${nodeObj.data.tag} [${nodeObj.data.name}]`;

    if (window.gsap) {
      // Smooth Camera Translation
      window.gsap.to(this.camera.position, {
        x: focalPos.x,
        y: focalPos.y,
        z: focalPos.z,
        duration: 1.6,
        ease: "power3.inOut",
        onComplete: () => {
          this.isTransitioning = false;
          this.warpSpeed = 0.0;
        }
      });

      // Camera FOV Warp Compression (Squeeze then relax)
      window.gsap.to(this.camera, {
        fov: 32,
        duration: 0.8,
        ease: "power2.in",
        yoyo: true,
        repeat: 1,
        onUpdate: () => this.camera.updateProjectionMatrix()
      });
    } else {
      // Fallback interpolation if GSAP is loading
      this.camera.position.copy(focalPos);
      this.isTransitioning = false;
      this.warpSpeed = 0.0;
    }

    this.selectNode(nodeObj.data);
  }

  /**
   * GSAP Smooth Camera Pullback to Swarm Constellation Overview
   */
  zoomToNexus() {
    this.activePortalId = null;
    this.isTransitioning = true;
    this.warpSpeed = 0.6;

    if (window.audioHUD) {
      window.audioHUD.playWarpSweep();
    }

    const returnDock = document.getElementById("portal-return-dock");
    if (returnDock) returnDock.classList.remove("visible");

    const drawer = document.getElementById("node-inspector");
    if (drawer) drawer.classList.remove("open");

    if (window.gsap) {
      window.gsap.to(this.camera.position, {
        x: 0,
        y: 0,
        z: 11,
        duration: 1.5,
        ease: "power3.inOut",
        onComplete: () => {
          this.isTransitioning = false;
          this.warpSpeed = 0.0;
        }
      });

      window.gsap.to(this.camera, {
        fov: 45,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => this.camera.updateProjectionMatrix()
      });
    } else {
      this.camera.position.set(0, 0, 11);
      this.isTransitioning = false;
      this.warpSpeed = 0.0;
    }
  }

  /**
   * 3D Guardrail Defense Simulation: Fires attack ray & ripples forcefield shield
   */
  triggerDefenseShield() {
    const supNode = this.nodeMeshes["supervisor"];
    if (!supNode || !this.shieldMesh) return;

    if (window.audioHUD) {
      window.audioHUD.playShieldDeflect();
    }

    // Flash shield mesh
    this.shieldMesh.material.color.setHex(0xf43f5e);
    this.shieldMesh.material.opacity = 0.85;

    // Red attack laser beam
    const startPos = new THREE.Vector3(-6, 5, 4);
    const endPos = supNode.group.position.clone();
    const lineGeo = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 });
    const laserLine = new THREE.Line(lineGeo, lineMat);
    this.scene.add(laserLine);

    setTimeout(() => {
      this.scene.remove(laserLine);
      lineGeo.dispose();
      lineMat.dispose();

      // Shield ripples and settles to safe cyan
      this.shieldMesh.material.color.setHex(0x38bdf8);
      this.shieldMesh.material.opacity = 0.35;
    }, 450);
  }

  firePulse(srcId, tgtId, color = 0x38bdf8) {
    const srcNode = this.nodeMeshes[srcId];
    const tgtNode = this.nodeMeshes[tgtId];
    if (!srcNode || !tgtNode) return;

    this.setNodeState(srcId, "WORKING");
    setTimeout(() => this.setNodeState(tgtId, "WORKING"), 240);

    const p1 = srcNode.group.position;
    const p2 = tgtNode.group.position;

    const photonGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const photonMat = new THREE.MeshBasicMaterial({ color: color });
    const photonMesh = new THREE.Mesh(photonGeo, photonMat);
    this.scene.add(photonMesh);

    this.activePhotons.push({
      mesh: photonMesh,
      start: p1.clone(),
      end: p2.clone(),
      progress: 0,
      speed: 0.045
    });

    const syn = this.synapseLines.find(s => (s.srcId === srcId && s.tgtId === tgtId) || (s.srcId === tgtId && s.tgtId === srcId));
    if (syn) {
      syn.line.material.opacity = 0.95;
      syn.line.material.color.setHex(0xffffff);
      setTimeout(() => {
        syn.line.material.opacity = 0.22;
        syn.line.material.color.setHex(0x818cf8);
      }, 350);
    }
  }

  setNodeState(nodeId, state) {
    const nodeObj = this.nodeMeshes[nodeId];
    if (!nodeObj) return;

    nodeObj.group.userData.state = state;
    if (state === "THINKING") {
      nodeObj.ringMesh.material.opacity = 0.85;
    } else if (state === "WORKING") {
      nodeObj.ringMesh.material.opacity = 0.65;
    } else if (state === "DONE") {
      nodeObj.ringMesh.material.opacity = 0.0;
      setTimeout(() => this.setNodeState(nodeId, "IDLE"), 1200);
    } else if (state === "BLOCKED") {
      nodeObj.coreMesh.material.color.setHex(0xf43f5e);
      nodeObj.shellMesh.material.color.setHex(0xf43f5e);
      setTimeout(() => {
        nodeObj.coreMesh.material.color.setHex(nodeObj.data.color);
        nodeObj.shellMesh.material.color.setHex(nodeObj.data.glowColor);
        this.setNodeState(nodeId, "IDLE");
      }, 2500);
    }
  }

  initListeners() {
    window.addEventListener("resize", () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    window.addEventListener("mousemove", (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Raycast hover check
      if (!this.isTransitioning && this.container) {
        const rect = this.container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
        const targets = Object.values(this.nodeMeshes).map(n => n.coreMesh);
        const intersects = this.raycaster.intersectObjects(targets);

        if (intersects.length > 0) {
          document.body.style.cursor = "pointer";
          const hitGroup = intersects[0].object.parent;
          if (hitGroup && this.hoveredNode !== hitGroup.userData.id) {
            this.hoveredNode = hitGroup.userData.id;
            if (window.audioHUD) window.audioHUD.playHover();
          }
        } else {
          document.body.style.cursor = "default";
          this.hoveredNode = null;
        }
      }
    });

    this.container.addEventListener("click", (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

      const targets = Object.values(this.nodeMeshes).map(n => n.coreMesh);
      const intersects = this.raycaster.intersectObjects(targets);
      if (intersects.length > 0) {
        const hitGroup = intersects[0].object.parent;
        if (hitGroup && hitGroup.userData) {
          this.zoomToNode(hitGroup.userData.id);
        }
      }
    });

    document.addEventListener("visibilitychange", () => {
      this.isRunning = !document.hidden;
      if (this.isRunning) {
        this.clock.start();
        this.animate();
      }
    });
  }

  selectNode(data) {
    const drawer = document.getElementById("node-inspector");
    if (!drawer) return;
    document.getElementById("insp-badge").textContent = `NODE // ${data.tag}`;
    document.getElementById("insp-name").textContent = data.name;
    document.getElementById("insp-role").textContent = data.role;
    document.getElementById("insp-details").innerHTML = 
      `IDENT: ${data.id.toUpperCase()}<br/>` +
      `STATUS: ONLINE // ZERO-PII PERIMETER<br/>` +
      `SPATIAL PORTAL: CINEMATIC GSAP LINKED<br/>` +
      `ARCHITECTURE: AUTONOMOUS ETHEREAL SWARM`;
    drawer.classList.add("open");
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth Mouse Parallax (only when not locked in portal zoom)
    if (!this.activePortalId && !this.isTransitioning) {
      this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
      this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

      this.camera.position.x = this.mouse.x * 1.8;
      this.camera.position.y = this.mouse.y * 1.2;
      this.camera.lookAt(0, 0.2, 0);
    }

    // Drift stardust & accelerate during warp
    if (this.stardustParticles) {
      this.stardustParticles.rotation.y = time * 0.02;
      if (this.warpSpeed > 0.01) {
        const posAttr = this.stardustParticles.geometry.attributes.position;
        for (let i = 2; i < posAttr.array.length; i += 3) {
          posAttr.array[i] += this.warpSpeed * 0.35;
          if (posAttr.array[i] > 10) posAttr.array[i] = -10;
        }
        posAttr.needsUpdate = true;
      }
    }

    // Rotate Forcefield Shield
    if (this.shieldMesh) {
      this.shieldMesh.rotation.y += 0.008;
      this.shieldMesh.rotation.x += 0.004;
    }

    // Animate Nodes
    Object.values(this.nodeMeshes).forEach(({ group, shellMesh, ringMesh, satMesh }) => {
      const state = group.userData.state;

      shellMesh.rotation.y += 0.012;
      shellMesh.rotation.x += 0.007;

      group.userData.orbitAngle += (state === "WORKING" ? 0.08 : 0.025);
      const r = 0.82;
      satMesh.position.x = Math.cos(group.userData.orbitAngle) * r;
      satMesh.position.z = Math.sin(group.userData.orbitAngle) * r;
      satMesh.position.y = Math.sin(group.userData.orbitAngle * 2) * 0.15;

      if (state === "THINKING" || state === "WORKING") {
        ringMesh.rotation.z += 0.035;
        ringMesh.scale.setScalar(1.0 + Math.sin(time * 8) * 0.18);
      } else {
        ringMesh.scale.set(1, 1, 1);
      }
    });

    // Animate Photons
    for (let i = this.activePhotons.length - 1; i >= 0; i--) {
      const p = this.activePhotons[i];
      p.progress += p.speed;
      p.mesh.position.lerpVectors(p.start, p.end, p.progress);

      if (p.progress >= 1.0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.activePhotons.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.neuralCanvas3D = null;
document.addEventListener("DOMContentLoaded", () => {
  if (window.THREE) {
    window.neuralCanvas3D = new NeuralCanvas3D("neural-canvas-container");
  }
});

