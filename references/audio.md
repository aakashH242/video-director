# Narration and pauses

Preserve the approved voice. A bigger model is not necessarily better. Audition identical short text first, and listen for phrasing, stress, names and word endings. Independent ASR finds omissions/repetition, not naturalness.

Generate coherent phrases/sentences, not separate words. Punctuation may not create an audible pause. Preserve raw clips and set per-clip gaps by ear: sentence gaps, a larger beat after a joke/before a new topic, a short beat after a standalone introduction. Do not mechanically pause at every comma/dash.

`scripts/audio.mjs manifest.json narration.wav` accepts:

```json
{"clips":[{"file":"speech/01.wav","gapAfter":0.3},{"file":"speech/02.wav","gapAfter":0.7}]}
```

Paths are relative to the manifest. It probes original durations, resamples to 48 kHz mono PCM, adds silence and writes `narration.wav.timing.json`. No synthesis, trimming or loudness normalization. Use measured timings for edits and independently align words if needed. Listen after assembly and final encode.

Music is optional; obey no-music requests. Record actual track licence/attribution and platform restrictions; royalty-free does not mean unclaimable. Mix after picture capture, not through a virtual clock. Never remove required AI provenance.

Optional **Pip profile**, only for her projects: approved Kokoro `af_heart`, speed `0.88`, no visible host unless requested. Reuse an available local TTS runtime without modifying it. No machine-specific path in the core helpers. The rejected VibeVoice auditions are not an approved replacement.
