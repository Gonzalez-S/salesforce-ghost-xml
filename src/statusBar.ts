import * as vscode from 'vscode';
import {
  CONFIG_SECTION,
  explorerIntegrationConfigAffected,
  isExplorerIntegrationEnabled,
} from './explorerIntegration';

const BG_INACTIVE = new vscode.ThemeColor('statusBarItem.warningBackground');

export function createGhostXmlStatusBar(context: vscode.ExtensionContext): void {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.name = 'Salesforce Ghost XML';
  item.command = 'salesforceGhostXml.toggle';

  const refresh = (): void => {
    const showInBar =
      vscode.workspace.getConfiguration(CONFIG_SECTION).get<boolean>('showStatusBar') ?? true;
    if (!showInBar) {
      item.hide();
      return;
    }
    const on = isExplorerIntegrationEnabled();
    item.text = on ? '$(list-tree) SF Meta' : '$(circle-slash) SF Meta';
    item.tooltip = `Ghost XML: ${on ? 'Enabled' : 'Disabled'}`;
    item.backgroundColor = on ? undefined : BG_INACTIVE;
    item.color = undefined;
    item.show();
  };

  refresh();

  context.subscriptions.push(
    item,
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        explorerIntegrationConfigAffected(e) ||
        e.affectsConfiguration(`${CONFIG_SECTION}.showStatusBar`)
      ) {
        refresh();
      }
    }),
  );
}
