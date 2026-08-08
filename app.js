// Descrições dos Jogos
const gameDescriptions = {
  'PS Store': 'Navegue pela loja para ver novos jogos e novidades.',
  'Flappy Sky': 'Desvie dos obstáculos no céu e alcance a maior pontuação!',
  'Click Master': 'Teste sua velocidade de clique e quebre recordes!',
  'Neon Runner': 'Desvie de obstáculos cyberpunk em alta velocidade!',
  'Troféus': 'Veja todas as suas conquistas desbloqueadas nos jogos.'
};

let tiles = document.querySelectorAll('.ps4-tile');
let currentIndex = 0;
let currentGameUrl = '';

// Atualização de Relógio
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// Atualização da Seleção no Carrossel
function updateSelection() {
  tiles.forEach((tile, index) => {
    if (index === currentIndex) {
      tile.classList.add('active');
      const title = tile.dataset.title || tile.querySelector('.tile-label').innerText;
      document.getElementById('selected-title').innerText = title;
      document.getElementById('selected-desc').innerText = gameDescriptions[title] || 'Aproveite o jogo!';
    } else {
      tile.classList.remove('active');
    }
  });

  const tileWidth = 110 + 20;
  const offset = -currentIndex * tileWidth;
  document.getElementById('carouselTrack').style.transform = `translateX(${offset}px)`;
}

// INICIAR JOGO
function launchGame(title, url) {
  currentGameUrl = url;
  document.getElementById('pause-game-title').innerText = title;
  document.getElementById('gameIframe').src = url;
  document.getElementById('gamePlayer').classList.remove('hidden');
  document.getElementById('pauseMenu').classList.add('hidden');
  closeModal('modal-store');
}

// TOGGLE MENU DE PAUSE
function togglePauseMenu() {
  const pauseMenu = document.getElementById('pauseMenu');
  pauseMenu.classList.toggle('hidden');
}

// REINICIAR JOGO
function restartGame() {
  const iframe = document.getElementById('gameIframe');
  iframe.src = currentGameUrl;
  document.getElementById('pauseMenu').classList.add('hidden');
}

// SAIR DO JOGO PARA O DASHBOARD (DESLIGA ÁUDIO E LIMPA IFRAME)
function exitToDashboard() {
  const iframe = document.getElementById('gameIframe');
  iframe.src = ''; // Limpa o iframe para parar o loop/som do jogo
  document.getElementById('gamePlayer').classList.add('hidden');
  document.getElementById('pauseMenu').classList.add('hidden');
}

// CONTROLE POR TECLADO
document.addEventListener('keydown', (e) => {
  const gamePlayer = document.getElementById('gamePlayer');

  // Se o jogo estiver aberto
  if (!gamePlayer.classList.contains('hidden')) {
    // Tecla ESC ou P acionam o PAUSE
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
      togglePauseMenu();
    }
    return;
  }

  // Se estiver no Dashboard PS4
  if (e.key === 'ArrowRight') {
    if (currentIndex < tiles.length - 1) {
      currentIndex++;
      updateSelection();
    }
  } else if (e.key === 'ArrowLeft') {
    if (currentIndex > 0) {
      currentIndex--;
      updateSelection();
    }
  } else if (e.key === 'Enter') {
    const activeTile = tiles[currentIndex];
    const type = activeTile.dataset.type;

    if (type === 'game') {
      launchGame(activeTile.dataset.title, activeTile.dataset.url);
    } else if (type === 'modal') {
      openModal(activeTile.dataset.target);
    }
  }
});

// CLIQUE DO MOUSE NOS TILES
tiles.forEach((tile, index) => {
  tile.addEventListener('click', () => {
    currentIndex = index;
    updateSelection();
    
    const type = tile.dataset.type;
    if (type === 'game') {
      launchGame(tile.dataset.title, tile.dataset.url);
    } else if (type === 'modal') {
      openModal(tile.dataset.target);
    }
  });
});

// SISTEMA DE MODAIS (Troféus, Login, Store)
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  if (id === 'modal-trophies') renderTrophies();
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

document.getElementById('btn-store').onclick = () => openModal('modal-store');
document.getElementById('btn-trophies').onclick = () => openModal('modal-trophies');
document.getElementById('btn-login').onclick = () => openModal('modal-login');

// TROFÉUS DUMMY
function renderTrophies() {
  const container = document.getElementById('trophyContainer');
  const trophies = [
    { title: 'Primeiro Passo', game: 'Console PS4', desc: 'Iniciou o sistema do console.', type: 'gold', unlocked: true },
    { title: 'Asas de Aço', game: 'Flappy Sky', desc: 'Jogou Flappy Sky pela primeira vez.', type: 'bronze', unlocked: true },
    { title: 'Dedo Veloz', game: 'Click Master', desc: 'Iniciou o desafio do Click Master.', type: 'silver', unlocked: false }
  ];

  container.innerHTML = trophies.map(t => `
    <div class="trophy-item" style="opacity: ${t.unlocked ? '1' : '0.4'}">
      <i class="fa-solid fa-trophy trophy-icon ${t.type}"></i>
      <div class="trophy-info">
        <h4>${t.title} <small>(${t.game})</small></h4>
        <p>${t.desc}</p>
      </div>
    </div>
  `).join('');
}

// PERFIL / LOGIN
const loginForm = document.getElementById('loginForm');
const avatarOptions = document.querySelectorAll('.avatar-option');
let selectedIcon = 'fa-user';

avatarOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    avatarOptions.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    selectedIcon = opt.dataset.icon;
  });
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('usernameInput').value;
  document.getElementById('current-username').innerText = username;
  document.getElementById('current-avatar').innerHTML = `<i class="fa-solid ${selectedIcon}"></i>`;
  localStorage.setItem('ps4_user', JSON.stringify({ name: username, icon: selectedIcon }));
  closeModal('modal-login');
});

const savedUser = JSON.parse(localStorage.getItem('ps4_user'));
if (savedUser) {
  document.getElementById('current-username').innerText = savedUser.name;
  document.getElementById('current-avatar').innerHTML = `<i class="fa-solid ${savedUser.icon}"></i>`;
}

updateSelection();
      

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
