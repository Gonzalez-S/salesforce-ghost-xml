import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = ['cursor', 'code'];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const profile = process.env.EDITOR_INSTALL_PROFILE ?? '';
const vsixPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(root, `${pkg.name}-${pkg.version}.vsix`);

const ok = '\x1b[42m\x1b[30m SUCCESS \x1b[0m';
const bad = '\x1b[41m\x1b[97m ERROR \x1b[0m';

const die = (msg) => {
  console.error(`\n${bad} ${pkg.name}: ${msg}`);
  process.exit(1);
};

if (!existsSync(vsixPath)) die(`VSIX not found (${vsixPath})`);

const args = [
  ...(profile ? ['--profile', profile] : []),
  '--install-extension',
  vsixPath,
  '--force',
];
const spawnOpts = { stdio: 'ignore', env: process.env, shell: process.platform === 'win32' };

for (const cli of CLI) {
  const r = spawnSync(cli, args, spawnOpts);
  if (r.error?.code === 'ENOENT') continue;
  if (r.status === 0) {
    console.log(`\n${ok} ${pkg.name}: installed on ${cli} (${profile || 'default'} profile)`);
    process.exit(0);
  }
}

die('install failed — no working editor CLI');
