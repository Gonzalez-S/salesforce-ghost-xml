import * as path from 'node:path';
import * as vscode from 'vscode';
import { COMPANION_META_SUFFIX_BY_EXT } from './pairedMetaCatalog';

export function resolveCompanionMetaUri(sourceUri: vscode.Uri): vscode.Uri | undefined {
  const base = path.basename(sourceUri.fsPath);
  const ext = path.extname(base).toLowerCase();
  const metaSuffix = COMPANION_META_SUFFIX_BY_EXT[ext];
  if (!metaSuffix) {
    return undefined;
  }
  const stem = base.slice(0, -ext.length);
  const metaName = stem + metaSuffix;
  const dir = path.dirname(sourceUri.fsPath);
  return vscode.Uri.file(path.join(dir, metaName));
}
