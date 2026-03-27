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

  it('resolves LWC .js paths to the bundle js-meta.xml', () => {
    const main = resolveCompanionMetaUri({
      fsPath: '/proj/lwc/baz/baz.js',
      scheme: 'file',
    } as import('vscode').Uri);
    expect(main?.fsPath.endsWith('baz.js-meta.xml')).toBe(true);

    const helper = resolveCompanionMetaUri({
      fsPath: '/proj/lwc/baz/helper.js',
      scheme: 'file',
    } as import('vscode').Uri);
    expect(helper?.fsPath).toBe(main?.fsPath);

    const nested = resolveCompanionMetaUri({
      fsPath: '/proj/force-app/main/default/lwc/baz/utils/helper.js',
      scheme: 'file',
    } as import('vscode').Uri);
    expect(nested?.fsPath.endsWith('/lwc/baz/baz.js-meta.xml')).toBe(true);

    const upper = resolveCompanionMetaUri({
      fsPath: '/proj/force-app/main/default/LWC/baz/baz.js',
      scheme: 'file',
    } as import('vscode').Uri);
    expect(upper?.fsPath.endsWith('/LWC/baz/baz.js-meta.xml')).toBe(true);
  });

  it('returns undefined for non-.js or unsupported extensions', () => {
    expect(
      resolveCompanionMetaUri({
        fsPath: '/proj/lwc/baz/baz.html',
        scheme: 'file',
      } as import('vscode').Uri),
    ).toBeUndefined();
    expect(
      resolveCompanionMetaUri({
        fsPath: '/x/readme.md',
        scheme: 'file',
      } as import('vscode').Uri),
    ).toBeUndefined();
  });

  it('resolves non-LWC .js by basename', () => {
    const u = resolveCompanionMetaUri({
      fsPath: '/proj/scripts/tool.js',
      scheme: 'file',
    } as import('vscode').Uri);
    expect(u?.fsPath.endsWith('tool.js-meta.xml')).toBe(true);
  });
});
