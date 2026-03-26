import * as vscode from 'vscode';
import { applyPairedFileNesting, clearPairedFileNesting } from './fileNestingController';

export const CONFIG_SECTION = 'salesforceGhostXml';
const ENABLED_KEY = 'explorerIntegrationEnabled';

/** When true, workspace gets Explorer file nesting for paired *-meta.xml (from this extension). */
export function isExplorerIntegrationEnabled(): boolean {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  const ins = config.inspect<boolean>(ENABLED_KEY);
  if (ins?.workspaceValue !== undefined) {
    return ins.workspaceValue;
  }
  if (ins?.globalValue !== undefined) {
    return ins.globalValue;
  }

  return true;
}

export async function syncExplorerIntegration(context: vscode.ExtensionContext): Promise<void> {
  if (isExplorerIntegrationEnabled()) {
    await applyPairedFileNesting(context);
  } else {
    await clearPairedFileNesting(context);
  }
}

export function explorerIntegrationConfigAffected(e: vscode.ConfigurationChangeEvent): boolean {
  return e.affectsConfiguration(`${CONFIG_SECTION}.${ENABLED_KEY}`);
}
