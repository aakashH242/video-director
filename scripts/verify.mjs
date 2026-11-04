import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {parseArgs} from 'node:util';
import {execFileSync, spawn} from 'node:child_process';
import {once} from 'node:events';
import {probe, rate, fresh, json, hash} from './media.mjs';

const {values, positionals} = parseArgs({allowPositionals: true, options: {seconds: {type: 'string'}, fps: {type: 'string'}, width: {type: 'string'}, height: {type: 'string'}}});
assert.equal(positionals.length, 1, 'Usage: verify.mjs video.mp4 [--seconds N --fps N --width N --height N]');
const path = resolve(positionals[0]), receipt = fresh(path + '.verification.json'), sheet = fresh(path + '.contact.png');
const metadata = probe(path), video = metadata.streams.find(s => s.codec_type === 'video');
assert.ok(video, 'Missing video stream');
const fps = rate(video.avg_frame_rate), duration = Number(video.duration), frames = Number(video.nb_frames);
for (const key of ['width', 'height']) if (values[key]) assert.equal(video[key], Number(values[key]));
if (values.fps) assert.equal(fps, Number(values.fps));
if (values.seconds) assert.ok(Math.abs(duration - Number(values.seconds)) <= 1 / fps + 0.001);
assert.ok(frames > 0 && duration > 0);
execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-err_detect', 'explode', '-i', path, '-f', 'null', '-'], {stdio: 'inherit'});
const decoder = spawn('ffmpeg', ['-v', 'error', '-i', path, '-vf', 'scale=64:36,format=gray', '-f', 'rawvideo', 'pipe:1'], {stdio: ['ignore', 'pipe', 'pipe']});
const closed = once(decoder, 'close'); let pending = Buffer.alloc(0), previous, count = 0, largest = {mae: 0, time: 0}, identical = 0, stderr = '';
decoder.stderr.on('data', chunk => {stderr = (stderr + chunk).slice(-2000);});
for await (const chunk of decoder.stdout) {
  pending = Buffer.concat([pending, chunk]);
  while (pending.length >= 2304) {
    const current = Buffer.from(pending.subarray(0, 2304)); pending = pending.subarray(2304);
    if (previous) {
      let difference = 0; for (let i = 0; i < current.length; i++) difference += Math.abs(current[i] - previous[i]);
      const mae = difference / current.length;
      if (mae > largest.mae) largest = {mae, time: count / fps};
      if (!difference) identical++;
    }
    previous = current; count++;
  }
}
assert.equal((await closed)[0], 0, stderr); assert.equal(pending.length, 0); assert.equal(count, frames);
execFileSync('ffmpeg', ['-n', '-v', 'error', '-i', path, '-vf', `fps=6/${duration},scale=640:-1,tile=3x2`, '-frames:v', '1', sheet], {stdio: 'inherit'});
json(receipt, {file: path, sha256: hash(path), width: video.width, height: video.height, fps, duration, frames, decodedFrames: count, fullDecodePassed: true, comparedAdjacentPairs: count - 1, largestAdjacentDifference: largest, identicalAdjacentPairs: identical, contactSheet: sheet, visualListeningReviewPending: true});
console.log(JSON.stringify({receipt, sheet, largest, frames}));
