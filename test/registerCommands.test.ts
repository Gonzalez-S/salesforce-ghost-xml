import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as vscode from 'vscode';

const handlers: Record<string, (...args: unknown[]) => unknown> = {};

vi.mock('vscode', () => ({
  Uri: {
    file: (fsPath: string) => ({ fsPath, scheme: 'file' as const }),
  },
  commands: {
    registerCommand: vi.fn((id: string, fn: (...args: unknown[]) => unknown) => {
      handlers[id] = fn;
      return { dispose: vi.fn() };
    }),
  },
  ConfigurationTarget: { Workspace: 1 },
  workspace: {
    getConfiguration: () => ({
      update: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
    }),
  },
  window: {
    activeTextEditor: undefined,
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showTextDocument: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../src/explorerIntegration', () => ({
  CONFIG_SECTION: 'salesforceGhostXml',
  isExplorerIntegrationEnabled: vi.fn().mockReturnValue(true),
  syncExplorerIntegration: vi.fn().mockResolvedValue(undefined),
}));

import * as vscodeApi from 'vscode';
import { registerCommands } from '../src/registerCommands';

describe('registerCommands', () => {
  beforeEach(() => {
    vi.mocked(vscodeApi.window.showInformationMessage).mockClear();
    vi.mocked(vscodeApi.window.showErrorMessage).mockClear();
    vi.mocked(vscodeApi.window.showTextDocument).mockClear();
    for (const k of Object.keys(handlers)) {
      delete handlers[k];
    }
  });

  function ctx(): vscode.ExtensionContext {
    return { subscriptions: [] } as unknown as vscode.ExtensionContext;
  }

  it('registers toggle and openCompanionMetaXml', () => {
    registerCommands(ctx());
    expect(handlers['salesforceGhostXml.toggle']).toBeDefined();
    expect(handlers['salesforceGhostXml.openCompanionMetaXml']).toBeDefined();
  });

  it('openCompanionMetaXml shows info when there is no file target', async () => {
    registerCommands(ctx());
    const open = handlers['salesforceGhostXml.openCompanionMetaXml']!;
    await open(undefined);
    expect(vscodeApi.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('open a file on disk'),
    );
  });

  it('openCompanionMetaXml shows info when there is no paired meta', async () => {
    registerCommands(ctx());
    const open = handlers['salesforceGhostXml.openCompanionMetaXml']!;
    const uri = {
      scheme: 'file',
      fsPath: '/proj/foo.txt',
    } as vscode.Uri;
    await open(uri);
    expect(vscodeApi.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('no paired *-meta.xml'),
    );
  });

  it('openCompanionMetaXml opens companion meta for Apex class', async () => {
    registerCommands(ctx());
    const open = handlers['salesforceGhostXml.openCompanionMetaXml']!;
    const uri = {
      scheme: 'file',
      fsPath: '/proj/classes/Foo.cls',
    } as vscode.Uri;
    await open(uri);
    expect(vscodeApi.window.showTextDocument).toHaveBeenCalledTimes(1);
    const firstArg = vi.mocked(vscodeApi.window.showTextDocument).mock.calls[0][0] as {
      fsPath: string;
    };
    expect(firstArg.fsPath).toMatch(/Foo\.cls-meta\.xml$/);
  });
});
