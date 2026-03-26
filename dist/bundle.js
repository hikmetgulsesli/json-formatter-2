// src/formatter.ts
function formatJson(input) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, 2);
}

// src/treeView.ts
var TYPE_COLORS = {
  string: "#89dceb",
  // Light cyan/blue
  number: "#fab387",
  // Orange/peach
  boolean: "#cba6f7",
  // Purple
  null: "#cba6f7",
  // Purple (same as boolean)
  object: "#adaaaa",
  // Gray with {N}
  array: "#adaaaa"
  // Gray with [N]
};
var TYPE_CLASSES = {
  string: "tree-node-string",
  number: "tree-node-number",
  boolean: "tree-node-boolean",
  null: "tree-node-null",
  object: "tree-node-object",
  array: "tree-node-array"
};
function parseJsonToTree(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    return buildNode("root", parsed, void 0);
  } catch {
    return null;
  }
}
function buildNode(key, value, parent) {
  const type = getNodeType(value);
  const node = {
    key,
    value,
    type,
    parent,
    isExpanded: true
  };
  if (type === "object" && value !== null && typeof value === "object" && !Array.isArray(value)) {
    node.children = Object.entries(value).map(
      ([childKey, childValue]) => buildNode(childKey, childValue, node)
    );
  } else if (type === "array" && Array.isArray(value)) {
    node.children = value.map(
      (item, index) => buildNode(String(index), item, node)
    );
  }
  return node;
}
function getNodeType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "null";
}
function getDisplayValue(node) {
  const { type, value } = node;
  switch (type) {
    case "string":
      return truncate(String(value), 50);
    case "number":
      return String(value);
    case "boolean":
      return String(value);
    case "null":
      return "null";
    case "object":
      return `{${node.children?.length ?? 0}}`;
    case "array":
      return `[${node.children?.length ?? 0}]`;
    default:
      return String(value);
  }
}
function getFullValue(node) {
  const { type, value } = node;
  if (type === "string") {
    return String(value);
  }
  if (type === "object" || type === "array") {
    return `${node.children?.length ?? 0} items`;
  }
  return String(value);
}
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "\u2026";
}
var TreeViewRenderer = class {
  constructor(container) {
    this.rootNode = null;
    this.visibleNodeCount = 0;
    this.LAZY_RENDER_THRESHOLD = 100;
    this.RENDER_BUFFER = 20;
    this.container = container;
    this.container.classList.add("tree-view-container");
  }
  /**
   * Load JSON string and render the tree
   */
  load(jsonString) {
    this.rootNode = parseJsonToTree(jsonString);
    this.render();
  }
  /**
   * Set root node directly
   */
  setRootNode(node) {
    this.rootNode = node;
    this.render();
  }
  /**
   * Expand all nodes
   */
  expandAll() {
    this.traverseNodes(this.rootNode, (node) => {
      node.isExpanded = true;
    });
    this.render();
  }
  /**
   * Collapse all nodes
   */
  collapseAll() {
    this.traverseNodes(this.rootNode, (node) => {
      if (node.parent) {
        node.isExpanded = false;
      }
    });
    this.render();
  }
  /**
   * Toggle expand/collapse for a node
   */
  toggleNode(node) {
    if (node.type === "object" || node.type === "array") {
      node.isExpanded = !node.isExpanded;
      this.render();
    }
  }
  /**
   * Traverse all nodes and apply callback
   */
  traverseNodes(node, callback) {
    if (!node) return;
    callback(node);
    if (node.children) {
      node.children.forEach((child) => this.traverseNodes(child, callback));
    }
  }
  /**
   * Count visible nodes for lazy rendering
   */
  countVisibleNodes(node) {
    if (!node) return 0;
    let count = 1;
    if (node.isExpanded && node.children) {
      count += node.children.reduce((sum, child) => sum + this.countVisibleNodes(child), 0);
    }
    return count;
  }
  /**
   * Render the tree
   */
  render() {
    if (!this.rootNode) {
      this.container.innerHTML = '<div class="tree-empty">Ge\xE7erli JSON girin</div>';
      return;
    }
    this.visibleNodeCount = this.countVisibleNodes(this.rootNode);
    const useLazyRendering = this.visibleNodeCount > this.LAZY_RENDER_THRESHOLD;
    this.container.innerHTML = "";
    const treeElement = document.createElement("div");
    treeElement.className = "tree-root";
    if (useLazyRendering) {
      this.renderLazy(treeElement, this.rootNode);
    } else {
      this.renderNode(treeElement, this.rootNode, 0);
    }
    this.container.appendChild(treeElement);
  }
  /**
   * Render a single node
   */
  renderNode(parent, node, depth) {
    const nodeElement = this.createNodeElement(node, depth);
    parent.appendChild(nodeElement);
    if (node.isExpanded && node.children && node.children.length > 0) {
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-children";
      childrenContainer.style.paddingLeft = "1.5rem";
      childrenContainer.style.borderLeft = "1px solid rgba(59, 73, 76, 0.3)";
      childrenContainer.style.marginTop = "0.25rem";
      node.children.forEach((child) => {
        this.renderNode(childrenContainer, child, depth + 1);
      });
      parent.appendChild(childrenContainer);
    }
  }
  /**
   * Lazy rendering for large trees
   */
  renderLazy(parent, node) {
    let renderedCount = 0;
    const renderRecursive = (n, depth) => {
      if (renderedCount >= this.LAZY_RENDER_THRESHOLD + this.RENDER_BUFFER) {
        return;
      }
      renderedCount++;
      const nodeElement = this.createNodeElement(n, depth);
      parent.appendChild(nodeElement);
      if (n.isExpanded && n.children && n.children.length > 0) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "tree-children";
        childrenContainer.style.paddingLeft = "1.5rem";
        childrenContainer.style.borderLeft = "1px solid rgba(59, 73, 76, 0.3)";
        childrenContainer.style.marginTop = "0.25rem";
        n.children.forEach((child) => {
          if (renderedCount < this.LAZY_RENDER_THRESHOLD + this.RENDER_BUFFER) {
            renderRecursive(child, depth + 1);
          }
        });
        if (childrenContainer.childNodes.length > 0) {
          parent.appendChild(childrenContainer);
        }
      }
    };
    renderRecursive(node, 0);
  }
  /**
   * Create DOM element for a node
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createNodeElement(node, _depth) {
    const container = document.createElement("div");
    container.className = "tree-node-wrapper";
    container.style.marginBottom = "0.25rem";
    const row = document.createElement("div");
    row.className = "tree-node-row";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "0.25rem";
    row.style.padding = "0.125rem 0.5rem";
    row.style.marginLeft = "-0.5rem";
    row.style.cursor = "pointer";
    row.style.transition = "background-color 0.15s ease";
    row.addEventListener("mouseenter", () => {
      row.style.backgroundColor = "#2a2a2a";
    });
    row.addEventListener("mouseleave", () => {
      row.style.backgroundColor = "transparent";
    });
    if (node.type === "object" || node.type === "array") {
      const chevron = document.createElement("span");
      chevron.className = "material-symbols-outlined tree-chevron";
      chevron.textContent = node.isExpanded ? "keyboard_arrow_down" : "keyboard_arrow_right";
      chevron.style.fontSize = "1rem";
      chevron.style.color = "#adaaaa";
      chevron.style.transition = "transform 0.2s ease";
      chevron.style.cursor = "pointer";
      row.appendChild(chevron);
      chevron.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleNode(node);
      });
    } else {
      const spacer = document.createElement("span");
      spacer.style.width = "1rem";
      row.appendChild(spacer);
    }
    if (node.parent) {
      const keySpan = document.createElement("span");
      keySpan.className = "tree-node-key";
      keySpan.textContent = node.key;
      keySpan.style.color = "#00E5FF";
      keySpan.style.fontFamily = "JetBrains Mono, monospace";
      keySpan.style.fontSize = "0.75rem";
      keySpan.style.cursor = "pointer";
      row.appendChild(keySpan);
      keySpan.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        this.toggleNode(node);
      });
      const colon = document.createElement("span");
      colon.textContent = ":";
      colon.style.color = "#adaaaa";
      colon.style.marginRight = "0.25rem";
      row.appendChild(colon);
    }
    if (node.type === "object" || node.type === "array") {
      const bracketSpan = document.createElement("span");
      bracketSpan.className = TYPE_CLASSES[node.type];
      bracketSpan.textContent = node.type === "object" ? "{ }" : "[ ]";
      bracketSpan.style.color = "#bac9cc";
      bracketSpan.style.fontFamily = "JetBrains Mono, monospace";
      bracketSpan.style.fontSize = "0.75rem";
      row.appendChild(bracketSpan);
      const countSpan = document.createElement("span");
      countSpan.className = "tree-node-count";
      countSpan.textContent = `${node.type === "object" ? "{" : "["}${node.children?.length ?? 0}${node.type === "object" ? "}" : "]"}`;
      countSpan.style.color = "rgba(173, 170, 170, 0.4)";
      countSpan.style.fontSize = "0.625rem";
      countSpan.style.marginLeft = "0.25rem";
      countSpan.style.fontWeight = "bold";
      countSpan.style.textTransform = "uppercase";
      row.appendChild(countSpan);
    } else {
      const valueSpan = document.createElement("span");
      valueSpan.className = TYPE_CLASSES[node.type];
      valueSpan.textContent = getDisplayValue(node);
      valueSpan.style.color = TYPE_COLORS[node.type];
      valueSpan.style.fontFamily = "JetBrains Mono, monospace";
      valueSpan.style.fontSize = "0.75rem";
      valueSpan.title = getFullValue(node);
      row.appendChild(valueSpan);
    }
    container.appendChild(row);
    return container;
  }
};
function escapeHtml(str) {
  const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return str.replace(/[&<>"']/g, (ch) => htmlEscapes[ch]);
}
function renderTreeToHtml(node) {
  if (!node) {
    return '<div class="tree-empty">Ge\xE7erli JSON girin</div>';
  }
  const renderNode = (n, depth) => {
    const displayValue = getDisplayValue(n);
    const fullValue = getFullValue(n);
    const hasChildren = n.children && n.children.length > 0;
    let html = '<div class="tree-node-wrapper" style="margin-bottom: 0.25rem;">';
    html += `<div class="tree-node-row" style="display: flex; align-items: center; gap: 0.25rem; padding: 0.125rem 0.5rem; margin-left: -0.5rem; cursor: pointer; transition: background-color 0.15s ease;">`;
    if (n.type === "object" || n.type === "array") {
      const chevronIcon = n.isExpanded ? "keyboard_arrow_down" : "keyboard_arrow_right";
      html += `<span class="material-symbols-outlined tree-chevron" style="font-size: 1rem; color: #adaaaa; transition: transform 0.2s ease;">${chevronIcon}</span>`;
    } else {
      html += '<span style="width: 1rem;"></span>';
    }
    if (n.parent) {
      html += `<span class="tree-node-key" style="color: #00E5FF; font-family: JetBrains Mono, monospace; font-size: 0.75rem;">${escapeHtml(n.key)}</span>`;
      html += '<span style="color: #adaaaa; margin-right: 0.25rem;">:</span>';
    }
    if (n.type === "object" || n.type === "array") {
      const bracket = n.type === "object" ? "{ }" : "[ ]";
      const count = n.children?.length ?? 0;
      html += `<span class="${TYPE_CLASSES[n.type]}" style="color: #bac9cc; font-family: JetBrains Mono, monospace; font-size: 0.75rem;">${bracket}</span>`;
      html += `<span class="tree-node-count" style="color: rgba(173, 170, 170, 0.4); font-size: 0.625rem; margin-left: 0.25rem; font-weight: bold; text-transform: uppercase;">${n.type === "object" ? "{" : "["}${count}${n.type === "object" ? "}" : "]"}</span>`;
    } else {
      html += `<span class="${TYPE_CLASSES[n.type]}" style="color: ${TYPE_COLORS[n.type]}; font-family: JetBrains Mono, monospace; font-size: 0.75rem;" title="${escapeHtml(fullValue)}">${escapeHtml(displayValue)}</span>`;
    }
    html += "</div>";
    if (n.isExpanded && hasChildren) {
      html += `<div class="tree-children" style="padding-left: 1.5rem; border-left: 1px solid rgba(59, 73, 76, 0.3); margin-top: 0.25rem;">`;
      n.children.forEach((child) => {
        html += renderNode(child, depth + 1);
      });
      html += "</div>";
    }
    html += "</div>";
    return html;
  };
  return `<div class="tree-root">${renderNode(node, 0)}</div>`;
}
export {
  TYPE_COLORS,
  TreeViewRenderer,
  formatJson,
  parseJsonToTree,
  renderTreeToHtml
};
