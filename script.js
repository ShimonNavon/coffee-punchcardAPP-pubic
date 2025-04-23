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

// Render status text and cups
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
    if (filled.includes(i)) {
      cup.classList.add('filled');
    }
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
}

// On load: punch one random cup, then render
document.addEventListener('DOMContentLoaded', () => {
  punchRandom();
  updateStatus();
});
