// src/json-utils.ts
function validateJson(input) {
  if (!input.trim()) {
    return { valid: false, error: "Bo\u015F girdi" };
  }
  try {
    JSON.parse(input);
    return { valid: true };
  } catch {
    return { valid: false, error: "Ge\xE7ersiz JSON s\xF6zdizimi" };
  }
}
function formatJson(input) {
  return JSON.stringify(JSON.parse(input), null, 2);
}
function minifyJson(input) {
  return JSON.stringify(JSON.parse(input));
}
function buildTree(input) {
  const parsed = JSON.parse(input);
  return parseNode("root", parsed, "$");
}
function parseNode(key, value, path) {
  const type = getType(value);
  const node = { key, value, type, path };
  if (type === "object" && value !== null) {
    node.children = Object.entries(value).map(
      ([k, v]) => parseNode(k, v, `${path}.${k}`)
    );
  } else if (type === "array") {
    node.children = value.map((v, i) => parseNode(String(i), v, `${path}[${i}]`));
  }
  return node;
}
function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  const t = typeof value;
  if (t === "string") return "string";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "string";
}

// src/index.ts
var currentInput = "";
var currentOutput = "";
var expandedNodes = /* @__PURE__ */ new Set();
function validateForAction(input) {
  if (!input.trim()) return false;
  return validateJson(input).valid;
}
function renderNodeValue(node, depth, expandedNodes2) {
  const keyEsc = escapeHtml(node.key);
  const pathEsc = escapeHtml(node.path);
  if (node.type === "object" || node.type === "array") {
    const isExpanded = expandedNodes2.has(node.path) || depth < 2;
    const isExpandable = node.children && node.children.length > 0;
    const toggleIcon = isExpandable ? isExpanded ? "unfold_less" : "unfold_more" : "fiber_manual_record";
    const expandClass = isExpandable ? "cursor-pointer toggle-node" : "";
    const dataPath = isExpandable ? `data-path="${pathEsc}"` : "";
    const expandAttr = isExpandable ? `data-expand="${!isExpanded}"` : "";
    const openBracket = node.type === "object" ? "{" : "[";
    const closeBracket = node.type === "object" ? "}" : "]";
    const collapsed = node.type === "object" ? "{...}" : "[...]";
    let html = `<div class="tree-line" style="padding-left: ${depth * 20}px;">`;
    html += `<span class="${expandClass}" ${dataPath} ${expandAttr}>`;
    html += `<span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle; color: var(--color-on-surface-variant);">${toggleIcon}</span></span>`;
    html += `<span style="color: var(--color-secondary);">"${keyEsc}"</span>`;
    html += `<span style="color: var(--color-on-surface-variant);">: </span>`;
    html += `<span style="color: var(--color-on-surface-variant);">${isExpanded ? openBracket : collapsed}</span>`;
    if (isExpanded && node.children) {
      html += `
${node.children.map((c) => renderNodeValue(c, depth + 1, expandedNodes2)).join("\n")}
`;
      html += `<div style="padding-left: ${depth * 20}px;"><span style="color: var(--color-on-surface-variant);">${closeBracket}</span></div>`;
    }
    html += `</div>`;
    return html;
  }
  switch (node.type) {
    case "string": {
      return `<div class="tree-line" style="padding-left: ${depth * 20}px;">
<span style="color: var(--color-secondary);">"${keyEsc}"</span><span style="color: var(--color-on-surface-variant);">: </span><span style="color: var(--color-tertiary);">"${escapeHtml(String(node.value))}"</span></div>`;
    }
    case "number": {
      return `<div class="tree-line" style="padding-left: ${depth * 20}px;">
<span style="color: var(--color-secondary);">"${keyEsc}"</span><span style="color: var(--color-on-surface-variant);">: </span><span style="color: var(--color-primary);">${node.value}</span></div>`;
    }
    case "boolean": {
      return `<div class="tree-line" style="padding-left: ${depth * 20}px;">
<span style="color: var(--color-secondary);">"${keyEsc}"</span><span style="color: var(--color-on-surface-variant);">: </span><span style="color: var(--color-secondary-dim);">${String(node.value)}</span></div>`;
    }
    case "null": {
      return `<div class="tree-line" style="padding-left: ${depth * 20}px;">
<span style="color: var(--color-secondary);">"${keyEsc}"</span><span style="color: var(--color-on-surface-variant);">: </span><span style="color: var(--color-error-dim);">null</span></div>`;
    }
  }
}
function renderTree(node, depth = 0, expandedNodes2 = /* @__PURE__ */ new Set()) {
  if (node.key === "root" && node.children) {
    return node.children.map((child) => renderNodeValue(child, depth, expandedNodes2)).join("\n");
  }
  return renderNodeValue(node, depth, expandedNodes2);
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function getElement(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}
function showEmptyState() {
  getElement("empty-state").classList.remove("hidden");
  getElement("tree-view").classList.add("hidden");
  getElement("error-state").classList.add("hidden");
}
function showTreeView(html) {
  getElement("empty-state").classList.add("hidden");
  getElement("tree-view").classList.remove("hidden");
  getElement("error-state").classList.add("hidden");
  getElement("tree-view").innerHTML = html;
}
function showErrorState(message) {
  getElement("empty-state").classList.add("hidden");
  getElement("tree-view").classList.add("hidden");
  getElement("error-state").classList.remove("hidden");
  getElement("error-message").textContent = message;
}
function updateLineNumbers(text) {
  const lines = text.split("\n");
  const container = getElement("line-numbers");
  container.innerHTML = lines.map((_, i) => `<span>${String(i + 1).padStart(2, "0")}</span>`).join("");
}
function showToast(message) {
  const toast = getElement("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Panoya kopyaland\u0131");
  }).catch(() => {
    showToast("Kopyalama ba\u015Far\u0131s\u0131z");
  });
}
function updateAll() {
  const input = getElement("json-input").value;
  currentInput = input;
  updateLineNumbers(input);
  if (!input.trim()) {
    showEmptyState();
    currentOutput = "";
    return;
  }
  const validation = validateJson(input);
  if (!validation.valid) {
    showErrorState(validation.error || "Bilinmeyen hata");
    currentOutput = "";
    return;
  }
  try {
    const formatted = formatJson(input);
    currentOutput = formatted;
    const tree = buildTree(input);
    const treeHtml = renderTree(tree, 0, expandedNodes);
    showTreeView(treeHtml);
  } catch (e) {
    showErrorState(e.message);
    currentOutput = "";
  }
}
function expandAll() {
  const treeEl = document.getElementById("tree-view");
  if (treeEl) {
    const toggles = treeEl.querySelectorAll(".toggle-node");
    toggles.forEach((toggle) => {
      const path = toggle.getAttribute("data-path");
      if (path) expandedNodes.add(path);
    });
    updateAll();
  }
}
function collapseAll() {
  expandedNodes.clear();
  updateAll();
}
function handleAction(action) {
  const input = getElement("json-input").value;
  switch (action) {
    case "format": {
      if (!validateForAction(input)) {
        showToast("Bi\xE7imlendirilecek JSON yok");
        return;
      }
      try {
        const formatted = formatJson(input);
        getElement("json-input").value = formatted;
        updateAll();
        showToast("Bi\xE7imlendirildi");
      } catch (e) {
        showErrorState(e.message);
      }
      break;
    }
    case "minify": {
      if (!validateForAction(input)) {
        showToast("K\xFC\xE7\xFClt\xFClecek JSON yok");
        return;
      }
      try {
        const minified = minifyJson(input);
        getElement("json-input").value = minified;
        updateAll();
        showToast("K\xFC\xE7\xFClt\xFCld\xFC");
      } catch (e) {
        showErrorState(e.message);
      }
      break;
    }
    case "copy": {
      if (!currentOutput) {
        showToast("Kopyalanacak \xE7\u0131kt\u0131 yok");
        return;
      }
      copyToClipboard(currentOutput);
      break;
    }
    case "clear": {
      getElement("json-input").value = "";
      currentInput = "";
      currentOutput = "";
      expandedNodes.clear();
      showEmptyState();
      updateLineNumbers("");
      showToast("Temizlendi");
      break;
    }
    case "expand-all": {
      expandAll();
      break;
    }
    case "collapse-all": {
      collapseAll();
      break;
    }
    case "fullscreen": {
      document.documentElement.requestFullscreen?.();
      break;
    }
    case "close-modal": {
      getElement("shortcuts-modal").classList.add("hidden");
      break;
    }
    case "help": {
      getElement("shortcuts-modal").classList.remove("hidden");
      break;
    }
    case "settings": {
      showToast("Ayarlar yak\u0131nda");
      break;
    }
    case "account": {
      showToast("Hesap yak\u0131nda");
      break;
    }
  }
}
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "?" && !isInputFocused()) {
      e.preventDefault();
      getElement("shortcuts-modal").classList.remove("hidden");
      return;
    }
    if (e.key === "Escape") {
      getElement("shortcuts-modal").classList.add("hidden");
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAction("format");
      } else if (e.shiftKey && e.key === "M") {
        e.preventDefault();
        handleAction("minify");
      } else if (e.shiftKey && e.key === "C") {
        e.preventDefault();
        handleAction("copy");
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        handleAction("clear");
      }
    }
  });
}
function isInputFocused() {
  const active = document.activeElement;
  return active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement;
}
function setupEventListeners() {
  getElement("json-input").addEventListener("input", updateAll);
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const action = e.currentTarget.getAttribute("data-action");
      if (action) handleAction(action);
    });
  });
  getElement("tree-view").addEventListener("click", (e) => {
    const target = e.target;
    const toggle = target.closest(".toggle-node");
    if (toggle) {
      const path = toggle.getAttribute("data-path");
      const shouldExpand = toggle.getAttribute("data-expand") === "true";
      if (path) {
        if (shouldExpand) {
          expandedNodes.add(path);
        } else {
          expandedNodes.delete(path);
        }
        updateAll();
      }
    }
  });
}
window.jsonFormatter = {
  input: () => currentInput,
  output: () => currentOutput,
  format: (input) => {
    const validation = validateJson(input);
    if (!validation.valid) throw new Error(validation.error);
    return formatJson(input);
  },
  minify: (input) => {
    const validation = validateJson(input);
    if (!validation.valid) throw new Error(validation.error);
    return minifyJson(input);
  },
  clear: () => {
    getElement("json-input").value = "";
    currentInput = "";
    currentOutput = "";
    expandedNodes.clear();
    showEmptyState();
    updateLineNumbers("");
  }
};
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  setupKeyboardShortcuts();
  updateLineNumbers("");
  showEmptyState();
});
export {
  buildTree,
  formatJson,
  minifyJson,
  renderNodeValue,
  renderTree,
  validateJson
};
