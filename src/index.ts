// JSON Formatter Application Logic

interface JsonNode {
  key: string;
  value: unknown;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: JsonNode[];
  path: string;
}

let currentInput = '';
let currentOutput = '';
const expandedNodes = new Set<string>();

function validateJson(input: string): { valid: boolean; error?: string } {
  if (!input.trim()) {
    return { valid: false, error: 'Boş girdi' };
  }
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

function formatJson(input: string): string {
  return JSON.stringify(JSON.parse(input), null, 2);
}

function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

function buildTree(input: string): JsonNode {
  const parsed = JSON.parse(input);
  return parseNode('root', parsed, '$');
}

function parseNode(key: string, value: unknown, path: string): JsonNode {
  const type = getType(value);
  const node: JsonNode = { key, value, type, path };

  if (type === 'object' && value !== null) {
    node.children = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => parseNode(k, v, `${path}.${k}`)
    );
  } else if (type === 'array') {
    node.children = (value as unknown[]).map((v, i) => parseNode(String(i), v, `${path}[${i}]`));
  }

  return node;
}

function getType(value: unknown): JsonNode['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonNode['type'];
}

function renderTree(node: JsonNode, depth = 0): string {
  const isExpandable = node.children && node.children.length > 0;
  const nodeId = node.path;
  const isExpanded = expandedNodes.has(nodeId) || depth < 2;

  let html = '';

  if (node.key === 'root') {
    if (node.children) {
      html += node.children.map(child => renderTree(child, depth)).join('\n');
    }
  } else {
    const toggleIcon = isExpandable ? (isExpanded ? 'unfold_less' : 'unfold_more') : 'fiber_manual_record';
    const expandClass = isExpandable ? 'cursor-pointer toggle-node' : '';
    const dataPath = isExpandable ? `data-path="${nodeId}"` : '';
    const expandAttr = isExpandable ? `data-expand="${!isExpanded}"` : '';

    html += `<div class="tree-line" style="padding-left: ${depth * 20}px;">`;
    html += `<span class="${expandClass}" ${dataPath} ${expandAttr}>`;
    html += `<span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle; color: var(--color-on-surface-variant);">${toggleIcon}</span>`;
    html += `</span>`;

    if (node.type === 'object') {
      html += `<span style="color: var(--color-secondary);">"${node.key}"</span>`;
      html += `<span style="color: var(--color-on-surface-variant);">: </span>`;
      html += `<span style="color: var(--color-on-surface-variant);">${isExpanded ? '{' : '{...}'}</span>`;
      if (isExpanded) {
        html += `\n${node.children!.map(c => renderTree(c, depth + 1)).join('\n')}\n`;
        html += `<div style="padding-left: ${depth * 20}px;"><span style="color: var(--color-on-surface-variant);">}</span></div>`;
      }
    } else if (node.type === 'array') {
      html += `<span style="color: var(--color-secondary);">"${node.key}"</span>`;
      html += `<span style="color: var(--color-on-surface-variant);">: </span>`;
      html += `<span style="color: var(--color-on-surface-variant);">${isExpanded ? '[' : '[...]'}</span>`;
      if (isExpanded) {
        html += `\n${node.children!.map(c => renderTree(c, depth + 1)).join('\n')}\n`;
        html += `<div style="padding-left: ${depth * 20}px;"><span style="color: var(--color-on-surface-variant);">]</span></div>`;
      }
    } else if (node.type === 'string') {
      html += `<span style="color: var(--color-secondary);">"${node.key}"</span>`;
      html += `<span style="color: var(--color-on-surface-variant);">: </span>`;
      html += `<span style="color: var(--color-tertiary);">"${escapeHtml(String(node.value))}"</span>`;
    } else if (node.type === 'number') {
      html += `<span style="color: var(--color-secondary);">"${node.key}"</span>`;
      html += `<span style="color: var(--color-on-surface-variant);">: </span>`;
      html += `<span style="color: var(--color-primary);">${node.value}</span>`;
    } else if (node.type === 'boolean') {
      html += `<span style="color: var(--color-secondary);">"${node.key}"</span>`;
      html += `<span style="color: var(--color-on-surface-variant);">: </span>`;
      html += `<span style="color: var(--color-secondary-dim);">${String(node.value)}</span>`;
    } else if (node.type === 'null') {
      html += `<span style="color: var(--color-secondary);">"${node.key}"</span>`;
      html += `<span style="color: var(--color-on-surface-variant);">: </span>`;
      html += `<span style="color: var(--color-error-dim);">null</span>`;
    }

    html += `</div>`;
  }

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showEmptyState() {
  document.getElementById('empty-state')!.classList.remove('hidden');
  document.getElementById('tree-view')!.classList.add('hidden');
  document.getElementById('error-state')!.classList.add('hidden');
}

function showTreeView(html: string) {
  document.getElementById('empty-state')!.classList.add('hidden');
  document.getElementById('tree-view')!.classList.remove('hidden');
  document.getElementById('error-state')!.classList.add('hidden');
  document.getElementById('tree-view')!.innerHTML = html;
}

function showErrorState(message: string) {
  document.getElementById('empty-state')!.classList.add('hidden');
  document.getElementById('tree-view')!.classList.add('hidden');
  document.getElementById('error-state')!.classList.remove('hidden');
  document.getElementById('error-message')!.textContent = message;
}

function updateLineNumbers(text: string) {
  const lines = text.split('\n');
  const container = document.getElementById('line-numbers')!;
  container.innerHTML = lines.map((_, i) => `<span>${String(i + 1).padStart(2, '0')}</span>`).join('');
}

function showToast(message: string) {
  const toast = document.getElementById('toast')!;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Panoya kopyalandı');
  }).catch(() => {
    showToast('Kopyalama başarısız');
  });
}

function updateAll() {
  const input = (document.getElementById('json-input') as HTMLTextAreaElement).value;
  currentInput = input;
  updateLineNumbers(input);

  if (!input.trim()) {
    showEmptyState();
    currentOutput = '';
    return;
  }

  const validation = validateJson(input);
  if (!validation.valid) {
    showErrorState(validation.error || 'Bilinmeyen hata');
    currentOutput = '';
    return;
  }

  try {
    const formatted = formatJson(input);
    currentOutput = formatted;
    const tree = buildTree(input);
    const treeHtml = renderTree(tree);
    showTreeView(treeHtml);
  } catch (e) {
    showErrorState((e as Error).message);
    currentOutput = '';
  }
}

function expandAll() {
  const treeEl = document.getElementById('tree-view');
  if (treeEl) {
    const toggles = treeEl.querySelectorAll('.toggle-node');
    toggles.forEach(toggle => {
      const path = toggle.getAttribute('data-path');
      if (path) expandedNodes.add(path);
    });
    updateAll();
  }
}

function collapseAll() {
  expandedNodes.clear();
  updateAll();
}

function handleAction(action: string) {
  const input = (document.getElementById('json-input') as HTMLTextAreaElement).value;

  switch (action) {
    case 'format': {
      if (!input.trim()) {
        showToast('Biçimlendirilecek JSON yok');
        return;
      }
      const validation = validateJson(input);
      if (!validation.valid) {
        showErrorState(validation.error || 'Geçersiz JSON');
        return;
      }
      try {
        const formatted = formatJson(input);
        (document.getElementById('json-input') as HTMLTextAreaElement).value = formatted;
        updateAll();
        showToast('Biçimlendirildi');
      } catch (e) {
        showErrorState((e as Error).message);
      }
      break;
    }
    case 'minify': {
      if (!input.trim()) {
        showToast('Küçültülecek JSON yok');
        return;
      }
      const validation = validateJson(input);
      if (!validation.valid) {
        showErrorState(validation.error || 'Geçersiz JSON');
        return;
      }
      try {
        const minified = minifyJson(input);
        (document.getElementById('json-input') as HTMLTextAreaElement).value = minified;
        updateAll();
        showToast('Küçültüldü');
      } catch (e) {
        showErrorState((e as Error).message);
      }
      break;
    }
    case 'copy': {
      if (!currentOutput) {
        showToast('Kopyalanacak çıktı yok');
        return;
      }
      copyToClipboard(currentOutput);
      break;
    }
    case 'clear': {
      (document.getElementById('json-input') as HTMLTextAreaElement).value = '';
      currentInput = '';
      currentOutput = '';
      expandedNodes.clear();
      showEmptyState();
      updateLineNumbers('');
      showToast('Temizlendi');
      break;
    }
    case 'expand-all': {
      expandAll();
      break;
    }
    case 'collapse-all': {
      collapseAll();
      break;
    }
    case 'fullscreen': {
      document.documentElement.requestFullscreen?.();
      break;
    }
    case 'close-modal': {
      document.getElementById('shortcuts-modal')!.classList.add('hidden');
      break;
    }
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !isInputFocused()) {
      e.preventDefault();
      document.getElementById('shortcuts-modal')!.classList.remove('hidden');
      return;
    }

    if (e.key === 'Escape') {
      document.getElementById('shortcuts-modal')!.classList.add('hidden');
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAction('format');
      } else if (e.shiftKey && e.key === 'M') {
        e.preventDefault();
        handleAction('minify');
      } else if (e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleAction('copy');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleAction('clear');
      }
    }
  });
}

function isInputFocused(): boolean {
  const active = document.activeElement;
  return active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement;
}

function setupEventListeners() {
  document.getElementById('json-input')!.addEventListener('input', updateAll);

  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', (e) => {
      const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
      if (action) handleAction(action);
    });
  });

  document.getElementById('tree-view')!.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const toggle = target.closest('.toggle-node');
    if (toggle) {
      const path = toggle.getAttribute('data-path');
      const shouldExpand = toggle.getAttribute('data-expand') === 'true';
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

// Expose API globally
export {};

declare global {
  interface Window {
    jsonFormatter: {
      input: () => string;
      output: () => string;
      format: (input: string) => string;
      minify: (input: string) => string;
      clear: () => void;
    };
  }
}

(window).jsonFormatter = {
  input: () => currentInput,
  output: () => currentOutput,
  format: (input: string) => {
    const validation = validateJson(input);
    if (!validation.valid) throw new Error(validation.error);
    return formatJson(input);
  },
  minify: (input: string) => {
    const validation = validateJson(input);
    if (!validation.valid) throw new Error(validation.error);
    return minifyJson(input);
  },
  clear: () => {
    (document.getElementById('json-input') as HTMLTextAreaElement).value = '';
    currentInput = '';
    currentOutput = '';
    expandedNodes.clear();
    showEmptyState();
    updateLineNumbers('');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupKeyboardShortcuts();
  updateLineNumbers('');
  showEmptyState();
});
