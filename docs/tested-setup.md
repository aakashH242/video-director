# Tested setup

Validation date: 5 November 2026. This is an evidence record, not a cross-platform support promise.

## Environment

- Fedora Linux, x86-64; kernel 7.1.5-200.fc44.x86_64.
- Node 24.18.0, npm 12.0.1.
- FFmpeg / FFprobe 8.1.3; CPU H.264 through `libopenh264`.
- First example pins Playwright 1.64.1 with an npm lockfile.

Playwright warns that this host OS is not officially supported and uses its Ubuntu fallback browser build. The test uses a newly created project and its own `node_modules`, not the author's previous Playwright runtime. The host already has Node, FFmpeg and browser system libraries; this is **not** a clean VM or OS installation test.

## Reproduced setup

A new project was created with `create-example.mjs`, followed by `npm ci`, `npm run browser:install` and `npm run doctor`, with `VIDEO_DIRECTOR_RUNTIME` and `CHROME_PATH` unset. Chromium **156.0.8078.4** launched and took the test SVG screenshot. No previous project runtime was used. Before browser installation completed, doctor correctly returned a nonzero exit and the missing-browser remedy.

The code-only example was exported at 1280 × 720, 60 fps, eight seconds, silent H.264. After annotation layout review, the final artifact decoded all **480 frames**, with zero capture errors, failed requests or retries. It is 503,695 bytes and has SHA-256 `e0ddeab42dd36342f3bc5ad43c419717829e3f44493b50f8f568254448b69a13`. The latest capture took 19.129 seconds on this host. Generated MP4s/receipts remain local; the runnable source, tests and lockfile are bundled in the repo.

## Checks

- `setup-test.mjs`: standalone copying, spaces in paths, refusal to overwrite, usage errors, timeline tests and a missing-Playwright diagnostic.
- `self-test.mjs`: ranges, HTTP methods/path containment, overwrite protection, audio timing and invalid inputs.
- `boundary-test.mjs`, using the new pinned runtime: local assets accepted, external HTTP/sockets/Workers rejected, corrupted audio rejected. Zero HTTP requests or socket upgrades reached the separate fixture listener.
- Six unit tests across the original Geneva mechanics and new SVG timeline: engagement/dwell/continuity and absolute-time sequencing.
- `hybrid-test.mjs`: executes the actual HTML/JS snippets from the recipe, decodes a local plate, tests missing-image failure, checks the annotation lane and rapid play/pause loop cancellation, exports 64 frames and verifies the decode. Its plate is a **synthetic gradient**, not a newly generated AI image; no image-provider quality claim is made.
- Chromium preview checks at widths 1440, 768 and 390: no horizontal overflow, keyboard scrub reaches the final explanation, reduced-motion starts on the completed still, capture hides preview controls. The landscape film scales down on a phone; this is not a portrait re-edit or a guarantee of small-screen text legibility.
- Out-of-order seeking restores the same SVG state. Chromium's raster was also compared; tiny edge antialias differences were investigated rather than treating compressed PNG identity as a universal browser guarantee.
- Skill frontmatter validation, JavaScript syntax, local documentation links and Git whitespace checks.

## Fresh-agent trial

A separate agent started with no conversation history and a frozen copy of the skill, docs, helpers and assets. It received a new creative brief: an eight-second silent parcel story from packing through transit to delivery, with a following annotation. It was limited to the supplied snapshot and a new project; no other local project/runtime, paid generation, accounts, OS installs or publishing.

The agent discovered the documented setup path without author hints, installed its own pinned project packages and produced a 1280 × 720, 60 fps, 480-frame MP4. The capture recorded zero errors, failed requests or retries; strict full decode passed. It also wrote editable source and three timeline/alignment tests. Initial capture time was **17.977 seconds on this host**, not a speed benchmark. The initial video SHA-256 is `d0fcc6a5860c5e7bc081e7c30a807e1a23997932369b5970b73a5fd5b51a9886`.

The initial setup/render path had no reported broken documentation. The agent noted that `verify.mjs` leaves `visualListeningReviewPending: true`: this is deliberate. Technical verification cannot establish subjective review; record actual frame/playback/listening inspection separately instead of rewriting a receipt to imply automatic approval. The trial used encoded contact-sheet/transition review, **not real-time playback or audio review**.

A follow-up trial also passed: the agent extended truck travel by exactly **0.5 seconds**, shifted unloading/delivery accordingly, shortened the final hold to keep the total at eight seconds, and changed only the headline colour to warm coral. The parcel-following annotation and scene geometry were preserved. Four revised scene tests and another 480-frame export/full decode passed with zero errors, failed requests or retries. The original MP4 and source archive were read back byte-for-byte unchanged. Revision SHA-256: `a07cb569d74839f5ed2133bf4985042ea6e91b07d8d4e6034f67e4025e3f5e99`.

The revision used the documented new-basename capture/verify commands. The example's convenient npm scripts deliberately keep their original filenames; they refuse an overwrite rather than automatically choosing or replacing a revision. No new documentation blocker was reported. This is **one fresh-agent task plus one revision**, not a statistical evaluation or evidence that every creative brief succeeds.

See [first-video.md](../references/first-video.md) for commands, not this report for setup instructions.

## Not claimed

Windows, macOS, Safari/WebKit, real phones, hardware GPU encoding, Node 22/26 and every FFmpeg build are not validated by this host run. Sixty fps describes the output timeline, not real-time render throughput. No paid image/video generation or publishing is part of these tests.
