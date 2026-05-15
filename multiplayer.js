// Multiplayer functionality for Royal Rift Arena
// This file adds multiplayer features without modifying existing single-player code

const SOCKET_URL = window.location.origin;
let socket = null;
let currentUser = null;
let currentBattleId = null;
let isMultiplayerMode = false;
let socketReady = false;

// Wait for socket to be ready
function waitForSocket() {
  return new Promise((resolve) => {
    if (socketReady) {
      resolve();
    } else {
      const checkSocket = setInterval(() => {
        if (socketReady) {
          clearInterval(checkSocket);
          resolve();
        }
      }, 100);
    }
  });
}

// Initialize Socket.io connection
function initializeMultiplayer() {
  // Dynamically load Socket.io library
  const script = document.createElement('script');
  script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
  script.onload = () => {
    console.log('Socket.io library loaded');
    socket = io(SOCKET_URL);
    setupSocketEvents();
  };
  script.onerror = () => {
    console.error('Failed to load Socket.io');
  };
  document.head.appendChild(script);
}

// Setup Socket.io events
function setupSocketEvents() {
  if (!socket) return;

  socket.on('connect', () => {
    console.log('✅ Socket connected to server');
    socketReady = true;
    if (currentUser) {
      console.log('Emitting player_online for:', currentUser.username);
      socket.emit('player_online', {
        userId: currentUser.userId,
        username: currentUser.username,
        token: currentUser.token
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
    socketReady = false;
  });

  socket.on('online_players_updated', (players) => {
    console.log('Received online players:', players);
    updateOnlinePlayersList(players);
  });

  socket.on('duel_request', (data) => {
    showDuelRequest(data);
  });

  socket.on('duel_rejected', (data) => {
    showNotification(`Duel request rejected`);
  });

  socket.on('battle_start', (data) => {
    console.log('📨 Received battle_start event:', data);
    handleMultiplayerBattleStart(data);
  });

  socket.on('opponent_action', (data) => {
    handleOpponentAction(data);
  });

  socket.on('battle_finished', (data) => {
    handleBattleFinished(data);
  });

  socket.on('battle_state_sync', (state) => {
    syncBattleState(state);
  });

  socket.on('error', (data) => {
    showNotification(`Error: ${data.message}`);
  });
}

// Register player
async function registerPlayer(username, email, password) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) {
      return { success: false, error: `Server error: ${response.status}. Make sure backend is running on http://localhost:3000` };
    }

    const data = await response.json();

    if (data.success) {
      currentUser = {
        userId: data.userId,
        username: data.username,
        token: data.token
      };
      localStorage.setItem('royal-rift-auth', JSON.stringify(currentUser));

      // Wait for socket to be ready, then emit
      await waitForSocket();
      if (socket && socket.connected) {
        console.log('Emitting player_online for new registration:', username);
        socket.emit('player_online', {
          userId: data.userId,
          username: data.username,
          token: data.token
        });
      }

      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}. Is the backend server running on http://localhost:3000?` };
  }
}

// Login player
async function loginPlayer(username, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      return { success: false, error: `Server error: ${response.status}. Make sure backend is running on http://localhost:3000` };
    }

    const data = await response.json();

    if (data.success) {
      currentUser = {
        userId: data.userId,
        username: data.username,
        token: data.token
      };
      localStorage.setItem('royal-rift-auth', JSON.stringify(currentUser));

      // Wait for socket to be ready, then emit
      await waitForSocket();
      if (socket && socket.connected) {
        console.log('Emitting player_online for login:', username);
        socket.emit('player_online', {
          userId: data.userId,
          username: data.username,
          token: data.token
        });
      }

      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}. Is the backend server running on http://localhost:3000?` };
  }
}

// Logout player
function logoutPlayer() {
  currentUser = null;
  localStorage.removeItem('royal-rift-auth');
  if (socket) {
    socket.disconnect();
  }
  location.reload();
}

// Restore session
async function restoreSession() {
  const saved = localStorage.getItem('royal-rift-auth');
  if (saved) {
    currentUser = JSON.parse(saved);
    // Wait for socket to be ready before emitting
    await waitForSocket();
    if (socket && socket.connected) {
      console.log('Restoring session for:', currentUser.username);
      socket.emit('player_online', {
        userId: currentUser.userId,
        username: currentUser.username,
        token: currentUser.token
      });
    }
    updatePlayerProfileUI();
    return true;
  }
  return false;
}

// Get online players
async function fetchOnlinePlayers() {
  try {
    const response = await fetch('/api/online-players');
    return await response.json();
  } catch (error) {
    console.error('Error fetching online players:', error);
    return [];
  }
}

// Get leaderboard
async function fetchLeaderboard(limit = 100) {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

// Get player profile
async function fetchPlayerProfile(userId) {
  try {
    const response = await fetch(`/api/profile/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }
}

// Request duel with another player
function requestDuel(opponentId, opponentUsername) {
  if (!socket || !currentUser) return;

  socket.emit('request_duel', {
    from_user_id: currentUser.userId,
    to_user_id: opponentId,
    from_username: currentUser.username
  });

  showNotification(`Duel request sent to ${opponentUsername}...`);
}

// Accept duel
function acceptDuel(fromUserId, fromUsername) {
  if (!socket || !currentUser) return;

  console.log(`✅ Accepting duel from ${fromUsername} (${fromUserId})`);
  socket.emit('accept_duel', {
    from_user_id: fromUserId,
    to_user_id: currentUser.userId,
    from_username: fromUsername,
    to_username: currentUser.username
  });
}

// Reject duel
function rejectDuel(fromUserId) {
  if (!socket || !currentUser) return;

  socket.emit('reject_duel', {
    from_user_id: fromUserId,
    to_user_id: currentUser.userId
  });
}

// Handle multiplayer battle start
function handleMultiplayerBattleStart(data) {
  const { battleId, opponent, opponent_id, is_multiplayer } = data;
  console.log('🎮 Battle start event received:', data);
  
  currentBattleId = battleId;
  isMultiplayerMode = true;

  // Update UI to show opponent info
  const selectedCardLabel = document.getElementById('selectedCardLabel');
  if (selectedCardLabel) {
    selectedCardLabel.textContent = `vs ${opponent}`;
  }

  // ACTUALLY START THE BATTLE - call the same function as the "Start Battle" button
  if (typeof state !== 'undefined') {
    console.log('✅ Starting multiplayer battle with:', opponent);

    if (typeof resetMatch !== 'undefined') {
      resetMatch();
    } else {
      state.gameOver = false;
      state.timeLeft = typeof GAME_TIME !== 'undefined' ? GAME_TIME : state.timeLeft;
      state.elixir = 5;
      state.selectedCard = null;
      state.dragCardIndex = null;
      state.dragPreview = { active: false, x: 0, y: 0, lane: 0, valid: false };
    }

    state.battleStarted = true;
    state.isMultiplayer = true;
    window.currentBattleId = battleId;
    window.currentOpponentId = opponent_id;
    window.isMultiplayerMode = true;
    const startBattleBtn = document.getElementById('startBattleBtn');
    if (startBattleBtn) {
      startBattleBtn.classList.add('hidden');
    }

    // Show deck status message (same as when Start Battle button is clicked)
    if (typeof showDeckStatus !== 'undefined') {
      showDeckStatus('Battle started! Drag cards to deploy. Right-click units to use abilities!');
    }

    // Trigger UI update
    if (typeof markCardStateDirty !== 'undefined') {
      markCardStateDirty();
    }
  } else {
    console.error('❌ state object not found!');
  }

  // Show notification
  showNotification(`⚔️ Battle started with ${opponent}!`);
}

// Handle opponent action in multiplayer battle
function handleOpponentAction(data) {
  const { action, timestamp } = data;
  console.log('📥 Opponent action received:', action);
  handleOpponentMultiplayerAction(action);
  window.multiplayerOpponentAction = action;
}

// Handle battle finished
function handleBattleFinished(data) {
  const { winner_id, loser_id, result } = data;

  currentBattleId = null;
  isMultiplayerMode = false;
  window.currentBattleId = null;
  window.isMultiplayerMode = false;
  if (typeof state !== 'undefined') {
    state.isMultiplayer = false;
  }
}

function sendMultiplayerAction(action) {
  if (!socket || !currentBattleId) return;
  socket.emit('battle_action', {
    battleId: currentBattleId,
    action,
    timestamp: Date.now()
  });
}

function sendMultiplayerBattleResult(result) {
  if (!socket || !currentBattleId || !currentUser || !window.currentOpponentId) return;
  if (result === 'Draw!') return; // Do not report draws to the server yet

  const winnerId = result === 'Victory!' ? currentUser.userId : window.currentOpponentId;
  const loserId = result === 'Victory!' ? window.currentOpponentId : currentUser.userId;

  socket.emit('battle_end', {
    battleId: currentBattleId,
    winner_id: winnerId,
    loser_id: loserId,
    player_hp: typeof state !== 'undefined' ? state.playerTower.hp : 0,
    enemy_hp: typeof state !== 'undefined' ? state.enemyTower.hp : 0
  });
}

window.sendMultiplayerAction = sendMultiplayerAction;
window.sendMultiplayerBattleResult = sendMultiplayerBattleResult;

// Sync battle state between players
function syncBattleState(state) {
  window.multiplayerBattleState = state;
}

// Update online players list UI
function updateOnlinePlayersList(players) {
  const container = document.getElementById('onlinePlayersList');
  if (!container) return;

  container.innerHTML = '';

  players.forEach(player => {
    if (player.id === (currentUser ? currentUser.userId : null)) return;

    const inBattle = player.in_battle ? '🎮 In Battle' : '✅ Ready';
    const playerEl = document.createElement('div');
    playerEl.className = 'online-player-item';
    playerEl.innerHTML = `
      <div class="player-info">
        <strong>${player.username}</strong>
        <span class="player-stats">${player.wins} wins • ${player.elo_rating} elo</span>
        <span class="player-status">${inBattle}</span>
      </div>
      ${!player.in_battle ? `<button onclick="requestDuel(${player.id}, '${player.username}')" class="challenge-btn small-btn">Challenge</button>` : '<span class="unavailable">Busy</span>'}
    `;
    container.appendChild(playerEl);
  });
}

// Show duel request
function showDuelRequest(data) {
  const { from_user_id, from_username } = data;

  const modal = document.createElement('div');
  modal.className = 'duel-request-modal glass';
  modal.innerHTML = `
    <div class="duel-request-card glass">
      <h3>${from_username} challenges you to a duel! ⚔️</h3>
      <div class="duel-actions">
        <button class="challenge-btn primary" onclick="acceptDuel(${from_user_id}, '${from_username}'); this.closest('.duel-request-modal').remove();">Accept</button>
        <button class="challenge-btn" onclick="rejectDuel(${from_user_id}); this.closest('.duel-request-modal').remove();">Decline</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  setTimeout(() => {
    if (modal.parentNode) modal.remove();
  }, 10000);
}

// Show leaderboard
async function showLeaderboard() {
  const modal = document.getElementById('leaderboardModal');
  if (!modal) return;

  modal.classList.remove('hidden');
  const content = document.getElementById('leaderboardContent');
  content.innerHTML = '<p style="text-align: center;">Loading leaderboard...</p>';

  const leaderboard = await fetchLeaderboard(100);

  content.innerHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: rgba(0, 212, 255, 0.2); border-bottom: 2px solid rgba(0, 212, 255, 0.5);">
          <th style="padding: 10px; text-align: left;">#</th>
          <th style="padding: 10px; text-align: left;">Player</th>
          <th style="padding: 10px; text-align: center;">Wins</th>
          <th style="padding: 10px; text-align: center;">Losses</th>
          <th style="padding: 10px; text-align: center;">Win Rate</th>
          <th style="padding: 10px; text-align: center;">Best Streak</th>
          <th style="padding: 10px; text-align: center;">Elo</th>
        </tr>
      </thead>
      <tbody>
        ${leaderboard.map((player, idx) => {
          const winRate = player.wins + player.losses > 0 
            ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1) 
            : 0;
          return `
            <tr style="border-bottom: 1px solid rgba(0, 212, 255, 0.2); ${idx % 2 === 0 ? 'background: rgba(0, 212, 255, 0.05);' : ''}">
              <td style="padding: 10px;">${idx + 1}</td>
              <td style="padding: 10px;"><strong>${player.username}</strong></td>
              <td style="padding: 10px; text-align: center; color: #39ff14;">${player.wins}</td>
              <td style="padding: 10px; text-align: center; color: #ff6b6b;">${player.losses}</td>
              <td style="padding: 10px; text-align: center; color: #fcd34d;">${winRate}%</td>
              <td style="padding: 10px; text-align: center;">${player.best_streak}</td>
              <td style="padding: 10px; text-align: center; font-weight: bold; color: #00d4ff;">${player.elo_rating}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// Update player profile UI
function updatePlayerProfileUI() {
  if (!currentUser) return;

  // Hide auth modal
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.style.display = 'none';
  }

  const profileBtn = document.getElementById('playerProfileBtn');
  if (profileBtn) {
    profileBtn.innerHTML = `👤 ${currentUser.username}`;
  }

  const sidebar = document.getElementById('onlinePlayersSidebar');
  if (sidebar) {
    sidebar.classList.remove('hidden');
    fetchOnlinePlayers().then(players => updateOnlinePlayersList(players));
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(90deg, #00d4ff, #b537f2);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    z-index: 1000;
    font-weight: bold;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 4000);
}

// Show auth modal
function showAuthModal(isLogin = true) {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  const title = document.getElementById('authTitle');
  const form = document.getElementById('authForm');
  const toggle = document.querySelector('.auth-toggle');

  title.textContent = isLogin ? 'Login' : 'Sign Up';

  form.innerHTML = `
    <div style="display: grid; gap: 10px;">
      <input type="text" id="authUsername" placeholder="Username" style="padding: 10px; border: 1px solid rgba(0,212,255,0.5); border-radius: 8px; background: rgba(15,23,42,0.8); color: white;">
      <input type="password" id="authPassword" placeholder="Password" style="padding: 10px; border: 1px solid rgba(0,212,255,0.5); border-radius: 8px; background: rgba(15,23,42,0.8); color: white;">
      <button onclick="submitAuth(${isLogin})" class="challenge-btn primary" style="width: 100%;">${isLogin ? 'Login' : 'Sign Up'}</button>
    </div>
  `;

  toggle.innerHTML = `
    <span>${isLogin ? "Don't have an account?" : 'Already have an account?'} <button id="toggleAuthBtn" class="link-btn" onclick="showAuthModal(${!isLogin})" style="background: none; border: none; color: var(--neon-cyan); cursor: pointer; text-decoration: underline;">${isLogin ? 'Sign Up' : 'Login'}</button></span>
  `;

  modal.style.display = 'grid';
}

// Submit auth
async function submitAuth(isLogin) {
  const username = document.getElementById('authUsername')?.value;
  const password = document.getElementById('authPassword')?.value;

  if (!username || !password) {
    showNotification('Please fill in all fields');
    return;
  }

  if (!isLogin && username.length < 3) {
    showNotification('Username must be at least 3 characters');
    return;
  }

  // Auto-generate email for registration
  const email = isLogin ? null : `${username}@royalrift.local`;

  const result = isLogin 
    ? await loginPlayer(username, password)
    : await registerPlayer(username, email, password);

  if (result.success) {
    showNotification(`${isLogin ? 'Logged in' : 'Registered'} successfully!`);
    document.getElementById('authModal').style.display = 'none';
    updatePlayerProfileUI();
  } else {
    showNotification(`Error: ${result.error}`);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  initializeMultiplayer();

  // Add styles for multiplayer UI
  const style = document.createElement('style');
  style.textContent = `
    .auth-modal {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.76);
      display: grid;
      place-items: center;
      z-index: 50;
      padding: 1rem;
      backdrop-filter: blur(5px);
    }

    .auth-panel {
      width: min(400px, 100%);
      padding: 2rem;
      border: 2px solid rgba(0, 212, 255, 0.5);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 23, 50, 0.9));
      box-shadow: 0 20px 50px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.05);
    }

    .auth-panel h2 {
      margin: 0 0 1.5rem;
      font-family: Cinzel, serif;
      color: var(--neon-cyan);
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
    }

    .auth-toggle {
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }

    .link-btn {
      background: none;
      border: none;
      color: var(--neon-cyan);
      cursor: pointer;
      text-decoration: underline;
      font-weight: 700;
    }

    .online-sidebar {
      position: fixed;
      right: 0;
      top: 0;
      width: 300px;
      height: 100vh;
      background: var(--glass);
      border-left: 2px solid rgba(0, 212, 255, 0.4);
      overflow-y: auto;
      z-index: 40;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .online-sidebar.hidden {
      display: none;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 2px solid rgba(0, 212, 255, 0.3);
    }

    .sidebar-header h3 {
      margin: 0;
      color: var(--neon-cyan);
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--neon-cyan);
      cursor: pointer;
      font-size: 1.5rem;
    }

    .online-players-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .online-player-item {
      border: 2px solid rgba(0, 212, 255, 0.3);
      border-radius: 10px;
      padding: 0.8rem;
      background: rgba(15, 23, 42, 0.8);
      transition: all 0.2s ease;
    }

    .online-player-item:hover {
      border-color: rgba(0, 212, 255, 0.6);
      background: rgba(15, 23, 42, 0.95);
    }

    .player-info {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      margin-bottom: 0.5rem;
    }

    .player-info strong {
      color: var(--neon-cyan);
    }

    .player-stats {
      font-size: 0.75rem;
      color: #93c5fd;
    }

    .player-status {
      font-size: 0.75rem;
      color: #a7f3d0;
    }

    .unavailable {
      font-size: 0.75rem;
      color: #fecaca;
    }

    .leaderboard-modal {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.76);
      display: grid;
      place-items: center;
      z-index: 45;
      padding: 1rem;
      backdrop-filter: blur(5px);
    }

    .leaderboard-modal.hidden {
      display: none;
    }

    .leaderboard-panel {
      width: min(900px, 100%);
      max-height: 80vh;
      overflow-y: auto;
      padding: 2rem;
      border: 2px solid rgba(0, 212, 255, 0.5);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 23, 50, 0.9));
      box-shadow: 0 20px 50px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.05);
    }

    .leaderboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid rgba(0, 212, 255, 0.3);
    }

    .leaderboard-header h2 {
      margin: 0;
      color: var(--neon-cyan);
      font-family: Cinzel, serif;
    }

    .duel-request-modal {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.76);
      display: grid;
      place-items: center;
      z-index: 60;
      padding: 1rem;
      backdrop-filter: blur(5px);
    }

    .duel-request-card {
      width: min(400px, 100%);
      text-align: center;
      padding: 2rem;
      border: 2px solid rgba(0, 212, 255, 0.5);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 23, 50, 0.9));
      box-shadow: 0 20px 50px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.05);
    }

    .duel-request-card h3 {
      margin: 0 0 1.5rem;
      color: var(--neon-cyan);
      font-size: 1.3rem;
    }

    .duel-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .unavailable {
      padding: 0.4rem 0.8rem;
      background: rgba(255, 0, 110, 0.2);
      border: 1px solid rgba(255, 0, 110, 0.4);
      border-radius: 999px;
      color: #ff006e;
      font-size: 0.75rem;
    }
  `;
  document.head.appendChild(style);

  // Check if user is already logged in
  const isLoggedIn = await restoreSession();
  if (isLoggedIn) {
    showNotification(`Welcome back, ${currentUser.username}!`);
  } else {
    // Show auth modal if not logged in
    showAuthModal(true);
  }
});

// Export functions for use in HTML
window.multiplayerAPI = {
  registerPlayer,
  loginPlayer,
  logoutPlayer,
  requestDuel,
  acceptDuel,
  rejectDuel,
  fetchOnlinePlayers,
  fetchLeaderboard,
  fetchPlayerProfile,
  showNotification,
  showLeaderboard,
  submitAuth,
  showAuthModal
};
