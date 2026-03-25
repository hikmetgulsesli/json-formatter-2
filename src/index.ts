/**
 * JSON Formatter Module
 * Provides format and minify operations with structured error reporting
 */

export interface JsonError {
  message: string;
  line: number;
  column: number;
}

export interface ParseResult {
  success: boolean;
  data?: unknown;
  error?: JsonError;
}

interface JsonToken {
  type: 'brace' | 'bracket' | 'colon' | 'comma' | 'string' | 'number' | 'boolean' | 'null' | 'whitespace' | 'unknown';
  value: string;
  position: number;
  line: number;
  column: number;
}

function tokenize(input: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let line = 1;
  let column = 1;

  let i = 0;
  while (i < input.length) {
    const char = input[i];
    const startPos = i;
    const startLine = line;
    const startCol = column;

    if (char === '{' || char === '}') {
      tokens.push({ type: 'brace', value: char, position: startPos, line: startLine, column: startCol });
      i++;
      column++;
    } else if (char === '[' || char === ']') {
      tokens.push({ type: 'bracket', value: char, position: startPos, line: startLine, column: startCol });
      i++;
      column++;
    } else if (char === ':') {
      tokens.push({ type: 'colon', value: char, position: startPos, line: startLine, column: startCol });
      i++;
      column++;
    } else if (char === ',') {
      tokens.push({ type: 'comma', value: char, position: startPos, line: startLine, column: startCol });
      i++;
      column++;
    } else if (char === '"') {
      let value = '"';
      i++;
      column++;
      while (i < input.length) {
        const c = input[i];
        if (c === '\n') {
          line++;
          column = 1;
        }
        if (c === '\\' && i + 1 < input.length) {
          value += c + input[i + 1];
          i += 2;
          column += 2;
        } else if (c === '"') {
          value += '"';
          i++;
          column++;
          break;
        } else {
          value += c;
          i++;
          column++;
        }
      }
      tokens.push({ type: 'string', value, position: startPos, line: startLine, column: startCol });
    } else if (char === '-' || (char >= '0' && char <= '9')) {
      let value = '';
      while (i < input.length && (input[i] >= '0' && input[i] <= '9' || input[i] === '-' || input[i] === '.' || input[i] === 'e' || input[i] === 'E' || input[i] === '+')) {
        value += input[i];
        i++;
        column++;
      }
      tokens.push({ type: 'number', value, position: startPos, line: startLine, column: startCol });
    } else if (char === 't' && input.slice(i, i + 4) === 'true') {
      tokens.push({ type: 'boolean', value: 'true', position: startPos, line: startLine, column: startCol });
      i += 4;
      column += 4;
    } else if (char === 'f' && input.slice(i, i + 5) === 'false') {
      tokens.push({ type: 'boolean', value: 'false', position: startPos, line: startLine, column: startCol });
      i += 5;
      column += 5;
    } else if (char === 'n' && input.slice(i, i + 4) === 'null') {
      tokens.push({ type: 'null', value: 'null', position: startPos, line: startLine, column: startCol });
      i += 4;
      column += 4;
    } else if (/\s/.test(char)) {
      let value = '';
      while (i < input.length && /\s/.test(input[i])) {
        if (input[i] === '\n') {
          line++;
          column = 1;
        } else {
          column++;
        }
        value += input[i];
        i++;
      }
      tokens.push({ type: 'whitespace', value, position: startPos, line: startLine, column: startCol });
    } else {
      tokens.push({ type: 'unknown', value: char, position: startPos, line: startLine, column: startCol });
      i++;
      column++;
    }
  }

  return tokens;
}

function skipWhitespace(tokens: JsonToken[], index: number): number {
  while (index < tokens.length && tokens[index].type === 'whitespace') {
    index++;
  }
  return index;
}

function parseValue(tokens: JsonToken[], index: number): { value: unknown; endIndex: number } | { error: JsonError; index: number } {
  index = skipWhitespace(tokens, index);

  if (index >= tokens.length) {
    return { error: { message: 'Unexpected end of input', line: 0, column: 0 }, index };
  }

  const token = tokens[index];

  if (token.type === 'string') {
    let str = token.value.slice(1, -1);
    str = str.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r').replace(/\\b/g, '\b').replace(/\\f/g, '\f');
    return { value: str, endIndex: index + 1 };
  }

  if (token.type === 'number') {
    const num = parseFloat(token.value);
    if (isNaN(num)) {
      return { error: { message: `Invalid number: ${token.value}`, line: token.line, column: token.column }, index };
    }
    return { value: num, endIndex: index + 1 };
  }

  if (token.type === 'boolean') {
    return { value: token.value === 'true', endIndex: index + 1 };
  }

  if (token.type === 'null') {
    return { value: null, endIndex: index + 1 };
  }

  if (token.type === 'brace' && token.value === '{') {
    const obj: Record<string, unknown> = {};
    index++;
    index = skipWhitespace(tokens, index);
    
    if (index < tokens.length && tokens[index].type === 'brace' && tokens[index].value === '}') {
      return { value: obj, endIndex: index + 1 };
    }

    while (index < tokens.length) {
      index = skipWhitespace(tokens, index);
      if (tokens[index].type !== 'string') {
        return { error: { message: 'Expected property name (string)', line: tokens[index].line, column: tokens[index].column }, index };
      }

      const key = tokens[index].value.slice(1, -1);
      index++;

      index = skipWhitespace(tokens, index);
      if (tokens[index]?.type !== 'colon') {
        return { error: { message: 'Expected colon after property name', line: tokens[index]?.line || 0, column: tokens[index]?.column || 0 }, index };
      }
      index++;

      const result = parseValue(tokens, index);
      if ('error' in result) {
        return result;
      }
      obj[key] = result.value;
      index = result.endIndex;

      index = skipWhitespace(tokens, index);
      if (tokens[index]?.type === 'comma') {
        index++;
      } else if (tokens[index]?.type === 'brace' && tokens[index].value === '}') {
        return { value: obj, endIndex: index + 1 };
      } else {
        return { error: { message: 'Expected comma or closing brace', line: tokens[index]?.line || 0, column: tokens[index]?.column || 0 }, index };
      }
    }

    return { error: { message: 'Unclosed object', line: token.line, column: token.column }, index };
  }

  if (token.type === 'bracket' && token.value === '[') {
    const arr: unknown[] = [];
    index++;
    index = skipWhitespace(tokens, index);

    if (index < tokens.length && tokens[index].type === 'bracket' && tokens[index].value === ']') {
      return { value: arr, endIndex: index + 1 };
    }

    while (index < tokens.length) {
      const result = parseValue(tokens, index);
      if ('error' in result) {
        return result;
      }
      arr.push(result.value);
      index = result.endIndex;

      index = skipWhitespace(tokens, index);
      if (tokens[index]?.type === 'comma') {
        index++;
      } else if (tokens[index]?.type === 'bracket' && tokens[index].value === ']') {
        return { value: arr, endIndex: index + 1 };
      } else {
        return { error: { message: 'Expected comma or closing bracket', line: tokens[index]?.line || 0, column: tokens[index]?.column || 0 }, index };
      }
    }

    return { error: { message: 'Unclosed array', line: token.line, column: token.column }, index };
  }

  return { error: { message: `Unexpected token: ${token.value}`, line: token.line, column: token.column }, index };
}

function validateJson(input: string): ParseResult {
  if (!input || input.trim() === '') {
    return { success: false, error: { message: 'Input is empty', line: 0, column: 0 } };
  }

  try {
    const tokens = tokenize(input);
    const result = parseValue(tokens, 0);

    if ('error' in result) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.value };
  } catch (e) {
    return { success: false, error: { message: String(e), line: 0, column: 0 } };
  }
}

interface TreeNode {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  value?: unknown;
  children?: { key: string; node: TreeNode }[];
  elements?: TreeNode[];
}

function buildTree(value: unknown): TreeNode {
  if (value === null) {
    return { type: 'null' };
  }

  if (typeof value === 'string') {
    return { type: 'string', value };
  }

  if (typeof value === 'number') {
    return { type: 'number', value };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean', value };
  }

  if (Array.isArray(value)) {
    return {
      type: 'array',
      elements: value.map(item => buildTree(item))
    };
  }

  if (typeof value === 'object') {
    return {
      type: 'object',
      children: Object.entries(value as Record<string, unknown>).map(([key, val]) => ({
        key,
        node: buildTree(val)
      }))
    };
  }

  throw new Error('Invalid JSON value');
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function formatPrimitive(node: TreeNode): string {
  if (node.type === 'string') {
    return `"${escapeString(String(node.value))}"`;
  }
  if (node.type === 'number' || node.type === 'boolean') {
    return String(node.value);
  }
  if (node.type === 'null') {
    return 'null';
  }
  return '';
}

function formatObjectNode(node: TreeNode, indent: number, currentIndent: number): string {
  const indentStr = ' '.repeat(currentIndent);
  const childIndent = ' '.repeat(currentIndent + indent);

  if (!node.children || node.children.length === 0) {
    return '{}';
  }

  const lines: string[] = ['{'];
  node.children.forEach((child, index) => {
    const isLast = index === node.children!.length - 1;
    
    if (child.node.type === 'object') {
      const formattedChild = formatObjectNode(child.node, indent, currentIndent + indent);
      if (formattedChild === '{}') {
        lines.push(`${childIndent}"${child.key}": {}`);
      } else {
        lines.push(`${childIndent}"${child.key}": ${formattedChild}`);
      }
    } else if (child.node.type === 'array') {
      const formattedChild = formatArrayNode(child.node, indent, currentIndent + indent);
      lines.push(`${childIndent}"${child.key}": ${formattedChild}`);
    } else {
      lines.push(`${childIndent}"${child.key}": ${formatPrimitive(child.node)}`);
    }
    
    if (!isLast) {
      lines[lines.length - 1] += ',';
    }
  });
  lines.push(`${indentStr}}`);
  return lines.join('\n');
}

function formatArrayNode(node: TreeNode, indent: number, currentIndent: number): string {
  const indentStr = ' '.repeat(currentIndent);
  const childIndent = ' '.repeat(currentIndent + indent);

  if (!node.elements || node.elements.length === 0) {
    return '[]';
  }

  const lines: string[] = ['['];
  node.elements.forEach((elem, index) => {
    const isLast = index === node.elements!.length - 1;
    
    if (elem.type === 'object') {
      const formattedElem = formatObjectNode(elem, indent, currentIndent + indent);
      lines.push(`${childIndent}${formattedElem}`);
    } else if (elem.type === 'array') {
      lines.push(`${childIndent}${formatArrayNode(elem, indent, currentIndent + indent)}`);
    } else {
      lines.push(`${childIndent}${formatPrimitive(elem)}`);
    }
    
    if (!isLast) {
      lines[lines.length - 1] += ',';
    }
  });
  lines.push(`${indentStr}]`);
  return lines.join('\n');
}

function formatWithTree(data: unknown, indent: number): string {
  const tree = buildTree(data);

  if (tree.type === 'object') {
    return formatObjectNode(tree, indent, 0);
  }
  if (tree.type === 'array') {
    return formatArrayNode(tree, indent, 0);
  }
  return formatPrimitive(tree);
}

/**
 * Formats JSON string with pretty-print indentation
 * @param input - JSON string to format
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON string
 * @throws JsonError with line/column info if input is invalid
 */
export function formatJson(input: string, indent: number = 2): string {
  const result = validateJson(input);
  
  if (!result.success || !result.data) {
    const error = result.error || { message: 'Invalid JSON', line: 0, column: 0 };
    throw error;
  }

  return formatWithTree(result.data, indent);
}

/**
 * Minifies JSON string by removing all whitespace
 * @param input - JSON string to minify
 * @returns Minified JSON string
 * @throws JsonError with line/column info if input is invalid
 */
export function minifyJson(input: string): string {
  const result = validateJson(input);
  
  if (!result.success || !result.data) {
    const error = result.error || { message: 'Invalid JSON', line: 0, column: 0 };
    throw error;
  }

  return JSON.stringify(result.data);
}
