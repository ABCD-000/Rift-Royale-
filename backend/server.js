const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { dbGet, dbAll, dbRun } = require('./database');
const auth = require('./auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from parent directory (where HTML/CSS/JS are)
app.use(express.static(path.join(__dirname, '..')));

// Store active user connections
const activeUsers = new Map();
const activeBattles = new Map();

// Routes
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await auth.registerPlayer(username, email, password);
  res.json(result);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await auth.loginPlayer(username, password);
  res.json(result);
});

app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const profile = await auth.getPlayerProfile(userId);

  if (!profile) {
    return res.status(404).json({ error: 'Player not found' });
  }

  res.json(profile);
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const leaderboard = await dbAll(`
      SELECT u.id, u.username, ps.wins, ps.losses, ps.best_streak, ps.elo_rating, ps.updated_at
      FROM player_stats ps
      JOIN users u ON ps.user_id = u.id
      ORDER BY ps.wins DESC, ps.elo_rating DESC
      LIMIT ?
    `, [limit]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/online-players', async (req, res) => {
  try {
    const onlinePlayers = await dbAll(`
      SELECT u.id, u.username, ps.wins, ps.elo_rating, op.status, op.in_battle
      FROM online_players op
      JOIN users u ON op.user_id = u.id
      LEFT JOIN player_stats ps ON u.id = ps.user_id
      WHERE op.status = 'online'
      ORDER BY ps.elo_rating DESC
    `);

    res.json(onlinePlayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/match-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit || 20;

    const matches = await dbAll(`
      SELECT m.*, u1.username as player1_name, u2.username as player2_name
      FROM matches m
      JOIN users u1 ON m.player1_id = u1.id
      JOIN users u2 ON m.player2_id = u2.id
      WHERE m.player1_id = ? OR m.player2_id = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `, [userId, userId, limit]);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log(`🔌 New socket connection: ${socket.id}`);

  // Player connects and goes online
  socket.on('player_online', async (data) => {
    const { userId, username, token } = data;
    console.log(`🟢 player_online event received for user: ${username} (${userId})`);

    // Verify token
    const decoded = auth.verifyToken(token);
    if (!decoded || decoded.userId !== parseInt(userId)) {
      console.error('❌ Token verification failed for:', username);
      socket.emit('error', { message: 'Invalid token' });
      return;
    }

    // Store connection
    activeUsers.set(userId, {
      socketId: socket.id,
      username,
      userId,
      token
    });
    console.log(`✅ Added user to activeUsers: ${username}, Total users: ${activeUsers.size}`);

    // Update database - reset battle status on reconnect
    await dbRun(`
      UPDATE online_players
      SET status = 'online', in_battle = 0, opponent_id = NULL, last_seen = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [userId]);

    // Also reset any battles they were in
    await dbRun(`
      UPDATE online_players
      SET in_battle = 0, opponent_id = NULL
      WHERE opponent_id = ?
    `, [userId]);

    // Broadcast updated online players list
    broadcastOnlinePlayersList();

    socket.on('disconnect', async () => {
      activeUsers.delete(userId);
      await dbRun(`
        UPDATE online_players
        SET status = 'idle', last_seen = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [userId]);
      broadcastOnlinePlayersList();
    });
  });

  // Duel request
  socket.on('request_duel', (data) => {
    const { from_user_id, to_user_id, from_username } = data;
    const targetUser = activeUsers.get(to_user_id);

    if (!targetUser) {
      socket.emit('error', { message: 'Player not online' });
      return;
    }

    // Send duel request to target
    io.to(targetUser.socketId).emit('duel_request', {
      from_user_id,
      from_username,
      request_id: `${from_user_id}_${to_user_id}_${Date.now()}`
    });
  });

  // Accept duel
  socket.on('accept_duel', async (data) => {
    const { from_user_id, to_user_id, from_username, to_username } = data;
    console.log(`⚔️  accept_duel event: ${from_username} vs ${to_username}`);

    const player1 = activeUsers.get(from_user_id);
    const player2 = activeUsers.get(to_user_id);

    if (!player1 || !player2) {
      console.error('❌ Player not found in activeUsers');
      socket.emit('error', { message: 'Opponent disconnected' });
      return;
    }

    const battleId = `battle_${from_user_id}_${to_user_id}_${Date.now()}`;
    console.log(`🎮 Creating battle: ${battleId}`);

    // Store battle
    activeBattles.set(battleId, {
      player1_id: from_user_id,
      player2_id: to_user_id,
      player1_name: from_username,
      player2_name: to_username,
      player1_socket: player1.socketId,
      player2_socket: player2.socketId,
      started_at: Date.now()
    });

    // Notify both players
    console.log(`📤 Sending battle_start to player1 socket: ${player1.socketId}`);
    io.to(player1.socketId).emit('battle_start', {
      battleId,
      opponent: to_username,
      opponent_id: to_user_id,
      is_multiplayer: true
    });

    console.log(`📤 Sending battle_start to player2 socket: ${player2.socketId}`);
    io.to(player2.socketId).emit('battle_start', {
      battleId,
      opponent: from_username,
      opponent_id: from_user_id,
      is_multiplayer: true
    });

    // Update online status
    await dbRun(`
      UPDATE online_players
      SET in_battle = 1, opponent_id = ?
      WHERE user_id = ?
    `, [to_user_id, from_user_id]);

    await dbRun(`
      UPDATE online_players
      SET in_battle = 1, opponent_id = ?
      WHERE user_id = ?
    `, [from_user_id, to_user_id]);

    broadcastOnlinePlayersList();
  });

  // Reject duel
  socket.on('reject_duel', (data) => {
    const { from_user_id, to_user_id } = data;
    const requester = activeUsers.get(from_user_id);

    if (requester) {
      io.to(requester.socketId).emit('duel_rejected', {
        by_user_id: to_user_id
      });
    }
  });

  // Send battle action
  socket.on('battle_action', (data) => {
    const { battleId, action, timestamp } = data;
    const battle = activeBattles.get(battleId);

    if (!battle) return;

    // Determine opponent socket
    const opponentSocket = socket.id === battle.player1_socket
      ? battle.player2_socket
      : battle.player1_socket;

    // Forward action to opponent
    io.to(opponentSocket).emit('opponent_action', {
      action,
      timestamp
    });
  });

  // Battle ended
  socket.on('battle_end', async (data) => {
    const { battleId, winner_id, loser_id, player_hp, enemy_hp } = data;
    const battle = activeBattles.get(battleId);

    if (!battle) return;

    // Update stats
    await auth.updatePlayerStatsAfterMatch(winner_id, loser_id, player_hp, enemy_hp);

    const opponentSocket = socket.id === battle.player1_socket
      ? battle.player2_socket
      : battle.player1_socket;

    // Notify opponent
    io.to(opponentSocket).emit('battle_finished', {
      winner_id,
      loser_id,
      result: 'loss'
    });

    // Notify sender
    socket.emit('battle_finished', {
      winner_id,
      loser_id,
      result: 'win'
    });

    // Clean up
    activeBattles.delete(battleId);
    await dbRun(`
      UPDATE online_players
      SET in_battle = 0, opponent_id = NULL
      WHERE user_id IN (?, ?)
    `, [battle.player1_id, battle.player2_id]);

    broadcastOnlinePlayersList();
  });

  // Update battle state sync
  socket.on('sync_battle_state', (data) => {
    const { battleId, state } = data;
    const battle = activeBattles.get(battleId);

    if (!battle) return;

    const opponentSocket = socket.id === battle.player1_socket
      ? battle.player2_socket
      : battle.player1_socket;

    io.to(opponentSocket).emit('battle_state_sync', state);
  });
});

// Helper function to broadcast online players
async function broadcastOnlinePlayersList() {
  try {
    const onlinePlayers = await dbAll(`
      SELECT u.id, u.username, ps.wins, ps.elo_rating, op.status, op.in_battle
      FROM online_players op
      JOIN users u ON op.user_id = u.id
      LEFT JOIN player_stats ps ON u.id = ps.user_id
      WHERE op.status = 'online'
      ORDER BY ps.elo_rating DESC
    `);

    console.log('📡 Broadcasting online players:', onlinePlayers);
    io.emit('online_players_updated', onlinePlayers);
  } catch (error) {
    console.error('❌ Error broadcasting players:', error);
  }
}

// Serve main index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Reset stale online player states on startup
(async () => {
  try {
    await dbRun(`
      UPDATE online_players
      SET status = 'idle', in_battle = 0, opponent_id = NULL
    `);
    console.log('✅ Reset stale online player states on startup');
  } catch (error) {
    console.error('❌ Failed to reset online player states on startup:', error);
  }

  server.listen(PORT, () => {
    console.log(`✨ Royal Rift Server running on http://localhost:${PORT}`);
  });
})();

module.exports = { app, server, io };
