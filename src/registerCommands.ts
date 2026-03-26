import * as vscode from 'vscode';
import { resolveCompanionMetaUri } from './companionMeta';
import { errorMessage } from './errorMessage';
import {
  CONFIG_SECTION,
  isExplorerIntegrationEnabled,
  syncExplorerIntegration,
} from './explorerIntegration';

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('salesforceGhostXml.toggle', async () => {
      try {
        const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
        const next = !isExplorerIntegrationEnabled();
        await config.update(
          'explorerIntegrationEnabled',
          next,
          vscode.ConfigurationTarget.Workspace,
        );
        await syncExplorerIntegration(context);
      } catch (err) {
        void vscode.window.showErrorMessage(`Could not update settings (${errorMessage(err)}).`);
      }
    }),

    vscode.commands.registerCommand(
      'salesforceGhostXml.openCompanionMetaXml',
      async (resource?: vscode.Uri) => {
        const target = resource ?? vscode.window.activeTextEditor?.document.uri ?? undefined;
        if (!target || target.scheme !== 'file') {
          void vscode.window.showInformationMessage(
            'SF Meta: open a file on disk first, or use this command from the Explorer on a local file.',
          );
          return;
        }
        const metaUri = resolveCompanionMetaUri(target);
        if (!metaUri) {
          void vscode.window.showInformationMessage(
            'SF Meta: no paired *-meta.xml was found for this file.',
          );
          return;
        }
        try {
          await vscode.window.showTextDocument(metaUri, {
            preview: false,
            preserveFocus: false,
          });
        } catch {
          void vscode.window.showErrorMessage(
            `Could not open companion meta file: ${metaUri.fsPath}`,
          );
        }
      },
    ),
  );
}
