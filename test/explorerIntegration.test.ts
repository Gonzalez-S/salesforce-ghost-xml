import { beforeEach, describe, expect, it, vi } from 'vitest';

const apply = vi.fn();
const clear = vi.fn();

const { mockGetConfiguration } = vi.hoisted(() => ({
  mockGetConfiguration: vi.fn(),
}));

vi.mock('vscode', () => ({
  workspace: {
    getConfiguration: mockGetConfiguration,
  },
}));

vi.mock('../src/fileNestingController', () => ({
  applyPairedFileNesting: (...a: unknown[]) => apply(...a),
  clearPairedFileNesting: (...a: unknown[]) => clear(...a),
}));

import * as explorerIntegration from '../src/explorerIntegration';

describe('syncExplorerIntegration', () => {
  beforeEach(() => {
    apply.mockClear();
    clear.mockClear();
    mockGetConfiguration.mockReset();
  });

  it('applies nesting when enabled', async () => {
    mockGetConfiguration.mockReturnValue({
      inspect: () => ({ workspaceValue: true }),
    });
    await explorerIntegration.syncExplorerIntegration({} as never);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(clear).not.toHaveBeenCalled();
  });

  it('clears when disabled', async () => {
    mockGetConfiguration.mockReturnValue({
      inspect: () => ({ workspaceValue: false }),
    });
    await explorerIntegration.syncExplorerIntegration({} as never);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(apply).not.toHaveBeenCalled();
  });
});

describe('explorerIntegrationConfigAffected', () => {
  it('returns true when explorerIntegrationEnabled changes', () => {
    const e = {
      affectsConfiguration: (id: string) => id === 'salesforceGhostXml.explorerIntegrationEnabled',
    };
    expect(explorerIntegration.explorerIntegrationConfigAffected(e as never)).toBe(true);
  });

  it('returns false for unrelated configuration', () => {
    const e = { affectsConfiguration: () => false };
    expect(explorerIntegration.explorerIntegrationConfigAffected(e as never)).toBe(false);
  });
});
