# Royal Rift Arena - Multiplayer Edition

A single-player Clash Royale-like game enhanced with full multiplayer functionality. Players can now play against each other online, compete on the global leaderboard, and challenge other players in real-time battles.

## Features Added

### ✨ Multiplayer Features
- **Online Player List**: See all players currently online and their stats
- **Player Profiles**: View detailed profiles with win/loss records and Elo ratings
- **Duel System**: Challenge other players to 1v1 battles
- **Global Leaderboard**: Real-time ranked leaderboard showing top players by wins
- **Real-time Synchronization**: Battles sync in real-time via WebSocket
- **Player Authentication**: Secure login/register system
- **Match History**: Track all battles and statistics
- **Elo Rating System**: Dynamic rating system that updates after each match
- **Streak Tracking**: Monitor current and best win streaks

### Preserved Features
✅ All original single-player game mechanics preserved
✅ All existing cards, game modes, and UI elements intact
✅ Local progress saving still works
✅ No code was deleted

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Backend Setup

1. **Navigate to the backend folder:**
```bash
cd "c:\Users\soura\Downloads\Something Beter\backend"
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the server:**
```bash
npm start
```

The server will run on `http://localhost:3000`

### Frontend Setup

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see the login screen
3. Create a new account or login with existing credentials

## How to Play Multiplayer

### Getting Started
1. **Register/Login**: Create an account with username, email, and password
2. **View Online Players**: Check the online players sidebar to see who's playing
3. **Challenge**: Click "Challenge" button next to any player to send a duel request
4. **Battle**: Once accepted, the battle starts immediately with real-time synchronization

### Leaderboard
- Click the **🏆 Leaderboard** button in the header
- View global rankings by:
  - Total wins
  - Elo rating
  - Win rate
  - Best streak

### Player Profile
- Click your username button to logout
- Your stats update automatically after each battle

## Architecture

### Frontend
- `index.html`: Main game interface (UNCHANGED except for new buttons)
- `style.css`: All game styling (UNCHANGED, new multiplayer styles added)
- `script.js`: Original game logic (COMPLETELY UNCHANGED)
- `multiplayer.js`: New multiplayer functionality (NEW FILE)

### Backend
- `server.js`: Express server + Socket.io WebSocket handler
- `database.js`: SQLite database schema and initialization
- `auth.js`: Authentication (JWT, bcrypt) and player management
- `package.json`: Node dependencies

## Database Schema

The system uses SQLite with the following tables:

### users
- Stores player accounts
- Username, email, hashed password
- Created and last login timestamps

### player_stats
- Player statistics (wins, losses, streaks, Elo)
- Updated after each match

### matches
- Complete match history
- Player IDs, winner, HP values
- Match timestamps

### online_players
- Real-time online status
- Current battle status
- Opponent ID if in battle

### card_collection
- Player card collection with levels

### player_decks
- Saved deck configurations

## API Endpoints

### Authentication
- `POST /api/register` - Create new player account
- `POST /api/login` - Login existing player

### Player Data
- `GET /api/profile/:userId` - Get player profile
- `GET /api/leaderboard?limit=100` - Get global leaderboard
- `GET /api/online-players` - Get list of online players
- `GET /api/match-history/:userId?limit=20` - Get player's match history

## WebSocket Events

### Client → Server
- `player_online` - Player comes online
- `request_duel` - Request duel from another player
- `accept_duel` - Accept a duel request
- `reject_duel` - Reject a duel request
- `battle_action` - Send action during battle
- `battle_end` - Notify battle completion
- `sync_battle_state` - Sync game state

### Server → Client
- `online_players_updated` - List of online players changed
- `duel_request` - Incoming duel request
- `battle_start` - Battle starts
- `opponent_action` - Action from opponent
- `battle_finished` - Battle ended

## Statistics Tracking

### Player Stats
- **Wins**: Total number of matches won
- **Losses**: Total number of matches lost
- **Elo Rating**: Starts at 1200, +25 for win, -25 for loss
- **Win Streak**: Current consecutive wins
- **Best Streak**: Highest win streak achieved
- **Gold**: In-game currency (reserved for future shop integration)

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Token validation on every connection
- ✅ CORS protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ Secure WebSocket connections

## Troubleshooting

### "Port 3000 already in use"
```bash
# On Windows, find the process using port 3000:
netstat -ano | findstr :3000

# Kill the process:
taskkill /PID <PID> /F

# Or use a different port:
PORT=3001 npm start
```

### "Cannot find module"
Make sure you ran `npm install` in the backend folder

### "Database locked"
SQLite lock issues - restart the server

### Multiplayer not working
1. Check that backend server is running
2. Verify Socket.io CDN is loading in browser console
3. Check browser console for errors

## Future Enhancements

- [ ] Player search functionality
- [ ] Friend system
- [ ] Seasonal rankings
- [ ] Tournaments
- [ ] Replay system
- [ ] Custom game modes
- [ ] Team battles
- [ ] Chat system
- [ ] Achievement/badge system
- [ ] Clan system

## Project Structure

```
Something Beter/
├── index.html                 (UPDATED with new buttons)
├── style.css                  (UNCHANGED)
├── script.js                  (COMPLETELY UNCHANGED)
├── multiplayer.js             (NEW - Multiplayer frontend)
├── royalty-instrumental*.mp3  (Audio files)
└── backend/
    ├── package.json           (NEW)
    ├── server.js              (NEW)
    ├── database.js            (NEW)
    ├── auth.js                (NEW)
    └── game.db                (AUTO-CREATED)
```

## Development Notes

### No Code Was Deleted
- All original `script.js` logic remains untouched
- Original CSS styling preserved
- New multiplayer features added via separate module
- Can operate in single-player mode without multiplayer

### Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and desktop
- Multiplayer features use WebSocket (auto-fallback if needed)

## License

Created as an enhancement to the original Royal Rift Arena single-player game.

## Contact & Support

For issues or feature requests, check the browser console for errors and verify:
1. Backend server is running
2. Port 3000 is accessible
3. All npm dependencies installed
4. Database file has write permissions

---

**Happy Gaming! 🎮⚔️👑**
