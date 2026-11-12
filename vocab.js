// Lug'at: qidiruv, mavzu va holat filtrlari, saqlash (⭐), talaffuz, takrorlashga qo'shish
import {S, save, mistake} from './store.js';
import {V} from './data.js';
import {esc, speak, hap, toast} from './ui.js';

const art = de => { const m = /^(der|die|das) (.*)/i.exec(de); return m ? `<span class="art-${m[1].toLowerCase()}">${esc(m[1])}</span> ${esc(m[2])}` : esc(de); };
let lv = null, th = '', q = '', fl = 'all', lim = 60, op = '';

export function render(el) {
  lv = lv || S.level; S.fav = S.fav || {};
  const w = V[lv] || [], themes = [...new Set(w.map(x => x[3] || 'Umumiy'))], kn = w.filter(x => S.known[x[0]]).length;
  el.innerHTML = `<div class="pop"><div class="top"><h1 class="grow" style="font-size:24px">Lug‘at</h1><div class="pill">✅ ${kn}/${w.length}</div></div>
  <div class="chips">${Object.keys(V).map(l => `<button class="chip ${l === lv ? 'on' : ''}" data-lv="${l}">${l} · ${V[l].length}</button>`).join('')}</div>
  <input class="date" id="vs" placeholder="🔍 Qidirish (nemischa yoki o‘zbekcha)" value="${esc(q)}" style="margin-bottom:10px">
  <div class="chips"><button class="chip ${th ? '' : 'on'}" data-th="">Hamma mavzu</button>${themes.map(t => `<button class="chip ${t === th ? 'on' : ''}" data-th="${esc(t)}">${esc(t)}</button>`).join('')}</div>
  <div class="chips">${[['all', 'Hammasi'], ['fav', '⭐ Saqlangan'], ['known', '✅ Bilaman'], ['new', '🆕 Yangi']].map(f => `<button class="chip ${fl === f[0] ? 'on' : ''}" data-fl="${f[0]}">${f[1]}</button>`).join('')}</div>
  <div class="card" id="vl" style="padding:6px 14px"></div><div id="vm"></div></div>`;
  el.querySelector('#vs').oninput = e => { q = e.target.value; lim = 60; list(el); };
  el.onclick = e => {
    const b = e.target.closest('[data-lv],[data-th],[data-fl],[data-more],[data-s],[data-f],[data-t],[data-r],[data-k]'); if (!b) return; const d = b.dataset;
    if (d.lv) { lv = d.lv; th = ''; lim = 60; return render(el); }
    if (d.th !== undefined) { th = d.th; lim = 60; return render(el); }
    if (d.fl) { fl = d.fl; lim = 60; return render(el); }
    if (d.more) { lim += 60; return list(el); }
    hap();
    if (d.s) speak(d.s);
    else if (d.f) { S.fav[d.f] ? delete S.fav[d.f] : S.fav[d.f] = 1; save(); list(el); }
    else if (d.t !== undefined) { op = op === d.t ? '' : d.t; list(el); }
    else if (d.r) { const x = w.find(y => y[0] === d.r); if (x) { mistake(x); toast('Takrorlashga qo‘shildi 🔁'); } }
    else if (d.k) { S.known[d.k] ? delete S.known[d.k] : S.known[d.k] = 1; save(); list(el); }
  };
  list(el);
}

function list(el) {
  const s = q.trim().toLowerCase();
  const a = (V[lv] || []).filter(x => (!th || (x[3] || 'Umumiy') === th) && (!s || x[0].toLowerCase().includes(s) || x[1].toLowerCase().includes(s)) &&
    (fl === 'all' || (fl === 'fav' && S.fav[x[0]]) || (fl === 'known' && S.known[x[0]]) || (fl === 'new' && !S.known[x[0]])));
  el.querySelector('#vl').innerHTML = a.length ? a.slice(0, lim).map(x => { const d = esc(x[0]), open = op === x[0], kn = S.known[x[0]];
    return `<div class="wr"><div class="wh" data-t="${d}"><div class="grow"><div class="wd">${art(x[0])}${kn ? ' ✅' : ''}</div><div class="mute">${esc(x[1])}</div></div><button class="icon" data-s="${d}" aria-label="Talaffuz">🔊</button><button class="icon" data-f="${d}" aria-label="Saqlash">${S.fav[x[0]] ? '⭐' : '☆'}</button></div>
    ${open ? `<div class="wx">${x[2] ? `<i>${esc(x[2])}</i>` : '<span class="mute">Misol gap tez orada qo‘shiladi</span>'}<div class="row"><button class="btn sm" data-r="${d}">🔁 Takrorlashga</button><button class="btn sm ok" data-k="${d}">${kn ? '↩ Qaytarish' : '✅ Bilaman'}</button></div></div>` : ''}</div>`; }).join('') : '<p class="mute" style="padding:12px 0">Hech narsa topilmadi</p>';
  el.querySelector('#vm').innerHTML = a.length > lim ? `<button class="btn" data-more="1" style="margin-top:12px">Yana ko‘rsatish (${a.length - lim})</button>` : '';
}
