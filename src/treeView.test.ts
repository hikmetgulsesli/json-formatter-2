/**
 * Tree View Renderer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseJsonToTree,
  TYPE_COLORS,
  TreeViewRenderer,
  renderTreeToHtml,
} from './treeView';

describe('parseJsonToTree', () => {
  it('should parse simple object', () => {
    const json = '{"id": 1024, "name": "test"}';
    const tree = parseJsonToTree(json);

    expect(tree).not.toBeNull();
    expect(tree?.type).toBe('object');
    expect(tree?.children).toHaveLength(2);
  });

  it('should parse nested object', () => {
    const json = '{"meta": {"session": "abc", "count": 3}}';
    const tree = parseJsonToTree(json);

    expect(tree?.type).toBe('object');
    expect(tree?.children?.[0].type).toBe('object');
    expect(tree?.children?.[0].children).toHaveLength(2);
  });

  it('should parse array', () => {
    const json = '[1, 2, 3]';
    const tree = parseJsonToTree(json);

    expect(tree?.type).toBe('array');
    expect(tree?.children).toHaveLength(3);
  });

  it('should parse array of objects', () => {
    const json = '[{"id": 1}, {"id": 2}]';
    const tree = parseJsonToTree(json);

    expect(tree?.type).toBe('array');
    expect(tree?.children).toHaveLength(2);
    expect(tree?.children?.[0].type).toBe('object');
  });

  it('should return null for invalid JSON', () => {
    const json = 'not valid json';
    const tree = parseJsonToTree(json);

    expect(tree).toBeNull();
  });
});

describe('JsonNode types', () => {
  it('should detect string type', () => {
    const json = '{"name": "Elif Yılmaz"}';
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('string');
    expect(tree?.children?.[0].value).toBe('Elif Yılmaz');
  });

  it('should detect number type', () => {
    const json = '{"age": 28, "score": 95.5}';
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('number');
    expect(tree?.children?.[1].type).toBe('number');
  });

  it('should detect boolean type', () => {
    const json = '{"active": true, "verified": false}';
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('boolean');
    expect(tree?.children?.[1].type).toBe('boolean');
  });

  it('should detect null type', () => {
    const json = '{"data": null}';
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('null');
  });

  it('should detect object type', () => {
    const json = '{"user": {"name": "Ahmet"}}';
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('object');
  });

  it('should detect array type', () => {
    const json = '{"items": [1, 2, 3]}';
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('array');
  });
});

describe('TYPE_COLORS', () => {
  it('should have correct string color', () => {
    expect(TYPE_COLORS.string).toBe('#89dceb');
  });

  it('should have correct number color', () => {
    expect(TYPE_COLORS.number).toBe('#fab387');
  });

  it('should have correct boolean color', () => {
    expect(TYPE_COLORS.boolean).toBe('#cba6f7');
  });

  it('should have correct null color', () => {
    expect(TYPE_COLORS.null).toBe('#cba6f7');
  });

  it('should have correct object color', () => {
    expect(TYPE_COLORS.object).toBe('#adaaaa');
  });

  it('should have correct array color', () => {
    expect(TYPE_COLORS.array).toBe('#adaaaa');
  });
});

describe('TreeViewRenderer', () => {
  it('exists as a class', () => {
    expect(TreeViewRenderer).toBeDefined();
    expect(typeof TreeViewRenderer).toBe('function');
  });
});

describe('renderTreeToHtml', () => {
  it('should render tree as HTML string', () => {
    const json = '{"id": 1024, "name": "test"}';
    const tree = parseJsonToTree(json);
    const html = renderTreeToHtml(tree);

    expect(html).toContain('tree-root');
    expect(html).toContain('id');
    expect(html).toContain('name');
  });

  it('should include type colors', () => {
    const json = '{"id": 1024}';
    const tree = parseJsonToTree(json);
    const html = renderTreeToHtml(tree);

    expect(html).toContain('#fab387'); // number color
  });

  it('should include key color', () => {
    const json = '{"id": 1024}';
    const tree = parseJsonToTree(json);
    const html = renderTreeToHtml(tree);

    expect(html).toContain('#00E5FF'); // key color
  });

  it('should show object count', () => {
    const json = '{"meta": {"a": 1, "b": 2}}';
    const tree = parseJsonToTree(json);
    const html = renderTreeToHtml(tree);

    expect(html).toContain('{2}');
  });

  it('should show array count', () => {
    const json = '{"items": [1, 2, 3]}';
    const tree = parseJsonToTree(json);
    const html = renderTreeToHtml(tree);

    expect(html).toContain('[3]');
  });

  it('should return empty message for null tree', () => {
    const html = renderTreeToHtml(null);

    expect(html).toContain('Geçerli JSON girin');
  });
});

describe('Tree node expansion state', () => {
  it('should track expanded state per node', () => {
    const json = '{"a": {"b": {"c": 1}}}';
    const tree = parseJsonToTree(json);

    expect(tree?.isExpanded).toBe(true);
    expect(tree?.children?.[0].isExpanded).toBe(true);
  });

  it('should toggle node expansion', () => {
    const json = '{"a": {"b": 1}}';
    const tree = parseJsonToTree(json);

    const node = tree?.children?.[0];
    if (node) {
      node.isExpanded = false;
      expect(node.isExpanded).toBe(false);

      node.isExpanded = true;
      expect(node.isExpanded).toBe(true);
    }
  });
});

describe('Value truncation', () => {
  it('should truncate long strings in display', () => {
    const longString = 'a'.repeat(100);
    const json = `{"text": "${longString}"}`;
    const tree = parseJsonToTree(json);
    const html = renderTreeToHtml(tree);

    // Should contain ellipsis for truncated display
    expect(html).toContain('…');
    // Full string should be in the title attribute for tooltip
    expect(html).toContain(`title="${longString}"`);
  });

  it('should show full value in tooltip', () => {
    const longString = 'a'.repeat(100);
    const json = `{"text": "${longString}"}`;
    const tree = parseJsonToTree(json);
    const html = renderTreeToHtml(tree);

    expect(html).toContain(`title="${longString}"`);
  });
});

describe('Complex JSON structures', () => {
  it('should handle deeply nested objects', () => {
    const json = JSON.stringify({
      level1: {
        level2: {
          level3: {
            level4: { value: 'deep' }
          }
        }
      }
    });
    const tree = parseJsonToTree(json);

    expect(tree?.type).toBe('object');
    const level4Node = tree?.children?.[0].children?.[0].children?.[0].children?.[0];
    expect(level4Node?.type).toBe('object');
    expect(level4Node?.children?.[0].value).toBe('deep');
  });

  it('should handle mixed arrays and objects', () => {
    const json = JSON.stringify({
      users: [
        { id: 1, name: 'Elif Yılmaz' },
        { id: 2, name: 'Ahmet Kaya' }
      ]
    });
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('array');
    expect(tree?.children?.[0].children?.[0].type).toBe('object');
    expect(tree?.children?.[0].children?.[0].children?.[1].value).toBe('Elif Yılmaz');
  });

  it('should handle empty objects', () => {
    const json = '{"empty": {}}';
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('object');
    expect(tree?.children?.[0].children).toHaveLength(0);
  });

  it('should handle empty arrays', () => {
    const json = '{"empty": []}';
    const tree = parseJsonToTree(json);

    expect(tree?.children?.[0].type).toBe('array');
    expect(tree?.children?.[0].children).toHaveLength(0);
  });

  it('should handle various data types', () => {
    const json = JSON.stringify({
      string: 'test',
      number: 42,
      float: 3.14,
      boolean: true,
      nullValue: null,
      array: [1, 2, 3],
      object: { key: 'value' }
    });
    const tree = parseJsonToTree(json);

    expect(tree?.children).toHaveLength(7);
  });
});
