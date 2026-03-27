## Prerequisites

- **Node.js 20** (matches CI).
- **VS Code** (or Cursor) for **Run Extension** and API typings (`@types/vscode` is pinned to `engines.vscode`).

## Getting started

```bash
npm ci
npm run verify
```

- **`npm run verify`** — same gate as CI and `vscode:prepublish`: Prettier check, ESLint, TypeScript (including tests), Vitest, then production compile.
- **`npm run compile`** — emit JavaScript to `out/` from `src/` (`tsconfig.build.json`).
- **`npm run watch`** — TypeScript watch; used by the **Run Extension** launch config.

Open this folder in the editor and use **Run and Debug → Run Extension** (see `.vscode/launch.json`). The extension only activates when the workspace contains `sfdx-project.json`, so use a Salesforce DX project as the **Extension Development Host** workspace when testing behavior.

## Repository layout

| Path                       | Role                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `src/`                     | Extension source (CommonJS emit, VS Code APIs).                                          |
| `out/`                     | Build output (not committed); `package.json` `main` points here.                         |
| `test/`                    | Vitest specs; import implementation from `../src/...`.                                   |
| `scripts/install-vsix.mjs` | Optional local install of a built VSIX into `cursor` / `code` (not shipped in the VSIX). |

Keep `extension.ts` small; add commands, providers, and helpers in focused modules (see [.cursorrules](../.cursorrules)).

## Tests

```bash
npm run test          # once
npm run test:watch    # watch mode
npm run test:coverage # coverage (lcov + text); `extension.ts` and `statusBar.ts` are excluded in config
```

Tests run in Node with mocks for `vscode` where needed. Pure logic in `src/` should stay easy to test without booting the editor.

## Formatting and lint

```bash
npm run format        # Prettier --write
npm run format:check  # Prettier --check
npm run lint          # ESLint for `.ts` / `.mts`
npm run typecheck     # `tsc` with `noEmit` (includes `test/`)
```

## Local VSIX

```bash
npm run package              # produces <name>-<version>.vsix in the repo root
npm run package:install      # package + install via scripts/install-vsix.mjs
```

Install script details:

- Tries **`cursor`**, then **`code`** (see `scripts/install-vsix.mjs`).
- Optional VSIX path: `node scripts/install-vsix.mjs path/to/extension.vsix` (default: VSIX next to `package.json` from current `package.json` version).
- Optional profile: set **`EDITOR_INSTALL_PROFILE`** so the CLI gets `--profile <name>`.

## CI (GitHub Actions)

**Workflow:** [.github/workflows/ci.yml](../.github/workflows/ci.yml)

| Trigger                           | What runs                   |
| --------------------------------- | --------------------------- |
| **Push** to `main`                | `npm ci` → `npm run verify` |
| **Pull request** targeting `main` | Same                        |

## Releases and CD

**Workflow:** [.github/workflows/release.yml](../.github/workflows/release.yml)

Releases are **manual** only (`workflow_dispatch`), not on every push.

1. In GitHub: **Actions → Release → Run workflow**.
2. Choose **patch**, **minor**, or **major** (passed to `npm version <level> --no-git-tag-version`).
3. The job runs **`npm run verify`**, builds the VSIX (`npm run package`), commits `package.json` and `package-lock.json` with **`[skip ci]`** in the message (so it does not re-trigger unnecessary automation), pushes to **`main`**, creates tag **`v<x.y.z>`**, and publishes a **GitHub Release** with the `.vsix` attached.

After a release, **pull `main`** locally before the next `npm run package` so your version matches the repo.

**Permissions:** Pushing from Actions and updating workflow files may require credentials with the right scopes (e.g. GitHub’s **`workflow`** scope for OAuth apps that touch `.github/workflows/`). SSH or a PAT with appropriate scopes avoids common push rejections.

## Contributing changes

1. Branch from **`main`**, make focused commits.
2. Run **`npm run verify`** before opening a PR; CI must stay green.
3. When behavior changes, update **tests** and any **`package.json` `contributes`** (commands, settings, menus, keybindings) in the same change.
4. **`pairedMetaCatalog.ts`** drives companion extensions and Explorer nesting patterns; **`package.json`** `editor/context` `when` must stay aligned — a test asserts the `when` clause matches the catalog (see `test/pairedMetaCatalog.test.ts`).
5. Do not bump **`package.json` version** in normal feature PRs unless you are doing a release (releases are normally handled by the Release workflow or maintainer policy).

## VS Code engine and APIs

- **`engines.vscode`** in `package.json` is the minimum supported editor version; only raise it when the code depends on newer APIs.
- Prefer explicit activation (`onCommand`, `workspaceContains`, etc.); this extension uses **`workspaceContains:**/sfdx-project.json`\*\*.
