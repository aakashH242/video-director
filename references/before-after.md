# Matched before/after

Label a constructed baseline honestly; don't pretend it is an old historical result. Same source assets/content, viewport, duration, fps and encoder; change the presentation. No deliberately degraded baseline or artificial jitter. This is a technique showcase, not a causal quality benchmark.

Copy `assets/comparison-study/` into a new project and supply the files in `assets.json`:

- `media/illustration.png`: approved AI art, with actual provenance/prompt if known.
- `media/ui.png`: permitted actual screenshot, no private information. Adjust the normalized anchors in `main.js` to its contents; the original test used Tenwrite's metadata panel.
- `vendor/three.module.min.js`: Three.js r169 from an existing compatible install; preserve its licence in the project.

No private media/dependencies are included globally. The source exercises SVG routing, screenshot crop/highlight and a tested Geneva assembly. Baseline holds views; directed version moves focus and tracks annotations. Three six-second scenes, 18 seconds total; silent. `scene=0|1|2` pins a scene for inspection.

```bash
node <skill>/scripts/self-test.mjs
node --test mechanics.test.mjs
node <skill>/scripts/capture.mjs --root . --entry 'index.html?mode=before' --out before.mp4 --seconds 18 --fps 60 --width 1280 --height 720
node <skill>/scripts/capture.mjs --root . --entry 'index.html?mode=after' --out after.mp4 --seconds 18 --fps 60 --width 1280 --height 720
node <skill>/scripts/compare.mjs before.mp4 after.mp4 comparison.mp4
node <skill>/scripts/verify.mjs comparison.mp4 --seconds 18 --fps 60 --width 1920 --height 1080
```

Review individual masters too: downscaling a comparison can hide defects. Measure reproducible frames, requests, actual 3D movement, correct anchors/crops and encoded validity. Don't claim an independent agent evaluation unless one actually happened.
