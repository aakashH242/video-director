# A little sunlight

**One generated painting. Editable objects, text and motion.**

A 12-second, silent hybrid scene: sunlight reaches a solar panel, electricity follows a cable, and a lamp lights up. The final wipe reveals a drawing grid without removing the SVG foreground.

The hillside is a real AI-generated still—not the synthetic test fixture from the recipe. The panel, cell grid, lamp, shadows, light, energy marker, leaders, labels, camera move and layer reveal are all code. This is a simplified energy illustration, not an electrical wiring plan or a 3D simulation.

## Run it

Use the existing first-project creator for the helper scripts, then overlay this scene into that **new project**. Replace `/path/to/video-director` with the skill checkout. `solar-demo` must not already exist; don't overlay an unrelated project.

```bash
node /path/to/video-director/scripts/create-example.mjs solar-demo
cp -R /path/to/video-director/assets/hybrid-demo/. solar-demo/
cd solar-demo
npm ci
npm run browser:install
npm run doctor
npm test
npm run preview
```

Open the printed loopback URL. Press Play, scrub Time, or choose Show layers. Reduced-motion starts with the completed labelled split. Stop the preview server with Ctrl+C. There are no API calls during preview or rendering.

```bash
npm run timing
npm run render
npm run verify
```

The final file is `output/hybrid-demo.mp4`: **12 seconds, 1280 × 720, 60 fps, H.264, silent**. The timing draft is 8 fps. Technical verification writes receipts and a contact sheet; watch the encoded film too. The [first-video setup guide](../../references/first-video.md) covers prerequisites and troubleshooting.

Outputs are protected from overwrite. For a revision, use a new basename:

```bash
node tools/capture.mjs --seconds 12 --fps 60 --width 1280 --height 720 --out output/hybrid-v2.mp4
node tools/verify.mjs output/hybrid-v2.mp4 --seconds 12 --fps 60 --width 1280 --height 720
```

## What to edit

| File | Change |
| --- | --- |
| `index.html` | SVG objects, titles, labels, gradients and composition. |
| `style.css` | Text styling and preview controls. |
| `scene.mjs` | Absolute-time animation, tracked leaders, camera and layer wipe. |
| `scene.test.mjs` | Timing, sequencing, continuity and deterministic-state tests. |
| `art/hillside.png` | The original generated plate, preserved byte-for-byte. Reuse it for text/timing revisions. |
| `prompts/background.txt` | Exact generation prompt. |
| `provenance.json` | Dimensions, image hash, source, generation count and cost limits. |

The painting and foreground share a single world transform. The electricity label sits in a reserved lane while its leader follows the path marker. The wipe clips only the bitmap, so it reveals rather than recreates the SVG objects. A 1.5% push is a compositing move, not a true 3D camera orbit.

One built-in image-generation call produced the plate. Its model identifier, job identifier and monetary cost were not exposed; the ledger records those as unknown, not zero. No separate paid-provider API, generated video, narration or music was used. Subsequent motion/label edits reuse that same image.

Read the [hybrid recipe](../../references/hybrid-scenes.md) to adapt the method to another subject. For a portrait version, redesign the framing and labels rather than cropping this landscape composition automatically.
