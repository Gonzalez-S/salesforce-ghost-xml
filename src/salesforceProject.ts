import * as vscode from 'vscode';

const SFDX_PROJECT_GLOB = '**/sfdx-project.json';

/**
 * Returns true if the workspace contains a Salesforce DX project config.
 */
export async function isSalesforceDxProject(token?: vscode.CancellationToken): Promise<boolean> {
  const found = await vscode.workspace.findFiles(SFDX_PROJECT_GLOB, '**/node_modules/**', 1, token);
  return found.length > 0;
}
