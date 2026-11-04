export const CENTRES = 2.5, CRANK = CENTRES / Math.SQRT2, PERIOD = 4;
export function motion(t) {
  const angle = t / PERIOD * Math.PI * 2;
  const cycle = Math.floor((angle + Math.PI / 4) / (Math.PI * 2));
  const local = angle - cycle * Math.PI * 2;
  const engaged = local <= Math.PI / 4;
  const beta = engaged ? Math.atan2(CRANK * Math.sin(local), CENTRES - CRANK * Math.cos(local)) : Math.PI / 4;
  return {angle, output: -cycle * Math.PI / 2 - beta, engaged, pin: [-CENTRES / 2 + CRANK * Math.cos(angle), CRANK * Math.sin(angle)]};
}
