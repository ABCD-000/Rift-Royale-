# 🎮 Royal Rift Arena Multiplayer - Quick Start Guide

## ⚡ Get Started in 2 Minutes

### Step 1: Install Node.js (if not already installed)
- Download from: https://nodejs.org/
- Install with default settings
- Restart your computer

### Step 2: Start the Server

**On Windows:**
- Double-click `start-server.bat` in the game folder
- A terminal window will open and start the server

**On Mac/Linux:**
```bash
cd "path/to/Something Beter"
bash start-server.sh
```

You should see:
```
✨ Royal Rift Server running on http://localhost:3000
```

### Step 3: Play the Game
1. Open your browser
2. Go to `http://localhost:3000`
3. Create a new account or login
4. Start playing!

---

## 🎯 How to Play Multiplayer

### Challenge Another Player
1. Look at the **Online Players** sidebar (right side)
2. Find a player who shows ✅ Ready
3. Click **Challenge** button
4. Wait for them to accept
5. Battle starts automatically!

### Check the Leaderboard
- Click **🏆 Leaderboard** button in the top menu
- See rankings by wins, Elo rating, and win rate

### Your Profile
- Click your username in the top right to logout
- Your stats update after each battle

---

## 🆘 Troubleshooting

### "Cannot connect to server"
- Make sure `start-server.bat` is still running
- Check that the terminal window shows "running on http://localhost:3000"
- Try refreshing the browser (Ctrl+R or Cmd+R)

### "Port 3000 in use"
Another program is using port 3000. Try:
1. Restart your computer
2. Or use a different port:
   - Open `backend/server.js`
   - Change `const PORT = process.env.PORT || 3000;` to `3001`

### Game not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser
- Check browser console for errors (F12)

---

## 📊 Game Features

### Preserved from Original
✅ All card mechanics
✅ Deck building
✅ Single-player battles
✅ Quests and shop
✅ All existing features

### New Multiplayer Features
🎮 Play against real players online
🏆 Global leaderboard rankings
👥 See who's online
⚔️ Challenge system
📈 Elo rating system
🔐 Player accounts

---

## 🚀 Advanced Setup

### Manual Installation (if .bat doesn't work)

1. Open Command Prompt/Terminal
2. Navigate to the backend folder:
```bash
cd "C:\Users\soura\Downloads\Something Beter\backend"
```

3. Install dependencies:
```bash
npm install
```

4. Start the server:
```bash
npm start
```

5. Open browser to `http://localhost:3000`

---

## ⚙️ System Requirements

- **Windows 7 or newer** (or Mac/Linux)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** (for multiplayer)
- **Node.js 12+** (for backend server)

---

## 🎮 Gameplay Tips

### Winning Strategy
- Study other players' stats on the leaderboard
- Build a balanced deck in Deck Builder
- Complete quests for rewards
- Track your win streak

### Multiplayer Tips
- Challenge players with similar Elo ratings
- Your rating gains/loses +25 per match
- Win streaks and loss streaks are tracked
- Play different AI difficulties for single-player practice

---

## 📝 Important Notes

- **All original code is preserved** - No features removed
- **Single-player mode still works** - Even if multiplayer is unavailable
- **Your progress is saved locally** - Even without multiplayer
- **Secure authentication** - Passwords are encrypted

---

## 🆘 Still Having Issues?

1. Check that the server terminal is running
2. Try refreshing the browser
3. Clear browser cache and cookies
4. Restart the server
5. Try a different browser

**Still stuck?** Check the terminal/console window for error messages.

---

## 🎉 Enjoy!

You now have a fully functional multiplayer Clash Royale-like game!

**Start playing now:** `http://localhost:3000`

---

### Quick Links
- Leaderboard: Check top players
- Online Players: Challenge someone
- Your Profile: See your stats
- Settings: Change difficulty

**Happy gaming! ⚔️👑🎮**
