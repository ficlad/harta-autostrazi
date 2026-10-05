// Tronsoane: status c = in executie, t = in licitare. Coordonate [lat, lon] aproximative (traseu schematic).
// Sursa stadiilor: 130km.ro, Review Trim. III 2026 (30.09.2026).
const P130 = r => 'https://www.130km.ro/' + r;
const SEGMENTS = [
// ---------- A0
{id:'a0-l1',road:'A0',name:'A0 Nord lot 1: DJ601 – DN1',status:'c',km:17.5,term:'2026',src:P130('a0.html'),pts:[[44.43,25.93],[44.50,25.96],[44.56,26.01],[44.59,26.05]]},
{id:'a0-l3',road:'A0',name:'A0 Nord lot 3: Afumați – Cernica (DN2–DN3)',status:'c',km:6.3,term:'~20 octombrie 2026',note:'Lotul are 8,6 km; 2,3 km sunt deja deschiși.',src:P130('a0.html'),pts:[[44.53,26.24],[44.49,26.27],[44.44,26.28]]},
{id:'a0-l4',road:'A0',name:'A0 Nord lot 4: DN3 – A2',status:'c',km:4.47,term:'~20 octombrie 2026 (odată cu lotul 3)',src:P130('a0.html'),pts:[[44.44,26.28],[44.40,26.27]]},
// ---------- A1
{id:'a1-s2',road:'A1',name:'A1 Sibiu–Pitești secț. 2: Boița – Cornetu',status:'c',km:31.3,term:'2030',note:'A1 Sibiu–Boița e închisă 5 oct. – 19 dec. 2026 pentru lucrări în nodul Boița.',src:P130('a1.html'),pts:[[45.63,24.26],[45.55,24.27],[45.48,24.28],[45.42,24.31]]},
{id:'a1-s3',road:'A1',name:'A1 Sibiu–Pitești secț. 3: Cornetu – Tigveni',status:'c',km:37.9,term:'2030',src:P130('a1.html'),pts:[[45.42,24.31],[45.35,24.38],[45.26,24.48],[45.17,24.58]]},
{id:'a1-s4',road:'A1',name:'A1 Sibiu–Pitești secț. 4: Tigveni – Curtea de Argeș',status:'c',km:9.9,term:'octombrie 2026',note:'Lucrări finalizate; deschiderea urmează după testele tunelului Momaia.',src:P130('a1.html'),pts:[[45.17,24.58],[45.14,24.68]]},
{id:'a1-ld2',road:'A1',name:'A1 Lugoj–Deva lot 2: Margina – Holdea',status:'c',km:13.5,term:'S1 2027',src:P130('a1.html'),pts:[[45.85,22.27],[45.88,22.35],[45.89,22.43]]},
// ---------- A3
{id:'a3-nm',road:'A3',name:'A3 Nădășelu – Mihăiești',status:'c',km:16.8,term:'2027',note:'Lucrări la 99,2%; deschiderea depinde de viaductele Mihăiești și Topa Mică.',src:P130('a3.html'),pts:[[46.84,23.36],[46.89,23.32],[46.93,23.29]]},
{id:'a3-via',road:'A3',name:'A3 Viaductele Mihăiești și Topa Mică',status:'c',km:3.2,term:'în execuție',note:'Proiect separat, inclus în traseul Nădășelu – Zimbor.',src:P130('a3.html'),pts:[[46.93,23.29],[46.95,23.285]]},
{id:'a3-mz',road:'A3',name:'A3 Mihăiești – Zimbor',status:'c',km:13.3,term:'2027',note:'Lucrări la 99,2%; deschiderea depinde de viaductele Mihăiești și Topa Mică.',src:P130('a3.html'),pts:[[46.95,23.285],[46.98,23.28],[47.00,23.27]]},
{id:'a3-pz',road:'A3',name:'A3 Poarta Sălajului – Zalău',status:'c',km:15.1,term:'2031',note:'Include tunelul Meseș (2,9 km).',src:P130('a3.html'),pts:[[47.07,23.20],[47.12,23.13],[47.17,23.06]]},
{id:'a3-zn',road:'A3',name:'A3 Zalău – Nușfalău',status:'c',km:25.8,term:'2031',src:P130('a3.html'),pts:[[47.17,23.06],[47.19,22.90],[47.20,22.70]]},
{id:'a3-sc',road:'A3',name:'A3 Suplacu de Barcău – Chiribiș',status:'c',km:26.4,term:'2026',note:'Deschidere estimată la 1 decembrie 2026.',src:P130('a3.html'),pts:[[47.25,22.52],[47.24,22.40],[47.22,22.22]]},
{id:'a3-cb',road:'A3',name:'A3 Chiribiș – Biharia',status:'c',km:28.9,term:'2027',src:P130('a3.html'),pts:[[47.22,22.22],[47.19,22.08],[47.15,21.92]]},
// ---------- A4
{id:'a4-tech',road:'A4',name:'A4 Alternativa Techirghiol: Constanța Sud – Olimp',status:'t',km:30.6,term:'în licitare',owner:'CNIR',src:P130('a4.html'),q:'autostrada A4 Alternativa Techirghiol licitatie',pts:[[44.10,28.60],[44.00,28.57],[43.92,28.58],[43.87,28.60]]},
// ---------- A6
{id:'a6-l1',road:'A6',name:'A6 lot 1: Ghercești (DEx12) – Craiova Nord',status:'t',km:10.3,term:'constructor desemnat, fără contract',owner:'CNAIR',src:P130('a6.html'),q:'autostrada Craiova Targu Jiu lot 1 Ghercesti contract',pts:[[44.38,23.92],[44.38,23.84],[44.37,23.79]]},
{id:'a6-l2',road:'A6',name:'A6 lot 2: Craiova Nord – Beharca',status:'t',km:14.4,term:'în licitare',owner:'CNAIR',src:P130('a6.html'),q:'autostrada Craiova Filiasi lot 2 licitatie',pts:[[44.37,23.79],[44.42,23.70],[44.45,23.64]]},
{id:'a6-l3',road:'A6',name:'A6 lot 3: Beharca – Filiași',status:'t',km:21.7,term:'în licitare',owner:'CNAIR',src:P130('a6.html'),q:'autostrada Craiova Filiasi lot 3 licitatie',pts:[[44.45,23.64],[44.50,23.57],[44.55,23.51]]},
{id:'a6-l4',road:'A6',name:'A6 lot 4: Filiași – Bibești (drum expres)',status:'t',km:22.9,term:'în licitare',owner:'CNAIR',src:P130('a6.html'),q:'drum expres Filiasi Targu Jiu lot 4 licitatie',pts:[[44.55,23.51],[44.65,23.48],[44.78,23.45]]},
{id:'a6-l5',road:'A6',name:'A6 lot 5: Bibești – Târgu Cărbunești (drum expres)',status:'t',km:21.5,term:'în licitare',owner:'CNAIR',src:P130('a6.html'),q:'drum expres Filiasi Targu Jiu lot 5 licitatie',pts:[[44.78,23.45],[44.87,23.49],[44.95,23.51]]},
{id:'a6-l6',road:'A6',name:'A6 lot 6: Târgu Cărbunești – Centura Târgu Jiu',status:'t',km:19.3,term:'câștigător desemnat, fără contract',owner:'CNAIR',src:P130('a6.html'),q:'drum expres Targu Carbunesti Targu Jiu lot 6',pts:[[44.95,23.51],[45.00,23.42],[45.03,23.33]]},
// ---------- A7
{id:'a7-bp1',road:'A7',name:'A7 Bacău–Pașcani lot 1: Săucești – Trifești',status:'c',km:30.3,term:'2027',src:P130('a7.html'),pts:[[46.62,26.93],[46.75,26.90],[46.87,26.86],[46.97,26.83]]},
{id:'a7-bp2',road:'A7',name:'A7 Bacău–Pașcani lot 2: Trifești – Gherăiești',status:'c',km:19.0,term:'2027',src:P130('a7.html'),pts:[[46.97,26.83],[47.02,26.87],[47.06,26.90]]},
{id:'a7-bp3',road:'A7',name:'A7 Bacău–Pașcani lot 3: Mircești – Pașcani',status:'c',km:28.1,term:'2027',src:P130('a7.html'),pts:[[47.06,26.90],[47.12,26.84],[47.19,26.77],[47.25,26.72]]},
{id:'a7-ps1',road:'A7',name:'A7 Pașcani–Suceava lot 1: Pașcani – Roșcani',status:'c',km:33.0,term:'2028',src:P130('a7.html'),pts:[[47.25,26.72],[47.35,26.62],[47.45,26.53]]},
{id:'a7-ps2',road:'A7',name:'A7 Pașcani–Suceava lot 2: Roșcani – Aeroport Suceava',status:'c',km:29.0,term:'2028',src:P130('a7.html'),pts:[[47.45,26.53],[47.57,26.42],[47.68,26.34]]},
{id:'a7-ss1',road:'A7',name:'A7 Suceava–Siret lot 1: Suceava – Dărmănești',status:'c',km:18.6,term:'2029',note:'Atribuirea a fost anulată în instanță.',src:P130('a7.html'),pts:[[47.68,26.34],[47.71,26.22],[47.75,26.15]]},
{id:'a7-ss2',road:'A7',name:'A7 Suceava–Siret lot 2: Dărmănești – Bălcăuți',status:'c',km:24.5,term:'2029',note:'Atribuirea a fost anulată în instanță.',src:P130('a7.html'),pts:[[47.75,26.15],[47.82,26.10],[47.89,26.08]]},
{id:'a7-ss3',road:'A7',name:'A7 Suceava–Siret lot 3: Bălcăuți – Vama Siret',status:'t',km:12.7,term:'în licitare',owner:'CNAIR',src:P130('a7.html'),q:'autostrada Suceava Siret lot 3 Balcauti licitatie',pts:[[47.89,26.08],[47.94,26.07],[47.98,26.06]]},
// ---------- A8
{id:'a8-s1',road:'A8',name:'A8 Secț. I: Târgu Mureș – Miercurea Nirajului',status:'c',km:24.4,term:'2027',src:P130('a8.html'),pts:[[46.55,24.60],[46.54,24.70],[46.53,24.80]]},
{id:'a8-1b',road:'A8',name:'A8 lot 1B: Miercurea Nirajului – Sărățeni',status:'c',km:23.4,term:'2027',src:P130('a8.html'),pts:[[46.53,24.80],[46.55,24.92],[46.58,25.01]]},
{id:'a8-1c',road:'A8',name:'A8 lot 1C: Sărățeni – Joseni',status:'c',km:32.4,term:'2030',src:P130('a8.html'),pts:[[46.58,25.01],[46.63,25.18],[46.67,25.35],[46.70,25.49]]},
{id:'a8-1d',road:'A8',name:'A8 lot 1D: Joseni – Ditrău',status:'c',km:14.4,term:'2028',src:P130('a8.html'),pts:[[46.70,25.49],[46.76,25.50],[46.82,25.51]]},
{id:'a8-2a',road:'A8',name:'A8 lot 2A: Ditrău – Grințieș',status:'c',km:null,term:'2029',src:P130('a8.html'),pts:[[46.82,25.51],[46.90,25.63],[46.98,25.75],[47.05,25.86]]},
{id:'a8-2b',road:'A8',name:'A8 lot 2B: Grințieș – Pipirig',status:'c',km:34.1,term:'2030',src:P130('a8.html'),pts:[[47.05,25.86],[47.13,25.96],[47.24,26.07]]},
{id:'a8-3c',road:'A8',name:'A8 lot 3C: Pipirig – Vânători Neamț / Leghin',status:'c',km:19.3,term:'2029',src:P130('a8.html'),pts:[[47.24,26.07],[47.23,26.15],[47.21,26.22]]},
{id:'a8-s3',road:'A8',name:'A8 Secț. III: Leghin – Târgu Neamț/Moțca',status:'c',km:29.9,term:'2028',note:'Se termină la Moțca, unde începe lotul 1 spre Târgu Frumos.',src:P130('a8.html'),pts:[[47.21,26.22],[47.20,26.36],[47.22,26.50],[47.24,26.62]]},
{id:'a8-l1',road:'A8',name:'A8 lot 1: Târgu Neamț/Moțca – Târgu Frumos',status:'c',km:27.0,term:'2030',src:P130('a8.html'),pts:[[47.24,26.62],[47.23,26.80],[47.21,27.00]]},
{id:'a8-l2',road:'A8',name:'A8 lot 2: Târgu Frumos – Lețcani (DN28)',status:'t',km:28.6,term:'în licitare',owner:'CNIR',src:P130('a8.html'),q:'autostrada A8 Targu Frumos Letcani lot 2 licitatie',pts:[[47.21,27.00],[47.20,27.20],[47.18,27.42]]},
{id:'a8-l3',road:'A8',name:'A8 lot 3: Lețcani (DN28) – Iași (DN24)',status:'c',km:17.7,term:'2030',note:'Contestație în anulare Concelex, termen la Curtea de Apel pe 7 oct. 2026.',src:P130('a8.html'),pts:[[47.18,27.42],[47.13,27.52],[47.12,27.63]]},
{id:'a8-l4',road:'A8',name:'A8 lot 4: Iași (DN24) – Vama/Pod Ungheni',status:'c',km:15.5,term:'2030',note:'Contract semnat în iulie 2026, suspendat în instanță; pronunțarea amânată la 6 oct. 2026.',src:P130('a8.html'),pts:[[47.12,27.63],[47.17,27.72],[47.21,27.78]]},
{id:'a8-pod',road:'A8',name:'A8 Pod peste Prut la Ungheni',status:'c',km:1.1,term:'2026',src:P130('a8.html'),pts:[[47.21,27.78],[47.21,27.80]]},
// ---------- A9
{id:'a9-rj',road:'A9',name:'A9 Remetea Mare – Jebel',status:'t',km:35.7,term:'în licitare',owner:'CNAIR',src:P130('a9.html'),q:'autostrada Timisoara Moravita Remetea Mare Jebel licitatie',pts:[[45.78,21.38],[45.68,21.33],[45.56,21.24]]},
{id:'a9-jm',road:'A9',name:'A9 Jebel – Moravița',status:'t',km:33.5,term:'constructor desemnat, fără contract',owner:'CNAIR',src:P130('a9.html'),q:'autostrada Jebel Moravita contract',pts:[[45.56,21.24],[45.42,21.25],[45.26,21.27]]},
// ---------- A13
{id:'a13-l1',road:'A13',name:'A13 Sibiu–Făgăraș lot 1: Boița – Avrig/Mârșa',status:'c',km:14.3,term:'2028',src:P130('a13.html'),pts:[[45.63,24.26],[45.68,24.33],[45.71,24.40]]},
{id:'a13-l2',road:'A13',name:'A13 Sibiu–Făgăraș lot 2: Avrig/Mârșa – Arpașu de Jos',status:'c',km:19.9,term:'2028',src:P130('a13.html'),pts:[[45.71,24.40],[45.75,24.52],[45.78,24.62]]},
{id:'a13-l3',road:'A13',name:'A13 Sibiu–Făgăraș lot 3: Arpașu de Jos – Sâmbăta de Sus',status:'c',km:17.6,term:'2028',src:P130('a13.html'),pts:[[45.78,24.62],[45.78,24.73],[45.77,24.82]]},
{id:'a13-l4',road:'A13',name:'A13 Sibiu–Făgăraș lot 4: Sâmbăta de Sus – Făgăraș',status:'c',km:16.3,term:'2028',src:P130('a13.html'),pts:[[45.77,24.82],[45.81,24.90],[45.84,24.97]]},
// ---------- A14
{id:'a14',road:'A14',name:'A14 Oar – Satu Mare (profil drum expres)',status:'c',km:10.8,term:'contract semnat',src:P130('a14.html'),pts:[[47.81,22.76],[47.80,22.83],[47.79,22.89]]},
// ---------- DEx
{id:'dex5a',road:'DEx5A',name:'DEx5A Bacău – Piatra Neamț',status:'t',km:51.0,term:'contestație respinsă definitiv (01.10.2026), ofertă în reevaluare',owner:'CNAIR',src:P130('dex5a.html'),q:'drum expres Bacau Piatra Neamt contestatie contract',pts:[[46.60,26.88],[46.70,26.70],[46.83,26.52],[46.93,26.38]]},
{id:'dex6-bg',road:'DEx6',name:'DEx6 Brăila – Galați',status:'c',km:12.3,term:'2026',src:P130('dxbrgl.html'),pts:[[45.29,27.97],[45.36,27.99],[45.43,28.01]]},
{id:'dex6-l1',road:'DEx6',name:'DEx6 lot 1: Focșani (A7) – Măicănești (DN23)',status:'c',km:28.2,term:'2029',src:P130('dxbrgl.html'),pts:[[45.68,27.17],[45.60,27.33],[45.50,27.50]]},
{id:'dex6-l2',road:'DEx6',name:'DEx6 lot 2: Măicănești – Siliștea (DJ221C)',status:'c',km:37.6,term:'2029',src:P130('dxbrgl.html'),pts:[[45.50,27.50],[45.41,27.68],[45.33,27.85]]},
{id:'dex6-l3',road:'DEx6',name:'DEx6 lot 3: Siliștea – Brăila (DEx6)',status:'c',km:7.7,term:'2029',src:P130('dxbrgl.html'),pts:[[45.33,27.85],[45.29,27.97]]},
{id:'dex16-l1',road:'DEx16',name:'DEx16 lot 1: Oradea – Salonta',status:'c',km:33.7,term:'2028',src:P130('dex16.html'),pts:[[47.01,21.93],[46.90,21.80],[46.80,21.66]]},
{id:'dex16-l2',road:'DEx16',name:'DEx16 lot 2: Salonta – Chișineu-Criș',status:'c',km:39.7,term:'2028',src:P130('dex16.html'),pts:[[46.80,21.66],[46.66,21.58],[46.52,21.52]]},
{id:'dex16-l3',road:'DEx16',name:'DEx16 lot 3: Chișineu-Criș – Arad',status:'c',km:47.1,term:'2028',src:P130('dex16.html'),pts:[[46.52,21.52],[46.36,21.42],[46.20,21.33]]},
];

// Rețea deschisă (context, schematic)
const OPEN = [
 ['A1',[[44.43,26.00],[44.60,25.55],[44.85,24.90],[45.14,24.68]]],
 ['A1',[[45.63,24.26],[45.75,24.15],[45.80,23.88],[45.95,23.57],[45.84,23.20],[45.87,22.90],[45.89,22.43]]],
 ['A1',[[45.85,22.27],[45.69,21.90],[45.73,21.25],[46.17,21.32],[46.16,20.75]]],
 ['A2',[[44.40,26.25],[44.35,26.90],[44.38,27.82],[44.33,28.03],[44.17,28.55]]],
 ['A3',[[44.52,26.10],[44.90,26.06]]],
 ['A3',[[45.61,25.48],[45.66,25.55]]],
 ['A3',[[46.54,24.56],[46.57,23.78],[46.75,23.38],[46.84,23.36]]],
 ['A3',[[47.00,23.27],[47.07,23.20]]],
 ['A3',[[47.20,22.70],[47.25,22.52]]],
 ['A3',[[47.15,21.92],[47.11,21.81]]],
 ['A4',[[44.25,28.52],[44.10,28.60]]],
 ['A6',[[45.69,21.90],[45.67,22.05]]],
 ['A7',[[44.93,26.08],[45.15,26.82],[45.38,27.05],[45.68,27.17],[46.10,27.17],[46.40,26.95],[46.62,26.93]]],
 ['A10',[[45.95,23.57],[46.07,23.58],[46.31,23.72],[46.57,23.78]]],
 ['DEx12',[[44.38,23.92],[44.43,24.36],[44.85,24.88]]],
 ['A0',[[44.43,25.93],[44.36,25.98],[44.33,26.10],[44.38,26.27],[44.40,26.27]]],
 ['A0',[[44.59,26.05],[44.57,26.15],[44.53,26.24]]],
 ['DEx16',[[47.11,21.81],[47.01,21.93]]],
];

const CITIES = [
 ['București',44.43,26.10,1],['Cluj-Napoca',46.77,23.60,1],['Iași',47.16,27.59,1],['Timișoara',45.75,21.23,1],['Constanța',44.18,28.63,1],
 ['Brașov',45.65,25.60,1],['Craiova',44.32,23.80,1],['Sibiu',45.79,24.15,1],['Oradea',47.06,21.93,1],['Suceava',47.65,26.26,1],
 ['Bacău',46.57,26.91,2],['Pitești',44.86,24.87,2],['Arad',46.18,21.31,2],['Târgu Mureș',46.54,24.56,2],['Ploiești',44.94,26.02,2],
 ['Galați',45.43,28.05,2],['Brăila',45.27,27.96,2],['Focșani',45.70,27.18,2],['Zalău',47.19,23.06,2],['Piatra Neamț',46.93,26.37,2],
 ['Satu Mare',47.79,22.89,2],['Deva',45.88,22.90,2],['Târgu Jiu',45.04,23.27,2],['Făgăraș',45.84,24.97,2],['Pașcani',47.25,26.72,2],['Siret',47.95,26.07,2],['Ungheni',47.21,27.80,2],['Roman',46.92,26.93,2],
];
