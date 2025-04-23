const MAX_COFFEES = 10;

function getCoffees() {
  return parseInt(localStorage.getItem('coffees') || '0');
}

function setCoffees(n) {
  localStorage.setItem('coffees', n);
}

function updateStatus() {
  const count = getCoffees();
  const status = document.getElementById('status');
  const cupsContainer = document.getElementById('cups');

  // Text message
  if (count >= MAX_COFFEES) {
    status.innerHTML = `🎉 You’ve earned a free coffee! (${count}/${MAX_COFFEES})`;
  } else {
    status.innerHTML = `You’ve had ${count} of ${MAX_COFFEES} coffees.`;
  }

  // Icons
  cupsContainer.innerHTML = '';
  for (let i = 0; i < MAX_COFFEES; i++) {
    const cup = document.createElement('span');
    cup.classList.add('cup');
    if (i < count) cup.classList.add('filled');
    cup.innerText = '☕';
    cupsContainer.appendChild(cup);
  }

  // 🎉 Celebration effect + confetti
  if (count === MAX_COFFEES) {
    document.body.classList.add('celebrate');

    // Show confetti once
    if (!window._confettiShown) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
      window._confettiShown = true;
    }
  } else {
    document.body.classList.remove('celebrate');
    window._confettiShown = false;
  }
}

// Auto-increment on page load
let count = getCoffees();
if (count < MAX_COFFEES) {
  count++;
  setCoffees(count);
}

updateStatus();
