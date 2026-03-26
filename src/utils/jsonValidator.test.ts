import { describe, it, expect } from 'vitest';
import { parseJson, debounce, type ValidationError } from './jsonValidator.js';

function isValidationError(e: unknown): e is ValidationError {
  return typeof e === 'object' && e !== null && 'message' in e && 'line' in e && 'column' in e && 'position' in e;
}

describe('parseJson', () => {
  describe('valid JSON', () => {
    it('parses simple object', () => {
      const result = parseJson('{"name":"Elif Yılmaz","age":28}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ name: 'Elif Yılmaz', age: 28 });
      expect(result.error).toBeUndefined();
    });

    it('parses nested object', () => {
      const result = parseJson('{"user":{"name":"Ahmet Kaya","email":"ahmet@reelforge.com"}}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ user: { name: 'Ahmet Kaya', email: 'ahmet@reelforge.com' } });
    });

    it('parses array with objects', () => {
      const input = '[{"id":1,"name":"Proje Planı"},{"id":2,"name":"Teknik Tasarım"}]';
      const result = parseJson(input);
      expect(result.valid).toBe(true);
      expect(result.data).toEqual([{ id: 1, name: 'Proje Planı' }, { id: 2, name: 'Teknik Tasarım' }]);
    });

    it('parses empty object', () => {
      const result = parseJson('{}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({});
    });

    it('parses empty array', () => {
      const result = parseJson('[]');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('parses array with primitives', () => {
      const result = parseJson('[1,2,3,"test",null,true]');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual([1, 2, 3, 'test', null, true]);
    });

    it('parses boolean values', () => {
      const result = parseJson('{"active":true,"deleted":false}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ active: true, deleted: false });
    });

    it('parses null value', () => {
      const result = parseJson('{"value":null}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ value: null });
    });

    it('parses number values', () => {
      const result = parseJson('{"price":29.99,"count":100,"negative":-5}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ price: 29.99, count: 100, negative: -5 });
    });

    it('parses string with escaped characters', () => {
      const result = parseJson('{"text":"Satır\\nsonu\\tve\\"tırnak\\""}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ text: 'Satır\nsonu\tve"tırnak"' });
    });

    it('parses whitespace around JSON', () => {
      const result = parseJson('  \n  {"name":"Elif"}\n  ');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ name: 'Elif' });
    });

    it('parses deeply nested structure', () => {
      const result = parseJson('{"a":{"b":{"c":{"d":[1,2,3]}}}}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ a: { b: { c: { d: [1, 2, 3] } } } });
    });
  });

  describe('invalid JSON - error reporting', () => {
    it('returns valid=false for empty input', () => {
      const result = parseJson('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Boş girdi');
      expect(result.error?.line).toBe(0);
      expect(result.error?.column).toBe(0);
      expect(result.error?.position).toBe(0);
    });

    it('returns valid=false for whitespace-only input', () => {
      const result = parseJson('   \n\t  ');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Boş girdi');
    });

    it('returns valid=false and error details for trailing comma', () => {
      const result = parseJson('{"name":"Elif",}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message.length).toBeGreaterThan(0);
      expect(result.error?.line).toBeGreaterThan(0);
      expect(result.error?.column).toBeGreaterThan(0);
      expect(result.error?.position).toBeGreaterThanOrEqual(0);
    });

    it('returns valid=false and error details for missing colon', () => {
      const result = parseJson('{"name" "Elif"}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.line).toBeGreaterThan(0);
    });

    it('returns valid=false and error details for missing closing brace', () => {
      const result = parseJson('{"name":"Elif"');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.line).toBeGreaterThan(0);
    });

    it('returns valid=false and error details for missing closing bracket', () => {
      const result = parseJson('[1,2,3');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.line).toBeGreaterThan(0);
    });

    it('returns valid=false and error details for invalid number', () => {
      const result = parseJson('{"age":12.34.56}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns valid=false and error details for unquoted key', () => {
      const result = parseJson('{name:"Elif"}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns valid=false and error details for single quotes', () => {
      const result = parseJson("{'name':'Elif'}");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns valid=false and error details for invalid syntax', () => {
      const result = parseJson('{{}}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.line).toBeGreaterThan(0);
    });

    it('returns valid=false and error details for incorrect array syntax', () => {
      const result = parseJson('[1, 2, 3,]');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('error position parsing', () => {
    it('provides position for simple parse error', () => {
      const result = parseJson('{"name":"Elif","age":}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.position).toBeGreaterThanOrEqual(0);
      expect(result.error?.line).toBeGreaterThan(0);
      expect(result.error?.column).toBeGreaterThan(0);
    });

    it('error result has all required fields', () => {
      const result = parseJson('invalid');
      expect(result.valid).toBe(false);
      expect(isValidationError(result.error)).toBe(true);
      if (isValidationError(result.error)) {
        expect(typeof result.error.message).toBe('string');
        expect(typeof result.error.line).toBe('number');
        expect(typeof result.error.column).toBe('number');
        expect(typeof result.error.position).toBe('number');
      }
    });
  });
});

describe('debounce', () => {
  it('delays function execution', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const debouncedFn = debounce(fn, 50);

    debouncedFn();
    expect(callCount).toBe(0);

    await new Promise(resolve => setTimeout(resolve, 60));
    expect(callCount).toBe(1);
  });

  it('only calls function once for rapid calls', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const debouncedFn = debounce(fn, 50);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    await new Promise(resolve => setTimeout(resolve, 60));
    expect(callCount).toBe(1);
  });

  it('calls with latest arguments', async () => {
    let lastValue = '';
    const fn = (value: string) => { lastValue = value; };
    const debouncedFn = debounce(fn, 50);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    await new Promise(resolve => setTimeout(resolve, 60));
    expect(lastValue).toBe('third');
  });
});
