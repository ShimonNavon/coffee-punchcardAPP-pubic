(() => {
  const MAX_COFFEES = 10;
  const STORAGE_KEY = 'filledCups';
  const STAR_KEY    = 'starCount';

  // cache DOM nodes
  const statusEl = document.getElementById('status');
  const cupsEl   = document.getElementById('cups');
  const starsEl  = document.getElementById('stars');
  let resetLinkEl;

  // simple storage helper
  const store = {
    getArray: key => {
      try { return JSON.parse(localStorage.getItem(key)) || []; }
      catch { return []; }
    },
    setArray: (key, arr) => {
      localStorage.setItem(key, JSON.stringify(arr));
    },
    getNum: key => parseInt(localStorage.getItem(key), 10) || 0,
    setNum: (key, n) => localStorage.setItem(key, n)
  };

  // pick a random unfilled cup + confetti
  const punchRandom = () => {
    const filled = store.getArray(STORAGE_KEY);
    if (filled.length >= MAX_COFFEES) return;

    const remaining = Array.from({ length: MAX_COFFEES }, (_, i) => i)
                           .filter(i => !filled.includes(i));
    filled.push(remaining[Math.floor(Math.random() * remaining.length)]);
    store.setArray(STORAGE_KEY, filled);

    confetti({ particleCount: 25, spread: 60, origin: { y: 0.4 } });
  };

  // render the cups row
  const renderCups = () => {
    const filled = store.getArray(STORAGE_KEY);
    cupsEl.innerHTML = '';
    for (let i = 0; i < MAX_COFFEES; i++) {
      const cup = document.createElement('span');
      cup.className = 'cup' + (filled.includes(i) ? ' filled' : '');
      cup.textContent = '☕';
      cupsEl.appendChild(cup);
    }
  };

  // render status & reset link
  const renderStatus = () => {
    const filled = store.getArray(STORAGE_KEY);
    const count  = filled.length;
    statusEl.textContent = count >= MAX_COFFEES
      ? `🎉 You’ve earned a free coffee! (${count}/${MAX_COFFEES})`
      : `You’ve had ${count} of ${MAX_COFFEES} coffees.`;

    // big finale confetti
    if (count === MAX_COFFEES && !window._confettiShown) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      window._confettiShown = true;
    }
    if (count < MAX_COFFEES) window._confettiShown = false;

    // reset link + star award
    if (resetLinkEl) resetLinkEl.remove();
    if (count >= MAX_COFFEES) {
      resetLinkEl = document.createElement('a');
      resetLinkEl.id = 'reset-link';
      resetLinkEl.href = '#';
      resetLinkEl.textContent = '🔄 Reset Card';
      resetLinkEl.className = 'reset-link';
      resetLinkEl.onclick = e => {
        e.preventDefault();
        const code = prompt('Barista code to reset:');
        if (code === '1234') {
          store.setNum(STAR_KEY, store.getNum(STAR_KEY) + 1);
          localStorage.removeItem(STORAGE_KEY);
          renderAll();
        } else {
          alert('❌ Incorrect code.');
        }
      };
      cupsEl.closest('.card').append(resetLinkEl);
    }
  };

  // render stars below
  const renderStars = () => {
    const count = store.getNum(STAR_KEY);
    starsEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.textContent = '⭐';
      starsEl.appendChild(s);
    }
  };

  // call all renders
  const renderAll = () => {
    renderCups();
    renderStatus();
    renderStars();
  };

  // on load (and ?punch=1), run punch + render
  document.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('punch') === '1') {
      punchRandom();
      history.replaceState(null, '', url.pathname);
    }
    renderAll();
  });
})();
