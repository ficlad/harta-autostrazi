// Construiește traseele reale, simplificate, pentru hartă → src/geo-lots.json (fișier mic, încărcat separat).
// Surse: data/raw/cestrin-geo.json (CESTRIN) și data/raw/osm.json (© OpenStreetMap contributors, ODbL).
//  - lot cu corespondent direct în CESTRIN (MAP din cestrin.mjs) → traseul CESTRIN
//  - altfel: bucățile de traseu din CESTRIN / OSM (șantier, propus) care cad pe linia schematică a lotului
//  - altfel: rămâne linia schematică din src/data.js
//  - rețeaua deschisă: CESTRIN „în folosință” + autostrăzile OSM care lipsesc din CESTRIN (tronsoane noi)
// Simplificare ~110 m (Douglas–Peucker) și coordonate cu 4 zecimale, ca pagina să rămână ușoară.
import fs from 'fs';
import { MAP } from './cestrin.mjs';

const ROOT = new URL('../', import.meta.url);
const rd = f => JSON.parse(fs.readFileSync(new URL(f, ROOT), 'utf8'));
const SEGMENTS = new Function(fs.readFileSync(new URL('src/data.js', ROOT), 'utf8') + '\nreturn SEGMENTS;')();
const CES = fs.existsSync(new URL('data/raw/cestrin-geo.json', ROOT)) ? rd('data/raw/cestrin-geo.json') : [];
const OSM = fs.existsSync(new URL('data/raw/osm.json', ROOT)) ? rd('data/raw/osm.json') : [];

const TOL = 0.0011;          // toleranța de simplificare, grade (~110 m)
const NEAR = 6;              // km: cât de departe de linia schematică poate fi traseul real
const KM = 111.32;

// ---- geometrie de bază (lon, lat)
const cosLat = 0.69; // cos(46°) — suficient pentru România
const dist = (a, b) => Math.hypot((a[0] - b[0]) * cosLat, a[1] - b[1]) * KM;
function proj(p, a, b) { // proiecția lui p pe segmentul ab: [t 0..1, distanța km]
  const ax = a[0] * cosLat, ay = a[1], bx = b[0] * cosLat, by = b[1], px = p[0] * cosLat, py = p[1];
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
  return [t, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)) * KM];
}
function onLine(p, S, cum) { // poziția normalizată de-a lungul polilinie S și distanța
  let best = [0, Infinity];
  for (let i = 0; i < S.length - 1; i++) {
    const [t, d] = proj(p, S[i], S[i + 1]);
    if (d < best[1]) best = [(cum[i] + t * (cum[i + 1] - cum[i])) / cum[cum.length - 1], d];
  }
  return best;
}
const cumOf = S => S.reduce((a, p, i) => (a.push(i ? a[i - 1] + dist(S[i - 1], p) : 0), a), []);
const lenOf = P => P.reduce((s, p, i) => s + (i ? dist(P[i - 1], p) : 0), 0);
function dp(P, tol) { // Douglas–Peucker
  if (P.length < 3) return P;
  const a = P[0], b = P[P.length - 1];
  let idx = 0, max = 0;
  for (let i = 1; i < P.length - 1; i++) {
    const ax = a[0], ay = a[1], dx = b[0] - ax, dy = b[1] - ay, L = dx * dx + dy * dy;
    let t = L ? ((P[i][0] - ax) * dx + (P[i][1] - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(P[i][0] - (ax + t * dx), P[i][1] - (ay + t * dy));
    if (d > max) { max = d; idx = i; }
  }
  if (max <= tol) return [a, b];
  return dp(P.slice(0, idx + 1), tol).slice(0, -1).concat(dp(P.slice(idx), tol));
}
const r4 = p => [Math.round(p[0] * 1e4) / 1e4, Math.round(p[1] * 1e4) / 1e4];
const finish = paths => paths.map(P => dp(P, TOL).map(r4)).filter(P => P.length >= 2);
const isLoop = P => P.length > 3 && dist(P[0], P[P.length - 1]) < 0.05;

// păstrează doar bucățile care cad pe linia schematică S, între capete
function clip(paths, S) {
  const cum = cumOf(S), out = [];
  for (const P of paths) {
    let cur = [];
    for (const p of P) {
      const [t, d] = onLine(p, S, cum);
      const ok = d <= NEAR && t > 0.0001 && t < 0.9999;
      if (ok) cur.push(p); else { if (cur.length > 1) out.push(cur); cur = []; }
    }
    if (cur.length > 1) out.push(cur);
  }
  return out;
}
// un obiect CESTRIN care acoperă mai multe loturi: fiecare punct merge la lotul cu linia schematică cea mai apropiată
function splitNearest(paths, id, group) {
  const segs = group.map(g => SEGMENTS.find(x => x.id === g)).filter(Boolean).map(x => ({ id: x.id, S: x.pts.map(([la, lo]) => [lo, la]) }));
  segs.forEach(x => (x.cum = cumOf(x.S)));
  const out = [];
  for (const P of paths) {
    let cur = [];
    for (const p of P) {
      let best = null, bd = Infinity;
      for (const x of segs) { const [t, d] = onLine(p, x.S, x.cum); const dd = d + (t <= 0.0001 || t >= 0.9999 ? 2 : 0); if (dd < bd) { bd = dd; best = x.id; } }
      if (best === id) cur.push(p); else { if (cur.length) { cur.push(p); out.push(cur); } cur = []; }
    }
    if (cur.length > 1) out.push(cur);
  }
  return out.filter(P => P.length > 1);
}
// elimină a doua cale de rulare (bucăți aproape suprapuse peste altele deja păstrate)
function dedupe(paths, kept = []) {
  const out = [], ref = kept.slice();
  for (const P of paths.slice().sort((a, b) => lenOf(b) - lenOf(a))) {
    const sample = P.filter((_, i) => i % Math.max(1, Math.floor(P.length / 8)) === 0);
    const near = sample.filter(p => ref.some(R => R.some((q, i) => i && proj(p, R[i - 1], q)[1] < 0.15))).length;
    if (near < sample.length * 0.6) { out.push(P); ref.push(P); }
  }
  return out;
}
function ends(paths, S) {
  const cum = cumOf(S); let lo = [2, null], hi = [-1, null];
  for (const P of paths) for (const p of P) { const [t] = onLine(p, S, cum); if (t < lo[0]) lo = [t, p]; if (t > hi[0]) hi = [t, p]; }
  return lo[1] && hi[1] ? [[lo[1][1], lo[1][0]], [hi[1][1], hi[1][0]]] : null;
}

// ---- surse
const cesById = Object.fromEntries(CES.map(f => [f.a.objectid, f]));
const cesOpen = CES.filter(f => /FOLOSINTA/.test(f.a.categorie_drum || '')).flatMap(f => f.paths).filter(P => !isLoop(P));
const cesOther = CES.filter(f => !/FOLOSINTA/.test(f.a.categorie_drum || '') && !/NODURI/.test((f.a.indicativ_drum || '') + (f.a.sectorul || ''))).flatMap(f => f.paths).filter(P => !isLoop(P));
const osmCons = OSM.filter(w => w.t.highway === 'construction').map(w => w.g);
const osmProp = OSM.filter(w => w.t.highway === 'proposed').map(w => w.g);
const osmOpen = OSM.filter(w => w.t.highway === 'motorway' || w.t.highway === 'trunk').map(w => w.g);
const direct = {};
for (const [oid, [ids]] of Object.entries(MAP)) for (const id of ids) (direct[id] ||= []).push(+oid);

const lots = {}, stat = { cestrin: 0, osm: 0, schematic: 0 };
for (const s of SEGMENTS) {
  const S = s.pts.map(([la, lo]) => [lo, la]);
  const want = lenOf(S);
  let got = null, src = '';
  // 1) CESTRIN direct (un obiect = un lot; dacă obiectul acoperă mai multe loturi, se taie pe schema lotului)
  const ids = direct[s.id] || [];
  const dpaths = ids.flatMap(o => (cesById[o] ? cesById[o].paths : [])).filter(P => !isLoop(P));
  if (dpaths.length) {
    const shared = ids.some(o => MAP[o][0].length > 1);
    const c = shared ? splitNearest(dpaths, s.id, ids.flatMap(o => MAP[o][0])) : dpaths;
    if (c.reduce((a, P) => a + lenOf(P), 0) > 0.3 * want) { got = c; src = 'cestrin'; }
  }
  // 2) OSM șantier, 3) alte trasee CESTRIN (licitație, pregătire), 4) OSM propus
  for (const [group, name] of [[osmCons, 'osm'], [cesOther, 'cestrin'], [osmProp, 'osm']]) {
    if (got) break;
    const c = dedupe(clip(group, S));
    if (c.reduce((a, P) => a + lenOf(P), 0) >= 0.5 * want) { got = c; src = name; }
  }
  if (!got) { stat.schematic++; continue; }
  const paths = finish(dedupe(got));
  if (!paths.length) { stat.schematic++; continue; }
  stat[src]++;
  lots[s.id] = { p: paths, e: ends(paths, S), s: src };
}

// rețeaua deschisă: CESTRIN + autostrăzile OSM noi (care nu se suprapun cu CESTRIN sau cu loturile)
const lotPaths = Object.values(lots).flatMap(l => l.p);
let open = finish(dedupe(cesOpen));
const extra = finish(dedupe(osmOpen.filter(P => lenOf(P) > 0.3), open.concat(lotPaths)));
open = open.concat(extra);

const out = { v: new Date().toISOString().slice(0, 10), lots, open };
const txt = JSON.stringify(out);
fs.writeFileSync(new URL('src/geo-lots.json', ROOT), txt);
console.log(`Trasee: ${stat.cestrin} din CESTRIN, ${stat.osm} din OSM, ${stat.schematic} schematice; rețea deschisă ${open.length} bucăți (+${extra.length} din OSM). ${Math.round(txt.length / 1024)} KB`);
