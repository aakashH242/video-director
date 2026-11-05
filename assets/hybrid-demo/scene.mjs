export const duration = 12;
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => {const u = clamp(value); return u * u * (3 - 2 * u);};
const enter = (time, start, seconds) => ease((time - start) / seconds);

export function stateAt(time) {
  const t = Math.max(0, Math.min(duration, time));
  return {
    t,
    panel: enter(t, 0.2, 0.8),
    lamp: enter(t, 0.55, 0.8),
    sun: enter(t, 0.4, 0.6) * (1 - enter(t, 7.4, 0.6)),
    panelLabel: enter(t, 1.5, 0.45) * (1 - enter(t, 3.4, 0.45)),
    travel: enter(t, 3.6, 2.6),
    energy: enter(t, 3.5, 0.3) * (1 - enter(t, 6.3, 0.35)),
    light: enter(t, 6.1, 0.7),
    reveal: enter(t, 8.6, 1.1),
    intro: 1 - enter(t, 7.7, 0.45),
    outro: enter(t, 8.0, 0.6),
    camera: 1 + 0.015 * enter(t, 0, 6.5)
  };
}

if (typeof document !== 'undefined') {
  const byId = id => document.getElementById(id);
  const opacity = (id, value) => byId(id).setAttribute('opacity', value);
  // One affine panel surface keeps the cell grid and frame in the same perspective.
  const surface = (u, v) => `${422 + 217 * u + 89 * v},${407 - 44 * u + 124 * v}`;
  for (let row = 0; row < 4; row++) for (let column = 0; column < 6; column++) {
    const cell = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const u = column / 6, v = row / 4, gap = 0.009;
    cell.setAttribute('points', [surface(u + gap, v + gap), surface(u + 1 / 6 - gap, v + gap), surface(u + 1 / 6 - gap, v + 1 / 4 - gap), surface(u + gap, v + 1 / 4 - gap)].join(' '));
    cell.setAttribute('fill', (row + column) % 2 ? '#2b6268' : '#24565f');
    cell.setAttribute('stroke', '#7cad9f'); cell.setAttribute('stroke-width', '0.65');
    byId('cells').append(cell);
  }
  const wire = byId('wire'), length = wire.getTotalLength();
  const range = byId('time'), button = byId('play');
  const capture = new URLSearchParams(location.search).has('capture');
  if (capture) document.documentElement.classList.add('capture');
  function renderAt(t) {
    const s = stateAt(t);
    byId('world').setAttribute('transform', `translate(${640 * (1 - s.camera)} ${410 * (1 - s.camera)}) scale(${s.camera})`);
    for (const [id, amount] of [['solar-panel', s.panel], ['lamp', s.lamp]]) {
      byId(id).setAttribute('transform', `translate(0 ${26 * (1 - amount)})`);
      opacity(id, amount);
    }
    opacity('panel-shadow', s.panel); opacity('lamp-shadow', s.lamp);
    opacity('sunlight', s.sun); byId('beam').setAttribute('stroke-dashoffset', -s.t * 20);
    opacity('panel-callout', s.panelLabel);
    opacity('wire', s.lamp);
    byId('power').setAttribute('stroke-dasharray', `${length * s.travel} ${length}`);
    opacity('power', enter(s.t, 3.6, 0.3));
    const point = wire.getPointAtLength(length * s.travel);
    byId('energy').setAttribute('transform', `translate(${point.x} ${point.y})`);
    opacity('energy', s.energy);
    byId('energy-leader').setAttribute('d', `M0-20H${809 - point.x}V${327 - point.y}`);
    byId('energy-caption').setAttribute('transform', `translate(${809 - point.x} ${327 - point.y})`);
    opacity('lamp-light', s.light);
    byId('bulb').setAttribute('fill', s.light > 0.5 ? '#ffe6a6' : '#b5b58e');
    byId('art-window').setAttribute('width', 1280 - 500 * s.reveal);
    byId('layer-divider').setAttribute('transform', `translate(${500 * (1 - s.reveal)} 0)`);
    opacity('layer-divider', s.reveal);
    opacity('layer-tags', s.reveal);
    opacity('intro-copy', s.intro); byId('intro-copy').setAttribute('transform', `translate(0 ${8 * (1 - s.panel) - 8 * (1 - s.intro)})`);
    opacity('outro-copy', s.outro); byId('outro-copy').setAttribute('transform', `translate(0 ${12 * (1 - s.outro)})`);
    range.value = s.t; byId('readout').value = `${s.t.toFixed(1)} s`;
  }
  window.videoDirector = {ready: false, renderAt};
  const plate = new Image(); plate.src = byId('plate').getAttribute('href'); await plate.decode();
  await document.fonts.ready;
  let playing = false, started = 0, frame;
  function stop() {cancelAnimationFrame(frame); playing = false; button.textContent = 'Play';}
  function tick(now) {
    if (!playing) return;
    const t = Math.min(duration, (now - started) / 1000); renderAt(t);
    if (t >= duration) stop(); else frame = requestAnimationFrame(tick);
  }
  button.addEventListener('click', () => {
    if (playing) {stop(); return;}
    if (Number(range.value) >= duration) renderAt(0);
    started = performance.now() - Number(range.value) * 1000;
    playing = true; button.textContent = 'Pause'; frame = requestAnimationFrame(tick);
  });
  range.addEventListener('input', () => {stop(); renderAt(Number(range.value));});
  byId('layers').addEventListener('click', () => {stop(); renderAt(11);});
  renderAt(!capture && matchMedia('(prefers-reduced-motion: reduce)').matches ? 11 : 0);
  for (const control of document.querySelectorAll('#controls button, #controls input')) control.disabled = false;
  byId('film').setAttribute('aria-busy', 'false');
  window.videoDirector.ready = true;
}
