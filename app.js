const cards = document.querySelectorAll('.game-card');
let currentIndex = 0;

// Atualiza relógio em tempo real
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// Destaca o card selecionado
function updateSelection(index) {
  cards.forEach((card, i) => {
    if (i === index) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// Navegação por teclado (Setas e Enter)
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      updateSelection(currentIndex);
    }
  } else if (e.key === 'ArrowLeft') {
    if (currentIndex > 0) {
      currentIndex--;
      updateSelection(currentIndex);
    }
  } else if (e.key === 'Enter') {
    const selectedGame = cards[currentIndex].getAttribute('data-url');
    if (selectedGame) {
      window.location.href = selectedGame;
    }
  }
});

// Suporte para cliques de mouse
cards.forEach((card, index) => {
  card.addEventListener('click', () => {
    currentIndex = index;
    updateSelection(currentIndex);
    const url = card.getAttribute('data-url');
    if (url) window.location.href = url;
  });
});
