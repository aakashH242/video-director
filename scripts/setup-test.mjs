import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const scripts = dirname(fileURLToPath(import.meta.url));
const fixture = mkdtempSync(resolve(tmpdir(), 'video-director-setup-'));
const project = resolve(fixture, 'first video');
const run = (script, args = [], options = {}) => spawnSync(process.execPath, [resolve(scripts, script), ...args], {encoding: 'utf8', ...options});
assert.equal(run('create-example.mjs', [project]).status, 0);
for (const file of ['index.html', 'scene.mjs', 'style.css', 'package.json', 'package-lock.json', 'tools/capture.mjs', 'tools/doctor.mjs']) {
  assert.ok(readFileSync(resolve(project, file)).length, file);
}
assert.deepEqual(readdirSync(resolve(project, 'output')), []);
writeFileSync(resolve(project, 'keep.txt'), 'owner content');
assert.notEqual(run('create-example.mjs', [project]).status, 0);
assert.equal(readFileSync(resolve(project, 'keep.txt'), 'utf8'), 'owner content');
assert.notEqual(run('create-example.mjs').status, 0);
assert.equal(spawnSync(process.execPath, ['--test', 'scene.test.mjs'], {cwd: project}).status, 0);
const missing = run('doctor.mjs', [], {cwd: project, env: {...process.env, VIDEO_DIRECTOR_RUNTIME: resolve(project, 'package.json')}});
assert.equal(missing.status, 1);
assert.match(missing.stderr, /Playwright missing.*npm ci/s);
console.log(JSON.stringify({passed: true, groups: ['standalone project', 'spaces in path', 'no overwrite', 'usage', 'timeline', 'missing-runtime diagnostic'], fixture}));
