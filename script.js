(() => {
  // ─── configuration ─────────────────────────────────────────────────
  const MAX_COFFEES   = 10;
  const STORAGE_KEY   = 'filledCups';
  const STAR_KEY      = 'starCount';
  const BARISTA_CODE  = '3004';  // ← punch code
  const RESET_CODE    = '1234';  // ← reset code

  // ─── localStorage helpers ────────────────────────────────────────────
  const store = {
    getArray: key => {
      const raw = localStorage.getItem(key);
      try { return raw ? JSON.parse(raw) : []; }
      catch { return []; }
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
  const modal    = document.getElementById('code-modal');
  const titleEl  = document.getElementById('code-modal-title');
  const inputEl  = document.getElementById('code-input');
  const btnOk    = document.getElementById('code-submit');
  const btnCancel= document.getElementById('code-cancel');
  let resetLinkEl = null;

  // ─── showCodeModal(message) → Promise<string|null> ───────────────────
  function showCodeModal(message) {
    return new Promise(resolve => {
      titleEl.textContent = message;
      inputEl.value = '';
      modal.classList.remove('hidden');
      inputEl.focus();

      function cleanup() {
        modal.classList.add('hidden');
        btnOk.removeEventListener('click', onOk);
        btnCancel.removeEventListener('click', onCancel);
      }

      function onOk() {
        cleanup();
        resolve(inputEl.value);
      }
      function onCancel() {
        cleanup();
        resolve(null);
      }

      btnOk.addEventListener('click', onOk);
      btnCancel.addEventListener('click', onCancel);
    });
  }

  // ─── punch logic ──────────────────────────────────────────────────────
  function punchRandom() {
    const filled = store.getArray(STORAGE_KEY);
    if (filled.length >= MAX_COFFEES) return;
    const remaining = Array.from({ length: MAX_COFFEES }, (_, i) => i)
                           .filter(i => !filled.includes(i));
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    filled.push(pick);
    store.setArray(STORAGE_KEY, filled);
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
    if (count < MAX_COFFEES) {
      statusEl.textContent = `You’ve had ${count} of ${MAX_COFFEES} coffees.`;
      window._confettiShown = false;
      if (resetLinkEl) resetLinkEl.remove();
    } else {
      statusEl.textContent = `🎉 You’ve earned a free coffee! (${count}/${MAX_COFFEES})`;
      if (!window._confettiShown) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        window._confettiShown = true;
      }
      if (resetLinkEl) resetLinkEl.remove();
      resetLinkEl = document.createElement('a');
      resetLinkEl.href = '#';
      resetLinkEl.textContent = '🔄 Reset Card';
      resetLinkEl.style.display = 'block';
      resetLinkEl.style.textAlign = 'center';
      resetLinkEl.style.marginTop = '12px';

      resetLinkEl.onclick = async e => {
        e.preventDefault();
        const code = await showCodeModal('Enter code to reset');
        if (code === RESET_CODE) {
          store.setNum(STAR_KEY, store.getNum(STAR_KEY) + 1);
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

  // ─── on page load: gate punch behind BARISTA_CODE ────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('punch') === '1') {
      const entry = await showCodeModal('Enter code to punch');
      if (entry === BARISTA_CODE) {
        punchRandom();
      } else {
        alert('❌ Incorrect code — punch not added.');
      }
      history.replaceState(null, '', url.pathname);
    }
    renderAll();
  });
})();
