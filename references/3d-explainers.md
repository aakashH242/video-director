# 3D explanations

Establish dimensions/relationships, axes, contacts, ratios and simplifications before detail. Prefer tested procedural geometry to decorative meshes that cannot demonstrate the mechanism. Use primary technical references for uncertain claims.

- A pure `motion(t)` returns absolute angles/positions/engagement. Test continuity, wraps, dwell and constraints separately from rendering.
- Give each named part a stable object/annotation anchor. Project with `Vector3.project(camera)` after updating world/camera matrices. Hide/reroute occluded or colliding labels; clamp the label box, not its anchor, into safe space.
- Establish the whole, move to the contact, hold, return. Ease positions **and** look-at targets. Avoid damping driven by frame count. Linear shaft rotation is appropriate.
- Use a long-enough lens, key/fill/rim, contact shadow, restrained reflections, tone mapping and antialiasing. Functional complementary colours help but don't replace labels.
- Avoid z-fighting; update material flags when transparency changes. Depth ordering must remain correct during fades.
- Reveal a short label/highlight when speech names that part. Silent explanations can use the same sequence as short visual beats.

Expose `window.videoDirector={ready:true,renderAt(t){...}}` after assets/fonts/geometry are ready. It must work for repeated or out-of-order times. Under `?capture=1`, stop the real-time rAF loop; render the actual WebGL scene before resolving. Use `preserveDrawingBuffer:true` for capture. Await video/asset decoding inside `renderAt` when applicable.

The starter is a simplified four-slot Geneva: crank radius = centre spacing / √2, 90° advance/cycle with dwell, not manufacturing CAD. Test engagement boundaries. Inspect several viewports/reduced motion; report browser/performance coverage honestly. Offline 60 fps output is not a real-time GPU benchmark.
