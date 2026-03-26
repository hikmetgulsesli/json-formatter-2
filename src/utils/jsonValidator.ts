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
    const position = extractErrorPosition(errorMessage);
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

function extractErrorPosition(errorMessage: string): { line?: number; column?: number } {
  // Chrome/V8: "at position N"
  const positionMatch = errorMessage.match(/at position (\d+)/);
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    const lines = errorMessage.split('\n');
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= position) {
        return { line: i + 1, column: position - charCount + 1 };
      }
      charCount += lines[i].length + 1;
    }
    return { line: 1, column: position };
  }

  // Firefox: "line L column C"
  const lineColMatch = errorMessage.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  // Try to find "line N" pattern
  const lineMatch = errorMessage.match(/line (\d+)/i);
  if (lineMatch) {
    return { line: parseInt(lineMatch[1], 10) };
  }

  return {};
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
