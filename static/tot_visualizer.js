/**
 * tot_visualizer.js — Holographic Tree-of-Thought (ToT) Visualizer.
 * NERV x Nostromo Industrial Tactical Command System:
 * - Speculative multi-branch reasoning tree with confidence metrics
 * - Pruned dead-ends with strike-throughs and red warning flags
 * - Winning branch flaring in CRT Amber Phosphor
 */

class TreeOfThoughtVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(treeData) {
    if (!this.container || !treeData) return;
    this.container.innerHTML = "";

    // 1. Root Intent Tactical Node
    const rootEl = document.createElement("div");
    rootEl.className = "tot-root-card tactical-panel";
    rootEl.style.cssText = `
      background: #000;
      border: 1px solid var(--accent-amber);
      padding: 12px 18px;
      margin-bottom: 14px;
      font-family: var(--font-mono);
      font-size: 0.78rem;
    `;
    rootEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="color: var(--accent-amber); font-weight: 800; font-family: var(--font-display); font-size: 0.82rem;">
          [ROOT] OBJECTIVE CONVERGENCE SEED
        </span>
        <span style="color: var(--accent-amber-dim); font-size: 0.65rem;">
          EVAL: ${treeData.planning_latency_ms || 22.4}ms // 3 PATHS EVALUATED
        </span>
      </div>
      <div style="color: #ffffff; font-weight: 600;">"${escapeHtml(treeData.root_intent)}"</div>
    `;
    this.container.appendChild(rootEl);

    // 2. Branch Cards
    treeData.branches.forEach(branch => {
      const isSelected = branch.status === "SELECTED";
      const card = document.createElement("div");
      card.className = `tot-branch-card ${isSelected ? "selected" : "pruned"}`;

      let subStepsHtml = "";
      if (branch.sub_steps && branch.sub_steps.length) {
        subStepsHtml = branch.sub_steps.map(s => `<span class="substep-pill">► ${escapeHtml(s)}</span>`).join("");
      }

      card.innerHTML = `
        <div class="branch-card-header">
          <span class="branch-name" style="color: ${isSelected ? 'var(--accent-amber-bright)' : 'var(--text-secondary)'};">
            ${escapeHtml(branch.branch_name)}
          </span>
          <span class="branch-status-badge ${isSelected ? 'selected' : 'pruned'}">
            ${isSelected ? `✓ OPTIMAL PATH (${(branch.confidence_score * 100).toFixed(0)}% CONFIDENCE)` : `✕ ${escapeHtml(branch.status)} [PRUNED]`}
          </span>
        </div>
        <div class="branch-hypothesis">${escapeHtml(branch.hypothesis)}</div>
        <div class="branch-rationale">
          <strong style="color: ${isSelected ? 'var(--accent-amber)' : 'var(--accent-red)'};">
            ${isSelected ? "[HEURISTIC ADVANTAGE]:" : "[PRUNING CRITERIA]:"}
          </strong> 
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

