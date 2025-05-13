(() => {
  // ─── configuration ─────────────────────────────────────────────────
  const MAX_COFFEES   = 10;
  const STORAGE_KEY   = 'filledCups';
  const STAR_KEY      = 'starCount';
  const BARISTA_CODE  = '3004';  // <-- new 4-digit barista code
  const RESET_CODE    = '1234';  // <-- existing reset code

  // ─── localStorage helpers ────────────────────────────────────────────
  const store = {
    getArray: key => {
      const raw = localStorage.getItem(key);
      try {
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    setArray: (key, arr) => {
      localStorage.setItem(key, JSON.stringify(arr));
    },
    getNum: key => {
      const n = parseInt(localStorage.getItem(key), 10);
      return Number.isNaN(n) ? 0 : n;
    },
    setNum: (key, n) => {
      localStorage.setItem(key, String(n));
    }
  };

  // ─── grab DOM elements ────────────────────────────────────────────────
  const statusEl = document.getElementById('status');
  const cupsEl   = document.getElementById('cups');
  const starsEl  = document.getElementById('stars');
  let resetLinkEl = null;

  // ─── punch logic ──────────────────────────────────────────────────────
  function punchRandom() {
    const filled = store.getArray(STORAGE_KEY);
    if (filled.length >= MAX_COFFEES) return;

    // pick a random unfilled index
    const remaining = Array.from({ length: MAX_COFFEES }, (_, i) => i)
                           .filter(i => !filled.includes(i));
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    filled.push(pick);
    store.setArray(STORAGE_KEY, filled);

    // small confetti burst
    confetti({ particleCount: 25, spread: 60, origin: { y: 0.4 } });
  }

  // ─── render cups ──────────────────────────────────────────────────────
  function renderCups() {
    const filled = store.getArray(STORAGE_KEY);
    cupsEl.innerHTML = '';
    for (let i = 0; i < MAX_COFFEES; i++) {
      const cup = document.createElement('span');
      cup.className   = 'cup' + (filled.includes(i) ? ' filled' : '');
      cup.textContent = '☕';
      cupsEl.appendChild(cup);
    }
  }

  // ─── render status & reset link ───────────────────────────────────────
  function renderStatus() {
    const count = store.getArray(STORAGE_KEY).length;

    // before free coffee
    if (count < MAX_COFFEES) {
      statusEl.textContent = `You’ve had ${count} of ${MAX_COFFEES} coffees.`;
      // allow re-showing big confetti once they hit 10 again
      window._confettiShown = false;
      if (resetLinkEl) {
        resetLinkEl.remove();
        resetLinkEl = null;
      }
    }
    // when they hit 10 → free coffee!
    else {
      statusEl.textContent = `🎉 You’ve earned a free coffee! (${count}/${MAX_COFFEES})`;

      // one-time big confetti
      if (!window._confettiShown) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        window._confettiShown = true;
      }

      // add or recreate the “🔄 Reset Card” link
      if (resetLinkEl) resetLinkEl.remove();
      resetLinkEl = document.createElement('a');
      resetLinkEl.href = '#';
      resetLinkEl.textContent = '🔄 Reset Card';
      resetLinkEl.style.display = 'block';
      resetLinkEl.style.textAlign = 'center';
      resetLinkEl.style.marginTop = '12px';

      resetLinkEl.onclick = e => {
        e.preventDefault();
        const code = prompt('🔑 Enter barista code to reset:');
        if (code === RESET_CODE) {
          // increment star count
          store.setNum(STAR_KEY, store.getNum(STAR_KEY) + 1);
          // clear punches
          localStorage.removeItem(STORAGE_KEY);
          renderAll();
        } else {
          alert('❌ Incorrect code.');
        }
      };

      cupsEl.closest('.card').append(resetLinkEl);
    }
  }

  // ─── render stars ─────────────────────────────────────────────────────
  function renderStars() {
    const count = store.getNum(STAR_KEY);
    starsEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className   = 'star';
      s.textContent = '⭐';
      starsEl.appendChild(s);
    }
  }

  // ─── master render ────────────────────────────────────────────────────
  function renderAll() {
    renderCups();
    renderStatus();
    renderStars();
  }

  // ─── on page load: gate the punch behind BARISTA_CODE ────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('punch') === '1') {
      const entry = prompt('🔑 Enter barista code to punch:');
      if (entry === BARISTA_CODE) {
        punchRandom();
      } else {
        alert('❌ Incorrect code — punch not added.');
      }
      // remove the query string so users can't replay it
      history.replaceState(null, '', url.pathname);
    }
    renderAll();
  });
})();
