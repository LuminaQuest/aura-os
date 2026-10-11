/**
 * tot_visualizer.js — Holographic Tree-of-Thought (ToT) Visualizer.
 * Renders speculative multi-branch reasoning trees with live pruning status
 * and winning branch highlighting.
 */

class TreeOfThoughtVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(treeData) {
    if (!this.container || !treeData) return;
    this.container.innerHTML = "";

    // 1. Root Intent Node
    const rootEl = document.createElement("div");
    rootEl.className = "tot-root-card";
    rootEl.style.cssText = `
      background: rgba(0, 243, 255, 0.08);
      border: 1px solid rgba(0, 243, 255, 0.3);
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 16px;
      font-family: var(--font-mono);
      font-size: 0.82rem;
    `;
    rootEl.innerHTML = `
      <div style="color: var(--neon-cyan); font-weight: 700; margin-bottom: 4px;">▶ ROOT COGNITIVE INTENT</div>
      <div style="color: #fff;">"${escapeHtml(treeData.root_intent)}"</div>
      <div style="color: var(--text-faint); font-size: 0.72rem; margin-top: 6px;">Evaluation Latency: ${treeData.planning_latency_ms} ms // Branches Explored: 3</div>
    `;
    this.container.appendChild(rootEl);

    // 2. Branch Cards
    treeData.branches.forEach(branch => {
      const isSelected = branch.status === "SELECTED";
      const card = document.createElement("div");
      card.className = `tot-branch-card ${isSelected ? "selected" : "pruned"}`;

      let subStepsHtml = "";
      if (branch.sub_steps && branch.sub_steps.length) {
        subStepsHtml = branch.sub_steps.map(s => `<span class="substep-pill">→ ${escapeHtml(s)}</span>`).join("");
      }

      card.innerHTML = `
        <div class="branch-card-header">
          <span class="branch-name" style="color: ${isSelected ? 'var(--neon-cyan)' : 'var(--text-main)'};">
            ${escapeHtml(branch.branch_name)}
          </span>
          <span class="branch-status-badge ${isSelected ? 'selected' : 'pruned'}">
            ${isSelected ? `✓ SELECTED (${(branch.confidence_score * 100).toFixed(0)}%)` : `✕ ${escapeHtml(branch.status)}`}
          </span>
        </div>
        <div class="branch-hypothesis">${escapeHtml(branch.hypothesis)}</div>
        <div class="branch-rationale">
          <em>${isSelected ? "Optimal Path Rationale:" : "Prune Reason:"}</em> 
          ${escapeHtml(branch.prune_reason || branch.rationale)}
        </div>
        <div class="branch-substeps">${subStepsHtml}</div>
      `;

      this.container.appendChild(card);
    });
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.totVisualizer = null;
document.addEventListener("DOMContentLoaded", () => {
  window.totVisualizer = new TreeOfThoughtVisualizer("tot-tree-viewport");
});
