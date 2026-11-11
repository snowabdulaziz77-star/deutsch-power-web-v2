// O'yin 1: So'z duyeli. Hamma o'yinchi bir xil savollarni (seed bo'yicha) bir vaqtda (server vaqti) ko'radi.
import {V} from './data.js';
import {mistake, addXp, bump} from './store.js';
import * as net from './net.js';
import {esc, hap, confetti} from './ui.js';

const SLOT = 12000, ANS = 10000, CD = 4000, N = 10;
const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const art = de => { const m = /^(der|die|das) (.*)/i.exec(de); return m ? `<span class="art-${m[1].toLowerCase()}">${esc(m[1])}</span> ${esc(m[2])}` : esc(de); };
let cache = {};
function questions(seed, level) {
  const k = seed + level; if (cache.k === k) return cache.q;
  const r = rng(seed), w = V[level] || V.A1, sh = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const q = sh(w).slice(0, N).map((x, i) => {
    const rev = i % 2 === 1, others = sh(w.filter(y => y[0] !== x[0] && y[1] !== x[1])).slice(0, 3);
    const opts = sh([x, ...others]);
    return {w: x, rev, opts: opts.map(o => rev ? o[0] : o[1]), right: opts.indexOf(x), text: rev ? `«${x[1]}»` : x[0]};
  });
  cache = {k, q}; return q;
}
const score = (p, qs) => Object.entries(p.ans || {}).reduce((s, [i, a]) => s + (qs[i] && a.o === qs[i].right ? 100 + Math.round(50 * (1 - Math.min(a.t, ANS) / ANS)) : 0), 0);
let last = '', done = false, botQ = {};

export const duel = {
  id: 'duel', name: 'So‘z duyeli', ic: '⚔️', desc: 'Kim tezroq to‘g‘ri tarjimani topadi?',
  init: () => ({seed: Math.random() * 1e9 | 0}),
  reset() { last = ''; done = false; botQ = {}; },
  draw(el, room, ctx) {
    const qs = questions(room.seed, room.level), nowT = net.now(), t0 = room.t0, me = ctx.me.id;
    const pl = Object.values(room.players || {}).map(p => ({...p, s: score(p, qs)})).sort((a, b) => b.s - a.s);
    const tick = (frac, cls) => { const b = el.querySelector('#tm'); if (b) { b.style.width = frac * 100 + '%'; b.className = cls || ''; } };
    if (nowT < t0) { const c = Math.ceil((t0 - nowT) / 1000), key = 'cd' + c; if (key !== last) { last = key; el.innerHTML = `<div class="card" style="text-align:center;margin-top:30px"><div class="mute">Tayyorlaning!</div><div style="font-size:90px;font-weight:800;color:var(--pri)">${c}</div></div>`; } return; }
    const el_ = nowT - t0, qi = Math.floor(el_ / SLOT);
    if (qi >= N) return this.result(el, qs, pl, room, ctx);
    const q = qs[qi], phase = el_ % SLOT < ANS ? 'ask' : 'rev', mine = ((room.players[me] || {}).ans || {})[qi];
    if (ctx.local && phase === 'ask' && !botQ[qi]) { botQ[qi] = 1; const t = 1800 + Math.random() * 6000; setTimeout(() => { const ok = Math.random() < .7, o = ok ? q.right : (q.right + 1 + (Math.random() * 3 | 0)) % 4; net.patch(ctx.code, {[`players/bot/ans/${qi}`]: {o, t: Math.round(t)}}); }, t); }
    const key = `${qi}|${phase}|${mine ? mine.o : -1}|${pl.map(p => p.s).join(',')}`;
    if (key !== last) {
      last = key;
      el.innerHTML = `<div class="pop"><div class="row" style="margin-bottom:8px"><span class="mute grow">Savol ${qi + 1}/${N}</span>${pl.slice(0, 3).map((p, i) => `<span class="pill">${['🥇', '🥈', '🥉'][i]} ${esc(p.name.slice(0, 8))} ${p.s}</span>`).join('')}</div>
      <div class="timer"><i id="tm"></i></div><div class="q">${q.rev ? esc(q.text) + '<div class="mute" style="font-size:14px">nemischasi?</div>' : art(q.w[0])}</div>
      ${q.opts.map((o, i) => { let c = ''; if (phase === 'rev' || mine) { if (i === q.right && phase === 'rev') c = 'right'; else if (mine && mine.o === i) c = phase === 'rev' ? (i === q.right ? 'right' : 'wrong') : 'sel'; } return `<button class="opt ${c}" data-o="${i}" ${mine || phase === 'rev' ? 'disabled' : ''}>${esc(o)}</button>`; }).join('')}
      <div class="mute" style="text-align:center;margin-top:6px">${phase === 'rev' ? (mine ? (mine.o === q.right ? '✅ To‘g‘ri!' : '❌ Xato') : '⏱ Vaqt tugadi') : mine ? 'Javob qabul qilindi, boshqalar kutilmoqda…' : ''}</div></div>`;
      el.onclick = e => { const b = e.target.closest('[data-o]'); if (!b || mine) return; hap(); net.patch(ctx.code, {[`players/${me}/ans/${qi}`]: {o: +b.dataset.o, t: Math.max(0, Math.min(ANS, Math.round(net.now() - t0 - qi * SLOT)))}}); };
    }
    const into = el_ % SLOT; tick(phase === 'ask' ? 1 - into / ANS : 0, into > ANS * .7 ? 'late' : '');
  },
  result(el, qs, pl, room, ctx) {
    const me = ctx.me.id, mp = pl.find(p => p.id === me) || {ans: {}, s: 0}, key = 'res' + pl.map(p => p.s).join(',');
    if (!done) { done = true; qs.forEach((q, i) => { const a = (mp.ans || {})[i]; if (!a || a.o !== q.right) mistake(q.w); }); addXp(Math.max(5, Math.round(mp.s / 10))); bump('quiz'); if (pl[0] && pl[0].id === me) confetti(); }
    if (key === last) return; last = key;
    const miss = qs.filter((q, i) => !((mp.ans || {})[i] && mp.ans[i].o === q.right)), okN = N - miss.length;
    el.innerHTML = `<div class="pop"><div class="card" style="text-align:center"><div style="font-size:44px">${pl[0] && pl[0].id === me ? '🏆' : '🥨'}</div><h2 style="margin:4px 0 10px">Natijalar</h2>
    ${pl.map((p, i) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><b style="width:30px">${['🥇', '🥈', '🥉'][i] || i + 1}</b><span class="grow" style="text-align:left;font-weight:${p.id === me ? 800 : 600}">${esc(p.name)}</span><b>${p.s}</b></div>`).join('')}
    <p class="mute" style="margin-top:10px">Siz: ${okN}/${N} to‘g‘ri · +${Math.max(5, Math.round(mp.s / 10))} XP</p></div>
    ${miss.length ? `<div class="card"><b>🧠 Esda qol (Takrorlashga qo‘shildi)</b>${miss.map(q => `<div class="q"><div class="grow"><div style="font-weight:800">${art(q.w[0])}</div><div class="mute">${esc(q.w[1])} · <i>${esc(q.w[2])}</i></div></div></div>`).join('')}</div>` : '<div class="card" style="text-align:center">🎉 Xatosiz o‘ynadingiz!</div>'}
    <button class="btn" data-exit="1">MENYUGA QAYTISH</button></div>`;
  }
};
