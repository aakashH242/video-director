export const duration = 8;
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const u = clamp(value); return u * u * (3 - 2 * u); };

// Every property is a function of absolute time: repeated/out-of-order seeks agree.
export function stateAt(time) {
  const t = Math.max(0, Math.min(duration, time));
  const travel = ease((t - 3.5) / 2.5);
  return {
    sunScale: 1 + 0.025 * Math.sin(Math.PI * t / duration),
    beam: ease(t / 0.7),
    panel: ease((t - 1.6) / 0.5) * (1 - ease((t - 3.0) / 0.5)),
    travel,
    energy: ease((t - 3.4) / 0.25) * (1 - ease((t - 5.8) / 0.3)),
    lamp: ease((t - 5.8) / 0.6),
    caption: t < 2.4 ? 'Sunlight reaches the panel.' : t < 5.8 ? 'The panel turns sunlight into electricity.' : 'Electricity powers the lamp.'
  };
}

if (typeof document !== 'undefined') {
  const byId = id => document.getElementById(id);
  const wire = byId('wire');
  const wireLength = wire.getTotalLength();
  const range = byId('time');
  const button = byId('play');
  const capture = new URLSearchParams(location.search).has('capture');
  if (capture) document.documentElement.classList.add('capture');
  function renderAt(t) {
    const state = stateAt(t);
    byId('sun').setAttribute('transform', `translate(223 367) scale(${state.sunScale})`);
    byId('sunbeam').setAttribute('opacity', state.beam);
    byId('panel-highlight').setAttribute('opacity', state.panel);
    const point = wire.getPointAtLength(wireLength * state.travel);
    byId('energy').setAttribute('transform', `translate(${point.x} ${point.y})`);
    byId('energy').setAttribute('opacity', state.energy);
    // Reserve a lane above the parts; only the leader follows their vertical offset.
    byId('energy-leader').setAttribute('d', `M0-18H${820 - point.x}V${280 - point.y}`);
    byId('energy-caption').setAttribute('transform', `translate(${820 - point.x} ${280 - point.y})`);
    byId('glow').setAttribute('opacity', state.lamp);
    byId('filament').setAttribute('stroke', state.lamp > 0.5 ? '#d86b24' : '#b2a78d');
    byId('caption').textContent = state.caption;
    range.value = Math.max(0, Math.min(duration, t));
    byId('readout').value = `${Number(range.value).toFixed(1)} s`;
  }
  window.videoDirector = {ready: true, renderAt};
  let playing = false, started = 0, frame;
  function stop() { cancelAnimationFrame(frame); playing = false; button.textContent = 'Play'; }
  function tick(now) {
    if (!playing) return;
    const t = Math.min(duration, (now - started) / 1000);
    renderAt(t);
    if (t >= duration) stop(); else frame = requestAnimationFrame(tick);
  }
  button.addEventListener('click', () => {
    if (playing) { stop(); return; }
    if (Number(range.value) >= duration) renderAt(0);
    started = performance.now() - Number(range.value) * 1000;
    playing = true; button.textContent = 'Pause'; frame = requestAnimationFrame(tick);
  });
  range.addEventListener('input', () => { stop(); renderAt(Number(range.value)); });
  // Preview starts still; reduced-motion readers get the completed, labelled diagram.
  renderAt(!capture && matchMedia('(prefers-reduced-motion: reduce)').matches ? duration : 0);
}
