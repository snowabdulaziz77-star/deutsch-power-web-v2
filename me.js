
import { S, dxp, due, rank, week } from './store.js';

export function render(el) {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user || {};

  const name = [user.first_name, user.last_name]
    .filter(Boolean).join(' ') || 'DeutschPower foydalanuvchisi';

  const xp = Number(S.xp) || 0;
  const today = Number(dxp()) || 0;
  const goal = Number(S.goal) || 50;
  const progress = Math.min(100, Math.round(today / goal * 100));
  const days = week();
  const max = Math.max(1, ...days.map(d => d.xp));

  el.innerHTML = `
    <div class="card profile-hero pop">
      <div class="row">
        <div class="profile-avatar">
          ${user.photo_url
            ? `<img src="${user.photo_url}" style="width:100%;height:100%;object-fit:cover;border-radius:20px">`
            : name.charAt(0).toUpperCase()}
        </div>
        <div class="grow">
          <small>DEUTSCHPOWER PROFILI</small>
          <h2>${name}</h2>
          <p class="mute">🏅 ${rank(xp)}</p>
        </div>
      </div>
      <p style="margin-top:18px">UMUMIY TAJRIBA</p>
      <h1 style="font-size:32px">${xp} XP</h1>
    </div>

    <div class="profile-grid">
      <div class="profile-stat">
        <div class="ico">🔥</div>
        <b>${S.streak || 0}</b>
        <small>Kunlik seriya</small>
      </div>
      <div class="profile-stat">
        <div class="ico">⚡</div>
        <b>${today} XP</b>
        <small>Bugungi XP</small>
      </div>
      <div class="profile-stat">
        <div class="ico">📚</div>
        <b>${S.level || 'A1'}</b>
        <small>Til darajasi</small>
      </div>
      <div class="profile-stat">
        <div class="ico">🔁</div>
        <b>${due()}</b>
        <small>Takrorlash</small>
      </div>
    </div>

    <h2>🎯 Bugungi maqsad</h2>
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <b>${today} / ${goal} XP</b>
        <b>${progress}%</b>
      </div>
      <div class="bar" style="margin-top:12px">
        <i style="width:${progress}%"></i>
      </div>
      <p class="mute" style="margin-top:10px">
        ${progress >= 100 ? 'Maqsad bajarildi! 🎉' : 'Har kuni o‘rganishda davom et!'}
      </p>
    </div>

    <h2>📊 Oxirgi 7 kun</h2>
    <div class="card">
      <div class="profile-week">
        ${days.map(d => `
          <div>
            <i style="height:${Math.max(5, d.xp / max * 76)}px"></i>
            <span>${d.l}</span>
            <small>${d.xp}</small>
          </div>
        `).join('')}
      </div>
    </div>

    <h2>👤 Hisob ma’lumotlari</h2>
    <div class="card">
      <div class="profile-line">
        <div class="ico">🆔</div>
        <div>
          <b>Telegram ID</b>
          <p class="mute">${user.id || 'Telegram orqali ochilmagan'}</p>
        </div>
      </div>
      <div class="profile-line">
        <div class="ico">🇩🇪</div>
        <div>
          <b>O‘rganayotgan til</b>
          <p class="mute">Nemis tili</p>
        </div>
      </div>
    </div>
  `;
}
