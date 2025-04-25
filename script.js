const MAX_COFFEES = 10;
const STORAGE_KEY = 'filledCups';
const STAR_KEY    = 'starCount';

// — star helpers —
function getStars() {
  return parseInt(localStorage.getItem(STAR_KEY), 10) || 0;
}
function setStars(n) {
  localStorage.setItem(STAR_KEY, n);
}
function updateStars() {
  const starsContainer = document.getElementById('stars');
  const starCount = getStars();
  starsContainer.innerHTML = '';
  for (let i = 0; i < starCount; i++) {
    const s = document.createElement('span');
    s.classList.add('star');
    s.textContent = '⭐';
    starsContainer.appendChild(s);
  }
}

// Retrieve array of filled indices
function getFilled() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function setFilled(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// Add one random punch + confetti
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

  confetti({ particleCount: 25, spread: 60, origin: { y: 0.4 } });
  return filled;
}

// Update cups, status, confetti & reset link
function updateStatus() {
  const filled = getFilled();
  const count = filled.length;
  const status = document.getElementById('status');
  const cupsContainer = document.getElementById('cups');

  status.textContent =
    count >= MAX_COFFEES
      ? `🎉 You’ve earned a free coffee! (${count}/${MAX_COFFEES})`
      : `You’ve had ${count} of ${MAX_COFFEES} coffees.`;

  cupsContainer.innerHTML = '';
  for (let i = 0; i < MAX_COFFEES; i++) {
    const cup = document.createElement('span');
    cup.classList.add('cup');
    cup.textContent = '☕';
    if (filled.includes(i)) cup.classList.add('filled');
    cupsContainer.appendChild(cup);
  }

  // big finale confetti
  if (count === MAX_COFFEES && !window._confettiShown) {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    window._confettiShown = true;
  }
  if (count < MAX_COFFEES) window._confettiShown = false;

  // reset link + star award
  const old = document.getElementById('reset-link');
  if (old) old.remove();

  if (count >= MAX_COFFEES) {
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
        // give a star, clear punches, re-render
        setStars(getStars() + 1);
        localStorage.removeItem(STORAGE_KEY);
        updateStatus();
        updateStars();
      } else {
        alert('❌ Incorrect code.');
      }
    });

    card.appendChild(resetLink);
  }
}

// On page load, handle ?punch=1 then render everything
document.addEventListener('DOMContentLoaded', () => {
  const url = new URL(window.location.href);
  if (url.searchParams.get('punch') === '1') {
    punchRandom();
    url.searchParams.delete('punch');
    history.replaceState(null, '', url.pathname);
  }

  updateStatus();
  updateStars();
});
