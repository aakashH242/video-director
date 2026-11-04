import * as THREE from './vendor/three.module.min.js';
import {motion, CENTRES, CRANK} from './mechanics.mjs';

export function buildGeneva() {
  const root = new THREE.Group(), driver = new THREE.Group(), output = new THREE.Group();
  root.add(driver, output); driver.position.x = -CENTRES / 2; output.position.x = CENTRES / 2;
  const material = color => new THREE.MeshStandardMaterial({color, metalness: .55, roughness: .29});
  const steel = material('#d8e5ed'), teal = material('#47d8c0'), gold = material('#f4b94a'), dark = material('#1c3a53');
  function mesh(geometry, mat, parent, position) {
    const item = new THREE.Mesh(geometry, mat); item.position.set(...position);
    item.castShadow = true; item.receiveShadow = true; parent.add(item); return item;
  }
  function disc(radius, depth, mat, parent, x, y, z) {
    const item = mesh(new THREE.CylinderGeometry(radius, radius, depth, 64), mat, parent, [x, y, z]);
    item.rotation.x = Math.PI / 2; return item;
  }
  const shape = new THREE.Shape(), outer = 1.91, slot = .105, inner = .56, edge = Math.asin(slot / outer);
  const rotated = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  function radius(a) {
    let r = outer;
    for (let j = 0; j < 4; j++) {
      const delta = a - (Math.PI / 4 + j * Math.PI / 2), projection = CENTRES * Math.cos(delta);
      const q = 1.4 ** 2 - (CENTRES * Math.sin(delta)) ** 2;
      if (q >= 0 && projection > 0) r = Math.min(r, projection - Math.sqrt(q));
    }
    return r;
  }
  for (let q = 0; q < 4; q++) {
    const a = q * Math.PI / 2, p = rotated(inner, -slot, a);
    if (!q) shape.moveTo(...p); else shape.lineTo(...p);
    shape.lineTo(...rotated(inner, slot, a));
    for (let j = 0; j <= 80; j++) {
      const b = a + edge + (Math.PI / 2 - edge * 2) * j / 80, r = radius(b);
      shape.lineTo(r * Math.cos(b), r * Math.sin(b));
    }
    shape.lineTo(...rotated(inner, -slot, a + Math.PI / 2));
  }
  shape.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, .24, 0, Math.PI * 2, true); shape.holes.push(hole);
  mesh(new THREE.ExtrudeGeometry(shape, {depth: .22, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2}), teal, output, [0, 0, .15]);
  disc(1.82, .14, dark, driver, 0, 0, -.18);
  const cam = new THREE.Shape(); cam.moveTo(0, 0); cam.absarc(0, 0, 1.4, .97, Math.PI * 2 - .97, false); cam.lineTo(0, 0);
  mesh(new THREE.ExtrudeGeometry(cam, {depth: .22, bevelEnabled: true, bevelSize: .025, bevelThickness: .02, bevelSegments: 2}), steel, driver, [0, 0, .12]);
  mesh(new THREE.BoxGeometry(CRANK, .23, .16), gold, driver, [CRANK / 2, 0, -.01]);
  const pin = disc(.075, .56, gold, driver, CRANK, 0, .22);
  disc(.12, .04, steel, driver, CRANK, 0, .52);
  for (const x of [-CENTRES / 2, CENTRES / 2]) disc(.24, .6, steel, root, x, 0, -.1);
  mesh(new THREE.BoxGeometry(6.8, 4.2, .18), dark, root, [.1, 0, -.54]);
  mesh(new THREE.BoxGeometry(7, 4.4, .12), material('#426783'), root, [.1, 0, -.68]);
  return {root, pin, update(t) {const state = motion(t); driver.rotation.z = state.angle; output.rotation.z = state.output; root.updateMatrixWorld(true); return state;}};
}
