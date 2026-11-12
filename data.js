// So'zlar bazasi: vocab.json + words-extra.js. Har so'z: [nemischa, o'zbekcha, misol, mavzu]
import {X} from './words-extra.js';
export let V = {A1: [['das Wasser','Suv','Ich trinke Wasser.'],['das Brot','Non','Das Brot ist frisch.'],['das Haus','Uy','Das Haus ist groß.']]};
function merge() {
  for (const line of X.trim().split('\n')) {
    const [lv, th, items] = line.split('|'); V[lv] = V[lv] || [];
    const have = new Set(V[lv].map(w => w[0]));
    items.split(';').forEach(p => { const i = p.indexOf('='), de = p.slice(0, i).trim(), uz = p.slice(i + 1).trim(); if (de && uz && !have.has(de)) { V[lv].push([de, uz, '', th]); have.add(de); } });
  }
}
export const ready = fetch('vocab.json').then(r => r.json()).then(j => { V = j; }).catch(() => {}).then(merge);
