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
  it('nests LWC js-meta under html, css, svg, and js', () => {
    expect(PAIRED_META_FILE_NESTING_PATTERNS['*.html']).toContain('js-meta.xml');
    expect(PAIRED_META_FILE_NESTING_PATTERNS['*.css']).toContain('js-meta.xml');
    expect(PAIRED_META_FILE_NESTING_PATTERNS['*.svg']).toContain('js-meta.xml');
    expect(PAIRED_META_FILE_NESTING_PATTERNS['*.js']).toBe('${capture}.js-meta.xml');
  });

  it('lists a pattern for every companion extension', () => {
    for (const ext of Object.keys(COMPANION_META_SUFFIX_BY_EXT)) {
      expect(PAIRED_META_FILE_NESTING_PATTERNS[`*${ext}`]).toBeDefined();
    }
  });
});

describe('COMPANION_META_SUFFIX_BY_EXT', () => {
  it('uses js-meta.xml for LWC bundle parts', () => {
    expect(COMPANION_META_SUFFIX_BY_EXT['.html']).toBe('.js-meta.xml');
    expect(COMPANION_META_SUFFIX_BY_EXT['.css']).toBe('.js-meta.xml');
    expect(COMPANION_META_SUFFIX_BY_EXT['.svg']).toBe('.js-meta.xml');
  });
});
