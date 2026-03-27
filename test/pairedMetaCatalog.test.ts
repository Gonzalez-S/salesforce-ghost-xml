import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  COMPANION_META_SUFFIX_BY_EXT,
  EXPECTED_EDITOR_CONTEXT_WHEN,
  PAIRED_META_FILE_NESTING_PATTERNS,
} from '../src/pairedMetaCatalog';

const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
  contributes: { menus: { 'editor/context': { command: string; when: string }[] } };
};

describe('package.json vs catalog', () => {
  it('editor/context when clause matches catalog extensions', () => {
    const entry = packageJson.contributes.menus['editor/context'].find(
      (m) => m.command === 'salesforceGhostXml.openCompanionMetaXml',
    );
    expect(entry?.when).toBe(EXPECTED_EDITOR_CONTEXT_WHEN);
  });
});

describe('PAIRED_META_FILE_NESTING_PATTERNS', () => {
  it('nests LWC js-meta only under *.js', () => {
    expect(PAIRED_META_FILE_NESTING_PATTERNS['*.js']).toBe('${capture}.js-meta.xml');
    expect(PAIRED_META_FILE_NESTING_PATTERNS['*.html']).toBeUndefined();
  });

  it('lists a pattern for every companion extension', () => {
    for (const ext of Object.keys(COMPANION_META_SUFFIX_BY_EXT)) {
      expect(PAIRED_META_FILE_NESTING_PATTERNS[`*${ext}`]).toBeDefined();
    }
  });
});

describe('COMPANION_META_SUFFIX_BY_EXT', () => {
  it('uses js-meta.xml for .js', () => {
    expect(COMPANION_META_SUFFIX_BY_EXT['.js']).toBe('.js-meta.xml');
    expect(COMPANION_META_SUFFIX_BY_EXT['.html']).toBeUndefined();
  });
});
