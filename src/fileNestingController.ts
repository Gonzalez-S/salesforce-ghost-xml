import * as vscode from 'vscode';
import { PAIRED_META_FILE_NESTING_PATTERNS } from './pairedMetaCatalog';

const WORKSPACE_STATE_OWNED_PATTERN_KEYS = 'ownedFileNestingPatternKeys';
const WORKSPACE_STATE_OWNED_ENABLED_FLAG = 'ownedExplorerFileNestingEnabled';

function getCurrentNestingPatterns(
  explorerConfig: vscode.WorkspaceConfiguration,
): Record<string, string> {
  const raw = explorerConfig.get<Record<string, string | undefined>>('fileNesting.patterns');
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string' && v.length > 0) {
      out[k] = v;
    }
  }
  return out;
}

function isOwnedNestingValue(parentGlob: string, value: string): boolean {
  return PAIRED_META_FILE_NESTING_PATTERNS[parentGlob] === value;
}

export async function applyPairedFileNesting(context: vscode.ExtensionContext): Promise<void> {
  const explorerConfig = vscode.workspace.getConfiguration('explorer');
  const current = getCurrentNestingPatterns(explorerConfig);
  const ownedKeys = context.workspaceState.get<string[]>(WORKSPACE_STATE_OWNED_PATTERN_KEYS) ?? [];
  const next: Record<string, string> = { ...current };
  const nextOwned = new Set(ownedKeys);

  for (const [parentPattern, childPattern] of Object.entries(PAIRED_META_FILE_NESTING_PATTERNS)) {
    if (current[parentPattern] === undefined) {
      next[parentPattern] = childPattern;
      nextOwned.add(parentPattern);
    }
  }

  await context.workspaceState.update(WORKSPACE_STATE_OWNED_PATTERN_KEYS, [...nextOwned]);

  const enabledInspect = explorerConfig.inspect<boolean>('fileNesting.enabled');
  const hadWorkspaceEnabled = enabledInspect?.workspaceValue !== undefined;
  if (!hadWorkspaceEnabled) {
    await explorerConfig.update('fileNesting.enabled', true, vscode.ConfigurationTarget.Workspace);
    await context.workspaceState.update(WORKSPACE_STATE_OWNED_ENABLED_FLAG, true);
  }

  await explorerConfig.update(
    'fileNesting.patterns',
    Object.keys(next).length > 0 ? next : undefined,
    vscode.ConfigurationTarget.Workspace,
  );
}

export async function clearPairedFileNesting(context: vscode.ExtensionContext): Promise<void> {
  const ownedKeys = context.workspaceState.get<string[]>(WORKSPACE_STATE_OWNED_PATTERN_KEYS) ?? [];
  const ownedEnabled = context.workspaceState.get<boolean>(WORKSPACE_STATE_OWNED_ENABLED_FLAG);

  const explorerConfig = vscode.workspace.getConfiguration('explorer');
  const current = getCurrentNestingPatterns(explorerConfig);
  const next: Record<string, string> = { ...current };

  for (const key of ownedKeys) {
    const val = next[key];
    if (val !== undefined && isOwnedNestingValue(key, val)) {
      delete next[key];
    }
  }

  await context.workspaceState.update(WORKSPACE_STATE_OWNED_PATTERN_KEYS, []);
  await explorerConfig.update(
    'fileNesting.patterns',
    Object.keys(next).length > 0 ? next : undefined,
    vscode.ConfigurationTarget.Workspace,
  );

  if (ownedEnabled) {
    await explorerConfig.update(
      'fileNesting.enabled',
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );
    await context.workspaceState.update(WORKSPACE_STATE_OWNED_ENABLED_FLAG, false);
  }
}
