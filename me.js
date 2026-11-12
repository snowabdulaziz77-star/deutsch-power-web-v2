export function render(el) {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

  el.innerHTML = `
    <div class="card">
      <h2>👤 Mening profilim</h2>

      <p>
        ${user?.first_name || 'DeutschPower foydalanuvchisi'}
      </p>

      <p>🆔 ID: ${user?.id || 'Noma’lum'}</p>

      <p>🇩🇪 Nemis tilini o‘rganish davom etmoqda!</p>
    </div>
  `;
}
