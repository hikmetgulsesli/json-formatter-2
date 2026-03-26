export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
}

export interface ValidationResult {
  valid: boolean;
  data?: unknown;
  error?: ValidationError;
}

export function parseJson(input: string): ValidationResult {
  if (!input.trim()) {
    return { valid: false, error: { message: 'Boş girdi' } };
  }

  try {
    const data = JSON.parse(input);
    return { valid: true, data };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    const position = extractErrorPosition(errorMessage, input);
    return {
      valid: false,
      error: {
        message: errorMessage,
        line: position.line,
        column: position.column,
      },
    };
  }
}

export function formatJson(input: string): string {
  const result = parseJson(input);
  if (!result.valid) {
    throw new Error(result.error?.message || 'Geçersiz JSON');
  }
  return JSON.stringify(result.data, null, 2);
}

export function minifyJson(input: string): string {
  const result = parseJson(input);
  if (!result.valid) {
    throw new Error(result.error?.message || 'Geçersiz JSON');
  }
  return JSON.stringify(result.data);
}

function extractErrorPosition(errorMessage: string, input: string): { line?: number; column?: number } {
  // Try to extract position from error message
  const positionMatch = errorMessage.match(/position (\d+)/i);
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    return getLineColumnFromPosition(input, position);
  }

  // Firefox: "line L column C"
  const lineColMatch = errorMessage.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  return {};
}

function getLineColumnFromPosition(input: string, position: number): { line: number; column: number } {
  const lines = input.split('\n');
  let charCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline
    if (charCount + lineLength > position) {
      return { line: i + 1, column: position - charCount + 1 };
    }
    charCount += lineLength;
  }

  return { line: lines.length, column: 1 };
}
