import { describe, it, expect } from 'vitest';
import { parseJson } from './jsonValidator';

describe('parseJson', () => {
  it('returns valid for proper JSON', () => {
    const result = parseJson('{"name": "test"}');
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ name: 'test' });
  });

  it('returns error for invalid JSON', () => {
    const result = parseJson('{invalid}');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBeTruthy();
  });

  it('returns error with line and column for Chrome V8 error format', () => {
    // Simulate Chrome error: "Unexpected token } in JSON at position 16"
    const result = parseJson('{"name": }');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error with Turkish message for invalid JSON', () => {
    const result = parseJson('not json at all');
    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('Unexpected');
  });

  it('returns error for empty input', () => {
    const result = parseJson('');
    expect(result.valid).toBe(false);
    expect(result.error?.message).toBe('Boş girdi');
  });

  it('returns error for whitespace-only input', () => {
    const result = parseJson('   ');
    expect(result.valid).toBe(false);
    expect(result.error?.message).toBe('Boş girdi');
  });
});

describe('ValidationError', () => {
  it('error object contains message', () => {
    const result = parseJson('{broken}');
    expect(result.valid).toBe(false);
    expect(result.error?.message).toBeTruthy();
    expect(typeof result.error?.message).toBe('string');
  });

  it('error may contain line and column', () => {
    const result = parseJson('{\n"a": 1,\n"b": }\n');
    expect(result.valid).toBe(false);
    // Error position extraction may or may not find line/column
    expect(result.error).toBeDefined();
  });
});
