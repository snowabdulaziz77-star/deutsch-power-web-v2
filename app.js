
import { S } from './store.js';
import { ready } from './data.js';

import { render as home } from './home.js';
import { render as learn } from './learn.js';
import { render as game } from './game.js';
import { render as vocab } from './vocab.js';
import { render as profile } from './me.js';

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

if (S.theme) {
  document.documentElement.dataset.theme = S.theme;
} else if (tg?.colorScheme) {
  document.documentElement.dataset.theme = tg.colorScheme;
}

const TABS = [
  ['home', '🏠', 'Bosh', home],
  ['learn', '📚', 'O‘rganish', learn],
  ['game', '🎮', 'O‘yin', game],
  ['vocab', '🔤', 'Lug‘at', vocab],
  ['me', '👤', 'Profil', profile]
];

let tab = 'home';

function go(t) {
  const selectedTab = TABS.find(x => x[0] === t);

  if (!selectedTab) return;

  tab = t;

  const nav = document.getElementById('nav');
  const view = document.getElementById('view');

  if (!nav || !view) {
    console.error('Nav yoki View elementi topilmadi!');
    return;
  }

  nav.innerHTML = TABS.map(x => `
    <button
      class="${x[0] === t ? 'on' : ''}"
      data-t="${x[0]}"
      aria-label="${x[2]}"
    >
      <span>${x[1]}</span>
      ${x[2]}
    </button>
  `).join('');

  selectedTab[3](view);

  window.scrollTo(0, 0);
}

document.getElementById('nav').onclick = e => {
  const button = e.target.closest('[data-t]');

  if (button) {
    go(button.dataset.t);
  }
};

window.addEventListener('go', e => {
  go(e.detail);
});

go('home');

ready.then(() => {
  if (tab === 'home') {
    go('home');
  }
}).catch(error => {
  console.error('Data yuklashda xatolik:', error);
});
