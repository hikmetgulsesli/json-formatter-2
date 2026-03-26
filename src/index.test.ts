import { describe, it, expect } from 'vitest';
import { validateJson, formatJson, minifyJson } from './json-utils.js';

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
