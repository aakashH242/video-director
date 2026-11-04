# Optional MoneyPrinterTurbo CLI

The installed `moneyprinterturbo-video` v1.3.2 instructions restrict their wrapper workflow to macOS/Windows. That is **not** evidence the upstream application/CLI cannot run on Linux. Upstream README lists Linux; `cli.py` supports explicit local media. Verify the installed version and `cli.py --help` before choosing flags. Don't edit the other skill or silently use its Chinese portrait/music defaults.

Primary sources inspected:
- https://github.com/harry0703/MoneyPrinterTurbo
- https://github.com/harry0703/MoneyPrinterTurbo/blob/main/cli.py

Useful for topic/script, footage, narration/subtitles and assembly when requested. It is not a procedural CAD, actual UI-action or Three.js renderer. Custom films can use explicit-time capture/FFmpeg without pretending MPT rendered them. Local-media inputs are a possible integration path.

**Local-only safeguard:** the inspected CLI's final `video` stage also runs configured cross-posting, and is the default stage. Before any full generation use an isolated configuration with every cross-post destination disabled and verify the suppression against that checkout. Do not merely assume the user's usual config is local-only. If publication cannot be safely suppressed, stop before the final stage or use the bundled capture/FFmpeg route. Creation authority is not publication authority.

Inspect checkout docs/configuration without printing keys, run help in an isolated runtime, pass language/aspect/media/audio explicitly, and resolve missing configuration/billed work before generation. Don't start Docker/WebUI/API services to probe help. Help success does not prove an end-to-end render. Keep optional MPT dependencies separate from working TTS/capture runtimes. No MPT source is bundled or required.

Actual creation-time probe on Linux: upstream commit `c8dbf96e9dfee43b30f7c3f440175d6bd4de61de`, `uv run --no-project --python 3.11 --with loguru cli.py --help`, exited 0 in a sparse checkout containing the CLI and its logging module. A standalone downloaded CLI failed missing `app`, demonstrating it is not a self-contained script. No configured generation/provider/publishing job was run.
