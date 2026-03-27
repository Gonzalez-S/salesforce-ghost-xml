import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as vscode from 'vscode';

const hoist = vi.hoisted(() => {
  const patterns: Record<string, string> = {};
  const state = { nestWs: undefined as boolean | undefined };
  const wsStore = new Map<string, unknown>();
  const stubEmpty = {
    get: vi.fn(),
    inspect: vi.fn(() => ({})),
    update: vi.fn(),
  };
  return { patterns, state, wsStore, stubEmpty };
});

vi.mock('vscode', () => ({
  ConfigurationTarget: { Workspace: 1 },
  workspace: {
    getConfiguration: (section: string) => {
      if (section !== 'explorer') {
        return hoist.stubEmpty;
      }
      return {
        get: (key: string) => {
          if (key === 'fileNesting.patterns') {
            return { ...hoist.patterns };
          }
          if (key === 'fileNesting.enabled') {
            return hoist.state.nestWs ?? false;
          }
          return undefined;
        },
        inspect: (key: string) =>
          key === 'fileNesting.enabled' ? { workspaceValue: hoist.state.nestWs } : {},
        update: vi.fn(async (key: string, value: unknown) => {
          if (key === 'fileNesting.patterns') {
            for (const k of Object.keys(hoist.patterns)) {
              delete hoist.patterns[k];
            }
            if (value !== null && typeof value === 'object') {
              Object.assign(hoist.patterns, value as object);
            }
          }
          if (key === 'fileNesting.enabled') {
            hoist.state.nestWs = value as boolean | undefined;
          }
        }),
      };
    },
  },
}));

import { applyPairedFileNesting, clearPairedFileNesting } from '../src/fileNestingController';

function makeContext(): vscode.ExtensionContext {
  return {
    workspaceState: {
      get: (k: string) => hoist.wsStore.get(k),
      update: async (k: string, v: unknown) => {
        hoist.wsStore.set(k, v);
      },
    },
  } as unknown as vscode.ExtensionContext;
}

describe('fileNestingController', () => {
  beforeEach(() => {
    for (const k of Object.keys(hoist.patterns)) {
      delete hoist.patterns[k];
    }
    hoist.state.nestWs = undefined;
    hoist.wsStore.clear();
  });

  it('apply adds patterns and records owned pairs', async () => {
    await applyPairedFileNesting(makeContext());
    expect(hoist.patterns['*.cls']).toContain('cls-meta.xml');
    expect(hoist.patterns['*.js']).toContain('js-meta.xml');
    const owned = hoist.wsStore.get('ownedFileNestingPairs') as Record<string, string>;
    expect(owned['*.cls']).toContain('cls-meta.xml');
    expect(owned['*.js']).toContain('js-meta.xml');
  });

  it('merges *.js when a pattern already exists without js-meta.xml', async () => {
    hoist.patterns['*.js'] = '${capture}.map';
    await applyPairedFileNesting(makeContext());
    expect(hoist.patterns['*.js']).toContain('js-meta.xml');
    expect(hoist.patterns['*.js']).toContain('map');
  });

  it('clear removes extension-owned patterns', async () => {
    const ctx = makeContext();
    await applyPairedFileNesting(ctx);
    await clearPairedFileNesting(ctx);
    expect(hoist.patterns['*.cls']).toBeUndefined();
    expect(hoist.patterns['*.js']).toBeUndefined();
  });
});
