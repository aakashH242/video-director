import {cpSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const skill = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = process.argv[2];
if (process.argv.length !== 3 || !destination) throw Error('Usage: node scripts/create-example.mjs NEW_PROJECT_FOLDER');
// mkdir without recursive is an atomic no-overwrite check, including empty folders/symlinks.
const project = resolve(destination);
mkdirSync(project);
cpSync(resolve(skill, 'assets/first-video'), project, {recursive: true, errorOnExist: true, force: false});
mkdirSync(resolve(project, 'tools'));
for (const file of ['capture.mjs', 'serve.mjs', 'media.mjs', 'verify.mjs', 'doctor.mjs']) {
  cpSync(resolve(skill, 'scripts', file), resolve(project, 'tools', file), {errorOnExist: true, force: false});
}
mkdirSync(resolve(project, 'output'));
console.log(`Created ${project}\nNext: cd into that folder, then npm ci, npm run browser:install, npm run doctor.\nSee references/first-video.md in the skill for the full walkthrough.`);
