# Runtime and capture

First run? Use the [self-contained eight-second example](first-video.md): its creator copies a complete project with locked dependencies and a setup checker.

Use a current Node 22, 24 or 26, FFmpeg/FFprobe (`libx264` or `libopenh264`) and Playwright/Chromium. The example pins Playwright 1.64.1; older project runtimes need at least 1.48 for the WebSocket blocking API. Reuse a suitable project's runtime. If missing, install necessary dependencies into an isolated project with authorization; don't alter global Python, drivers or OS. Three.js is only needed for 3D. Check [tested setup and limits](../docs/tested-setup.md), not an assumed cross-platform guarantee.

Helpers resolve Playwright from the current project's `package.json`. Alternatively set `VIDEO_DIRECTOR_RUNTIME=/absolute/path/to/existing/runtime/package.json`. `CHROME_PATH` selects a browser executable if necessary. No credentials are read.

Run `node <skill>/scripts/doctor.mjs` from that project to check Node, FFmpeg/FFprobe, an available CPU H.264 encoder and an actual headless Chromium SVG screenshot. Missing dependencies return a nonzero exit and an actionable message; nothing is installed automatically. Doctor is a preflight, not a substitute for rendering the intended scene.

Resolve `<skill>` from `SKILL.md`; run from your video project:

```bash
node <skill>/scripts/capture.mjs --root . --entry 'index.html?mode=after' --out timing.mp4 --seconds 18 --fps 8 --width 1280 --height 720
node <skill>/scripts/capture.mjs --root . --entry 'index.html?mode=after' --out master.mp4 --seconds 18 --fps 60 --width 1920 --height 1080
node <skill>/scripts/verify.mjs master.mp4 --seconds 18 --fps 60 --width 1920 --height 1080
node <skill>/scripts/serve.mjs . --port 8097
```

Capture adds `capture=1`, serves the selected root on loopback with browser-enforced `connect-src 'self'; worker-src 'none'` CSP, blocks out-of-origin HTTP requests and page WebSockets, waits for `videoDirector.ready`, then awaits `renderAt(frame/fps)`. **Workers (including local-only workers) are deliberately unsupported** in this trusted main-thread scene recorder; this closes the separate execution realm not covered by Playwright's page socket wrapper. Worker/socket/CSP attempts fail capture. If a source requires workers, choose another authorized recording workflow or a main-thread export; do not silently relax the policy. This is not an OS sandbox for hostile code. PNG screenshots feed FFmpeg with pipe backpressure; retries stay at identical time. A receipt records source hashes, errors, retries and output metadata. Keep sensitive files **outside** the served project. Static files are read-only; GET/HEAD/single ranges work, dotfiles/path/symlink escapes are blocked. Stop owned servers after review.

`node <skill>/scripts/boundary-test.mjs` uses the selected Playwright runtime and disposable local fixtures to check blocked WebSockets/external HTTP, accepted local assets, and failure on damaged audio. No remote connections or providers are used.

Use explicit time, seeded randomness and decoded assets. Don't secretly drive film motion with `setTimeout`, wall clocks, real-time physics or accumulated deltas. Repeated frames at a time must match. Seek videos in `renderAt` and await decoding. Freeze/hash source before final capture. Long films can render reversible ranges, but don't reuse stale chunks after editing active source; check wraps, fades and joins.

Test actual runtime operations, not OS assumptions. An NVML diagnostic failure alone does not prove CUDA unavailable. CPU encoding is a valid fallback; don't repair drivers/reboot without authorization.

## Quality

`verify.mjs` checks optional requested dimensions/fps/duration, full decode, hash, every adjacent frame on a downscaled grayscale signal and an encoded contact sheet. An edit may change many pixels, a readable hold may repeat frames: the metrics deliberately don't pretend to establish visual quality. Inspect worst transitions and all chapter boundaries manually.

Check source versus encoded colour, labels, UI readability, all edits/repairs and first/last frame. Audio needs decode/levels/transcript **and listening**. Say if Safari, actual phone or hardware GPU wasn't tested.

Helpers refuse existing outputs. Keep partial files/failed receipts, fix the cause and use a new name. Local-only is not later upload authority. No publishing, automatic package/model installation or paid-provider calls are bundled.
