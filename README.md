# Video Director

An installable agent skill for directing finished videos with **AI artwork + editable SVG**, **actual product UI**, and **procedural 3D**. Includes focused recipes and working local capture, annotation, audio-timing, comparison and verification tools. Not a separate Python package, framework or hosted service.

## Install

Clone this private repository into a global skill location supported by your agent, for example:

```bash
git clone git@github.com:aakashH242/video-director.git ~/.agents/skills/video-director
```

Do not overwrite an existing installation. If already installed, update its existing checkout deliberately. Invoke `$video-director`, or point your agent to `SKILL.md`.

Example request:

> Use $video-director to make a 30-second product demo with readable real UI, smooth motion and clear annotations. Keep it local for review; do not publish.

## What's included

- `SKILL.md`: creative decisions, routing and delivery boundaries.
- `references/`: hybrid scenes, real UI, 3D, audio, capture/QA, comparisons, optional MoneyPrinterTurbo and lineage.
- `scripts/`: local-only frame capture, ranged static serving, clip assembly with pauses, comparison, strict decode/contact-sheet checks and regressions.
- `assets/comparison-study/`: an editable 18-second, three-scene starter. Supply your own approved illustration, actual screenshot and Three.js dependency. No private media is bundled.

## Runtime and tests

Read `references/production.md` for commands. Need Node 18+, FFmpeg/FFprobe with CPU H.264, and Playwright >=1.48 with Chromium. Three.js r169 is needed only for the included 3D study. Reuse an existing project runtime or install prerequisites separately into an isolated project. Helpers do not install anything or call generation providers.

From your video project, set `VIDEO_DIRECTOR_RUNTIME` to an existing runtime's absolute `package.json` path if Playwright is not installed in that project. Resolve `<skill>` to this checkout:

```bash
node <skill>/scripts/self-test.mjs
node <skill>/scripts/boundary-test.mjs
node --test <skill>/assets/comparison-study/mechanics.test.mjs
```

The comparison recipe explains how to copy the starter, add media, render matched before/after films and verify the encoded result. A constructed baseline demonstrates techniques; it is not proof of a model-quality improvement.

## Boundaries

Local review by default. No uploads, social publishing, paid generation, credential collection, global model/package installs or driver changes are performed by the helpers. The static capture helper rejects worker/socket applications; use trusted main-thread export scenes, not a generic app/session recorder. It is not an OS sandbox for hostile code. Music/media/model permissions remain project-specific.

MoneyPrinterTurbo is optional, not the 3D renderer. Its CLI help has been exercised on Linux; full generation was not tested here. Its configured final video stage can also cross-post: see the explicit non-publishing preflight in `references/moneyprinterturbo.md`.

The repository is private while being developed. No redistribution licence has been selected for original material. Upstream techniques/dependencies have their own rights and notices; see `references/lineage.md` and `references/upstream-notices.txt`. No claim of exclusive ownership over upstream techniques.
