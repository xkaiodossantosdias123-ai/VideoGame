// Descrições
const gameDescriptions = {
  'PS Store': 'Navegue pela loja oficial para encontrar novos jogos.',
  'Amigos & Chat': 'Envie mensagens e adicione amigos da PSN.',
  'Party Call': 'Entre em salas de voz com microfone em tempo real.',
  'Flappy Sky': 'Desvie de obstáculos no céu e ganhe troféus!',
  'Click Master': 'Teste a velocidade do seu clique!',
  'Neon Runner': 'Corrida infinita estilo cyberpunk.',
  'Troféus': 'Veja todas as conquistas salvas da sua conta.'
};

// Banco de Dados Inicial
let friends = JSON.parse(localStorage.getItem('ps4_friends')) || [
  { id: 'Kratos_BR', status: 'online', messages: [{ sender: 'them', text: 'Bora jogar uma partida hoje?' }] },
  { id: 'GamerGirl99', status: 'online', messages: [] },
  { id: 'Pro_Player_PS4', status: 'offline', messages: [] }
];

let trophies = JSON.parse(localStorage.getItem('ps4_trophies')) || [
  { id: 1, title: 'Início da Jornada', game: 'Console PS4', desc: 'Criou sua conta na PSN.', type: 'gold', unlocked: true },
  { id: 2, title: 'Piloto Celestial', game: 'Flappy Sky', desc: 'Pontuou 10 vezes no Flappy Sky.', type: 'bronze', unlocked: false }
];

let tiles = document.querySelectorAll('.ps4-tile');
let currentIndex = 0;
let activeChatFriend = null;
let isMicOn = false;
let micStream = null;

// Relógio
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
setInterval(updateClock, 1000);
updateClock();

// Atualiza Carrossel
function updateSelection() {
  tiles.forEach((tile, index) => {
    if (index === currentIndex) {
      tile.classList.add('active');
      const title = tile.dataset.title || tile.querySelector('.tile-label').innerText;
      document.getElementById('selected-title').innerText = title;
      document.getElementById('selected-desc').innerText = gameDescriptions[title] || 'Aproveite!';
    } else {
      tile.classList.remove('active');
    }
  });

  const offset = -currentIndex * (110 + 20);
  document.getElementById('carouselTrack').style.transform = `translateX(${offset}px)`;
}

// 🏆 SISTEMA DE DESBLOQUEIO DE TROFÉUS DA PSN (Chamado de dentro dos jogos ou do console)
window.unlockTrophy = function(title, desc, type = 'bronze') {
  // Salva troféu
  trophies.push({ id: Date.now(), title, game: 'Jogo HTML', desc, type, unlocked: true });
  localStorage.setItem('ps4_trophies', JSON.stringify(trophies));

  // Exibe Popup PS4
  const popup = document.getElementById('trophyPopup');
  document.getElementById('popupTrophyTitle').innerText = title;
  document.getElementById('popupTrophyDesc').innerText = desc;
  
  popup.classList.remove('hidden');
  setTimeout(() => popup.classList.add('hidden'), 4000);
};

// Abrir / Fechar Jogos
function launchGame(title, url) {
  document.getElementById('pause-game-title').innerText = title;
  document.getElementById('gameIframe').src = url;
  document.getElementById('gamePlayer').classList.remove('hidden');
  closeModal('modal-store');
}

function togglePauseMenu() {
  document.getElementById('pauseMenu').classList.toggle('hidden');
}

function restartGame() {
  const iframe = document.getElementById('gameIframe');
  iframe.src = iframe.src;
  document.getElementById('pauseMenu').classList.add('hidden');
}

function exitToDashboard() {
  document.getElementById('gameIframe').src = '';
  document.getElementById('gamePlayer').classList.add('hidden');
  document.getElementById('pauseMenu').classList.add('hidden');
}

// Controle por Teclado
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('gamePlayer').classList.contains('hidden')) {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') togglePauseMenu();
    return;
  }

  if (e.key === 'ArrowRight' && currentIndex < tiles.length - 1) {
    currentIndex++; updateSelection();
  } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
    currentIndex--; updateSelection();
  } else if (e.key === 'Enter') {
    const activeTile = tiles[currentIndex];
    if (activeTile.dataset.type === 'game') launchGame(activeTile.dataset.title, activeTile.dataset.url);
    else openModal(activeTile.dataset.target);
  }
});

tiles.forEach((tile, index) => {
  tile.onclick = () => {
    currentIndex = index; updateSelection();
    if (tile.dataset.type === 'game') launchGame(tile.dataset.title, tile.dataset.url);
    else openModal(tile.dataset.target);
  };
});

// Modais
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  if (id === 'modal-friends') renderFriends();
  if (id === 'modal-party') renderParty();
  if (id === 'modal-trophies') renderTrophies();
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

document.getElementById('btn-store').onclick = () => openModal('modal-store');
document.getElementById('btn-friends').onclick = () => openModal('modal-friends');
document.getElementById('btn-party').onclick = () => openModal('modal-party');
document.getElementById('btn-trophies').onclick = () => openModal('modal-trophies');
document.getElementById('btn-login').onclick = () => openModal('modal-login');

// 👥 SISTEMA DE AMIGOS E CHAT DE MENSAGENS
function renderFriends() {
  const container = document.getElementById('friendsList');
  container.innerHTML = friends.map(f => `
    <div class="friend-item ${activeChatFriend === f.id ? 'active' : ''}" onclick="selectChatFriend('${f.id}')">
      <div class="friend-status ${f.status}"></div>
      <span>${f.id}</span>
    </div>
  `).join('');
}

function addFriend() {
  const input = document.getElementById('friendInput');
  if (!input.value.trim()) return;
  friends.push({ id: input.value.trim(), status: 'online', messages: [] });
  localStorage.setItem('ps4_friends', JSON.stringify(friends));
  input.value = '';
  renderFriends();
}

function selectChatFriend(id) {
  activeChatFriend = id;
  renderFriends();
  
  const friend = friends.find(f => f.id === id);
  document.getElementById('chatHeader').innerText = `Conversando com: ${friend.id}`;
  document.getElementById('messageInput').disabled = false;
  document.getElementById('sendMessageBtn').disabled = false;

  renderMessages();
}

function renderMessages() {
  const friend = friends.find(f => f.id === activeChatFriend);
  const container = document.getElementById('chatMessages');
  container.innerHTML = friend.messages.map(m => `
    <div class="msg-bubble ${m.sender === 'me' ? 'sent' : 'received'}">${m.text}</div>
  `).join('');
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  if (!input.value.trim() || !activeChatFriend) return;

  const friend = friends.find(f => f.id === activeChatFriend);
  friend.messages.push({ sender: 'me', text: input.value.trim() });
  
  // Resposta Automática Simulada
  setTimeout(() => {
    friend.messages.push({ sender: 'them', text: 'Show! Vamo jogar junto!' });
    localStorage.setItem('ps4_friends', JSON.stringify(friends));
    if (activeChatFriend === friend.id) renderMessages();
  }, 1000);

  localStorage.setItem('ps4_friends', JSON.stringify(friends));
  input.value = '';
  renderMessages();
}

// 🎧 SISTEMA DE CALL DE VOZ (PARTY)
function renderParty() {
  const user = JSON.parse(localStorage.getItem('ps4_user')) || { name: 'Você' };
  const container = document.getElementById('partyMembers');
  
  container.innerHTML = `
    <div class="party-member-card">
      <div class="party-avatar ${isMicOn ? 'speaking' : ''}"><i class="fa-solid fa-user"></i></div>
      <span>${user.name}</span>
    </div>
    <div class="party-member-card">
      <div class="party-avatar speaking"><i class="fa-solid fa-ghost"></i></div>
      <span>Kratos_BR</span>
    </div>
  `;
}

async function toggleMicrophone() {
  const btnText = document.getElementById('micStatusText');
  
  if (!isMicOn) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isMicOn = true;
      btnText.innerText = 'Desativar Microfone';
    } catch (err) {
      alert('Permissão de microfone negada ou indisponível.');
    }
  } else {
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    isMicOn = false;
    btnText.innerText = 'Ativar Microfone';
  }
  renderParty();
}

// 🏆 RENDERIZAR TROFÉUS
function renderTrophies() {
  const container = document.getElementById('trophyContainer');
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

// PERFIL
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('usernameInput').value;
  document.getElementById('current-username').innerText = username;
  localStorage.setItem('ps4_user', JSON.stringify({ name: username }));
  closeModal('modal-login');
});

const savedUser = JSON.parse(localStorage.getItem('ps4_user'));
if (savedUser) document.getElementById('current-username').innerText = savedUser.name;

updateSelection();
  
