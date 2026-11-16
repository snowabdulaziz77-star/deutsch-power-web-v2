// Profil: avatar (Brezel kiyimlari), statistika, faollik xaritasi, yutuqlar, sozlamalar, zaxira nusxa
import {S, save, RANKS, rank, due} from './store.js';
import {V} from './data.js';
import {esc, mascot, hap, toast, confetti} from './ui.js';

const tg = window.Telegram && window.Telegram.WebApp;
const ACH = [
  {id: 'streak', ic: '🔥', n: 'Olov', d: 'Eng uzun streak (kun)', v: () => Math.max(S.best || 0, S.streak), t: [3, 7, 30]},
  {id: 'words', ic: '📚', n: 'So‘z ustasi', d: 'O‘zlashtirilgan so‘zlar', v: () => Object.keys(S.known).length, t: [10, 50, 200]},
  {id: 'xp', ic: '⭐', n: 'XP yig‘uvchi', d: 'Jami XP', v: () => S.xp, t: [100, 500, 2000]},
  {id: 'games', ic: '🎮', n: 'O‘yinchi', d: 'O‘ynalgan o‘yinlar', v: () => S.games || 0, t: [1, 10, 50]},
  {id: 'wins', ic: '🏆', n: 'G‘olib', d: 'O‘yin g‘alabalari', v: () => S.wins || 0, t: [1, 5, 20]},
];
const OUTFITS = [['', '🥨', 'Oddiy', () => true, ''], ['cap', '🎓', 'Bitiruvchi', () => S.xp >= 100, '100 XP'], ['glasses', '🤓', 'Bilimdon', () => Object.keys(S.known).length >= 50, '50 so‘z'],
  ['flame', '🔥', 'Olovli', () => Math.max(S.best || 0, S.streak) >= 7, '7 kun streak'], ['crown', '👑', 'Qirol', () => S.xp >= 1500, '1500 XP']];
const lvl = a => a.t.filter(x => a.v() >= x).length;
let tab = 'main';

export function render(el) {
  const name = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.first_name) || 'Do‘st';
  S.ach = S.ach || {}; let up = false;
  ACH.forEach(a => { const l = lvl(a); if (l > (S.ach[a.id] || 0)) { up = true; toast(`${a.ic} Yangi yutuq: ${a.n} ${['', '🥉', '🥈', '🥇'][l]}`); } S.ach[a.id] = l; });
  if (up) { confetti(); save(); }
  const lo = [...RANKS].reverse().find(r => S.xp >= r[0]), hi = RANKS.find(r => r[0] > S.xp), p = hi ? (S.xp - lo[0]) / (hi[0] - lo[0]) : 1;
  const dark = document.documentElement.dataset.theme || '';
  const cells = []; for (let a = 29; a >= 0; a--) { const k = new Date(Date.now() - a * 864e5).toLocaleDateString('sv'), x = S.hist[k] || 0, g = S.goal;
    cells.push(`<i class="hm l${x === 0 ? 0 : x < g * .4 ? 1 : x < g * .8 ? 2 : x < g ? 3 : 4}" title="${k}: ${x} XP"></i>`); }
  const stats = [['⭐', S.xp, 'XP'], ['🔥', Math.max(S.best || 0, S.streak), 'eng uzun streak'], ['📚', Object.keys(S.known).length, 'bilgan so‘z'], ['🎮', S.games || 0, 'o‘yinlar'], ['🏆', S.wins || 0, 'g‘alabalar'], ['🧊', S.freeze, 'freeze']];
  el.innerHTML = `<div class="pop"><div class="card hero" style="text-align:center"><div data-a="out" style="cursor:pointer">${mascot('happy', 110, S.outfit)}</div>
    <h1 style="font-size:24px;margin:4px 0">${esc(name)}</h1><div style="font-weight:800">${rank(S.xp)} · 🎓 ${S.level}</div>
    <div class="bar" style="margin:10px 0 4px;background:rgba(255,255,255,.25)"><i style="width:${p * 100}%;background:#fff"></i></div><div class="mute">${hi ? `Keyingi daraja: ${hi[0]} XP` : 'Eng yuqori daraja!'}</div></div>
  <div class="chips"><button class="chip ${tab === 'main' ? 'on' : ''}" data-tab="main">📊 Natijalar</button><button class="chip ${tab === 'set' ? 'on' : ''}" data-tab="set">⚙️ Sozlamalar</button><button class="chip ${tab === 'data' ? 'on' : ''}" data-tab="data">💾 Ma‘lumotlar</button></div>
  ${tab === 'main' ? `<div class="sgrid">${stats.map(s => `<div class="card stat"><b>${s[0]} ${s[1]}</b><span>${s[2]}</span></div>`).join('')}</div>
  <div class="card"><b>Faollik xaritasi</b> <span class="mute">(oxirgi 30 kun)</span><div class="hmap">${cells.join('')}</div></div>
  <h2>Yutuqlar</h2>${ACH.map(a => { const l = lvl(a), nx = a.t[l], v = a.v(); return `<div class="card q" style="display:flex"><div class="ic" style="font-size:26px">${a.ic}</div><div class="grow"><b>${a.n}</b> ${['🔒', '🥉', '🥈', '🥇'][l]}<div class="mute">${a.d}: ${v}${nx ? ` / ${nx}` : ' · maksimal!'}</div><div class="bar" style="height:8px;margin-top:6px"><i style="width:${nx ? Math.min(v / nx, 1) * 100 : 100}%"></i></div></div></div>`; }).join('')}
  <h2>Brezel kiyimi</h2><div class="chips">${OUTFITS.map(o => { const ok = o[3](); return `<button class="chip ${(S.outfit || '') === o[0] ? 'on' : ''}" data-o="${o[0]}" ${ok ? '' : 'disabled'}>${ok ? o[1] : '🔒'} ${o[2]}${ok ? '' : ` (${o[4]})`}</button>`; }).join('')}</div>` : ''}
  ${tab === 'set' ? `<div class="card"><b>Kunlik maqsad</b><div class="chips" style="margin-top:8px">${[20, 50, 100].map(g => `<button class="chip ${S.goal === g ? 'on' : ''}" data-g="${g}">${g === 20 ? '🌱' : g === 50 ? '⚡' : '🔥'} ${g} XP</button>`).join('')}</div></div>
  <div class="card"><b>Daraja</b><div class="chips" style="margin-top:8px">${Object.keys(V).map(l => `<button class="chip ${S.level === l ? 'on' : ''}" data-lv="${l}">${l}</button>`).join('')}</div></div>
  <div class="card"><b>Rejim</b><div class="chips" style="margin-top:8px">${[['', '🌓 Avto'], ['light', '☀️ Yorug‘'], ['dark', '🌙 Qorong‘i']].map(t => `<button class="chip ${dark === t[0] ? 'on' : ''}" data-th="${t[0]}">${t[1]}</button>`).join('')}</div></div>
  <div class="card"><b>🎓 Goethe imtihon sanasi</b><input class="date" type="date" data-exam="1" value="${esc(S.exam || '')}" style="margin-top:8px"></div>` : ''}
  ${tab === 'data' ? `<div class="card"><b>💾 Zaxira nusxa</b><p class="mute" style="margin:6px 0 10px">Natijalar faqat shu qurilmada saqlanadi. Brauzer tozalansa yo‘qoladi, shuning uchun vaqti-vaqti bilan zaxiralang.</p><button class="btn" data-a="bk">Zaxira nusxani yuklab olish va nusxalash</button></div>
  <div class="card"><b>📂 Tiklash</b><textarea id="rs" class="date" rows="3" placeholder="Zaxira matnini shu yerga joylang" style="margin:8px 0"></textarea><button class="btn ok" data-a="rs">Tiklash</button></div>
  <div class="card"><button class="btn" data-a="sh">📤 Natijamni ulashish</button><button class="btn bad" data-a="rm" style="margin-top:10px">🗑 Hammasini o‘chirish</button></div>` : ''}</div>`;
  el.onclick = e => { const b = e.target.closest('[data-tab],[data-a],[data-o],[data-g],[data-lv],[data-th]'); if (!b) return; hap(); const d = b.dataset;
    if (d.tab) { tab = d.tab; return render(el); }
    if (d.o !== undefined) { S.outfit = d.o; save(); return render(el); }
    if (d.g) { S.goal = +d.g; save(); return render(el); }
    if (d.lv) { S.level = d.lv; save(); return render(el); }
    if (d.th !== undefined) { S.theme = d.th; d.th ? document.documentElement.dataset.theme = d.th : delete document.documentElement.dataset.theme; save(); return render(el); }
    if (d.a === 'out') { const i = OUTFITS.filter(o => o[3]()); const c = i.findIndex(o => o[0] === (S.outfit || '')); S.outfit = i[(c + 1) % i.length][0]; save(); return render(el); }
    if (d.a === 'bk') { const t = JSON.stringify(S); try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], {type: 'application/json'})); a.download = 'deutschpower-zaxira.json'; a.click(); } catch (er) {} try { navigator.clipboard.writeText(t); toast('Zaxira nusxalandi ✅'); } catch (er) { toast('Fayl yuklandi'); } }
    if (d.a === 'rs') { try { const o = JSON.parse(document.getElementById('rs').value); if (typeof o.xp !== 'number' || typeof o.known !== 'object') throw 0; Object.keys(S).forEach(k => delete S[k]); Object.assign(S, o); save(); toast('Tiklandi ✅'); setTimeout(() => location.reload(), 700); } catch (er) { toast('Matn noto‘g‘ri'); } }
    if (d.a === 'sh') { const text = `Men DeutschPower'da ${S.xp} XP to‘pladim va ${S.streak} kunlik streak qildim! 🔥`, link = 'https://t.me/DeutschMasterUz_Bot';
      if (tg && tg.openTelegramLink) tg.openTelegramLink('https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(text)); else if (navigator.share) navigator.share({text, url: link}).catch(() => {}); else { try { navigator.clipboard.writeText(text + ' ' + link); toast('Nusxalandi'); } catch (er) {} } }
    if (d.a === 'rm' && confirm('Hamma natijalar o‘chadi. Davom etasizmi?')) { try { localStorage.removeItem('dp6'); } catch (er) {} location.reload(); } };
  el.onchange = e => { if (e.target.dataset.exam) { S.exam = e.target.value; save(); toast('Saqlandi'); } };
}
