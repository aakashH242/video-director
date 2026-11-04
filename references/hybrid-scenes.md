# Generated artwork + SVG

Use an approved generated still as a plate, then layer editable SVG subjects/diagrams, HTML text, 3D and shadows. Keep exact text/factual geometry out of generation. Inspect existing assets first. For new assets use the available image tool; resolve separately billed scope/cost before spending, and log the exact prompt, tool/model, references, job, selected file, rights/cost (unknown is not zero), size and hash. Preserve provenance signals. Don't silently switch to a paid API after a tool fails.

Example prompt, adapt to subject: “Wide illustrated workshop background, muted cool blue, warm key light, quiet central area for a separately rendered mechanism, fixed perspective, no text, logos, labels or foreground machinery. Background plate for editable code animation.”

- Match perspective, light direction, contact shadow and colour temperature across layers.
- Attach overlays to normalized image/viewBox coordinates and project them through the **same** crop/transform as the artwork.
- Restrain parallax. One bitmap cannot supply correct geometry for a camera orbit; use 3D, locked framing or suitable footage instead.
- Preserve quiet text space; dim a busy region locally. Keep foreground edges crisp at export size.
- Derive motion from `renderAt(t)`. An interactive reduced-motion poster should retain the explanation.
- Alpha must be real alpha or a measured key, not an opaque black plate. Inspect generated video throughout for detail/colour drift.

The comparison starter reuses the same approved illustration on both sides: static baseline versus modest depth and code-controlled SVG routing. It does not imply that its artwork is a real product screenshot.
