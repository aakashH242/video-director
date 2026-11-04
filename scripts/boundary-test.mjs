import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import {spawn, execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {encoderArgs} from './media.mjs';

const scripts = dirname(fileURLToPath(import.meta.url)), directory = mkdtempSync(resolve(tmpdir(), 'video-director-boundaries-'));
async function command(args) {
  const child = spawn(process.execPath, args, {env: process.env, stdio: ['ignore', 'pipe', 'pipe']});
  const closed = once(child, 'close'); let stdout = '', stderr = '';
  child.stdout.on('data', chunk => {stdout = (stdout + chunk).slice(-4000);});
  child.stderr.on('data', chunk => {stderr = (stderr + chunk).slice(-4000);});
  return {code: (await closed)[0], stdout, stderr};
}
let upgrades = 0, httpRequests = 0;
const remote = createServer((req, res) => {httpRequests++; res.end('not allowed');});
remote.on('upgrade', (req, socket) => {upgrades++; socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');});
await new Promise(done => remote.listen(0, '127.0.0.1', done));
try {
  const port = remote.address().port;
  for (const kind of ['local', 'websocket', 'worker', 'worker-local', 'http']) {
    const root = resolve(directory, kind); mkdirSync(root);
    writeFileSync(resolve(root, 'data.json'), '{}');
    writeFileSync(resolve(root, 'worker.js'), kind === 'worker-local' ? "postMessage('done')" : `try {const s=new WebSocket('ws://127.0.0.1:${port}/worker');s.onerror=s.onclose=()=>postMessage('done');}catch {postMessage('done');}`);
    const operation = kind.startsWith('worker') ? "try{const w=new Worker('./worker.js');w.onmessage=w.onerror=()=>window.videoDirector.ready=true;}catch{window.videoDirector.ready=true;}"
      : kind === 'websocket'
      ? `const s=new WebSocket('ws://127.0.0.1:${port}/blocked');s.onerror=s.onclose=()=>window.videoDirector.ready=true;`
      : `fetch('${kind === 'http' ? `http://127.0.0.1:${port}/blocked` : './data.json'}').then(()=>window.videoDirector.ready=true).catch(()=>window.videoDirector.ready=true);`;
    writeFileSync(resolve(root, 'index.html'), `<!doctype html><link rel="icon" href="data:,"><script>window.videoDirector={ready:false,renderAt(){document.body.style.background='teal'}};${operation}</script>`);
    const output = resolve(directory, kind + '.mp4');
    const result = await command([resolve(scripts, 'capture.mjs'), '--root', root, '--out', output, '--seconds', '0.1', '--fps', '10', '--width', '64', '--height', '64']);
    const receipt = JSON.parse(readFileSync(output + '.receipt.json'));
    if (kind === 'local') {assert.equal(result.code, 0, result.stderr); assert.equal(receipt.frames, 1); assert.equal(receipt.complete, true);}
    else {assert.notEqual(result.code, 0, `${kind}: ${result.stdout}`); assert.equal(receipt.complete, false); assert.ok(receipt.failedRequests.length > 0);}
  }
  assert.equal(upgrades, 0); assert.equal(httpRequests, 0);
} finally {remote.closeAllConnections(); await new Promise(done => remote.close(done));}
const damaged = resolve(directory, 'damaged-audio.mp4');
execFileSync('ffmpeg', ['-n', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=teal:s=64x64:r=10:d=1', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', ...encoderArgs(10), '-c:a', 'aac', '-t', '1', damaged]);
const packets = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_packets', '-of', 'json', damaged])).packets;
assert.ok(packets.length > 5);
const bytes = readFileSync(damaged);
for (const packet of packets.slice(2, 5)) bytes.fill(255, Number(packet.pos), Number(packet.pos) + Number(packet.size));
writeFileSync(damaged, bytes);
const failed = await command([resolve(scripts, 'verify.mjs'), damaged]);
assert.notEqual(failed.code, 0, 'Damaged audio must fail full decode');
assert.equal(existsSync(damaged + '.verification.json'), false, 'No successful verification receipt on decode failure');
console.log(JSON.stringify({passed: true, cases: ['local HTTP accepted', 'page WebSockets blocked', 'Workers rejected including local-only Workers', 'external HTTP blocked', 'damaged audio rejected'], upgrades, httpRequests, fixtures: directory}));
