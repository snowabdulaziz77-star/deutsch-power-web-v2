// O'rganish: dars yo'li (Dars = 50 so'z, bosqich = 10 so'z), kartochkalar va takrorlash
import {S, save, words, addXp, bump, due, dueList, mistake, reviewAns, markStep, stepDone} from './store.js';
import {V} from './data.js';
import {esc, mascot, speak, hap, confetti} from './ui.js';

const LS = 50, ST = 10;
let M = null;                                   // joriy sessiya
const art = de => { const m = /^(der|die|das) (.*)/i.exec(de); return m ? `<span class="art-${m[1].toLowerCase()}">${esc(m[1])}</span> ${esc(m[2])}` : esc(de); };

export function render(el) { M ? session(el) : path(el); }

function path(el) {
  el.ontouchstart = el.ontouchend = null;
  const w = words(), n = Math.ceil(w.length / LS), dl = due();
  let cur = false, html = '';
  for (let l = 0; l < n; l++) {
    const len = Math.min(LS, w.length - l * LS), st = Math.ceil(len / ST);
    html += `<div class="unit"><b>Dars ${l + 1}</b><div class="mute">${len} ta so‘z · ${st} bosqich</div></div>`;
    for (let k = 0; k < st; k++) {
      const done = stepDone(S.level, l, k), cls = done ? 'done' : !cur ? (cur = true, 'cur') : 'lock';
      html += `<button class="node ${cls}" style="transform:translateX(${[0, 38, 58, 38, 0][k % 5]}px)" data-l="${l}" data-k="${k}" ${cls === 'lock' ? 'disabled' : ''} aria-label="Dars ${l + 1}, bosqich ${k + 1}">${done ? '✓' : cls === 'lock' ? '🔒' : '★'}${cls === 'cur' ? '<span class="go">BOSHLASH</span>' : ''}</button>`;
    }
  }
  el.innerHTML = `<div class="pop"><div class="top"><h1 class="grow" style="font-size:24px">O‘rganish</h1><div class="pill">🎓 ${S.level}</div></div>
  <div class="chips">${Object.keys(V).map(l => `<button class="chip ${l === S.level ? 'on' : ''}" data-lv="${l}">${l}</button>`).join('')}</div>
  <button class="btn" data-rev="1" ${dl ? '' : 'disabled'}>🔁 Takrorlash${dl ? ` · ${dl} ta so‘z` : ' · hozircha yo‘q'}</button>
  <div class="path">${html || '<p class="mute">So‘z topilmadi</p>'}</div></div>`;
  el.onclick = e => {
    const lv = e.target.closest('[data-lv]'), nd = e.target.closest('.node:not(:disabled)'), rv = e.target.closest('[data-rev]:not(:disabled)');
    if (lv) { S.level = lv.dataset.lv; save(); path(el); }
    else if (nd) { const l = +nd.dataset.l, k = +nd.dataset.k; begin(el, words().slice(l * LS + k * ST, l * LS + (k + 1) * ST), false, [S.level, l, k]); }
    else if (rv) begin(el, dueList().slice(0, ST).map(m => [m.de, m.uz, m.ex]), true);
  };
}

function begin(el, list, rev, key) {
  if (!list.length) return;
  M = {q: list.map(w => ({w, tried: 0})), i: 0, total: list.length, done: 0, first: 0, xp: 0, rev, key, flip: false, streak: false, t0: Date.now()};
  session(el);
}

function session(el) {
  const c = M.q[M.i]; if (!c) return finish(el);
  const [de, uz, ex] = c.w;
  el.innerHTML = `<div class="pop"><div class="row" style="margin-bottom:14px"><button class="icon" data-x="1" aria-label="Chiqish">✕</button><div class="bar grow"><i style="width:${M.done / M.total * 100}%"></i></div><span class="mute">${M.done}/${M.total}</span></div>
  <div class="card fc" data-f="1" role="button" tabindex="0"><div class="fcde">${art(de)}</div>${M.flip ? `<div class="fcuz">${esc(uz)}</div><div class="mute"><i>${esc(ex)}</i></div>` : '<div class="mute">Tarjima uchun bosing</div>'}</div>
  <button class="icon" data-s="1" aria-label="Eshitish" style="display:block;margin:0 auto 14px">🔊</button>
  <div class="row"><button class="btn bad" data-a="0">↺ Takror</button><button class="btn ok" data-a="1">✓ Bilaman</button></div>
  <p class="mute" style="text-align:center;margin-top:10px">Telefonda: o‘ngga surish = Bilaman, chapga = Takror</p></div>`;
  el.onclick = e => {
    const b = e.target.closest('[data-x],[data-s],[data-a],[data-f]'); if (!b) return;
    if (b.dataset.x) { M = null; path(el); }
    else if (b.dataset.s) speak(de);
    else if (b.dataset.f) { M.flip = !M.flip; hap(); session(el); }
    else answer(el, b.dataset.a === '1');
  };
  let x0 = 0; el.ontouchstart = e => { x0 = e.touches[0].clientX; };
  el.ontouchend = e => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 70) answer(el, dx > 0); };
}

function answer(el, ok) {
  const c = M.q[M.i]; hap(ok ? 'ok' : '');
  if (ok) {
    if (c.tried === 0) M.first++;
    M.done++; const x = M.rev ? 5 : 3; M.xp += x;
    if (addXp(x).first) M.streak = true;
    bump(M.rev ? 'rev' : 'words');
    if (M.rev) reviewAns(c.w[0], true);
  } else {
    c.tried++;
    if (M.rev) reviewAns(c.w[0], false); else mistake(c.w);
    if (c.tried < 2) M.q.push(c); else M.done++;     // bir so'z ko'pi bilan 2 marta qaytadi
  }
  M.i++; M.flip = false; session(el);
}

function finish(el) {
  const m = M, sec = Math.round((Date.now() - m.t0) / 1000), acc = Math.round(m.first / m.total * 100);
  if (!m.rev) markStep(m.key);
  m.streak ? confetti() : hap('ok');
  el.ontouchstart = el.ontouchend = null;
  el.innerHTML = `<div class="pop card" style="text-align:center;margin-top:16px">${mascot('cheer', 120)}<h1 style="margin:8px 0">${m.rev ? 'Takrorlash tugadi!' : 'Bosqich tugadi!'}</h1>
  ${m.streak ? `<p style="font-weight:800;color:var(--acc-d)">🔥 Streak: ${S.streak} kun!</p>` : ''}
  <div class="row" style="margin:16px 0"><div class="card grow stat"><b>⭐ ${m.xp}</b><span>XP</span></div><div class="card grow stat"><b>⏱ ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}</b><span>vaqt</span></div><div class="card grow stat"><b>🎯 ${acc}%</b><span>aniqlik</span></div></div>
  <button class="btn" data-c="1">DAVOM ETISH</button></div>`;
  el.onclick = e => { if (e.target.closest('[data-c]')) { M = null; path(el); } };
}
