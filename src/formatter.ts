/**
 * JSON Formatter Module
 */

/**
 * Format JSON string with proper indentation
 */
export function formatJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, 2);
}

/**
 * Minify JSON string (remove all whitespace)
 */
export function minifyJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

/**
 * Validate JSON string
 */
export function validateJson(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}
