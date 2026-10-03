// Stadiul fizic și financiar din harta oficială CESTRIN „Transparență”
// (https://cestrin.maps.arcgis.com/apps/webappviewer/index.html?id=210f9dcdbeaf48349e3ed19e92ee2f19).
// Serviciul ArcGIS răspunde doar cererilor care vin „de pe” harta CESTRIN, de aceea trimitem antetul Referer.
//
// Reguli (conservatoare, ca să nu stricăm date bune din presă):
//  - stadiul financiar (f) se ia întotdeauna din CESTRIN, dacă rândul nu pare învechit;
//  - stadiul fizic (p) se ia din CESTRIN dacă lotul nu are procent sau dacă valoarea CESTRIN e ≥ cea existentă
//    (progresul nu scade; unele rânduri CESTRIN rămân în urmă față de presă);
//  - un rând cu fizic mult sub valoarea existentă (> 10 puncte) e considerat neactualizat și e ignorat complet;
//  - 0% la fizic nu înlocuiește o fază descrisă în text (ex. „proiectare”, „fără ordin de începere”).

export const CESTRIN_URL = 'https://cestrin.maps.arcgis.com/apps/webappviewer/index.html?id=210f9dcdbeaf48349e3ed19e92ee2f19';
const SERVICE = 'https://utility.arcgis.com/usrsvcs/servers/a55600f1d1aa482ab17fa5f0691587b4/rest/services/ProgramConstructie/FeatureServer/0/query';

// objectid CESTRIN → loturile hărții, plus un cuvânt care trebuie să apară în descrierea rândului (verificare)
export const MAP = {
  31: [['a8-pod'], 'UNGHENI'],
  8218: [['a1-s2'], 'CORNETU'],
  8240: [['a14'], 'OAR'],
  8247: [['a0-l4'], 'LOT 4'],
  8251: [['a13-l4'], 'TRONSON 4'],
  8256: [['a13-l1'], 'TRONSON 1'],
  8257: [['a13-l2'], 'TRONSON 2'],
  8267: [['a3-cb'], 'BIHARIA'],
  8271: [['a3-sc'], 'SUPLAC'],
  8274: [['a13-l3'], 'TRONSON 3'],
  8281: [['a3-nm', 'a3-mz'], 'ZIMBOR'],
  8290: [['a0-l1'], 'LOT 1'],
  8294: [['a1-s3'], 'TIGVENI'],
  8332: [['a7-bp2'], 'TRIFESTI'],
  8349: [['a7-bp1'], 'SAUCESTI'],
  8355: [['a7-ps1'], 'PASCANI'],
  8358: [['a0-l3'], 'LOT 3'],
  8388: [['a1-ld2'], 'MARGINA'],
  8407: [['dex6-bg'], 'GALATI'],
  8413: [['a7-bp3'], 'MIRCESTI'],
  9652: [['dex16-l3'], 'LOT 3'],
  10483: [['a8-s1'], 'NIRAJULUI'],
  10506: [['a8-s3'], 'LEGHIN'],
  11313: [['a3-via'], 'NADASELU'],
  12127: [['dex16-l1'], 'LOT 1'],
  12129: [['dex16-l2'], 'LOT 2'],
  12134: [['a3-pz', 'a3-zn'], 'ZALAU'],
  13743: [['a7-ps2'], 'SUCEAVA'],
};

export async function fetchCestrin() {
  const u = SERVICE + '?where=1%3D1&outFields=objectid,indicativ_drum,sectorul,lotul,stadiu_actual_fizic,stadiu_actual_financiar,last_edit_date&returnGeometry=false&f=json&resultRecordCount=2000';
  const r = await fetch(u, { headers: { Referer: 'https://cestrin.maps.arcgis.com/', 'User-Agent': 'Mozilla/5.0 harta-autostrazi' } });
  const j = await r.json();
  if (j.error) throw new Error(`CESTRIN ${j.error.code}: ${j.error.message}`);
  return j;
}

// „12.14%” → 12.14; texte cu mai multe valori: „60.66% (STADIU FIZIC…)” / „FARA ACTUALIZARE 41.92%”
export function pct(s, kind) {
  if (s == null) return null;
  const t = String(s).toUpperCase().replace(/\s+/g, ' ').trim();
  const all = [...t.matchAll(/(\d{1,3}(?:[.,]\d{1,2})?)\s?%/g)].map(m => parseFloat(m[1].replace(',', '.')));
  if (!all.length) return null;
  if (all.length === 1) return all[0] <= 100 ? all[0] : null;
  if (kind === 'fizic') { const m = t.match(/(\d{1,3}(?:[.,]\d{1,2})?)\s?%\s*\(STADIU FIZIC/); return m ? parseFloat(m[1].replace(',', '.')) : null; }
  if (kind === 'fin') { const m = t.match(/FARA ACTUALIZARE\s*(\d{1,3}(?:[.,]\d{1,2})?)\s?%/); return m ? parseFloat(m[1].replace(',', '.')) : null; }
  return null;
}

const round = x => Math.round(x * 100) / 100;

// Aplică datele CESTRIN peste obiectele progress existente. lots: { id: { progress } }. Întoarce lista schimbărilor.
export function applyCestrin(lots, json) {
  const changes = [];
  for (const f of json.features || []) {
    const a = f.attributes || {};
    const m = MAP[a.objectid];
    if (!m) continue;
    const [ids, check] = m;
    const desc = [a.indicativ_drum, a.sectorul, a.lotul].join(' ').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!desc.includes(check)) { changes.push(`! CESTRIN ${a.objectid}: descrierea nu mai conține „${check}”, ignorat`); continue; }
    const fiz = pct(a.stadiu_actual_fizic, 'fizic');
    const fin = pct(a.stadiu_actual_financiar, 'fin');
    const d = a.last_edit_date ? new Date(a.last_edit_date).toISOString().slice(0, 10) : '';
    for (const id of ids) {
      const lot = (lots[id] ||= { videos: [], news: [] });
      const old = lot.progress || null;
      const g = old ? { ...old } : { p: null, q: '', faza: '', d: '', s: '', u: '' };
      if (fiz != null && g.p != null && fiz < g.p - 10) { changes.push(`~ ${id}: CESTRIN ${fiz}% fizic e mult sub ${g.p}% (presă), rând ignorat`); continue; }
      let changed = false;
      if (fiz != null && fiz > 0 && (g.p == null || fiz >= g.p) && fiz !== g.p) {
        changes.push(`${id}: fizic ${g.p == null ? (g.faza || '–') : g.p + '%'} → ${fiz}%`);
        Object.assign(g, { p: round(fiz), q: '', faza: '', d, s: 'CESTRIN', u: CESTRIN_URL }); changed = true;
      }
      if (fin != null && (fin > 0 || g.p === 0 || fiz === 0) && fin !== g.f) {
        changes.push(`${id}: financiar ${g.f == null ? '–' : g.f + '%'} → ${fin}%`);
        Object.assign(g, { f: round(fin), fd: d, fs: 'CESTRIN', fu: CESTRIN_URL }); changed = true;
      }
      if (changed) lot.progress = g;
    }
  }
  return changes;
}

// Rulare directă: node scripts/cestrin.mjs [fișier.json]  → aplică pe live.json (din fișier sau de pe server)
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('fs');
  const path = new URL('../live.json', import.meta.url);
  const live = JSON.parse(fs.readFileSync(path, 'utf8'));
  const json = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : await fetchCestrin();
  const ch = applyCestrin(live.lots, json);
  fs.writeFileSync(path, JSON.stringify(live, null, 1));
  console.log(ch.join('\n') || 'Nicio schimbare.');
}
