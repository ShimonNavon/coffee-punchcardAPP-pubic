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
  if (count >= MAX_COFFEES) {
    status.innerHTML = `🎉 You’ve earned a free coffee! (${count}/${MAX_COFFEES})`;
  } else {
    status.innerHTML = `You’ve had ${count} of ${MAX_COFFEES} coffees.`;
  }
}

function addCoffee() {
  let count = getCoffees();
  if (count < MAX_COFFEES) {
    count++;
    setCoffees(count);
    updateStatus();
  }
}

function resetCard() {
  setCoffees(0);
  updateStatus();
}

updateStatus();
