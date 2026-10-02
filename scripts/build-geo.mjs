import fs from 'fs';
import {feature, mesh} from 'topojson-client';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const ids = {'642':'RO','498':'MD','804':'UA','348':'HU','688':'RS','100':'BG'};
const fc = feature(topo, topo.objects.countries);
const r = a => Array.isArray(a[0]) ? a.map(r) : [Math.round(a[0]*1000)/1000, Math.round(a[1]*1000)/1000];
const out = fc.features.filter(f => ids[f.id]).map(f => ({type:'Feature', properties:{c:ids[f.id]}, geometry:{type:f.geometry.type, coordinates:r(f.geometry.coordinates)}}));
fs.writeFileSync('geo.json', JSON.stringify({type:'FeatureCollection', features: out}));
console.log(fs.statSync('geo.json').size);
