// Descarcă traseele reale ale autostrăzilor și drumurilor expres:
//  - CESTRIN „Transparență” (loturi în execuție/licitare/pregătire și rețeaua în folosință)
//  - OpenStreetMap prin Overpass (autostrăzi, șantiere, trasee propuse) — © OpenStreetMap contributors (ODbL)
// Scrie data/raw/cestrin-geo.json și data/raw/osm.json. Rulează: node scripts/fetch-geometry.mjs
import fs from 'fs';

const ROOT = new URL('../', import.meta.url);
fs.mkdirSync(new URL('data/raw/', ROOT), { recursive: true });

async function cestrin() {
  const base = 'https://utility.arcgis.com/usrsvcs/servers/a55600f1d1aa482ab17fa5f0691587b4/rest/services/ProgramConstructie/FeatureServer/0/query';
  const where = "categorie_drum LIKE 'AUTOSTRAZI%' OR categorie_drum LIKE 'DRUM%EXPRES%' OR categorie_drum LIKE 'DRUMURI DE MARE%'";
  const u = `${base}?where=${encodeURIComponent(where)}&outFields=objectid,categorie_drum,indicativ_drum,sectorul,lotul,an_deschidere,lungime_km&returnGeometry=true&outSR=4326&maxAllowableOffset=0.0002&geometryPrecision=5&f=json&resultRecordCount=2000`;
  const r = await fetch(u, { headers: { Referer: 'https://cestrin.maps.arcgis.com/', 'User-Agent': 'Mozilla/5.0 harta-autostrazi' } });
  const j = await r.json();
  if (j.error) throw new Error('CESTRIN ' + JSON.stringify(j.error));
  const out = j.features.map(f => ({ a: f.attributes, paths: f.geometry ? f.geometry.paths : [] }));
  fs.writeFileSync(new URL('data/raw/cestrin-geo.json', ROOT), JSON.stringify(out));
  console.log('CESTRIN:', out.length, 'obiecte');
}

async function osm() {
  const q = `[out:json][timeout:240];
area["ISO3166-1"="RO"][admin_level=2]->.ro;
(
  way["highway"="motorway"](area.ro);
  way["highway"="trunk"]["motorroad"="yes"](area.ro);
  way["highway"="construction"]["construction"~"^(motorway|trunk)$"](area.ro);
  way["highway"="proposed"]["proposed"~"^(motorway|trunk)$"](area.ro);
);
out tags geom qt;`;
  const eps = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  let last;
  for (const ep of eps) {
    try {
      const r = await fetch(ep, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'harta-autostrazi (github.com/ficlad/harta-autostrazi)' } });
      if (!r.ok) throw new Error(ep + ' ' + r.status);
      const j = await r.json();
      const out = j.elements.filter(e => e.type === 'way' && e.geometry).map(e => ({
        id: e.id,
        t: (({ highway, construction, proposed, ref, name, motorroad }) => ({ highway, construction, proposed, ref, name, motorroad }))(e.tags || {}),
        g: e.geometry.map(p => [Math.round(p.lon * 1e5) / 1e5, Math.round(p.lat * 1e5) / 1e5]),
      }));
      fs.writeFileSync(new URL('data/raw/osm.json', ROOT), JSON.stringify(out));
      console.log('OSM:', out.length, 'segmente de la', ep);
      return;
    } catch (e) { last = e; console.log('Overpass eșuat:', e.message); }
  }
  throw last;
}

async function overpass(q) {
  const eps = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  let last;
  for (const ep of eps) {
    try {
      const r = await fetch(ep, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'harta-autostrazi (github.com/ficlad/harta-autostrazi)' } });
      if (!r.ok) throw new Error(ep + ' ' + r.status);
      return await r.json();
    } catch (e) { last = e; console.log('Overpass eșuat:', e.message); }
  }
  throw last;
}

// Noduri rutiere: bretelele (motorway_link / trunk_link, inclusiv în șantier sau propuse), punctele de ieșire
// și drumurile de care se leagă bretelele → data/raw/junctions.json
async function junctions() {
  const j = await overpass(`[out:json][timeout:300];
area["ISO3166-1"="RO"][admin_level=2]->.ro;
(
  way["highway"~"^(motorway_link|trunk_link)$"](area.ro);
  way["highway"="construction"]["construction"~"^(motorway_link|trunk_link)$"](area.ro);
  way["highway"="proposed"]["proposed"~"^(motorway_link|trunk_link)$"](area.ro);
)->.l;
.l out body geom qt;
node(w.l)->.n;
node.n["highway"="motorway_junction"];
out body qt;
way(bn.n)->.w;
(.w; - .l;);
out body qt;`);
  const tg = t => (({ highway, construction, proposed, ref, name, motorroad, destination, 'destination:ref': dref }) => ({ highway, construction, proposed, ref, name, motorroad, destination, dref }))(t || {});
  const out = { links: [], exits: [], roads: [] };
  for (const e of j.elements) {
    if (e.type === 'node') out.exits.push({ id: e.id, p: [Math.round(e.lon * 1e5) / 1e5, Math.round(e.lat * 1e5) / 1e5], name: e.tags && e.tags.name, ref: e.tags && e.tags.ref });
    else if (e.type === 'way' && e.geometry) out.links.push({ n: e.nodes, t: tg(e.tags), g: e.geometry.map(p => [Math.round(p.lon * 1e5) / 1e5, Math.round(p.lat * 1e5) / 1e5]) });
    else if (e.type === 'way') out.roads.push({ n: e.nodes, t: tg(e.tags) });
  }
  // din drumuri păstrăm doar nodurile comune cu bretelele (fișier mic)
  const ln = new Set(out.links.flatMap(l => l.n));
  out.roads = out.roads.map(r => ({ n: r.n.filter(x => ln.has(x)), t: r.t })).filter(r => r.n.length);
  fs.writeFileSync(new URL('data/raw/junctions.json', ROOT), JSON.stringify(out));
  console.log('Noduri:', out.links.length, 'bretele,', out.exits.length, 'ieșiri,', out.roads.length, 'drumuri legate');
}

let ok = true;
try { await cestrin(); } catch (e) { ok = false; console.log('Eroare CESTRIN:', e.message); }
try { await osm(); } catch (e) { ok = false; console.log('Eroare OSM:', e.message); }
try { await junctions(); } catch (e) { ok = false; console.log('Eroare noduri:', e.message); }
if (!ok) process.exitCode = 1;
