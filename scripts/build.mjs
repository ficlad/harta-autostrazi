// Construiește index.html (fișier unic) din src/. Rulează: node scripts/build.mjs
import fs from 'fs';
const rd = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
let h = rd('src/src.html');
// Rezervă: filmările din live.json sunt incluse și în pagină, ca să apară chiar dacă live.json nu se încarcă.
let fallback = {};
try { const j = JSON.parse(rd('live.json')); for (const [id, b] of Object.entries(j.lots || {})) if (b.videos?.length) fallback[id] = b.videos; } catch {}
h = h.replace('/*__GEO__*/', 'const GEO = ' + rd('src/geo.json') + ';')
     .replace('/*__DATA__*/', rd('src/data.js'))
     .replace('/*__VIDEOS__*/', 'const VIDEOS = ' + JSON.stringify(fallback) + ';\nconst LIVE_JSON = "live.json";');
const doc = '<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  + '<meta name="description" content="Hartă interactivă a autostrăzilor din România în construcție și în licitare, cu filmări YouTube și știri actualizate automat.">'
  + '<style>html,body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>' + h + '</body></html>';
fs.writeFileSync(new URL('../index.html', import.meta.url), doc);
console.log('index.html', doc.length, 'bytes');
