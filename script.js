const MAX_COFFEES = 10;
const STORAGE_KEY = 'filledCups';

// Retrieve array of filled indices from localStorage
function getFilled() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Save array of filled indices
function setFilled(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// Pick one random unfilled cup and mark it filled
function punchRandom() {
  const filled = getFilled();
  if (filled.length >= MAX_COFFEES) return filled;

  const remaining = [];
  for (let i = 0; i < MAX_COFFEES; i++) {
    if (!filled.includes(i)) remaining.push(i);
  }

  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  filled.push(pick);
  setFilled(filled);
  return filled;
}

// Render status text, cups, confetti—and the reset link when full
function updateStatus() {
  const filled = getFilled();
  const count = filled.length;
  const status = document.getElementById('status');
  const cupsContainer = document.getElementById('cups');

  // ——— status message ———
  if (count >= MAX_COFFEES) {
    status.textContent = `🎉 You’ve earned a free coffee! (${count}/${MAX_COFFEES})`;
  } else {
    status.textContent = `You’ve had ${count} of ${MAX_COFFEES} coffees.`;
  }

  // ——— cups row ———
  cupsContainer.innerHTML = '';
  for (let i = 0; i < MAX_COFFEES; i++) {
    const cup = document.createElement('span');
    cup.classList.add('cup');
    cup.textContent = '☕';
    if (filled.includes(i)) cup.classList.add('filled');
    cupsContainer.appendChild(cup);
  }

  // ——— confetti on completion ———
  if (count === MAX_COFFEES) {
    if (!window._confettiShown) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      window._confettiShown = true;
    }
  } else {
    window._confettiShown = false;
  }

  // ——— reset link logic ———
  // remove any old link
  const old = document.getElementById('reset-link');
  if (old) old.remove();

  if (count >= MAX_COFFEES) {
    // append a Reset link to the card
    const card = cupsContainer.closest('.card');
    const resetLink = document.createElement('a');
    resetLink.id = 'reset-link';
    resetLink.href = '#';
    resetLink.textContent = '🔄 Reset Card';
    resetLink.style.display = 'block';
    resetLink.style.textAlign = 'center';
    resetLink.style.margin = '12px 0';
    resetLink.style.cursor = 'pointer';

    resetLink.addEventListener('click', e => {
      e.preventDefault();
      const code = prompt('Barista code to reset:');
      if (code === '1234') {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('didPunch');
        updateStatus();
      } else {
        alert('❌ Incorrect code.');
      }
    });

    card.appendChild(resetLink);
  }
}

// On load: only punch if ?punch=1 and not already done this session
document.addEventListener('DOMContentLoaded', () => {
  const url = new URL(window.location.href);

  if (
    url.searchParams.get('punch') === '1' &&
    !sessionStorage.getItem('didPunch')
  ) {
    punchRandom();
    sessionStorage.setItem('didPunch', '1');

    // clean the URL so refresh won't re-fire the punch
    url.searchParams.delete('punch');
    history.replaceState(null, '', url.pathname);
  }

  updateStatus();
});
