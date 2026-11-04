import assert from 'node:assert/strict';
import {parseArgs} from 'node:util';
import {createRequire} from 'node:module';
import {readdirSync, statSync} from 'node:fs';
import {resolve, relative, extname} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {startServer} from './serve.mjs';
import {fresh, json, hash, encoderArgs, probe} from './media.mjs';

const {values} = parseArgs({options: {root: {type: 'string', default: '.'}, entry: {type: 'string', default: 'index.html'}, out: {type: 'string'}, seconds: {type: 'string'}, fps: {type: 'string', default: '60'}, width: {type: 'string', default: '1920'}, height: {type: 'string', default: '1080'}}});
const root = resolve(values.root), output = fresh(resolve(values.out || 'capture.mp4')), receiptPath = fresh(output + '.receipt.json');
const seconds = Number(values.seconds), fps = Number(values.fps), width = Number(values.width), height = Number(values.height);
assert.ok(seconds > 0 && seconds <= 3600 && Number.isFinite(seconds));
assert.ok(Number.isInteger(fps) && fps > 0 && fps <= 120);
assert.ok([width, height].every(n => Number.isInteger(n) && n >= 64 && n <= 7680 && n % 2 === 0));
const count = Math.round(seconds * fps);
assert.ok(Math.abs(count / fps - seconds) < 1e-6, 'Duration must contain whole frames');
const sourceHashes = {};
function inventory(directory) {
  for (const item of readdirSync(directory, {withFileTypes: true})) {
    if (item.name.startsWith('.') || ['node_modules', 'review', 'output'].includes(item.name)) continue;
    const path = resolve(directory, item.name);
    if (item.isDirectory()) inventory(path);
    else if (item.isFile() && /\.(html|css|js|mjs|json|svg|png|jpg|webp|ttf|woff2)$/.test(extname(path) ? item.name : '') && !/\.(receipt|verification)\.json$/.test(item.name)) sourceHashes[relative(root, path)] = hash(path);
  }
}
inventory(root);
const require = createRequire(resolve(process.env.VIDEO_DIRECTOR_RUNTIME || 'package.json'));
const {chromium} = require('playwright');
const candidate = new URL(values.entry, 'http://127.0.0.1/');
assert.equal(candidate.origin, 'http://127.0.0.1', 'Only a local project entry is allowed');
const errors = [], failedRequests = []; let browser, encoder, retries = 0, frames = 0, encoderError;
const local = await startServer(root);
const entry = new URL(candidate.pathname + candidate.search, local.origin);
entry.searchParams.set('capture', '1');
const started = Date.now();
const receipt = {output, fps, seconds, width, height, frames, sourceHashes, errors, failedRequests, retries, complete: false};
try {
  browser = await chromium.launch({executablePath: process.env.CHROME_PATH || undefined, args: ['--enable-gpu', '--ignore-gpu-blocklist']});
  const context = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, serviceWorkers: 'block'});
  assert.equal(typeof context.routeWebSocket, 'function', 'Playwright >=1.48 is needed to block WebSockets');
  await context.routeWebSocket('**/*', socket => {
    failedRequests.push('Blocked WebSocket: static capture does not permit socket connections');
    socket.close({code: 1008, reason: 'Static local capture only'});
  });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === local.origin || ['data:', 'blob:'].includes(url.protocol) ? route.continue() : route.abort('blockedbyclient');
  });
  const page = await context.newPage();
  const safeUrl = raw => {const url = new URL(raw); return url.origin + url.pathname;};
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => {
    if (message.type() === 'error' && /content security policy|violates.*directive/i.test(message.text())) failedRequests.push('Browser blocked a Content Security Policy violation');
  });
  page.on('requestfailed', request => failedRequests.push(safeUrl(request.url())));
  page.on('response', response => {if (response.status() >= 400) failedRequests.push(`${response.status()} ${safeUrl(response.url())}`);});
  await page.goto(entry.href, {waitUntil: 'load'});
  await page.waitForFunction(() => window.videoDirector?.ready === true, undefined, {timeout: 30000});
  await page.evaluate(() => document.fonts.ready);
  const args = ['-n', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', 'pipe:0', '-an', '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p', ...encoderArgs(fps), output];
  encoder = spawn('ffmpeg', args, {stdio: ['pipe', 'ignore', 'pipe']});
  let stderr = '';
  encoder.stderr.on('data', chunk => {stderr = (stderr + chunk).slice(-4000);});
  encoder.on('error', error => {encoderError = error;});
  encoder.stdin.on('error', error => {encoderError = error;});
  const closed = new Promise(done => encoder.once('close', (code, signal) => done({code, signal})));
  for (let frame = 0; frame < count; frame++) {
    assert.equal(errors.length + failedRequests.length, 0, JSON.stringify({errors, failedRequests}));
    if (encoderError || encoder.exitCode !== null) throw encoderError || Error(stderr);
    await page.evaluate(async t => {await window.videoDirector.renderAt(t); for (const animation of document.getAnimations()) {animation.pause(); animation.currentTime = t * 1000;}}, frame / fps);
    let png;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {png = await page.screenshot({type: 'png', timeout: 30000}); break;}
      catch (error) {if (error.name !== 'TimeoutError' || attempt === 2) throw error; retries++;}
    }
    if (!encoder.stdin.write(png)) await once(encoder.stdin, 'drain');
    frames++;
    if (frames % (fps * 3) === 0) console.log(JSON.stringify({frames, total: count, secondsRendered: frames / fps}));
  }
  encoder.stdin.end();
  const result = await closed;
  assert.equal(result.code, 0, stderr || `Encoder stopped: ${result.signal}`);
  assert.equal(errors.length + failedRequests.length, 0, JSON.stringify({errors, failedRequests}));
  for (const [file, expected] of Object.entries(sourceHashes)) assert.equal(hash(resolve(root, file)), expected, `Source changed during capture: ${file}`);
  const video = probe(output).streams.find(s => s.codec_type === 'video');
  assert.equal(Number(video.nb_frames), count);
  Object.assign(receipt, {complete: true, bytes: statSync(output).size, sha256: hash(output), codec: video.codec_name});
} catch (error) {
  receipt.failure = error.message;
  throw error;
} finally {
  if (encoder && encoder.exitCode === null) {encoder.stdin.destroy(); encoder.kill('SIGTERM');}
  await browser?.close();
  await local.close();
  Object.assign(receipt, {frames, retries, elapsedSeconds: (Date.now() - started) / 1000});
  json(receiptPath, receipt);
  console.log(JSON.stringify({output, receipt: receiptPath, complete: receipt.complete, frames}));
}
