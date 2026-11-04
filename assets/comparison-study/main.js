import * as THREE from './vendor/three.module.min.js';
import {buildGeneva} from './geneva.js';

const $ = id => document.getElementById(id), params = new URLSearchParams(location.search);
const directed = params.get('mode') !== 'before', capture = params.has('capture');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.toggle('capture', capture);
let manualScene = null, animationFrame;
const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => {const t = clamp(n); return t * t * t * (t * (t * 6 - 15) + 10);};
const mix = (a, b, t) => a + (b - a) * t;
const manifest = await (await fetch('assets.json')).json();
$('art').src = manifest.illustration; $('ui').src = manifest.ui;
await Promise.all([$('art').decode(), $('ui').decode(), document.fonts.ready]);
const renderer = new THREE.WebGLRenderer({canvas: $('gl'), antialias: true, alpha: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(1); renderer.setSize(940, 455, false); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const world = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 940 / 455, .1, 60);
world.add(new THREE.HemisphereLight('#d4efff', '#294563', 2.2));
const key = new THREE.DirectionalLight('#fff0d5', 3.4); key.position.set(-3, 5, 6); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4; key.shadow.normalBias = .025; world.add(key);
const fill = new THREE.DirectionalLight('#74cfff', 2); fill.position.set(4, -2, 3); world.add(fill);
const mechanism = buildGeneva(); world.add(mechanism.root);
const scenes = ['artScene', 'uiScene', 'mechanismScene'];
const titles = ['Artwork. With control.', 'Make the fields readable.', 'Point to the part.'];
const explanations = ['AI illustration behind. Editable SVG in front.', 'Same screenshot. Clear focus. No invented UI.', 'Actual 3D motion. A label that follows the pin.'];
let proof;
function fit() {$('stage').style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 1280, innerHeight / 720)})`;}
addEventListener('resize', fit); fit();
function fieldCrop(t) {
  const k = directed ? ease((t - .35) / 1.5) : 0;
  const image = $('ui'), naturalWidth = image.naturalWidth, naturalHeight = image.naturalHeight;
  const crop = [0, mix(0, .41, k), 1, mix(1, .36, k)];
  const scale = Math.min(880 / (crop[2] * naturalWidth), 382 / (crop[3] * naturalHeight));
  const x = (880 - crop[2] * naturalWidth * scale) / 2 - crop[0] * naturalWidth * scale;
  const y = (382 - crop[3] * naturalHeight * scale) / 2 - crop[1] * naturalHeight * scale;
  image.style.width = naturalWidth + 'px'; image.style.height = naturalHeight + 'px';
  image.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  const index = t < 2.8 ? 0 : t < 4.4 ? 1 : 2;
  const targets = [[.025, .452, .93, .05], [.025, .579, .93, .09], [.025, .715, .93, .047]];
  const target = targets[index], bounds = [350 + x + target[0] * naturalWidth * scale, 214 + y + target[1] * naturalHeight * scale, target[2] * naturalWidth * scale, target[3] * naturalHeight * scale];
  const visible = directed && t > 1.7;
  $('fieldLabel').textContent = directed ? ['SEO title.', 'Description.', 'Focus keyword.'][index] : 'SEO title. Description. Focus keyword.';
  const highlight = $('highlight'); ['x', 'y', 'width', 'height'].forEach((name, i) => highlight.setAttribute(name, bounds[i]));
  $('uiOverlay').style.opacity = visible ? ease((t - 1.7) / .25) : 0;
  $('leader').setAttribute('d', `M 294 351 C 320 351 320 ${bounds[1] + bounds[3] / 2} ${bounds[0] - 8} ${bounds[1] + bounds[3] / 2}`);
  return {crop, target: index, bounds};
}
function drawMechanism(t) {
  const k = directed ? ease(t / 2.2) : 0;
  camera.position.set(mix(0, .4, k), mix(0, -1.1, k), mix(9.2, 7.6, k));
  camera.lookAt(.1, 0, 0); camera.updateMatrixWorld(true);
  const state = mechanism.update(directed ? t - .5 : .15);
  renderer.render(world, camera);
  const anchor = mechanism.pin.getWorldPosition(new THREE.Vector3()); anchor.z += .3; anchor.project(camera);
  const x = 300 + (anchor.x + 1) * 470, y = 160 + (1 - anchor.y) * 227.5;
  $('pinRing').setAttribute('cx', x); $('pinRing').setAttribute('cy', y);
  $('partLeader').setAttribute('d', `M 270 344 C 330 344 330 ${y} ${x - 19} ${y}`);
  $('partOverlay').style.opacity = directed ? ease((t - .4) / .4) : 0;
  $('partLabel').style.opacity = directed ? ease((t - .4) / .4) : 1;
  $('state').textContent = directed ? state.engaged ? 'PIN IN. WHEEL TURNS.' : 'PIN OUT. WHEEL WAITS.' : 'ONE STEP. THEN A PAUSE.';
  return {state, anchor: {x, y}, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles};
}
function renderAt(time) {
  const fixedScene = manualScene ?? (params.has('scene') ? Math.max(0, Math.min(2, Number(params.get('scene')))) : null);
  const selected = fixedScene ?? Math.min(2, Math.floor(Math.max(0, time) / 6));
  const t = fixedScene !== null ? Math.max(0, time) % 6 : Math.max(0, time) - selected * 6;
  const transition = !directed || fixedScene !== null ? 1 : Math.min(selected > 0 ? ease(t / .32) : 1, selected < 2 ? ease((6 - t) / .32) : 1);
  $('stage').style.opacity = transition;
  document.querySelectorAll('[data-scene]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.scene) === selected)));
  $('stage').className = selected === 1 ? 'ui' : '';
  scenes.forEach((id, i) => {$(id).style.opacity = i === selected ? 1 : 0;});
  $('title').textContent = titles[selected]; $('eyebrow').textContent = ['01 / AI + SVG', '02 / REAL UI', '03 / PROCEDURAL 3D'][selected];
  $('explanation').textContent = explanations[selected]; $('mode').textContent = directed ? 'DIRECTED PRESENTATION' : 'PLAIN PRESENTATION';
  $('progress').style.transform = `scaleX(${clamp(time / manifest.duration)})`;
  if (selected === 0) {
    const k = directed ? ease(t / 6) : 0;
    $('art').style.transform = `scale(${1 + .045 * k}) translate(${-8 * k}px,${-4 * k}px)`;
    $('card').setAttribute('transform', `translate(0 ${directed ? 18 * (1 - ease(t / 1.1)) : 0})`);
    const route = $('route'), length = route.getTotalLength(); route.style.strokeDasharray = `${length}`; route.style.strokeDashoffset = directed ? `${length * (1 - ease((t - 1) / 2))}` : '0';
    const p = route.getPointAtLength(length * (directed ? ease((t - 1) / 2) : 1)); $('traveller').setAttribute('cx', p.x); $('traveller').setAttribute('cy', p.y);
    proof = {scene: selected, t, artworkScale: 1 + .045 * k};
  } else if (selected === 1) proof = {scene: selected, t, ...fieldCrop(t)};
  else proof = {scene: selected, t, ...drawMechanism(t)};
  window.videoDirector.proof = proof;
}
window.videoDirector = {ready: false, renderAt};
window.__app = {renderer, scene: world, camera};
renderAt(0); window.videoDirector.ready = true; window.__ready = true;
document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => {manualScene = Number(button.dataset.scene); cancelAnimationFrame(animationFrame); renderAt(3);}));
if (!capture && !reduced) {const start = performance.now(); const tick = now => {renderAt(((now - start) / 1000) % manifest.duration); animationFrame = requestAnimationFrame(tick);}; animationFrame = requestAnimationFrame(tick);}
