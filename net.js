// Tarmoq qatlami: Firebase (do'stlar bilan) yoki mahalliy (bot bilan). Boshqa fayllar faqat shu funksiyalarni ishlatadi.
import {FB} from './firebase-config.js';
export const online = !!(FB && FB.apiKey && FB.databaseURL);
const V_ = '10.12.2', L = {}, subs = {};
let fb = null, off = 0, local = false;
export const setLocal = l => { local = !!l || !online; return local; };
export const now = () => Date.now() + off;
async function init() {
  if (fb) return fb;
  const A = await import(`https://www.gstatic.com/firebasejs/${V_}/firebase-app.js`), D = await import(`https://www.gstatic.com/firebasejs/${V_}/firebase-database.js`);
  const db = D.getDatabase(A.initializeApp(FB));
  D.onValue(D.ref(db, '.info/serverTimeOffset'), s => { off = s.val() || 0; });
  return fb = {D, db};
}
const setPath = (o, p, v) => { const k = p.split('/'); let c = o; k.slice(0, -1).forEach(x => c = c[x] = c[x] || {}); v === null ? delete c[k.pop()] : c[k[k.length - 1]] = v; };
const newCode = () => Array.from({length: 4}, () => 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.random() * 23 | 0]).join('');
export async function create(room) {
  if (local) { const c = newCode(); L[c] = room; return c; }
  const {D, db} = await init();
  for (let i = 0; i < 6; i++) { const c = newCode(), r = D.ref(db, 'rooms/' + c); if (!(await D.get(r)).exists()) { await D.set(r, room); return c; } }
  throw new Error('Xona yaratib bo‘lmadi');
}
export async function join(c, me) {
  if (local) return;
  const {D, db} = await init(), s = await D.get(D.ref(db, 'rooms/' + c));
  if (!s.exists()) throw new Error('Bunday xona topilmadi');
  if (s.val().status !== 'lobby') throw new Error('O‘yin allaqachon boshlangan');
  await D.update(D.ref(db, 'rooms/' + c), {['players/' + me.id]: me});
}
export function watch(c, cb) {
  if (local) { subs[c] = cb; cb(L[c]); return () => { delete subs[c]; }; }
  let un = () => {}, dead = false;
  init().then(({D, db}) => { if (!dead) un = D.onValue(D.ref(db, 'rooms/' + c), s => cb(s.val())); });
  return () => { dead = true; un(); };
}
export async function patch(c, obj) {
  if (local) { for (const k in obj) setPath(L[c], k, obj[k]); subs[c] && subs[c](L[c]); return; }
  const {D, db} = await init(); await D.update(D.ref(db, 'rooms/' + c), obj);
}
