import * as path from 'node:path';
import * as vscode from 'vscode';
import { COMPANION_META_SUFFIX_BY_EXT } from './pairedMetaCatalog';

/** LWC: `<bundleDir>/<bundleName>.js-meta.xml` after walking up to the folder below `lwc/`. */
function resolveLwcBundleJsMetaUri(sourceUri: vscode.Uri): vscode.Uri | undefined {
  const fsPath = sourceUri.fsPath;
  const base = path.basename(fsPath);
  if (!base.toLowerCase().endsWith('.js')) {
    return undefined;
  }

  let dir = path.dirname(fsPath);
  for (;;) {
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      return undefined;
    }
    if (path.basename(parentDir).toLowerCase() === 'lwc') {
      const moduleName = path.basename(dir);
      return vscode.Uri.file(path.join(dir, `${moduleName}.js-meta.xml`));
    }
    dir = parentDir;
  }
}

export function resolveCompanionMetaUri(sourceUri: vscode.Uri): vscode.Uri | undefined {
  const base = path.basename(sourceUri.fsPath);
  const ext = path.extname(base).toLowerCase();

  if (ext === '.js') {
    const lwcMeta = resolveLwcBundleJsMetaUri(sourceUri);
    if (lwcMeta) {
      return lwcMeta;
    }
  }

  const metaSuffix = COMPANION_META_SUFFIX_BY_EXT[ext];
  if (!metaSuffix) {
    return undefined;
  }
  const stem = base.slice(0, -ext.length);
  const metaName = stem + metaSuffix;
  const dir = path.dirname(sourceUri.fsPath);
  return vscode.Uri.file(path.join(dir, metaName));
}
