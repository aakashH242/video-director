import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {startServer} from './serve.mjs';

// Exercise the documented snippets, without a provider call or private artwork.
const scripts = dirname(fileURLToPath(import.meta.url));
const guide = readFileSync(resolve(scripts, '../references/hybrid-scenes.md'), 'utf8');
const background = guide.match(/```html\n([\s\S]*?)\n```/)[1];
const readiness = guide.match(/```js\n([\s\S]*?)\n```/)[1];
const root = mkdtempSync(resolve(tmpdir(), 'video-director-hybrid-'));
const project = resolve(root, 'project');
execFileSync(process.execPath, [resolve(scripts, 'create-example.mjs'), project]);
const htmlPath = resolve(project, 'index.html');
writeFileSync(htmlPath, readFileSync(htmlPath, 'utf8').replace(/<rect id="backdrop"[^>]*\/>/, background));
const scenePath = resolve(project, 'scene.mjs');
writeFileSync(scenePath, readFileSync(scenePath, 'utf8').replace('window.videoDirector = {ready: true, renderAt};', readiness));
mkdirSync(resolve(project, 'media'));
const require = createRequire(resolve(process.env.VIDEO_DIRECTOR_RUNTIME || 'package.json'));
const {chromium} = require('playwright');
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || undefined});
const local = await startServer(project);
try {
  const page = await browser.newPage({viewport: {width: 1280, height: 720}});
  await page.setContent('<style>body{margin:0;background:linear-gradient(165deg,#e4ebdf,#b6cdc7 60%,#d9c9a9)}</style>');
  await page.screenshot({path: resolve(project, 'media/landscape.png')});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(local.origin + '/?capture=1');
  await page.waitForFunction(() => window.videoDirector?.ready);
  await page.evaluate(() => window.videoDirector.renderAt(4.5));
  assert.equal(await page.locator('#plate').getAttribute('href'), 'media/landscape.png');
  assert.equal(await page.locator('#caption').textContent(), 'The panel turns sunlight into electricity.');
  assert.deepEqual(errors, []);
  for (const time of [3.6, 4.5, 5.5, 5.9]) {
    await page.evaluate(t => window.videoDirector.renderAt(t), time);
    const label = await page.locator('#energy-caption').boundingBox();
    const panel = await page.locator('#panel').boundingBox();
    const lamp = await page.locator('#lamp > path').first().boundingBox();
    assert.ok(label.y + label.height < panel.y && label.y + label.height < lamp.y, 'Annotation lane must stay above the parts');
    assert.ok(label.x >= 0 && label.x + label.width <= 1280, 'Annotation must stay within the frame');
  }
  await page.evaluate(() => window.videoDirector.renderAt(4.5));
  await page.screenshot({path: resolve(root, 'hybrid.png')});
  await page.goto(local.origin);
  await page.waitForFunction(() => window.videoDirector?.ready);
  const callbacks = await page.evaluate(() => {
    const pending = new Map(); let id = 0;
    const request = window.requestAnimationFrame, cancel = window.cancelAnimationFrame;
    window.requestAnimationFrame = callback => {pending.set(++id, callback); return id;};
    window.cancelAnimationFrame = key => pending.delete(key);
    const button = document.getElementById('play');
    button.click(); button.click(); button.click();
    const active = pending.size;
    button.click();
    const stopped = pending.size;
    window.requestAnimationFrame = request; window.cancelAnimationFrame = cancel;
    return {active, stopped};
  });
  assert.deepEqual(callbacks, {active: 1, stopped: 0});
  // A broken plate must not silently set ready; the capture contract sees failure.
  await page.route('**/media/landscape.png', route => route.abort());
  await page.reload();
  await page.waitForFunction(() => window.videoDirector?.ready === false);
  await assert.rejects(page.waitForFunction(() => window.videoDirector?.ready, undefined, {timeout: 500}), /Timeout/);
  assert.ok(errors.length > 0, 'Missing image must surface a decode error');
} finally { await browser.close(); await local.close(); }
execFileSync(process.execPath, [resolve(scripts, 'capture.mjs'), '--root', project, '--seconds', '8', '--fps', '8', '--width', '1280', '--height', '720', '--out', resolve(project, 'output/hybrid.mp4')]);
execFileSync(process.execPath, [resolve(scripts, 'verify.mjs'), resolve(project, 'output/hybrid.mp4'), '--seconds', '8', '--fps', '8', '--width', '1280', '--height', '720']);
console.log(JSON.stringify({passed: true, groups: ['documented composition', 'decoded plate readiness', 'annotation lane', 'preview loop cancellation', 'missing image fails', '64-frame capture and strict decode'], fixture: root, plate: 'synthetic gradient; no AI generation'}));
