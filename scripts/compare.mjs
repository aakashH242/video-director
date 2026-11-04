import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {probe, rate, fresh, encoderArgs, json, hash} from './media.mjs';

const [left, right, destination] = process.argv.slice(2);
assert.ok(left && right && destination, 'Usage: compare.mjs before.mp4 after.mp4 comparison.mp4');
const output = fresh(resolve(destination)), receipt = fresh(output + '.receipt.json');
const [a, b] = [left, right].map(path => probe(path).streams.find(s => s.codec_type === 'video'));
const fps = rate(a.avg_frame_rate);
assert.equal(fps, rate(b.avg_frame_rate), 'Use matched frame rates');
assert.equal(a.width, b.width); assert.equal(a.height, b.height);
assert.equal(a.nb_frames, b.nb_frames, 'Use matched frame counts');
assert.ok(Math.abs(Number(a.duration) - Number(b.duration)) <= 1 / fps);
const panel = "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=0x101b2b,setsar=1";
const filter = `[0:v]${panel}[a];[1:v]${panel}[b];[a][b]hstack,pad=1920:1080:0:270:color=0x07111e,drawtext=text='BEFORE — PLAIN PRESENTATION':x=42:y=210:fontsize=30:fontcolor=0xb8c2d1,drawtext=text='AFTER — DIRECTED PRESENTATION':x=1002:y=210:fontsize=30:fontcolor=0x79e9cd,drawtext=text='Same assets. Different direction.':x=42:y=74:fontsize=56:fontcolor=white,drawtext=text='Constructed matched baseline • technique study • no audio':x=42:y=910:fontsize=28:fontcolor=0xb8c2d1`;
execFileSync('ffmpeg', ['-n', '-v', 'error', '-xerror', '-err_detect', 'explode', '-i', resolve(left), '-err_detect', 'explode', '-i', resolve(right), '-filter_complex', filter, '-an', ...encoderArgs(fps), output], {stdio: 'inherit'});
json(receipt, {output, sha256: hash(output), inputs: [left, right].map(file => ({file: resolve(file), sha256: hash(file)})), fps, frames: Number(a.nb_frames), constructedBaseline: true, audio: false});
console.log(output);
