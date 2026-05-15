const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, dbRun, dbGet, dbAll } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register a new player
async function registerPlayer(username, email, password) {
  try {
    // Check if user already exists
    const existing = await dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing) {
      return { success: false, error: 'Username or email already exists' };
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const result = await dbRun(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const userId = result.lastID;

    // Create player stats
    await dbRun(
      'INSERT INTO player_stats (user_id) VALUES (?)',
      [userId]
    );

    // Create online player record
    await dbRun(
      'INSERT INTO online_players (user_id, status) VALUES (?, ?)',
      [userId, 'idle']
    );

    // Generate token
    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });

    return {
      success: true,
      token,
      userId,
      username
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Login player
async function loginPlayer(username, password) {
  try {
    const user = await dbGet('SELECT id, username, password FROM users WHERE username = ?', [username]);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check password
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid password' };
    }

    // Update last login
    await dbRun('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    return {
      success: true,
      token,
      userId: user.id,
      username: user.username
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Verify token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get player profile
async function getPlayerProfile(userId) {
  try {
    const user = await dbGet(`
      SELECT u.id, u.username, u.created_at,
             ps.wins, ps.losses, ps.current_streak, ps.best_streak,
             ps.elo_rating, ps.gold, ps.total_elixir_spent
      FROM users u
      LEFT JOIN player_stats ps ON u.id = ps.user_id
      WHERE u.id = ?
    `, [userId]);

    return user || null;
  } catch (error) {
    return null;
  }
}

// Update player stats after match
async function updatePlayerStatsAfterMatch(winnerId, loserId, playerHp, enemyHp) {
  try {
    // Update winner
    await dbRun(`
      UPDATE player_stats
      SET wins = wins + 1,
          current_streak = current_streak + 1,
          best_streak = MAX(best_streak, current_streak + 1),
          elo_rating = elo_rating + 25,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [winnerId]);

    // Update loser
    await dbRun(`
      UPDATE player_stats
      SET losses = losses + 1,
          current_streak = 0,
          elo_rating = MAX(1000, elo_rating - 25),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [loserId]);

    // Record match
    await dbRun(`
      INSERT INTO matches (player1_id, player2_id, winner_id, loser_id, player1_hp, player2_hp, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [winnerId, loserId, winnerId, loserId, playerHp, enemyHp, 150]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  registerPlayer,
  loginPlayer,
  verifyToken,
  getPlayerProfile,
  updatePlayerStatsAfterMatch
};
