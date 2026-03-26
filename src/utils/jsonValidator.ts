/**
 * JSON Validator Module
 * Real-time JSON validation with debounced input and structured error reporting
 */

export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  position?: number;
}

export interface ValidationResult {
  valid: boolean;
  data?: unknown;
  error?: ValidationError;
}

/**
 * Parse error position from browser error message
 * Chrome/V8: 'at position N'
 * Firefox: 'line L column C'
 */
function parseErrorPosition(errorMessage: string, input: string): { line: number; column: number; position: number } {
  // Chrome/V8: "Unexpected token } in JSON at position 42"
  const v8Match = errorMessage.match(/at position (\d+)/);
  if (v8Match) {
    const position = parseInt(v8Match[1], 10);
    return calculateLineColumn(input, position);
  }

  // Firefox: "JSON.parse: expected ',' or '}' after property value in object at line 3 column 5 of the data"
  const ffMatch = errorMessage.match(/line (\d+) column (\d+)/);
  if (ffMatch) {
    const line = parseInt(ffMatch[1], 10);
    const column = parseInt(ffMatch[2], 10);
    const position = calculatePosition(input, line, column);
    return { line, column, position };
  }

  // Fallback: estimate position by counting newlines before the error
  const position = estimateErrorPosition(input);
  return calculateLineColumn(input, position);
}

function calculatePosition(input: string, line: number, column: number): number {
  let currentLine = 1;
  let pos = 0;
  while (pos < input.length && currentLine < line) {
    if (input[pos] === '\n') {
      currentLine++;
    }
    pos++;
  }
  return pos + column - 1;
}

function calculateLineColumn(input: string, position: number): { line: number; column: number; position: number } {
  const clampedPos = Math.min(position, input.length);
  const beforeError = input.slice(0, clampedPos);
  const lines = beforeError.split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column, position: clampedPos };
}

function estimateErrorPosition(input: string): number {
  // Try to find where the error might be by looking for common issues
  // Count newlines to estimate line
  const newlines = input.split('\n');
  if (newlines.length > 1) {
    return input.length - newlines[newlines.length - 1].length;
  }
  return Math.floor(input.length / 2);
}

/**
 * Parse JSON string and return structured validation result
 * @param input - JSON string to validate
 * @returns ValidationResult with valid=true on success or valid=false with error details
 */
export function parseJson(input: string): ValidationResult {
  if (!input || input.trim() === '') {
    return {
      valid: false,
      error: {
        message: 'Boş girdi',
        line: 0,
        column: 0,
        position: 0,
      },
    };
  }

  try {
    const data = JSON.parse(input);
    return { valid: true, data };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    const { line, column, position } = parseErrorPosition(errorMessage, input);

    return {
      valid: false,
      error: {
        message: errorMessage,
        line,
        column,
        position,
      },
    };
  }
}

/**
 * Debounce utility for real-time validation
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
