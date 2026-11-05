# AI artwork + editable SVG

Generate the atmosphere once. Keep the words, diagram, highlights and timing editable. This recipe covers [layer choice](#choose-what-belongs-in-pixels), [asset planning](#plan-the-plate-before-generation), [a worked example](#worked-example-add-a-plate-to-the-first-video), [crop-safe anchors](#keep-crops-and-anchors-together) and [review](#review-and-revise-without-regeneration).

See it in action: [A little sunlight](../assets/hybrid-demo/README.md) is a complete 12-second example with an actual generated hillside plate, editable SVG equipment, a tracked energy label and a layer-reveal wipe. Its original image, exact prompt, provenance, tests and render commands are included. No new generation is needed to run or revise it.

## Choose what belongs in pixels

| Layer | Good use | Avoid |
| --- | --- | --- |
| Generated still | Landscape, texture, illustrated room, atmosphere | Exact text, factual internals, fake product UI |
| SVG / HTML | Titles, arrows, diagrams, labels, controllable subjects | Pretending flat art has a hidden back side |
| Real capture | Actual settings, clicks, data and results | Painting in a successful operation that didn't happen |
| 3D | Gear engagement, cutaways, real camera orbits | A bitmap stretched into an allegedly correct mechanism |

Use a still if the camera only needs a small push or layered pan. Use separate approved layers for modest parallax. A single bitmap cannot support a convincing orbit or reveal geometry behind its subject; use 3D or suitable footage instead. If code alone communicates the idea, skip image generation.

## Plan the plate before generation

Inspect existing approved assets first. Show the owner the concept, exact new prompts, count, aspect/resolution and any separately billed provider cost before spending. Use the available image-generation tool when appropriate; provider APIs are optional, not a prerequisite. If a tool fails, do not silently switch to a billed API. A timeout may still have produced a charged job: inspect its status before retrying.

Example plan for the first-video scene:

- **Story:** sunlight becomes electricity and lights a lamp; the editable diagram remains the explanation.
- **Plate:** one quiet illustrated landscape, 16:9, native at least 1280 × 720 (or the tool's nearest supported landscape output). Crop once to the project composition. No generated text or foreground machinery.
- **Foreground:** existing sun, panel, wire, travelling energy marker and lamp from the code-only first example.
- **Composition:** headline in the upper 30%; the panel and lamp occupy the middle/lower field. Keep detail and strong contrast away from text and wire.
- **Light/palette:** warm upper-left light, desaturated blue-green distance, warm ivory ground; orange/teal foreground with dark text. Outline labels so colour is not the only cue.
- **Motion:** static plate first. Optionally one 1–2% eased push, with overlays transformed consistently. No camera orbit.
- **Cost:** report the actual provider estimate/charge if known; otherwise mark unknown. Reusing an approved image means no **new** image call, not that the old image or agent work was free.

Exact starting prompt (adapt subject/framing, not just adjectives):

> Wide, hand-painted editorial landscape background for a simple educational diagram. Warm ivory ground across the lower half, soft desaturated blue-green hills in the far distance, gentle warm sunlight from the upper left, matte gouache texture, fixed straight-on perspective. Very quiet low-detail upper 30 percent for dark headline text added separately; low-detail middle and lower area for large SVG objects. Keep the centre uncluttered. No people, no sun disc, no solar panels, no lamp, no wire, no foreground equipment. No text, letters, labels, logos, watermarks or interface. Landscape 16:9 composition. This is a background plate, not a finished infographic.

Do not remove tool-provided provenance metadata/signals. The “no watermarks” prompt is not permission to strip an output's provenance. Store the original output unchanged; make a separate composition crop when needed. Inspect at export size for unwanted foreground objects, fake text, edge clutter and light direction before accepting it.

For multiple plates, reuse the approved palette/medium/light preamble and pass the approved reference if the tool supports it. Do not assume a fixed seed guarantees identical style across tools.

## Worked example: add a plate to the first video

First make and render [the code-only example](first-video.md). Then use a new revision folder or preserve a source snapshot and the baseline MP4. This recipe needs **one already-approved local background**, not another generated video. No picture is bundled or silently downloaded.

1. Place the composition-ready image at `media/landscape.png` inside the generated project. Keep a separate original. Record its dimensions and SHA-256.
2. In `index.html`, replace **only** the `rect` with `id="backdrop"` with the group below. Leave the rest of the scene, words and absolute-time animation editable.

```html
<g id="backdrop">
  <image id="plate" href="media/landscape.png"
    x="0" y="0" width="1280" height="720"
    preserveAspectRatio="xMidYMid slice"/>
  <!-- A quiet text mat: not generated lettering. -->
  <rect width="1280" height="238" fill="#f4f0e7" opacity="0.94"/>
  <rect y="238" width="1280" height="482" fill="#f4f0e7" opacity="0.32"/>
</g>
```

3. In `scene.mjs`, replace the `window.videoDirector = {ready: true, renderAt};` line with this readiness gate. Broken assets must fail rather than render an empty background. SVG `<image>` loading uses an `Image` decode probe here, not an HTML-only `.decode()` call on an SVG node.

```js
window.videoDirector = {ready: false, renderAt};
const plate = new Image();
plate.src = document.getElementById('plate').getAttribute('href');
await plate.decode();
window.videoDirector.ready = true;
```

4. Render a timing draft and final revision to **new** paths, then verify:

```bash
node tools/capture.mjs --seconds 8 --fps 8 --width 1280 --height 720 --out output/hybrid-timing.mp4
node tools/capture.mjs --seconds 8 --fps 60 --width 1280 --height 720 --out output/hybrid-v1.mp4
node tools/verify.mjs output/hybrid-v1.mp4 --seconds 8 --fps 60 --width 1280 --height 720
```

The sun/panel/lamp remain schematic foreground objects rather than objects falsely embedded in the generated landscape. For a more integrated scene, adjust their contact shadows, ground line and lighting together. Do not add parallax just because you can: first establish a readable still composition.

## Keep crops and anchors together

The worked example uses a common **1280 × 720 SVG viewBox** for the entire composition. For anchors on editable SVG objects, put the object and its local leader in one `<g>`; moving/scaling that group moves both. For a moving point on a path, derive the annotation anchor with `getPointAtLength()` on the same path, as the first example does.

For an anchor attached to a feature in the **bitmap**, save normalized coordinates `(u, v)` against the un-cropped source image. An `xMidYMid slice` cover fit of source `(iw, ih)` into target `(W, H)` uses:

```js
const scale = Math.max(W / iw, H / ih);
const offsetX = (W - iw * scale) / 2;
const offsetY = (H - ih * scale) / 2;
const x = offsetX + u * iw * scale;
const y = offsetY + v * ih * scale;
```

Apply any subsequent shot transform to the bitmap **and** these projected anchors. Do not independently zoom the bitmap with CSS `object-fit` while keeping leader coordinates unchanged. If a selected feature falls outside the crop, reframe or omit that annotation. For `meet`/contain use `Math.min`, account for the letterbox, and don't reuse the cover coordinates.

Concrete check: a 1600 × 1200 image covering 1280 × 720 has scale `0.8`, offsets `(0, -120)`. Its centre `(0.5, 0.5)` maps to `(640, 360)`, not `(640, 480)`. Test the centre and at least two noncentral landmarks after changing the crop. For portrait, create a new composition and quiet label area; don't trust an automatic centre crop.

## Motion and layering

- Choose one hero action. Bring in its annotation as it is named; let the eye settle before changing the next thing. Leave readable holds.
- Keep a label a consistent screen size during a zoom. Transform its anchor, then lay out the label/leader in screen/viewBox space; apply the same projection, not necessarily the same scale to the lettering.
- If a leader crosses the subject or another label, change the label position or reserve a lane. Hide an occluded 3D anchor rather than drawing through geometry.
- Use `renderAt(t)` for every moving layer. Avoid accumulated transforms, random changes per frame and CSS transitions that fight explicit SVG transforms.
- Preview reduced-motion with a completed labelled poster and accessible scrub controls. The exported film remains the requested timed animation; reduced-motion is a preview/accessibility behaviour, not a silent change of deliverable.
- Use real transparency for cutouts. An opaque black plate is not alpha; inspect borders against both light and dark backgrounds.

## Review and revise without regeneration

Check the **encoded** first frame, annotation peak, last frame, every transition and the worst frame-change candidates. Check text at the actual display size, foreground/background contrast, crop edges, shadows, missing images and unexpected generated details. Metrics do not establish artistic quality. Watch the whole clip if generated footage is used: later frames can change details or colours.

Revision test: change one label, delay its entrance and shift a crop. Re-render with a new filename. The source image's hash should remain the same. Reuse of a plate is a measurable fact; a universal cost/speed claim is not. Log render time and any new generation calls separately if comparing iteration methods.

Keep a small asset ledger beside the project, for example:

```json
{
  "file": "media/landscape.png",
  "role": "background plate; diagram remains code",
  "origin": "approved generated still",
  "toolAndModel": "record actual value, or unknown",
  "promptFile": "prompts/landscape.txt",
  "referenceFiles": [],
  "jobId": null,
  "nativeSize": [1600, 900],
  "compositionCrop": "xMidYMid slice into 1280x720",
  "sha256": "record actual hash",
  "rights": "record applicable terms/permission",
  "generationCost": null,
  "costNote": "unknown is not zero; no new call during timing/text revisions"
}
```

Use real values, not the sample placeholders, in deliverables. Preserve the original asset, prompt, reference identity and any provenance metadata. See [before-after.md](before-after.md) for matched comparison exports and [real-ui.md](real-ui.md) when the foreground needs actual product evidence.
