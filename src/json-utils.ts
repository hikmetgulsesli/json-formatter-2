// JSON utility functions - exported for testing

export function validateJson(input: string): { valid: boolean; error?: string } {
  if (!input.trim()) {
    return { valid: false, error: 'Boş girdi' };
  }
  try {
    JSON.parse(input);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Geçersiz JSON sözdizimi' };
  }
}

export function formatJson(input: string): string {
  return JSON.stringify(JSON.parse(input), null, 2);
}

export function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

export type JsonNodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface JsonNode {
  key: string;
  value: unknown;
  type: JsonNodeType;
  children?: JsonNode[];
  path: string;
}

export function buildTree(input: string): JsonNode {
  const parsed = JSON.parse(input);
  return parseNode('root', parsed, '$');
}

export function parseNode(key: string, value: unknown, path: string): JsonNode {
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

export function getType(value: unknown): JsonNodeType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  if (t === 'string') return 'string';
  if (t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  return 'string';
}
