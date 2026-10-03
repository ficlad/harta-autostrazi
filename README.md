# Harta autostrăzi România

Hartă interactivă a tronsoanelor de autostradă și drum expres din România aflate **în execuție** sau **în licitare**, cu:

- cele mai recente filmări YouTube cu stadiul lucrărilor, pentru loturile în execuție;
- ultimele știri pentru fiecare lot;
- linkuri spre 130km.ro, CNAIR și CNIR.

Stadiile, lungimile și termenele sunt preluate din [130km.ro, Review Trim. III 2026](https://www.130km.ro/articol85.html). Traseele de pe hartă sunt schematice, aproximative.

## Cum funcționează

Site static, fără server și fără bază de date:

| Fișier | Rol |
|---|---|
| `index.html` | Pagina, generată de `scripts/build.mjs` (un singur fișier, ~150 KB) |
| `live.json` | Filmările și știrile pentru fiecare lot, actualizate automat |
| `src/data.js` | Loturile: stadiu, km, termen, traseu |
| `src/src.html` | Sursa paginii (HTML/CSS/JS, d3 din cdnjs) |
| `src/geo.json` | Contururi România și vecini (Natural Earth 1:10m, domeniu public) |
| `src/geo-lots.json` | Traseele reale simplificate (~40 KB), încărcate după afișarea hărții |
| `scripts/fetch-geometry.mjs` | Descarcă traseele din CESTRIN și OpenStreetMap (workflow săptămânal) |
| `scripts/build-geometry.mjs` | Potrivește traseele pe loturi și le simplifică |
| `scripts/update.mjs` | Caută pe YouTube (YouTube Data API) și în Google News RSS |
| `scripts/cestrin.mjs` | Stadiul fizic și financiar oficial din harta CESTRIN „Transparență” |
| `.github/workflows/update.yml` | Rulează actualizarea zilnic |

Fiecare lot are și un **grad de execuție** (`progress` în `live.json`). Valorile de bază sunt verificate manual; workflow-ul le păstrează și le actualizează doar când găsește într-o știre atribuită unui singur lot un procent de execuție cu dată mai nouă.

Actualizarea atribuie fiecare clip sau știre lotului de pe aceeași autostradă cu cele mai multe localități potrivite în titlu.

## Configurare (o singură dată)

1. **Cheia YouTube** (gratuită):
   - [console.cloud.google.com](https://console.cloud.google.com/) → creează un proiect
   - *APIs & Services → Library* → activează **YouTube Data API v3**
   - *APIs & Services → Credentials → Create credentials → API key*
   - (recomandat) restricționează cheia doar la YouTube Data API v3
2. În repo: **Settings → Secrets and variables → Actions → New repository secret**, nume `YT_API_KEY`, valoare = cheia.
3. **Settings → Pages**: *Source* = **Deploy from a branch**, *Branch* = `main`, folder `/ (root)`.
4. **Actions → Actualizare filmări și știri → Run workflow** pentru o primă rulare.

Fără cheie YouTube, workflow-ul actualizează doar știrile.

Cota gratuită YouTube e de 10.000 de unități pe zi; o rulare zilnică folosește ~4.800 (48 de loturi × 100), deci încape în cotă.

## Schimbarea stadiului unui lot

Când un lot trece din licitare în execuție, se deschide sau primește un termen nou: editează `src/data.js`, apoi rulează `node scripts/build.mjs` și fă commit. Pentru loturi noi, adaugă și cuvintele-cheie în `KW` din `scripts/update.mjs`.

## Licență

MIT

## Surse hartă

Trasee: CESTRIN „Transparență” și © OpenStreetMap contributors (ODbL). Fundal opțional: © Esri și furnizorii săi.
