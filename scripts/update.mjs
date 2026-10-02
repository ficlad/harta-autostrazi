// Actualizează live.json cu cele mai noi filmări YouTube și știri pentru fiecare lot.
// Rulează: YT_API_KEY=... node scripts/update.mjs   (Node 20+, fără dependențe)
//
// YouTube: YouTube Data API v3, search.list (100 unități/căutare; cota gratuită e 10.000/zi).
// Știri:   Google News RSS (fără cheie).
// Potrivire: fiecare rezultat e atribuit lotului (sau loturilor) de pe aceeași autostradă
// cu cele mai multe cuvinte-cheie găsite în titlu, ca un clip „Moțca – Leghin” să ajungă
// la Secț. III și nu la lotul 1 care doar pornește din Moțca.
import fs from 'fs';

const ROOT = new URL('../', import.meta.url);
const KEY = process.env.YT_API_KEY;
const VIDEO_DAYS = 60, NEWS_DAYS = 90, MAX_ITEMS = 3;

// ---- loturile, citite din src/data.js
const src = fs.readFileSync(new URL('src/data.js', ROOT), 'utf8');
const SEGMENTS = new Function(src + '\nreturn SEGMENTS;')();

// Variante de scriere pentru fiecare autostradă (titlurile folosesc forme diferite)
const ROAD = {
  A0: ['a0', 'centura bucuresti', 'autostrada de centura', 'centura capitalei'],
  DEx5A: ['dex5a', 'dex 5a', 'bacau - piatra neamt', 'bacau-piatra neamt', 'drum expres bacau', 'drumul expres bacau'],
  DEx6: ['dex6', 'dex 6', 'drum expres', 'drumul expres', 'drumul expres'],
  DEx16: ['dex16', 'dex 16', 'drum expres', 'drumul expres', 'arad-oradea', 'oradea-arad', 'arad - oradea', 'oradea - arad'],
};
// Cuvinte-cheie (localități / denumiri de lot) pentru fiecare lot
const KW = {
  'a0-l1': ['lot 1', 'lotul 1', 'dj601', 'dn1', 'chitila', 'corbeanca', 'buftea', 'mogosoaia'],
  'a0-l3': ['lot 3', 'lotul 3', 'afumati', 'cernica', 'pantelimon', 'dn2', 'dn3'],
  'a0-l4': ['lot 4', 'lotul 4', 'dn3', 'a2'],
  'a1-s2': ['boita', 'cornetu', 'lot 2', 'lotul 2', 'sectiunea 2', 'valea oltului', 'caineni'],
  'a1-s3': ['cornetu', 'tigveni', 'lot 3', 'lotul 3', 'sectiunea 3', 'tunel poiana', 'salatrucel'],
  'a1-s4': ['tigveni', 'curtea de arges', 'lot 4', 'lotul 4', 'sectiunea 4'],
  'a1-ld2': ['margina', 'holdea', 'lugoj-deva', 'lugoj - deva'],
  'a3-nm': ['nadaselu', 'mihaiesti'],
  'a3-via': ['viaduct', 'topa mica', 'mihaiesti'],
  'a3-mz': ['mihaiesti', 'zimbor'],
  'a3-pz': ['poarta salajului', 'zalau', 'meses'],
  'a3-zn': ['zalau', 'nusfalau'],
  'a3-sc': ['suplacu', 'chiribis', '3c1'],
  'a3-cb': ['chiribis', 'biharia', '3c2'],
  'a4-tech': ['techirghiol', 'olimp', 'alternativa'],
  'a6-l1': ['ghercesti', 'craiova nord', 'lot 1', 'lotul 1'],
  'a6-l2': ['craiova nord', 'beharca', 'lot 2', 'lotul 2'],
  'a6-l3': ['beharca', 'filiasi', 'lot 3', 'lotul 3'],
  'a6-l4': ['filiasi', 'bibesti', 'lot 4', 'lotul 4'],
  'a6-l5': ['bibesti', 'targu carbunesti', 'lot 5', 'lotul 5'],
  'a6-l6': ['targu carbunesti', 'targu jiu', 'lot 6', 'lotul 6'],
  'a7-bp1': ['saucesti', 'trifesti', 'filipesti', 'bacau - roman', 'bacau-roman', 'bacau - pascani', 'bacau-pascani', 'lot 1', 'lotul 1'],
  'a7-bp2': ['trifesti', 'gheraiesti', 'roman', 'bacau - pascani', 'bacau-pascani', 'lot 2', 'lotul 2'],
  'a7-bp3': ['mircesti', 'sabaoani', 'bacau - pascani', 'bacau-pascani', 'roman-pascani', 'roman - pascani', 'lot 3', 'lotul 3'],
  'a7-ps1': ['roscani', 'pascani-suceava', 'pascani - suceava', 'lot 1', 'lotul 1'],
  'a7-ps2': ['roscani', 'aeroport', 'suceava', 'pascani-suceava', 'pascani - suceava', 'lot 2', 'lotul 2'],
  'a7-ss1': ['suceava - siret', 'suceava-siret', 'darmanesti', 'lot 1', 'lotul 1'],
  'a7-ss2': ['suceava - siret', 'suceava-siret', 'darmanesti', 'balcauti', 'lot 2', 'lotul 2'],
  'a7-ss3': ['suceava - siret', 'suceava-siret', 'balcauti', 'vama siret', 'lot 3', 'lotul 3'],
  'a8-s1': ['targu mures', 'tg mures', 'tg. mures', 'miercurea nirajului', 'sectiunea 1', 's1'],
  'a8-1b': ['miercurea nirajului', 'sarateni', '1b'],
  'a8-1c': ['sarateni', 'joseni', '1c'],
  'a8-1d': ['joseni', 'ditrau', '1d'],
  'a8-2a': ['ditrau', 'grinties', '2a'],
  'a8-2b': ['grinties', 'pipirig', '2b'],
  'a8-3c': ['pipirig', 'leghin', 'vanatori', '3c'],
  'a8-s3': ['leghin', 'motca', 'targu neamt', 'tg neamt', 'agapia', 'sacalusesti'],
  'a8-l1': ['motca', 'targu frumos', 'tg frumos', 'lot 1', 'tronsonul 1'],
  'a8-l2': ['targu frumos', 'letcani', 'lot 2', 'tronsonul 2'],
  'a8-l3': ['letcani', 'iasi', 'lot 3', 'tronsonul 3'],
  'a8-l4': ['iasi', 'ungheni', 'lot 4', 'tronsonul 4'],
  'a8-pod': ['pod', 'prut', 'ungheni', 'zagarancea'],
  'a9-rj': ['remetea', 'jebel'],
  'a9-jm': ['jebel', 'moravita'],
  'a13-l1': ['boita', 'avrig', 'marsa', 'lot 1', 'lotul 1', 'tronsonul 1', 'trons. 1', 'tronsoanele 1', 'tronsoanelor 1', 'sibiu - fagaras', 'sibiu-fagaras', 'fagaras-sibiu', 'fagaras - sibiu'],
  'a13-l2': ['avrig', 'marsa', 'arpasu', 'lot 2', 'lotul 2', 'tronsonul 2', 'trons. 2', 'tronsoanele 2', 'tronsoanelor 2', 'sibiu - fagaras', 'sibiu-fagaras', 'fagaras-sibiu', 'fagaras - sibiu'],
  'a13-l3': ['arpasu', 'sambata', 'lot 3', 'lotul 3', 'tronsonul 3', 'trons. 3', 'tronsoanele 3', 'tronsoanelor 3', 'sibiu - fagaras', 'sibiu-fagaras', 'fagaras-sibiu', 'fagaras - sibiu'],
  'a13-l4': ['sambata', 'lot 4', 'lotul 4', 'tronsonul 4', 'trons. 4', 'tronsoanele 4', 'tronsoanelor 4', 'sibiu - fagaras', 'sibiu-fagaras', 'fagaras-sibiu', 'fagaras - sibiu'],
  'a14': ['oar', 'satu mare'],
  'dex5a': ['piatra neamt', 'bacau'],
  'dex6-bg': ['braila - galati', 'braila-galati', 'galati'],
  'dex6-l1': ['focsani', 'maicanesti', 'lot 1', 'lotul 1'],
  'dex6-l2': ['maicanesti', 'silistea', 'lot 2', 'lotul 2'],
  'dex6-l3': ['silistea', 'braila - focsani', 'focsani - braila', 'lot 3', 'lotul 3'],
  'dex16-l1': ['oradea', 'salonta', 'lot 1', 'lotul 1'],
  'dex16-l2': ['salonta', 'chisineu', 'lot 2', 'lotul 2'],
  'dex16-l3': ['chisineu', 'arad', 'lot 3', 'lotul 3'],
};
// Interogări de căutare (scurte, ca să nu ratăm rezultate)
const Q = {
  'a0-l1': 'A0 Nord lot 1', 'a0-l3': 'A0 Nord lot 3 Afumați', 'a0-l4': 'A0 Nord lot 4',
  'a3-via': 'A3 viaduct Topa Mică', 'a8-pod': 'pod Prut Ungheni autostrada A8',
  'dex6-bg': 'DEx6 Brăila Galați', 'dex5a': 'drum expres Bacău Piatra Neamț',
};

const NOROAD = new Set(['a8-pod']);
// Expresii care descriu tot traseul, nu un lot anume: contează doar jumătate
const GENERIC = new Set(['bacau - pascani', 'bacau-pascani', 'sibiu - fagaras', 'sibiu-fagaras', 'fagaras-sibiu', 'fagaras - sibiu', 'pascani-suceava', 'pascani - suceava', 'suceava - siret', 'suceava-siret', 'roman-pascani', 'roman - pascani']);
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/ş/g, 's').replace(/ţ/g, 't').replace(/[–—]/g, '-').replace(/\s+/g, ' ');
const has = (t, k) => new RegExp('(^|[^a-z0-9])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])').test(t);
const roadAliases = r => ROAD[r] || [r.toLowerCase()];
const endpoints = s => s.name.replace(/^\S+\s/, '').split(':').pop().split(/–|\/|\(|\)/).map(x => x.trim()).filter(x => x && !/^(DN|DJ)\d|lot|secț|drum expres|profil/i.test(x));
const query = s => Q[s.id] || `${s.road} ${endpoints(s).join(' ')}`;

// Scor = numărul de cuvinte-cheie ale lotului găsite în titlu (0 dacă lipsește autostrada).
function score(title, s) {
  const t = norm(title);
  const n = (KW[s.id] || []).filter(k => has(t, k)).reduce((a, k) => a + (GENERIC.has(k) ? 0.5 : 1), 0);
  // Podul de la Ungheni apare des fără „A8” în titlu: acceptat cu minim 2 cuvinte-cheie
  if (NOROAD.has(s.id)) return n >= 2 ? n : 0;
  if (!roadAliases(s.road).some(a => has(t, a))) return 0;
  return n;
}
// Atribuie fiecare rezultat loturilor de pe aceeași autostradă cu scor maxim.
function assign(items, titleOf) {
  const out = {};
  for (const it of items) {
    const sameRoad = SEGMENTS.filter(s => s.road === it.road);
    let best = 0, ids = [];
    for (const s of sameRoad) {
      const sc = score(titleOf(it), s);
      if (sc > best) { best = sc; ids = [s.id]; } else if (sc === best && sc > 0) ids.push(s.id);
    }
    if (best > 0 && ids.length <= 4) ids.forEach(id => (out[id] ||= []).push(it));
  }
  return out;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function ytSearch(s) {
  const after = new Date(Date.now() - VIDEO_DAYS * 864e5).toISOString();
  const u = new URL('https://www.googleapis.com/youtube/v3/search');
  Object.entries({ part: 'snippet', type: 'video', order: 'date', maxResults: '15', q: query(s), publishedAfter: after, relevanceLanguage: 'ro', regionCode: 'RO', key: KEY })
    .forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u);
  if (!r.ok) throw new Error(`YouTube ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return (j.items || []).map(i => ({
    road: s.road, v: i.id.videoId, t: decode(i.snippet.title), c: decode(i.snippet.channelTitle),
    h: '', d: i.snippet.publishedAt.slice(0, 10),
  }));
}

async function newsSearch(s) {
  const eps = endpoints(s).map(e => `"${e}"`).join(' OR ');
  const q = `${s.road === 'A0' ? 'A0 Nord' : s.road} (${eps}) when:${NEWS_DAYS}d`;
  const u = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=ro&gl=RO&ceid=RO:ro';
  const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0 harta-autostrazi' } });
  if (!r.ok) throw new Error(`Google News ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => {
    const g = tag => (m[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1] || '';
    const src = decode(g('source'));
    let t = decode(g('title'));
    if (src && t.endsWith(' - ' + src)) t = t.slice(0, -(src.length + 3));
    const d = new Date(g('pubDate'));
    return { road: s.road, u: decode(g('link')), t, s: src, d: isNaN(d) ? '' : d.toISOString().slice(0, 10) };
  });
}

const byDate = (a, b) => (b.d || '').localeCompare(a.d || '');
const uniq = (arr, key) => { const seen = new Set(); return arr.filter(x => !seen.has(x[key]) && seen.add(x[key])); };

// ---- grad de execuție din titlurile știrilor
// Ia procentul doar din titluri care vorbesc clar de stadiul lucrărilor („au ajuns la 78%”,
// „stadiu fizic de peste 70%”), niciodată din sume, costuri sau sondaje.
const P_CTX = /stadiu|execu[tț]|lucr[aă]ri|progres|ajuns|realizat|finalizat|construit/;
const P_NEG = /lei|euro|eur\b|buget|cost|pre[tț]|tarif|scump|inflat|sondaj|vot|dobând|taxa|tax[aă]/;
function extractProgress(title) {
  const t = norm(title);
  if (!P_CTX.test(t) || P_NEG.test(t)) return null;
  const m = t.match(/(?:(peste|aproape|sub|circa|cca\.?)\s+)?(\d{1,3}(?:[.,]\d{1,2})?)\s?%/);
  if (!m) return null;
  const p = parseFloat(m[2].replace(',', '.'));
  if (!(p > 0 && p <= 100)) return null;
  const q = m[1] === 'peste' || m[1] === 'aproape' || m[1] === 'sub' ? m[1] : (m[1] ? 'aproape' : '');
  return { p, q };
}

// ---- rulare
const livePath = new URL('live.json', ROOT);
const prev = fs.existsSync(livePath) ? JSON.parse(fs.readFileSync(livePath, 'utf8')) : { lots: {} };
const allVideos = [], allNews = [];
const errors = [];

for (const s of SEGMENTS) {
  if (s.status === 'c' && KEY) {
    try { allVideos.push(...await ytSearch(s)); } catch (e) { errors.push(`${s.id} video: ${e.message}`); }
  }
  try { allNews.push(...await newsSearch(s)); } catch (e) { errors.push(`${s.id} știri: ${e.message}`); }
  await sleep(400);
}

const vAssigned = assign(uniq(allVideos, 'v'), x => x.t);
const nAssigned = assign(uniq(allNews, 'u'), x => x.t);
const now = new Date().toISOString();
const lots = {};
let newV = 0, newN = 0, newP = 0;
// câte loturi a primit fiecare știre: procentul se ia doar din știrile atribuite unui singur lot
const nCount = {};
for (const arr of Object.values(nAssigned)) for (const n of arr) nCount[n.u] = (nCount[n.u] || 0) + 1;
for (const s of SEGMENTS) {
  const old = prev.lots?.[s.id] || {};
  const clean = ({ road, ...x }) => x;
  const vids = s.status === 'c'
    ? uniq([...(vAssigned[s.id] || []).map(clean), ...(old.videos || [])], 'v').sort(byDate).slice(0, MAX_ITEMS) : [];
  const news = uniq([...(nAssigned[s.id] || []).map(clean), ...(old.news || [])], 'u').sort(byDate).slice(0, MAX_ITEMS);
  newV += vids.filter(v => !(old.videos || []).some(o => o.v === v.v)).length;
  newN += news.filter(n => !(old.news || []).some(o => o.u === n.u)).length;
  // grad de execuție: păstrează valoarea existentă; o înlocuiește doar cu una din presă, cu dată mai nouă
  let progress = old.progress || null;
  if (s.status === 'c') {
    for (const n of (nAssigned[s.id] || []).filter(n => nCount[n.u] === 1).sort(byDate)) {
      const g = extractProgress(n.t);
      if (!g || !n.d) continue;
      if (!progress || !progress.d || n.d > progress.d) {
        progress = { p: g.p, q: g.q, faza: '', d: n.d, s: n.s || '', u: n.u };
        newP++;
      }
      break; // doar cea mai nouă știre cu procent
    }
  }
  lots[s.id] = { videos: vids, news, checkedAt: now, ...(progress ? { progress } : {}) };
}
fs.writeFileSync(livePath, JSON.stringify({ lastRun: now, summary: `${newV} filmări noi, ${newN} știri noi, ${newP} grade de execuție actualizate`, lots }, null, 1));
console.log(`Gata: ${newV} filmări noi, ${newN} știri noi, ${newP} grade de execuție actualizate.${KEY ? '' : ' (fără YT_API_KEY: doar știri)'}`);
if (errors.length) console.log('Erori:\n' + errors.join('\n'));
