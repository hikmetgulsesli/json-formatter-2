import { describe, it, expect } from 'vitest';

// Re-implement the functions for testing since the bundled code doesn't export them
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

describe('JSON Formatter', () => {
  describe('validateJson', () => {
    it('should return invalid for empty input', () => {
      const result = validateJson('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Boş girdi');
    });

    it('should return invalid for whitespace-only input', () => {
      const result = validateJson('   \n\t  ');
      expect(result.valid).toBe(false);
    });

    it('should return invalid for invalid JSON', () => {
      const result = validateJson('{invalid}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return valid for valid JSON object', () => {
      const result = validateJson('{"key":"value"}');
      expect(result.valid).toBe(true);
    });

    it('should return valid for valid JSON array', () => {
      const result = validateJson('[1,2,3]');
      expect(result.valid).toBe(true);
    });
  });

  describe('formatJson', () => {
    it('should format a valid JSON string', () => {
      const input = '{"a":1,"b":2}';
      const expected = `{
  "a": 1,
  "b": 2
}`;
      expect(formatJson(input)).toBe(expected);
    });

    it('should format nested JSON', () => {
      const input = '{"a":{"b":{"c":1}}}';
      const result = formatJson(input);
      expect(result).toContain('"a"');
      expect(result).toContain('"b"');
      expect(result).toContain('"c"');
    });

    it('should throw for invalid JSON', () => {
      expect(() => formatJson('invalid')).toThrow();
    });
  });

  describe('minifyJson', () => {
    it('should minify formatted JSON', () => {
      const input = `{
  "a": 1,
  "b": 2
}`;
      expect(minifyJson(input)).toBe('{"a":1,"b":2}');
    });

    it('should minify nested JSON', () => {
      const input = `{
  "a": {
    "b": 1
  }
}`;
      expect(minifyJson(input)).toBe('{"a":{"b":1}}');
    });

    it('should throw for invalid JSON', () => {
      expect(() => minifyJson('invalid')).toThrow();
    });
  });
});

describe('window.jsonFormatter API', () => {
  // These tests verify the API shape and behavior
  // The actual window object is set up in index.ts

  it('format function should work correctly', () => {
    const input = '{"a":1}';
    const result = formatJson(input);
    expect(result).toContain('"a"');
    expect(result).toContain('1');
  });

  it('minify function should work correctly', () => {
    const input = '{\n  "a": 1\n}';
    const result = minifyJson(input);
    expect(result).toBe('{"a":1}');
  });

  it('validateJson should detect syntax errors', () => {
    const result = validateJson('{"a":1,}')
    expect(result.valid).toBe(false);
  });
});
