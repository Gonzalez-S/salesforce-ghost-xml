import * as vscode from 'vscode';
import { PAIRED_META_FILE_NESTING_PATTERNS } from './pairedMetaCatalog';

const WORKSPACE_STATE_OWNED_PAIRS = 'ownedFileNestingPairs';
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

export async function applyPairedFileNesting(context: vscode.ExtensionContext): Promise<void> {
  const explorerConfig = vscode.workspace.getConfiguration('explorer');
  const current = getCurrentNestingPatterns(explorerConfig);
  const ownedPairs: Record<string, string> = {
    ...(context.workspaceState.get<Record<string, string>>(WORKSPACE_STATE_OWNED_PAIRS) ?? {}),
  };
  const next: Record<string, string> = { ...current };

  for (const [parentPattern, childPattern] of Object.entries(PAIRED_META_FILE_NESTING_PATTERNS)) {
    const cur = current[parentPattern];
    let newVal: string | undefined;

    if (parentPattern === '*.js') {
      if (cur === undefined) {
        newVal = childPattern;
      } else if (!cur.includes('js-meta.xml')) {
        newVal = `${cur}, ${childPattern}`;
      }
    } else if (cur === undefined) {
      newVal = childPattern;
    }

    if (newVal !== undefined) {
      next[parentPattern] = newVal;
      ownedPairs[parentPattern] = newVal;
    }
  }

  await context.workspaceState.update(WORKSPACE_STATE_OWNED_PAIRS, ownedPairs);

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
  const ownedPairs =
    context.workspaceState.get<Record<string, string>>(WORKSPACE_STATE_OWNED_PAIRS) ?? {};
  const ownedEnabled = context.workspaceState.get<boolean>(WORKSPACE_STATE_OWNED_ENABLED_FLAG);

  const explorerConfig = vscode.workspace.getConfiguration('explorer');
  const current = getCurrentNestingPatterns(explorerConfig);
  const next: Record<string, string> = { ...current };

  for (const [key, val] of Object.entries(ownedPairs)) {
    if (next[key] === val) {
      delete next[key];
    }
  }

  await context.workspaceState.update(WORKSPACE_STATE_OWNED_PAIRS, {});
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
