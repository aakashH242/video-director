# Your first runnable video

An eight-second, silent **Sun → solar panel → lamp** explainer. Everything visible is bundled HTML/SVG: no API key, model download, paid generation, private screenshot, external font or Three.js. It demonstrates eased timing, a moving annotation and a full-resolution export. It is a simplified energy diagram, not an electrical wiring plan.

## 1. Check the prerequisites

Use a current **Node 22, 24 or 26**, npm, and **FFmpeg + FFprobe** on PATH. FFmpeg must offer `libx264` or `libopenh264`; GPU encoding is not required. The starter pins Playwright **1.64.1** and includes its npm lockfile. These are project dependencies, not global installations.

See Playwright's [supported systems](https://playwright.dev/docs/intro#system-requirements) and [browser installation guide](https://playwright.dev/docs/browsers). Linux browser libraries and FFmpeg are OS prerequisites; the scripts do not install system packages, request sudo or change drivers. Follow your OS/package-manager documentation if they are missing. Install Node before running the commands below.

## 2. Create a separate project

Replace `/path/to/video-director` with this skill checkout. Run from a folder where you can create a new child directory:

```bash
node /path/to/video-director/scripts/create-example.mjs my-first-video
cd my-first-video
npm ci
npm run browser:install
npm run doctor
npm test
```

The new folder **must not exist**, even if empty. The creator copies the example, locked package files and required helpers; it does not install anything or overwrite existing work. `npm ci` downloads the pinned packages. `browser:install` explicitly downloads Playwright's matching Chromium into its usual browser cache; it does not install OS libraries. Both require network access once. Rendering uses local files only.

For this reproducibility check, leave `VIDEO_DIRECTOR_RUNTIME` and `CHROME_PATH` unset. Existing projects may deliberately use those overrides; see [production.md](production.md).

## 3. Preview, then export

```bash
npm run preview
```

Open the printed loopback address. Press Play or scrub Time; the preview does not autoplay. Reduced-motion starts on the completed, labelled diagram. Stop the owned preview server with Ctrl+C. The controls are excluded from capture.

```bash
npm run timing
npm run render
npm run verify
```

Results:

- `output/timing.mp4`: eight-second, 8 fps timing draft.
- `output/first-video.mp4`: eight-second, **1280 × 720, 60 fps**, silent H.264.
- Adjacent `.receipt.json`: source hashes, frame count, retries and capture result.
- Adjacent `.verification.json` and `.contact.png`: strict decode/probe checks, frame-change statistics and encoded keyframes.

Watch the exported MP4, not just the page. Check the electricity label at 4–6 seconds and the final lamp hold. Sixty output frames per second means frame-exact offline rendering, not a promise of real-time capture speed. Encoding/capture time depends on the machine.

Outputs are intentionally **not overwritten**. For another version, use a new name:

```bash
node tools/capture.mjs --seconds 8 --fps 60 --width 1280 --height 720 --out output/revision-2.mp4
node tools/verify.mjs output/revision-2.mp4 --seconds 8 --fps 60 --width 1280 --height 720
```

## 4. Change one thing

- Words and SVG geometry: `index.html`.
- Palette and text styles: `style.css` plus explicit SVG fills/strokes.
- Timing and motion: `stateAt()` in `scene.mjs`; tests in `scene.test.mjs`.
- Add artwork behind the editable diagram: [the worked hybrid recipe](hybrid-scenes.md#worked-example-add-a-plate-to-the-first-video).

`window.videoDirector.renderAt(seconds)` must reconstruct the whole frame independently of past calls. The preview uses a wall clock only to choose which absolute time to show; exported motion never depends on elapsed render time. Keep new assets local and wait for them to decode before setting `ready`.

The starter's package scripts specify eight seconds and landscape dimensions. If you change duration, update the capture/verify commands too. For portrait, recompose the SVG and labels before choosing 720 × 1280; merely changing export dimensions letterboxes this landscape layout.

## Troubleshooting

| Symptom | Next check |
| --- | --- |
| `node` / `ffmpeg` / `ffprobe` not found | Install that prerequisite through your normal system setup, then rerun doctor. |
| Playwright missing | Run `npm ci` **inside the generated folder**; check an accidental `VIDEO_DIRECTOR_RUNTIME` override. |
| Browser executable missing | Run `npm run browser:install`; check `CHROME_PATH` or a custom `PLAYWRIGHT_BROWSERS_PATH`. |
| Browser reports missing shared libraries | Follow Playwright's system guidance with the owner's OS-install approval. The checker does not fix system packages. |
| Existing output refused | Pick a new output basename; keep receipts and partial files for diagnosis. |
| Capture waits for `ready` | Check syntax/page errors, local asset paths and the `window.videoDirector` contract. |
| Remote asset / Worker / socket blocked | Download an authorized asset into the project or choose another appropriate workflow; don't remove capture boundaries to force it through. |

For current validation evidence and its limits, see [tested-setup.md](../docs/tested-setup.md).
