import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fresh, probe, json, hash} from './media.mjs';

const [manifestPath, destination] = process.argv.slice(2);
assert.ok(manifestPath && destination, 'Usage: audio.mjs manifest.json narration.wav');
const manifest = JSON.parse(readFileSync(manifestPath));
assert.ok(Array.isArray(manifest.clips) && manifest.clips.length > 0 && manifest.clips.length <= 200);
const output = fresh(resolve(destination)), timingPath = fresh(output + '.timing.json');
assert.ok(output.endsWith('.wav'), 'Use a WAV master');
const args = ['-n', '-v', 'error', '-xerror'], filters = [], clips = []; let cursor = 0;
for (const [index, clip] of manifest.clips.entries()) {
  assert.equal(typeof clip.file, 'string');
  const file = resolve(dirname(resolve(manifestPath)), clip.file), gap = clip.gapAfter ?? 0;
  assert.ok(Number.isFinite(gap) && gap >= 0 && gap <= 30, 'Invalid pause');
  const metadata = probe(file); assert.ok(metadata.streams.some(s => s.codec_type === 'audio'));
  const duration = Number(metadata.format.duration); assert.ok(duration > 0 && Number.isFinite(duration));
  args.push('-err_detect', 'explode', '-i', file);
  filters.push(`[${index}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=mono,apad=pad_dur=${gap}[a${index}]`);
  clips.push({file, sha256: hash(file), start: cursor, speechEnd: cursor + duration, end: cursor + duration + gap, gapAfter: gap});
  cursor += duration + gap;
}
filters.push(clips.map((_, i) => `[a${i}]`).join('') + `concat=n=${clips.length}:v=0:a=1[out]`);
execFileSync('ffmpeg', [...args, '-filter_complex', filters.join(';'), '-map', '[out]', '-c:a', 'pcm_s24le', output], {stdio: 'inherit'});
assert.ok(Math.abs(Number(probe(output).format.duration) - cursor) < 0.03);
json(timingPath, {output, sha256: hash(output), duration: cursor, clips, synthesized: false, normalized: false});
console.log(JSON.stringify({output, timingPath, duration: cursor}));
