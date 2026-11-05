import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {encoderArgs} from './media.mjs';

let failed = false;
async function check(name, action) {
  try { console.log(`OK ${name}: ${await action()}`); }
  catch (error) { failed = true; console.error(`FAIL ${name}: ${error.message}`); }
}
await check('Node', () => {
  const major = Number(process.versions.node.split('.')[0]);
  if (![22, 24, 26].includes(major)) throw Error('Use current Node 22, 24 or 26. This starter is tested on Node 24.');
  return process.version;
});
for (const command of ['ffmpeg', 'ffprobe']) {
  await check(command, () => execFileSync(command, ['-version'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).split('\n')[0]);
}
await check('CPU H.264', () => encoderArgs().slice(0, 2).join(' '));
await check('Playwright + Chromium', async () => {
  const require = createRequire(resolve(process.env.VIDEO_DIRECTOR_RUNTIME || 'package.json'));
  let chromium, version;
  try { ({chromium} = require('playwright')); ({version} = require('playwright/package.json')); }
  catch { throw Error('Playwright missing in the selected project runtime. Run npm ci in the generated project, or set VIDEO_DIRECTOR_RUNTIME to the correct absolute package.json.'); }
  let browser;
  try {
    browser = await chromium.launch({executablePath: process.env.CHROME_PATH || undefined});
    const context = await browser.newContext();
    if (typeof context.routeWebSocket !== 'function') throw Error('Playwright >=1.48 is required.');
    const page = await context.newPage();
    await page.setContent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="coral"/></svg>');
    await page.screenshot({type: 'png'});
    return `${version}; Chromium ${browser.version()}; headless SVG screenshot passed`;
  } catch (error) {
    throw Error(`${error.message}\nRun npm run browser:install in the generated project. If OS libraries are missing, consult Playwright's system requirements; this helper does not install OS packages. Check CHROME_PATH if set.`);
  } finally { await browser?.close(); }
});
process.exitCode = failed ? 1 : 0;
