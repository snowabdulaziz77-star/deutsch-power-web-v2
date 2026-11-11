// O'yin markazi: xona yaratish, kod bilan kirish, lobbi, taklif. O'yinlar ro'yxati GAMES ichida.
import {S} from './store.js';
import * as net from './net.js';
import {duel} from './duel.js';
import {esc, hap, toast} from './ui.js';

const tg = window.Telegram && window.Telegram.WebApp;
const GAMES = [duel];
const SOON = [['🔍', 'Wortjagd'], ['🧩', 'Artikl poygasi'], ['🃏', 'Juftlik jangi'], ['🔀', 'Harflar aralashmasi'], ['🎧', 'Eshitib top'], ['⛓️', 'So‘z zanjiri'], ['🏁', 'Omon qolish turniri'], ['🪢', 'Jamoa arqon tortish']];
const uid = (() => { const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user; if (u) return 'tg' + u.id; try { let x = localStorage.getItem('dp_uid'); if (!x) localStorage.setItem('dp_uid', x = 'u' + Math.random().toString(36).slice(2, 10)); return x; } catch (e) { return 'u' + Math.random().toString(36).slice(2, 10); } })();
const me = {id: uid, name: ((tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.first_name) || 'O‘yinchi').slice(0, 14)};
let R = null, root = null, tmr = null, urlRoom = new URLSearchParams(location.search).get('room');

export function render(el) { root = el; if (urlRoom) { const c = urlRoom; urlRoom = null; return joinRoom(c); } R ? view() : hub(); }

function hub() {
  clearInterval(tmr); root.onclick = null;
  root.innerHTML = `<div class="pop"><div class="top"><h1 class="grow" style="font-size:24px">O‘yin markazi</h1><div class="pill">🎓 ${S.level}</div></div>
  <div class="card hero"><h2 style="margin:0 0 4px">${duel.ic} ${duel.name}</h2><p class="mute" style="margin-bottom:12px">${duel.desc} 1–8 o‘yinchi</p>
  <button class="btn" data-a="create">➕ XONA YARATISH</button>
  <div class="row" style="margin-top:10px"><input class="date" id="rc" maxlength="4" placeholder="Xona kodi" style="text-transform:uppercase;text-align:center;letter-spacing:4px;font-weight:800"><button class="btn" style="width:auto;background:#fff;color:var(--pri-d)" data-a="join">KIRISH</button></div>
  <button class="btn" style="margin-top:10px;background:rgba(255,255,255,.2);box-shadow:none" data-a="solo">🤖 Yolg‘iz mashq (Brezel bilan)</button></div>
  ${net.online ? '' : '<div class="card mute">ℹ️ Do‘stlar bilan o‘ynash uchun Firebase sozlanishi kerak (firebase-config.js). Hozircha faqat yolg‘iz mashq ishlaydi.</div>'}
  <h2>Tez kunda</h2><div class="chips" style="flex-wrap:wrap">${SOON.map(s => `<span class="chip" style="cursor:default">${s[0]} ${s[1]}</span>`).join('')}</div></div>`;
  root.onclick = async e => { const b = e.target.closest('[data-a]'); if (!b) return; hap();
    try { if (b.dataset.a === 'create') await createRoom(false); else if (b.dataset.a === 'solo') await createRoom(true);
      else { const c = document.getElementById('rc').value.trim().toUpperCase(); if (c.length === 4) await joinRoom(c); else toast('4 harfli kodni yozing'); } } catch (er) { toast(er.message); } };
}

async function createRoom(solo) {
  net.setLocal(solo); duel.reset();
  const room = {game: 'duel', level: S.level, status: 'lobby', host: me.id, ...duel.init(), players: {[me.id]: me}};
  if (solo) room.players.bot = {id: 'bot', name: 'Brezel 🥨'};
  const code = await net.create(room); enter(code, solo);
}
async function joinRoom(code) { net.setLocal(false); if (!net.online) return toast('Do‘stlar rejimi sozlanmagan'); duel.reset(); await net.join(code, me); enter(code, false); }

function enter(code, local) {
  R = {code, local, room: null};
  R.un = net.watch(code, r => { R.room = r; if (!r) { leave(); toast('Xona yopildi'); } else view(); });
  clearInterval(tmr); tmr = setInterval(() => { if (R && R.room && R.room.status === 'play') duel.draw(root, R.room, ctx()); }, 200);
}
const ctx = () => ({me, code: R.code, local: R.local});
function leave() { if (!R) return; try { R.un(); } catch (e) {} if (!R.local && R.room && R.room.status === 'lobby') net.patch(R.code, {['players/' + me.id]: null}); R = null; clearInterval(tmr); hub(); }

function view() {
  const r = R.room; if (!r) return;
  if (r.status === 'play') { duel.draw(root, r, ctx()); root.onclick = root.onclick || null; return wireExit(); }
  const pl = Object.values(r.players || {}), host = r.host === me.id;
  root.innerHTML = `<div class="pop"><div class="card" style="text-align:center"><div class="mute">Xona kodi</div><div class="code">${esc(R.code)}</div>
  ${R.local ? '' : '<button class="btn sm" data-a="share">📨 Do‘stlarni taklif qilish</button>'}</div>
  <div class="card"><b>O‘yinchilar (${pl.length})</b>${pl.map(p => `<div class="q"><div class="ic" style="background:var(--pri);color:#fff;font-weight:800">${esc(p.name[0] || '?')}</div><div class="grow" style="font-weight:800">${esc(p.name)}${p.id === r.host ? ' 👑' : ''}</div></div>`).join('')}</div>
  ${host ? '<button class="btn ok" data-a="start">⚔️ BOSHLASH</button>' : '<p class="mute" style="text-align:center">Boshlovchi o‘yinni boshlashini kuting…</p>'}
  <button class="btn" style="margin-top:12px;background:var(--line);color:var(--ink);box-shadow:none" data-a="leave">Chiqish</button></div>`;
  root.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; hap(); const a = b.dataset.a;
    if (a === 'start') net.patch(R.code, {status: 'play', t0: Math.round(net.now() + 4000)});
    if (a === 'leave') leave();
    if (a === 'share') { const url = location.origin + location.pathname + '?room=' + R.code, text = `Men bilan So‘z duyelida o‘yna! Kod: ${R.code}`;
      if (tg && tg.openTelegramLink) tg.openTelegramLink('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text));
      else if (navigator.share) navigator.share({title: 'DeutschPower', text, url}).catch(() => {}); else { try { navigator.clipboard.writeText(text + ' ' + url); toast('Havola nusxalandi'); } catch (er) {} } } };
}
function wireExit() { const old = root.onclick; root.addEventListener('click', e => { if (e.target.closest('[data-exit]')) { if (R) { try { R.un(); } catch (er) {} R = null; } clearInterval(tmr); hub(); } }); }
