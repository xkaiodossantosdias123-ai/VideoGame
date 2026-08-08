// Referências de Elementos do DOM
const track = document.getElementById('carouselTrack');
let cards = document.querySelectorAll('.game-card');

const storeScreen = document.getElementById('storeScreen');
const openStoreBtn = document.getElementById('open-store-btn');
const closeStoreBtn = document.getElementById('closeStoreBtn');

let currentIndex = 0;

// Sistema de Áudio Interno em WebAudio (Som do PS4 sem precisar de arquivo externo)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'move') {
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // Som suave de navegação
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } else if (type === 'select') {
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Som de confirmação
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }
}

// Relógio em Tempo Real
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// Atualização da Posição do Carrossel e Foco
function updateCarousel() {
  cards.forEach((card, index) => {
    if (index === currentIndex) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // Calcula o Deslocamento do Carrossel para manter o item selecionado centralizado
  const cardWidth = 200 + 35; // Largura do card + gap
  const offset = -currentIndex * cardWidth;
  track.style.transform = `translateX(${offset}px)`;
}

// Abrir e Fechar PS Store
function openStore() {
  playSound('select');
  storeScreen.classList.remove('hidden');
}

function closeStore() {
  playSound('move');
  storeScreen.classList.add('hidden');
}

openStoreBtn.addEventListener('click', openStore);
closeStoreBtn.addEventListener('click', closeStore);

// Ação ao selecionar um card
function launchSelected() {
  const currentCard = cards[currentIndex];
  playSound('select');

  if (currentCard.dataset.type === 'store') {
    openStore();
  } else {
    const url = currentCard.getAttribute('data-url');
    if (url) {
      setTimeout(() => {
        window.location.href = url;
      }, 150);
    }
  }
}

// Navegação via Teclado (Setas, Enter, ESC, etc.)
document.addEventListener('keydown', (e) => {
  // Se a PS Store estiver aberta
  if (!storeScreen.classList.contains('hidden')) {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'o') {
      closeStore();
    }
    return;
  }

  // Se estiver no Dashboard
  if (e.key === 'ArrowRight') {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      playSound('move');
      updateCarousel();
    }
  } else if (e.key === 'ArrowLeft') {
    if (currentIndex > 0) {
      currentIndex--;
      playSound('move');
      updateCarousel();
    }
  } else if (e.key === 'Enter' || e.key.toLowerCase() === 'x') {
    launchSelected();
  }
});

// Navegação via Clique de Mouse no Carrossel
function bindCardClicks() {
  cards.forEach((card, index) => {
    card.onclick = () => {
      if (currentIndex === index) {
        launchSelected();
      } else {
        currentIndex = index;
        playSound('move');
        updateCarousel();
      }
    };
  });
}
bindCardClicks();

// Função para "Baixar/Instalar" um jogo na barra do console
function installGame(title, url, iconClass, colorClass, subtitle) {
  playSound('select');
  
  // Verifica se o jogo já está no carrossel
  const exists = Array.from(cards).some(card => card.getAttribute('data-url') === url);
  if (exists) {
    alert(`🎮 "${title}" já está instalado na sua biblioteca!`);
    closeStore();
    return;
  }

  // Cria o novo Card no Carrossel
  const newCard = document.createElement('div');
  newCard.className = 'game-card';
  newCard.setAttribute('data-type', 'game');
  newCard.setAttribute('data-url', url);
  newCard.innerHTML = `
    <div class="card-art ${colorClass}">
      <i class="fa-solid ${iconClass}"></i>
    </div>
    <div class="card-info">
      <span class="card-title">${title}</span>
      <span class="card-subtitle">${subtitle}</span>
    </div>
  `;

  track.appendChild(newCard);
  
  // Re-mapeia a lista de cards e eventos
  cards = document.querySelectorAll('.game-card');
  bindCardClicks();
  
  // Move o foco para o novo jogo instalado
  currentIndex = cards.length - 1;
  updateCarousel();

  alert(`✅ ${title} foi baixado e instalado com sucesso!`);
  closeStore();
}

// Inicialização
updateCarousel();
