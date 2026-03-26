# Salesforce Ghost XML

Nests paired `*-meta.xml` under source files in Explorer for Salesforce DX workspaces, and opens the companion meta from the editor (context menu or keys from **Keyboard Shortcuts**).

**Requires** `sfdx-project.json` in the workspace.

**Usage:** **SF Meta** (status bar) or Command Palette toggles nesting. Open paired meta: context menu on supported files, or bind keys under **Salesforce Ghost XML** in Keyboard Shortcuts.

**Settings:** `Salesforce Ghost XML` in Settings—nesting on/off and optional status bar hide.

If nothing happens, confirm the folder is a DX project. If nesting looks wrong, check `explorer.fileNesting` for manual overrides.
