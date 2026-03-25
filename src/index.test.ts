import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson, type JsonError } from './index.js';

function isJsonError(e: unknown): e is JsonError {
  return typeof e === 'object' && e !== null && 'message' in e && 'line' in e && 'column' in e;
}

describe('formatJson', () => {
  it('formats simple object with 2-space indent by default', () => {
    const input = '{"name":"Elif","age":28}';
    const result = formatJson(input);
    expect(result).toBe(`{
  "name": "Elif",
  "age": 28
}`);
  });

  it('formats simple object with custom indent', () => {
    const input = '{"name":"Elif","age":28}';
    const result = formatJson(input, 4);
    expect(result).toBe(`{
    "name": "Elif",
    "age": 28
}`);
  });

  it('formats nested object', () => {
    const input = '{"user":{"name":"Ahmet Kaya","email":"ahmet@reelforge.com"}}';
    const result = formatJson(input);
    expect(result).toContain('"user":');
    expect(result).toContain('"name": "Ahmet Kaya"');
    expect(result).toContain('"email": "ahmet@reelforge.com"');
  });

  it('formats array with objects', () => {
    const input = '[{"id":1,"title":"Proje Planı"},{"id":2,"title":"Teknik Tasarım"}]';
    const result = formatJson(input);
    expect(result).toContain('[');
    expect(result).toContain('"id": 1');
    expect(result).toContain('"title": "Proje Planı"');
  });

  it('formats deeply nested structure', () => {
    const input = '{"a":{"b":{"c":{"d":[1,2,3]}}}}';
    const result = formatJson(input);
    expect(result).toContain('"a":');
    expect(result).toContain('"b":');
    expect(result).toContain('"c":');
    expect(result).toContain('"d": [');
  });

  it('formats empty object', () => {
    const input = '{}';
    const result = formatJson(input);
    expect(result).toBe('{}');
  });

  it('formats empty array', () => {
    const input = '[]';
    const result = formatJson(input);
    expect(result).toBe('[]');
  });

  it('formats object with empty array value', () => {
    const input = '{"items":[]}';
    const result = formatJson(input);
    expect(result).toContain('"items": []');
  });

  it('formats boolean values', () => {
    const input = '{"active":true,"deleted":false}';
    const result = formatJson(input);
    expect(result).toContain('"active": true');
    expect(result).toContain('"deleted": false');
  });

  it('formats null values', () => {
    const input = '{"value":null}';
    const result = formatJson(input);
    expect(result).toContain('"value": null');
  });

  it('formats number values', () => {
    const input = '{"price":29.99,"count":100}';
    const result = formatJson(input);
    expect(result).toContain('"price": 29.99');
    expect(result).toContain('"count": 100');
  });

  it('formats string with escaped characters', () => {
    const input = '{"text":"Satır\\nsonu\\tve\\"tırnak\\""}';
    const result = formatJson(input);
    expect(result).toContain('"text": "Satır');
  });

  it('throws JsonError with line and column for invalid JSON', () => {
    const input = '{"name":"Elif","age":}';
    try {
      formatJson(input);
      expect.fail('Should have thrown');
    } catch (e) {
      expect(isJsonError(e)).toBe(true);
      if (isJsonError(e)) {
        expect(e.line).toBeGreaterThan(0);
        expect(e.column).toBeGreaterThan(0);
        expect(e.message.length).toBeGreaterThan(0);
      }
    }
  });

  it('throws JsonError for empty input', () => {
    try {
      formatJson('');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(isJsonError(e)).toBe(true);
    }
  });

  it('throws JsonError for whitespace-only input', () => {
    try {
      formatJson('   \n\t  ');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(isJsonError(e)).toBe(true);
    }
  });

  it('throws JsonError for invalid syntax', () => {
    try {
      formatJson('{{}}');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(isJsonError(e)).toBe(true);
    }
  });
});

describe('minifyJson', () => {
  it('minifies simple object', () => {
    const input = `{
  "name": "Elif",
  "age": 28
}`;
    const result = minifyJson(input);
    expect(result).toBe('{"name":"Elif","age":28}');
  });

  it('minifies nested object', () => {
    const input = `{
  "user": {
    "name": "Ahmet Kaya",
    "email": "ahmet@reelforge.com"
  }
}`;
    const result = minifyJson(input);
    expect(result).toBe('{"user":{"name":"Ahmet Kaya","email":"ahmet@reelforge.com"}}');
  });

  it('minifies array', () => {
    const input = `[
  1,
  2,
  3
]`;
    const result = minifyJson(input);
    expect(result).toBe('[1,2,3]');
  });

  it('minifies already minified JSON', () => {
    const input = '{"name":"Elif","age":28}';
    const result = minifyJson(input);
    expect(result).toBe('{"name":"Elif","age":28}');
  });

  it('minifies object with all primitive types', () => {
    const input = `{
  "string": "test",
  "number": 42,
  "float": 3.14,
  "boolean": true,
  "null": null
}`;
    const result = minifyJson(input);
    expect(result).toBe('{"string":"test","number":42,"float":3.14,"boolean":true,"null":null}');
  });

  it('throws JsonError for invalid JSON', () => {
    try {
      minifyJson('{name:"Elif"}');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(isJsonError(e)).toBe(true);
    }
  });

  it('throws JsonError for empty input', () => {
    try {
      minifyJson('');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(isJsonError(e)).toBe(true);
    }
  });

  it('throws JsonError for malformed JSON object', () => {
    try {
      minifyJson('{"name":"Elif",}');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(isJsonError(e)).toBe(true);
    }
  });
});
