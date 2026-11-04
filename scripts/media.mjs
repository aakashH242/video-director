import assert from 'node:assert/strict';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

export function fresh(path) {
  assert.ok(!existsSync(path), `Preserving existing output: ${path}`);
  return path;
}
export function json(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
}
export function hash(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}
export function probe(path) {
  return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], {encoding: 'utf8'}));
}
export function rate(value) {
  const [n, d = 1] = value.split('/').map(Number);
  assert.ok(Number.isFinite(n / d));
  return n / d;
}
export function encoderArgs(fps = 60) {
  const encoders = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
  const codec = /\blibx264\b/.test(encoders) ? ['-c:v', 'libx264', '-crf', '16', '-preset', 'medium'] : ['-c:v', 'libopenh264', '-b:v', '18M', '-qmin', '0', '-qmax', '12'];
  assert.ok(/\blibx264\b|\blibopenh264\b/.test(encoders), 'Need a CPU H.264 encoder');
  return [...codec, '-pix_fmt', 'yuv420p', '-g', String(fps), '-bf', '0', '-color_range', 'tv', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart'];
}
