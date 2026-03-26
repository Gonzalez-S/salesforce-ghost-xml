import * as vscode from 'vscode';
import { errorMessage } from './errorMessage';
import {
  CONFIG_SECTION,
  explorerIntegrationConfigAffected,
  syncExplorerIntegration,
} from './explorerIntegration';
import { registerCommands } from './registerCommands';
import { createGhostXmlStatusBar } from './statusBar';
import { isSalesforceDxProject } from './salesforceProject';

/** Must match `when` clauses using `${CONFIG_SECTION}.isSalesforceProject` in package.json. */
const CONTEXT_IS_SALESFORCE_PROJECT = `${CONFIG_SECTION}.isSalesforceProject`;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const isSf = await isSalesforceDxProject();
  if (!isSf) {
    return;
  }

  await vscode.commands.executeCommand('setContext', CONTEXT_IS_SALESFORCE_PROJECT, true);

  registerCommands(context);
  try {
    await syncExplorerIntegration(context);
  } catch (err) {
    void vscode.window.showErrorMessage(`Could not apply Explorer nesting (${errorMessage(err)}).`);
  }
  createGhostXmlStatusBar(context);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (explorerIntegrationConfigAffected(e)) {
        void syncExplorerIntegration(context).catch((syncErr) => {
          void vscode.window.showErrorMessage(
            `Could not sync Explorer nesting (${errorMessage(syncErr)}).`,
          );
        });
      }
    }),
  );
}

export function deactivate(): void {}
