# Video Director

**Make it move. Keep it editable.**

Make product demos, animated diagrams and 3D explainers with your AI agent. Combine **real screenshots, crisp SVG graphics, working 3D and AI artwork where it helps**—with readable close-ups, labels that follow the action, and smooth motion.

Change the words, timing or camera move in code. Reuse the good assets. Render the next version without generating the whole shot again.

An installable agent skill. No new video app to learn.

[See the demo](#see-the-difference) · [Get started](#get-started) · [Explore the recipes](#pick-your-kind-of-video)

## See the difference

The same assets, presented two ways: a plain overview on the left; directed motion, readable crops and tracked labels on the right.

<a href="docs/showcase/before-after.mp4?raw=true" title="Download the full 18-second before/after MP4">
  <img src="docs/showcase/demo-preview.gif" alt="Animated before/after: AI illustration with SVG, a real UI close-up, and a 3D mechanism with a tracked label" width="480">
</a>

**[Download the full-quality MP4 →](docs/showcase/before-after.mp4?raw=true)** · 18 seconds · 1080p · 60 fps · silent

## A closer look

| AI artwork + SVG | Readable product UI | 3D + tracked annotations |
| :---: | :---: | :---: |
| <a href="docs/showcase/hybrid.jpg"><img src="docs/showcase/hybrid.jpg" width="200" alt="AI illustration behind an editable SVG card and animated route"></a> | <a href="docs/showcase/real-ui.jpg"><img src="docs/showcase/real-ui.jpg" width="200" alt="Actual Tenwrite screenshot cropped to its SEO fields with a description highlight"></a> | <a href="docs/showcase/3d-annotations.jpg"><img src="docs/showcase/3d-annotations.jpg" width="200" alt="Working Geneva drive with a leader line following the drive pin"></a> |
| Keep the art. Control the words and motion. | Show the field people need to read. | Point to the part you're explaining. |

## Iterate in code. Save generation for what needs it.

A new label shouldn't need a new video generation. Neither should a slower zoom, a longer pause or a different camera angle.

For **UI, diagrams, SVG graphics and procedural 3D**, Video Director gives you a practical alternative to regenerating images or clips for each revision:

- **Edit the exact thing you want to change.** Update a word, colour, highlight, camera path or timing without replacing the rest of the scene.
- **Reuse artwork across versions.** Generate a background when you need one, then keep titles, foreground objects and animation separate.
- **Capture real screens.** Show the actual interface instead of spending image-generation credits trying to recreate it.
- **Reuse your renders as stills.** Pull frames for diagrams, thumbnails or feature images from the same scene.
- **Check a quick timing pass first.** Adjust the choreography before spending time on the final high-frame-rate render.

That can mean **lower generation spend and faster iteration** for these kinds of scenes. This demo reused existing artwork and a real screenshot; its motion and annotation edits needed no new image or video generation.

It isn't a universal replacement for image or video models. Use them for artwork or footage that needs them; use code for the parts you want precise control over. Total cost and speed still depend on agent usage, assets, scene complexity and your hardware.

## What it helps you do

- **Show the useful bit first.** Plan an opening around the result, then explain how it works.
- **Make real screens readable.** Use deliberate crops, visible actions and holds long enough to follow. Keep screenshots honest; don't fake a live operation.
- **Keep text and diagrams editable.** Use generated artwork for atmosphere, then add crisp SVG/HTML foregrounds, arrows and labels in code.
- **Explain moving parts.** Build tested 3D motion, move in for the contact, and attach labels to the part—not a random spot on screen.
- **Render smooth motion.** Capture exact frames on a controlled timeline, even when a scene renders slower than real time.
- **Give narration room to breathe.** Assemble approved speech clips with natural pauses and measured timings.
- **Check the actual export.** Spot decoding errors and wrong frame counts, then inspect the transitions before handing over the MP4.

## Pick your kind of video

**Launching a product?** Start with [real UI](references/real-ui.md): show where to go, what to click and what changes.

**Explaining how something works?** Use [3D explainers](references/3d-explainers.md): establish the whole, reveal the parts and follow the motion.

**Making an illustrated story or advert?** Use [hybrid scenes](references/hybrid-scenes.md): approved AI artwork behind an editable foreground.

**Comparing two versions?** Use the [before/after starter](references/before-after.md): matched assets, timing and export settings, with clear labels.

Mix these approaches when the story needs it. A product demo doesn't have to look like a mechanical explainer, and the next video doesn't have to reuse the last video's colours.

## Get started

Clone the repo into a global skill location supported by your agent:

```bash
git clone git@github.com:aakashH242/video-director.git ~/.agents/skills/video-director
```

Already installed? Update your existing checkout deliberately—don't overwrite it with another clone.

Then ask:

> Use $video-director to make a 30-second product demo with readable real UI, smooth motion and clear annotations. Give me an MP4 to review.

Or:

> Use $video-director to explain this mechanism in 45 seconds. Show the whole thing, then close-ups. Highlight each part as the narration names it.

Read [SKILL.md](SKILL.md) for the entry point and [production.md](references/production.md) for setup and commands.

## What's in the box?

| Included | What you get |
| --- | --- |
| [Skill instructions](SKILL.md) | Shot planning, visual choices and the right recipe for the video. |
| [Recipes](references/) | Hybrid artwork, real UI, 3D, audio, comparisons and production checks. |
| [Working scripts](scripts/) | Frame-exact capture, local serving, audio pauses, side-by-side comparisons and export verification. |
| [Editable starter](assets/comparison-study/) | The three-scene study, ready for your own approved art, screenshot and Three.js dependency. |
| [Showcase](docs/showcase/) | The demo and small screenshots shown above. |

### Runtime

Use **Node 18+**, **FFmpeg/FFprobe** with CPU H.264, and **Playwright ≥1.48 with Chromium**. The 3D starter uses **Three.js r169**. See the [setup and capture guide](references/production.md) for requirements, commands and compatibility.

<details>
<summary><strong>Run the checks</strong></summary>

From your video project, set `VIDEO_DIRECTOR_RUNTIME` to an existing runtime's absolute `package.json` path if Playwright isn't installed there. Replace `<skill>` with this checkout's path:

```bash
node <skill>/scripts/self-test.mjs
node <skill>/scripts/boundary-test.mjs
node --test <skill>/assets/comparison-study/mechanics.test.mjs
```

The [production guide](references/production.md) covers capture and encoded-output verification. Technical checks support visual review; they don't replace watching the result or listening to the voice.

</details>

---

[Production guide](references/production.md) · [Audio and narration](references/audio.md) · [Optional MoneyPrinterTurbo integration](references/moneyprinterturbo.md) · [Credits and licences](references/lineage.md)
