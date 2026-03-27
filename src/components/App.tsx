import { useState, useMemo } from 'react';

function formatJson(input: string): string {
  try {
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch (e) {
    return String(e);
  }
}

type ViewMode = 'format' | 'tree' | 'raw';

interface JsonNode {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
  path: string;
  children?: JsonNode[];
}

function buildTree(key: string, value: unknown, path: string): JsonNode {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const node: JsonNode = { key, value, type, path };

  if (type === 'object' && value !== null) {
    node.children = Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      buildTree(k, v, `${path}.${k}`)
    );
  } else if (type === 'array') {
    node.children = (value as unknown[]).map((v, i) =>
      buildTree(String(i), v, `${path}[${i}]`)
    );
  }
  return node;
}

function JsonNodeView({ node, depth = 0 }: { node: JsonNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (node.type === 'object' || node.type === 'array') {
    const entries = node.children ?? [];
    const isArray = node.type === 'array';
    return (
      <div className="pl-4" style={{ paddingLeft: `${depth * 16}px` }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#81ecff] hover:text-[#00d4ec] cursor-pointer text-sm font-mono flex items-center gap-1"
        >
          <span className="text-[#adaaaa]">{expanded ? '▼' : '▶'}</span>
          <span className="text-[#bc87fe]">{isArray ? `[${node.key}]` : `"${node.key}"`}</span>
          <span className="text-[#adaaaa] text-xs">
            {isArray ? `(${entries.length} items)` : `{${entries.length}}`}
          </span>
        </button>
        {expanded && (
          <div>
            {entries.map((child, i) => (
              <JsonNodeView key={i} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const valueColor =
    node.type === 'string' ? '#81ecff' :
    node.type === 'number' ? '#a0fff0' :
    node.type === 'boolean' ? '#bc87fe' :
    node.type === 'null' ? '#ff716c' : '#adaaaa';

  return (
    <div className="pl-4" style={{ paddingLeft: `${depth * 16}px` }}>
      <span className="text-[#bc87fe] font-mono text-sm">"{node.key}":</span>{' '}
      <span className={`font-mono text-sm`} style={{ color: valueColor }}>
        {node.type === 'string' ? `"${node.value}"` : String(node.value)}
      </span>
    </div>
  );
}

export function App() {
  const [input, setInput] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('format');
  const [copied, setCopied] = useState(false);

  const { formatted, error, tree } = useMemo(() => {
    if (!input.trim()) {
      return { formatted: null, error: null, tree: null };
    }
    try {
      const result = formatJson(input);
      if (result.includes('SyntaxError') || result.includes('Error')) {
        return { formatted: null, error: result, tree: null };
      }
      const parsed = JSON.parse(input);
      const treeData = buildTree('root', parsed, 'root');
      return { formatted: result, error: null, tree: treeData };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { formatted: null, error: msg, tree: null };
    }
  }, [input]);

  const handleCopy = async () => {
    if (formatted) {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const minified = JSON.stringify(JSON.parse(input));
      setInput(minified);
    } catch (e) {
      // silent fail
    }
  };

  const handleClear = () => {
    setInput('');
  };

  const stats = input.trim()
    ? { size: new Blob([input]).size, lines: input.split('\n').length }
    : null;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#adaaaa] font-mono p-6 lg:p-10">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-baseline gap-4 mb-2">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter text-white" style={{ letterSpacing: '-2%' }}>
            FORMATTER
          </h1>
          <span className="text-lg text-[#81ecff] font-medium">JSON</span>
        </div>
        <p className="text-sm text-[#767575] uppercase tracking-widest">
          Yapılandırılmış Veri Görselleştirici
        </p>
      </header>

      {/* Stats */}
      {stats && !error && (
        <div className="flex gap-6 mb-6 text-xs uppercase tracking-widest text-[#767575]">
          <span>SIZE: {stats.size > 1024 ? `${(stats.size / 1024).toFixed(1)}KB` : `${stats.size}B`}</span>
          <span>ENCODING: UTF-8</span>
          <span>LINES: {stats.lines}</span>
        </div>
      )}

      {/* View Mode Selector */}
      <div className="flex gap-3 mb-6">
        {(['format', 'tree', 'raw'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-all ${
              viewMode === mode
                ? 'bg-gradient-to-r from-[#81ecff] to-[#00d4ec] text-[#005762] border-transparent'
                : 'bg-transparent border-[rgba(72,72,71,0.15)] text-[#adaaaa] hover:border-[rgba(72,72,71,0.3)]'
            }`}
          >
            {mode === 'format' ? 'FORMAT' : mode === 'tree' ? 'TREE' : 'RAW'}
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="grid lg:grid-cols-2 gap-0 bg-[#131313]">
        {/* Input */}
        <div className="bg-[#131313] p-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"ornek": "JSON yapistirin"}'
            className="w-full h-96 lg:h-[28rem] bg-[#262626] text-[#adaaaa] p-4 font-mono text-sm focus:outline-none focus:bg-[#2e2e2e] resize-none placeholder-[#484847]"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="bg-[#20201f] p-0">
          {error ? (
            <div className="h-96 lg:h-[28rem] bg-[#262626] p-4 overflow-auto">
              <div className="text-[#ff716c] font-mono text-sm">
                <span className="text-xs uppercase tracking-widest block mb-2">HATA</span>
                {error}
              </div>
            </div>
          ) : viewMode === 'tree' && tree ? (
            <div className="h-96 lg:h-[28rem] bg-[#262626] p-4 overflow-auto">
              <JsonNodeView node={tree} />
            </div>
          ) : viewMode === 'raw' ? (
            <pre className="h-96 lg:h-[28rem] bg-[#262626] p-4 overflow-auto text-[#81ecff] font-mono text-sm whitespace-pre-wrap">
              {formatted || ''}
            </pre>
          ) : (
            <pre className="h-96 lg:h-[28rem] bg-[#262626] p-4 overflow-auto text-[#a0fff0] font-mono text-sm whitespace-pre">
              {formatted || ''}
            </pre>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={() => {}}
          className="px-6 py-2.5 bg-gradient-to-r from-[#81ecff] to-[#00d4ec] text-[#005762] font-mono text-sm font-medium hover:opacity-90 transition-opacity"
        >
          BİÇİMLENDİR
        </button>
        <button
          onClick={handleCopy}
          disabled={!formatted}
          className="px-6 py-2.5 bg-transparent border border-[rgba(72,72,71,0.15)] text-[#bc87fe] font-mono text-sm hover:border-[rgba(188,135,254,0.3)] transition-colors disabled:opacity-30"
        >
          {copied ? 'KOPYALANDI ✓' : 'KOPYALA'}
        </button>
        <button
          onClick={handleMinify}
          disabled={!input.trim() || !!error}
          className="px-6 py-2.5 bg-transparent border border-[rgba(72,72,71,0.15)] text-[#adaaaa] font-mono text-sm hover:border-[rgba(72,72,71,0.3)] transition-colors disabled:opacity-30"
        >
          MİNİFY
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-2.5 bg-transparent border border-[rgba(72,72,71,0.15)] text-[#767575] font-mono text-sm hover:border-[rgba(72,72,71,0.3)] transition-colors"
        >
          TEMİZLE
        </button>
      </div>
    </div>
  );
}
