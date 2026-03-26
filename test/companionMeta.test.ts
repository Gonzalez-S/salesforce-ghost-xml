import { describe, expect, it, vi } from 'vitest';

vi.mock('vscode', () => ({
  Uri: {
    file: (fsPath: string) => ({ fsPath, scheme: 'file' as const }),
  },
}));

import { resolveCompanionMetaUri } from '../src/companionMeta';

describe('resolveCompanionMetaUri', () => {
  it('resolves Apex class to cls-meta.xml', () => {
    const u = resolveCompanionMetaUri({
      fsPath: '/proj/classes/Foo.cls',
      scheme: 'file',
    } as import('vscode').Uri);
    expect(u?.fsPath.endsWith('Foo.cls-meta.xml')).toBe(true);
  });

  it('resolves LWC module to shared js-meta.xml', () => {
    const html = resolveCompanionMetaUri({
      fsPath: '/proj/lwc/baz/baz.html',
      scheme: 'file',
    } as import('vscode').Uri);
    expect(html?.fsPath.endsWith('baz.js-meta.xml')).toBe(true);

    const js = resolveCompanionMetaUri({
      fsPath: '/proj/lwc/baz/baz.js',
      scheme: 'file',
    } as import('vscode').Uri);
    expect(js?.fsPath.endsWith('baz.js-meta.xml')).toBe(true);
  });

  it('returns undefined for unsupported extension', () => {
    expect(
      resolveCompanionMetaUri({
        fsPath: '/x/readme.md',
        scheme: 'file',
      } as import('vscode').Uri),
    ).toBeUndefined();
  });
});
