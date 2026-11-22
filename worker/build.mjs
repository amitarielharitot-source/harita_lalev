import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const page = readFileSync('dist/index.html', 'utf8').replaceAll('חריטה לבית', 'חריטה ללב');
const worker = readFileSync('worker/index.mjs', 'utf8');
const media = {};
for (const [name, type] of [['launch.jpg','image/jpeg'], ['materials.mp4','video/mp4']]) {
  const bytes = readFileSync('worker/media/' + name);
  media['/campaign/' + name] = {type, size:bytes.length, data:bytes.toString('base64')};
}
mkdirSync('dist/server', {recursive:true});
writeFileSync('dist/server/index.js', 'const PAGE = ' + JSON.stringify(page) + ';\nconst MEDIA = ' + JSON.stringify(media) + ';\n' + worker);
