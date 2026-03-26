import { describe, it, expect } from 'vitest';
import { parseJson, formatJson, minifyJson } from './jsonValidator';

describe('parseJson', () => {
  it('returns valid result for valid JSON', () => {
    const result = parseJson('{"name": "test"}');
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ name: 'test' });
    expect(result.error).toBeUndefined();
  });

  it('returns invalid result for empty input', () => {
    const result = parseJson('');
    expect(result.valid).toBe(false);
    expect(result.error?.message).toBe('Boş girdi');
  });

  it('returns invalid result for whitespace only', () => {
    const result = parseJson('   ');
    expect(result.valid).toBe(false);
  });

  it('returns invalid result for invalid JSON', () => {
    const result = parseJson('{"name": }');
    expect(result.valid).toBe(false);
    expect(result.error?.message).toBeDefined();
  });
});

describe('formatJson', () => {
  it('formats JSON with 2 space indentation', () => {
    const input = '{"name":"test"}';
    const result = formatJson(input);
    expect(result).toBe('{\n  "name": "test"\n}');
  });

  it('throws error for invalid JSON', () => {
    expect(() => formatJson('invalid')).toThrow();
  });
});

describe('minifyJson', () => {
  it('minifies JSON by removing whitespace', () => {
    const input = '{\n  "name": "test"\n}';
    const result = minifyJson(input);
    expect(result).toBe('{"name":"test"}');
  });

  it('throws error for invalid JSON', () => {
    expect(() => minifyJson('invalid')).toThrow();
  });
});
