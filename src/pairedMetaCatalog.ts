/** Paired Salesforce sources and sibling *-meta.xml (Explorer nesting + open companion). */

interface PairedMetaSource {
  readonly ext: string;
  /** Suffix for "Open paired meta" (LWC uses shared `.js-meta.xml`). */
  readonly suffix: string;
  /** VS Code nesting value: comma-separated ${capture}… patterns. */
  readonly pattern: string;
}

const SOURCES: readonly PairedMetaSource[] = [
  { ext: '.cls', suffix: '.cls-meta.xml', pattern: '${capture}.cls-meta.xml' },
  {
    ext: '.trigger',
    suffix: '.trigger-meta.xml',
    pattern: '${capture}.trigger-meta.xml',
  },
  {
    ext: '.page',
    suffix: '.page-meta.xml',
    pattern: '${capture}.page-meta.xml',
  },
  {
    ext: '.component',
    suffix: '.component-meta.xml',
    pattern: '${capture}.component-meta.xml',
  },
  { ext: '.js', suffix: '.js-meta.xml', pattern: '${capture}.js-meta.xml' },
];

const EDITOR_CONTEXT_EXT_NAMES = SOURCES.map((s) => s.ext.slice(1)).join('|');

/** Must match `editor/context` menu `when` in package.json (test-enforced). */
export const EXPECTED_EDITOR_CONTEXT_WHEN = `salesforceGhostXml.isSalesforceProject && resourceExtname =~ /^\\.(${EDITOR_CONTEXT_EXT_NAMES})$/`;

/** Map source extension -> companion *-meta.xml suffix (for open-in-editor). */
export const COMPANION_META_SUFFIX_BY_EXT: Readonly<Record<string, string>> = Object.fromEntries(
  SOURCES.map((s) => [s.ext, s.suffix]),
);

/** Parent glob -> Explorer file nesting child pattern string. */
export const PAIRED_META_FILE_NESTING_PATTERNS: Readonly<Record<string, string>> =
  Object.fromEntries(SOURCES.map((s) => [`*${s.ext}`, s.pattern]));
