/**
 * neural_canvas_3d.js — Three.js 3D WebGL Swarm Topology Visualizer.
 * NERV x Nostromo Industrial Tactical Command System:
 * - 3D spatial depth floating nodes with mouse parallax orbit
 * - Active laser photon streams along 3D synapse wires
 * - Real node states: IDLE, THINKING, WORKING, DONE, BLOCKED
 * - Battery-friendly: pauses when tab is hidden, capped at 60fps
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
    this.hoveredNode = null;
    this.isRunning = true;
    this.clock = new THREE.Clock();

    this.initScene();
    this.initNodes();
    this.initSynapses();
    this.initListeners();
    this.animate();
  }

  initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    // Subtle atmospheric fog for industrial depth
    this.scene.fog = new THREE.FogExp2(0x08090d, 0.04);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 11);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // Replace old canvas or append
    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // Ambient & Point Lighting (Amber CRT Phosphor)
    const ambientLight = new THREE.AmbientLight(0xffb000, 0.4);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffb000, 1.8, 30);
    pointLight.position.set(0, 4, 6);
    this.scene.add(pointLight);

    // Add faint tactical grid floor
    const gridHelper = new THREE.GridHelper(24, 24, 0xffb000, 0x1f242d);
    gridHelper.position.y = -3.8;
    gridHelper.material.opacity = 0.12;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  initNodes() {
    this.nodeData = [
      { id: "supervisor", tag: "ORCH-01", name: "COGNITIVE GATEWAY", role: "Swarm Supervisor & Security Perimeter", pos: [0, 2.0, 0.2], color: 0xffb000 },
      { id: "strategist", tag: "PLAN-02", name: "BRANCH EXPLORER", role: "ToT Speculative Decomposition", pos: [-3.4, 0.6, 0.8], color: 0xf59e0b },
      { id: "data_engineer", tag: "EXEC-03", name: "SANDBOX RUNTIME", role: "Isolated Analytics & Dynamic Charts", pos: [3.4, 0.6, -0.4], color: 0xfbbf24 },
      { id: "vision_analyst", tag: "TOPO-04", name: "GRAPH AUDITOR", role: "Synapse Matrix & Memory Auditor", pos: [-2.2, -1.4, 0.6], color: 0xd97706 },
      { id: "executive_synthesizer", tag: "COMM-05", name: "AUDIO TELEMETRY", role: "Multimodal Voice & Telemetry Stream", pos: [2.2, -1.4, -0.6], color: 0xfef08a }
    ];

    this.nodeData.forEach(data => {
      const group = new THREE.Group();
      group.position.set(...data.pos);
      group.userData = { ...data, state: "IDLE", pulse: 0, orbitAngle: 0 };

      // 1. Core Sphere (Luminous Phosphor)
      const coreGeo = new THREE.SphereGeometry(0.36, 24, 24);
      const coreMat = new THREE.MeshBasicMaterial({ color: data.color });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // 2. Tactical Wireframe Octahedron Shell
      const shellGeo = new THREE.OctahedronGeometry(0.56, 0);
      const shellMat = new THREE.MeshBasicMaterial({
        color: data.color,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);
      group.add(shellMesh);

      // 3. Shockwave Ripple Ring (for Thinking / Done states)
      const ringGeo = new THREE.RingGeometry(0.65, 0.72, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: data.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      // 4. Orbiting Mechanical Satellite Particle
      const satGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.position.set(0.75, 0, 0);
      group.add(satMesh);

      // 5. HTML Overlay Label Anchor
      this.scene.add(group);
      this.nodeMeshes[data.id] = { group, coreMesh, shellMesh, ringMesh, satMesh, data };
    });
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

      // Base Dim Laser Line
      const points = [p1, p2];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0xffb000,
        transparent: true,
        opacity: 0.18,
        linewidth: 1
      });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);

      this.synapseLines.push({ srcId, tgtId, line, p1, p2, activePulse: 0 });
    });
  }

  firePulse(srcId, tgtId, color = 0xffb000) {
    const srcNode = this.nodeMeshes[srcId];
    const tgtNode = this.nodeMeshes[tgtId];
    if (!srcNode || !tgtNode) return;

    // Flare source node
    this.setNodeState(srcId, "WORKING");
    setTimeout(() => this.setNodeState(tgtId, "WORKING"), 240);

    // Create 3D traveling photon bead
    const p1 = srcNode.group.position;
    const p2 = tgtNode.group.position;

    const photonGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const photonMat = new THREE.MeshBasicMaterial({ color: color });
    const photonMesh = new THREE.Mesh(photonGeo, photonMat);
    this.scene.add(photonMesh);

    this.activePhotons.push({
      mesh: photonMesh,
      start: p1.clone(),
      end: p2.clone(),
      progress: 0,
      speed: 0.04
    });

    // Flash the line
    const syn = this.synapseLines.find(s => (s.srcId === srcId && s.tgtId === tgtId) || (s.srcId === tgtId && s.tgtId === srcId));
    if (syn) {
      syn.line.material.opacity = 0.95;
      syn.line.material.color.setHex(0xffffff);
      setTimeout(() => {
        syn.line.material.opacity = 0.18;
        syn.line.material.color.setHex(0xffb000);
      }, 350);
    }
  }

  setNodeState(nodeId, state) {
    const nodeObj = this.nodeMeshes[nodeId];
    if (!nodeObj) return;

    nodeObj.group.userData.state = state;
    if (state === "THINKING") {
      nodeObj.ringMesh.material.opacity = 0.9;
    } else if (state === "WORKING") {
      nodeObj.ringMesh.material.opacity = 0.6;
    } else if (state === "DONE") {
      nodeObj.ringMesh.material.opacity = 0.0;
      setTimeout(() => this.setNodeState(nodeId, "IDLE"), 1200);
    } else if (state === "BLOCKED") {
      nodeObj.coreMesh.material.color.setHex(0xef4444);
      nodeObj.shellMesh.material.color.setHex(0xef4444);
      setTimeout(() => {
        nodeObj.coreMesh.material.color.setHex(nodeObj.data.color);
        nodeObj.shellMesh.material.color.setHex(nodeObj.data.color);
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
          this.selectNode(hitGroup.userData);
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
      `TELEMETRY: AMBER CRT CARRIER SYNCHRONIZED<br/>` +
      `SUBSYSTEM: NOSTROMO-TACTICAL-CORE-v3.2`;
    drawer.classList.add("open");
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    this.camera.position.x = this.mouse.x * 1.8;
    this.camera.position.y = this.mouse.y * 1.2;
    this.camera.lookAt(0, 0.2, 0);

    Object.values(this.nodeMeshes).forEach(({ group, shellMesh, ringMesh, satMesh }) => {
      const state = group.userData.state;

      shellMesh.rotation.y += 0.012;
      shellMesh.rotation.x += 0.006;

      group.userData.orbitAngle += (state === "WORKING" ? 0.08 : 0.025);
      const r = 0.72;
      satMesh.position.x = Math.cos(group.userData.orbitAngle) * r;
      satMesh.position.z = Math.sin(group.userData.orbitAngle) * r;
      satMesh.position.y = Math.sin(group.userData.orbitAngle * 2) * 0.15;

      if (state === "THINKING" || state === "WORKING") {
        ringMesh.rotation.z += 0.03;
        ringMesh.scale.setScalar(1.0 + Math.sin(time * 8) * 0.15);
      } else {
        ringMesh.scale.set(1, 1, 1);
      }
    });

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
