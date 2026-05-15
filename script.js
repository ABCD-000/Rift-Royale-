const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

const cardsNode = document.getElementById('cards');
const elixirFill = document.getElementById('elixirFill');
const elixirValue = document.getElementById('elixirValue');
const enemyHpNode = document.getElementById('enemyHp');
const playerHpNode = document.getElementById('playerHp');
const resultNode = document.getElementById('result');
const restartBtn = document.getElementById('restartBtn');
const startBattleBtn = document.getElementById('startBattleBtn');
const timerNode = document.getElementById('timer');
const selectedCardLabel = document.getElementById('selectedCardLabel');
const bgm = document.getElementById('bgm');
const musicToggle = document.getElementById('musicToggle');
const streakValue = document.getElementById('streakValue');
const challengeModal = document.getElementById('challengeModal');
const challengeMessage = document.getElementById('challengeMessage');
const openChestBtn = document.getElementById('openChestBtn');
const continueBtn = document.getElementById('continueBtn');
const difficultySelect = document.getElementById('difficultySelect');
const difficultyLabel = document.getElementById('difficultyLabel');
const totalWinsNode = document.getElementById('totalWins');
const unlockedNode = document.getElementById('unlockedCount');
const goldValueNode = document.getElementById('goldValue');
const deckCardsNode = document.getElementById('deckCards');
const deckCollectionNode = document.getElementById('deckCollection');
const deckStatusNode = document.getElementById('deckStatus');
const saveDeckBtn = document.getElementById('saveDeckBtn');
const resetProgressBtn = document.getElementById('resetProgressBtn');
const aiModeSelect = document.getElementById('aiModeSelect');
const questsNode = document.getElementById('quests');
const refreshQuestsBtn = document.getElementById('refreshQuestsBtn');
const shopCardsNode = document.getElementById('shopCards');
const rerollShopBtn = document.getElementById('rerollShopBtn');
const battleLogNode = document.getElementById('battleLog');
const cardInfoModal = document.getElementById('cardInfoModal');
const cardInfoBody = document.getElementById('cardInfoBody');
const closeCardInfoBtn = document.getElementById('closeCardInfoBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

let scrollPosition = 0;

const LANE_Y = [180, 350, 520];
const MID_X = canvas.width / 2;
const GAME_TIME = 150;
const DECK_SIZE = 4;
const STORAGE_KEY = 'royal-rift-progress-v6';

const DIFFICULTY_LEVELS = [
  { name: 'Easy', enemyTowerHp: 3600, aiMin: 1.25, aiMax: 1.8, aiBudgetMin: 2.4, aiBudgetMax: 5.4, enemyHpMult: 0.88, enemyDamageMult: 0.9, enemySpeedMult: 0.96 },
  { name: 'Medium', enemyTowerHp: 4200, aiMin: 1.0, aiMax: 1.6, aiBudgetMin: 2.9, aiBudgetMax: 5.9, enemyHpMult: 1, enemyDamageMult: 1, enemySpeedMult: 1 },
  { name: 'Hard', enemyTowerHp: 4600, aiMin: 0.9, aiMax: 1.4, aiBudgetMin: 3.3, aiBudgetMax: 6.2, enemyHpMult: 1.1, enemyDamageMult: 1.1, enemySpeedMult: 1.04 },
  { name: 'Extreme', enemyTowerHp: 5000, aiMin: 0.8, aiMax: 1.2, aiBudgetMin: 3.7, aiBudgetMax: 6.9, enemyHpMult: 1.2, enemyDamageMult: 1.2, enemySpeedMult: 1.08 },
  { name: 'Impossible', enemyTowerHp: 5600, aiMin: 0.6, aiMax: 0.9, aiBudgetMin: 4.4, aiBudgetMax: 7.8, enemyHpMult: 1.44, enemyDamageMult: 1.5, enemySpeedMult: 1.3 }
];

const AI_MODES = {
  aggressive: { label: 'Aggressive', bias: 0.7, preferHeavy: true },
  defensive: { label: 'Defensive', bias: 0.3, preferHeavy: false },
  split: { label: 'Split', bias: 0.5, preferHeavy: false }
};

const TEAM_STYLE = {
  player: { primary: '#3b82f6', secondary: '#93c5fd' },
  enemy: { primary: '#ef4444', secondary: '#fca5a5' }
};

const CARD_POOL = [
  { id: 'knight', name: 'Knight', rarity: 'Common', unlockWins: 0, cost: 3, hp: 730, damage: 308, speed: 56, range: 28, radius: 18, color: '#94a3b8', ability: { name: 'Shield Bash', cost: 2, description: 'Block incoming damage' } },
  { id: 'archers', name: 'Archers', rarity: 'Common', unlockWins: 0, cost: 3, hp: 1030, damage: 208, speed: 56, range: 150, radius: 18, color: '#94a3b8', ability: { name: 'Power Shot', cost: 2, description: '2x damage next hit' } },
  { id: 'goblins', name: 'Goblins', rarity: 'Common', unlockWins: 1, cost: 2, hp: 560, damage: 84, speed: 52, range: 28, radius: 17, color: '#94a3b8', ability: { name: 'Swarm', cost: 1, description: 'Double spawn count' } },
  { id: 'giant', name: 'Giant', rarity: 'Rare', unlockWins: 0, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#38bdf8', ability: { name: 'Stomp', cost: 2, description: 'Stun nearby enemies' } },
  { id: 'pekka', name: 'P.E.K.K.A', rarity: 'Epic', unlockWins: 6, cost: 7, hp: 1410, damage: 204, speed: 72, range: 28, radius: 22, color: '#c084fc', ability: { name: 'Megahit', cost: 3, description: '3x damage to first unit' } },
  { id: 'minions', name: 'Minions', rarity: 'Common', unlockWins: 0, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#94a3b8', ability: { name: 'Air Strike', cost: 2, description: 'Hit 3 random enemies' } },
  { id: 'balloon', name: 'Balloon', rarity: 'Epic', unlockWins: 7, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#c084fc', ability: { name: 'Bomb Drop', cost: 2, description: 'AOE explosion on death' } },
  { id: 'witch', name: 'Witch', rarity: 'Epic', unlockWins: 6, cost: 5, hp: 2070, damage: 556, speed: 64, range: 190, radius: 20, color: '#c084fc', ability: { name: 'Summon', cost: 3, description: 'Spawn skeleton army' } },
  { id: 'barbarians', name: 'Barbarians', rarity: 'Common', unlockWins: 3, cost: 5, hp: 1570, damage: 556, speed: 64, range: 28, radius: 20, color: '#94a3b8', ability: { name: 'Fury', cost: 2, description: '+50% speed for 3s' } },
  { id: 'golem', name: 'Golem', rarity: 'Epic', unlockWins: 10, cost: 8, hp: 1580, damage: 228, speed: 76, range: 28, radius: 23, color: '#c084fc', ability: { name: 'Shatter', cost: 3, description: 'Split into 2 golems' } },
  { id: 'skeletons', name: 'Skeletons', rarity: 'Common', unlockWins: 2, cost: 1, hp: 390, damage: 60, speed: 48, range: 28, radius: 16, color: '#94a3b8', ability: { name: 'Bone Wave', cost: 1, description: 'Knockback enemies' } },
  { id: 'valkyrie', name: 'Valkyrie', rarity: 'Rare', unlockWins: 2, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#38bdf8', ability: { name: 'Whirlwind', cost: 2, description: 'Hit all nearby units' } },
  { id: 'wizard', name: 'Wizard', rarity: 'Rare', unlockWins: 4, cost: 5, hp: 1070, damage: 156, speed: 64, range: 150, radius: 20, color: '#38bdf8', ability: { name: 'Fireball', cost: 3, description: 'AOE burn damage' } },
  { id: 'mini-pekka', name: 'Mini P.E.K.K.A', rarity: 'Rare', unlockWins: 0, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#38bdf8', ability: { name: 'Charge', cost: 2, description: 'Dash attack' } },
  { id: 'musketeer', name: 'Musketeer', rarity: 'Rare', unlockWins: 0, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#38bdf8', ability: { name: 'Headshot', cost: 2, description: 'Stun on critical hit' } },
  { id: 'baby-dragon', name: 'Baby Dragon', rarity: 'Epic', unlockWins: 6, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#c084fc', ability: { name: 'Fire Breath', cost: 2, description: 'Cone of fire damage' } },
  { id: 'prince', name: 'Prince', rarity: 'Epic', unlockWins: 7, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#c084fc', ability: { name: 'Royal Charge', cost: 3, description: 'High speed dash' } },
  { id: 'ice-wizard', name: 'Ice Wizard', rarity: 'Legendary', unlockWins: 12, cost: 3, hp: 1730, damage: 108, speed: 56, range: 150, radius: 18, color: '#f59e0b', ability: { name: 'Freeze', cost: 3, description: 'Freeze all enemies' } },
  { id: 'princess', name: 'Princess', rarity: 'Legendary', unlockWins: 11, cost: 3, hp: 730, damage: 108, speed: 56, range: 150, radius: 18, color: '#f59e0b', ability: { name: 'Arrows', cost: 2, description: 'Rain of arrows' } },
  { id: 'lava-hound', name: 'Lava Hound', rarity: 'Legendary', unlockWins: 13, cost: 7, hp: 1410, damage: 204, speed: 72, range: 28, radius: 22, color: '#f59e0b', ability: { name: 'Lava Burst', cost: 3, description: 'Spawn lava pups' } },
  { id: 'fireball', name: 'Fireball', rarity: 'Rare', unlockWins: 0, cost: 4, spell: true, radius: 102, damage: 256, color: '#38bdf8', ability: { name: 'Ignite', cost: 2, description: 'Burn damage over time' } },
  { id: 'arrows', name: 'Arrows', rarity: 'Common', unlockWins: 0, cost: 3, spell: true, radius: 94, damage: 222, color: '#94a3b8', ability: { name: 'Pierce', cost: 1, description: 'Penetrate shields' } },
  { id: 'rocket', name: 'Rocket', rarity: 'Rare', unlockWins: 5, cost: 6, spell: true, radius: 118, damage: 324, color: '#38bdf8', ability: { name: 'Blast', cost: 2, description: 'Large explosion' } },
  { id: 'freeze', name: 'Freeze', rarity: 'Epic', unlockWins: 8, cost: 4, spell: true, radius: 102, damage: 256, color: '#c084fc', ability: { name: 'Deep Freeze', cost: 3, description: 'Long duration freeze' } },
  { id: 'lightning', name: 'Lightning', rarity: 'Epic', unlockWins: 8, cost: 6, spell: true, radius: 118, damage: 324, color: '#c084fc', ability: { name: 'Chain', cost: 3, description: 'Jump to 3 targets' } },
  { id: 'ice-spirit', name: 'Ice Spirit', rarity: 'Common', unlockWins: 8, cost: 1, hp: 390, damage: 60, speed: 48, range: 150, radius: 16, color: '#94a3b8' },
  { id: 'fire-spirit', name: 'Fire Spirit', rarity: 'Common', unlockWins: 4, cost: 1, hp: 390, damage: 60, speed: 48, range: 150, radius: 16, color: '#94a3b8' },
  { id: 'miner', name: 'Miner', rarity: 'Legendary', unlockWins: 11, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#f59e0b' },
  { id: 'sparky', name: 'Sparky', rarity: 'Legendary', unlockWins: 11, cost: 6, hp: 1240, damage: 180, speed: 68, range: 28, radius: 21, color: '#f59e0b' },
  { id: 'bowler', name: 'Bowler', rarity: 'Epic', unlockWins: 13, cost: 5, hp: 1070, damage: 156, speed: 64, range: 150, radius: 20, color: '#c084fc' },
  { id: 'lumberjack', name: 'Lumberjack', rarity: 'Legendary', unlockWins: 14, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#f59e0b' },
  { id: 'battle-ram', name: 'Battle Ram', rarity: 'Rare', unlockWins: 3, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#38bdf8' },
  { id: 'inferno-dragon', name: 'Inferno Dragon', rarity: 'Legendary', unlockWins: 11, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#f59e0b' },
  { id: 'ice-golem', name: 'Ice Golem', rarity: 'Rare', unlockWins: 8, cost: 2, hp: 560, damage: 84, speed: 52, range: 28, radius: 17, color: '#38bdf8' },
  { id: 'mega-minion', name: 'Mega Minion', rarity: 'Rare', unlockWins: 3, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#38bdf8' },
  { id: 'dart-goblin', name: 'Dart Goblin', rarity: 'Rare', unlockWins: 9, cost: 3, hp: 730, damage: 108, speed: 56, range: 150, radius: 18, color: '#38bdf8' },
  { id: 'goblin-gang', name: 'Goblin Gang', rarity: 'Common', unlockWins: 9, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#94a3b8' },
  { id: 'electro-wizard', name: 'Electro Wizard', rarity: 'Legendary', unlockWins: 11, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#f59e0b' },
  { id: 'elite-barbarians', name: 'Elite Barbarians', rarity: 'Common', unlockWins: 10, cost: 6, hp: 5240, damage: 6800, speed: 68, range: 28, radius: 21, color: '#94a3b8' },
  { id: 'hunter', name: 'Hunter', rarity: 'Epic', unlockWins: 10, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#c084fc' },
  { id: 'executioner', name: 'Executioner', rarity: 'Epic', unlockWins: 14, cost: 5, hp: 1070, damage: 156, speed: 64, range: 150, radius: 20, color: '#c084fc' },
  { id: 'bandit', name: 'Bandit', rarity: 'Legendary', unlockWins: 13, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#f59e0b' },
  { id: 'royal-recruits', name: 'Royal Recruits', rarity: 'Common', unlockWins: 7, cost: 7, hp: 1410, damage: 204, speed: 72, range: 28, radius: 22, color: '#94a3b8' },
  { id: 'night-witch', name: 'Night Witch', rarity: 'Legendary', unlockWins: 14, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#f59e0b' },
  { id: 'bats', name: 'Bats', rarity: 'Common', unlockWins: 5, cost: 2, hp: 560, damage: 84, speed: 52, range: 28, radius: 17, color: '#94a3b8' },
  { id: 'royal-ghost', name: 'Royal Ghost', rarity: 'Legendary', unlockWins: 12, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#f59e0b' },
  { id: 'ram-rider', name: 'Ram Rider', rarity: 'Legendary', unlockWins: 11, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#f59e0b' },
  { id: 'zappies', name: 'Zappies', rarity: 'Rare', unlockWins: 10, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#38bdf8' },
  { id: 'rascals', name: 'Rascals', rarity: 'Common', unlockWins: 13, cost: 5, hp: 1070, damage: 156, speed: 64, range: 150, radius: 20, color: '#94a3b8' },
  { id: 'cannon-cart', name: 'Cannon Cart', rarity: 'Epic', unlockWins: 15, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#c084fc' },
  { id: 'mega-knight', name: 'Mega Knight', rarity: 'Legendary', unlockWins: 11, cost: 7, hp: 1410, damage: 204, speed: 72, range: 28, radius: 22, color: '#f59e0b' },
  { id: 'skeleton-barrel', name: 'Skeleton Barrel', rarity: 'Common', unlockWins: 9, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#94a3b8' },
  { id: 'flying-machine', name: 'Flying Machine', rarity: 'Rare', unlockWins: 5, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#38bdf8' },
  { id: 'wall-breakers', name: 'Wall Breakers', rarity: 'Epic', unlockWins: 12, cost: 2, hp: 560, damage: 84, speed: 52, range: 28, radius: 17, color: '#c084fc' },
  { id: 'royal-hogs', name: 'Royal Hogs', rarity: 'Rare', unlockWins: 7, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#38bdf8' },
  { id: 'goblin-giant', name: 'Goblin Giant', rarity: 'Epic', unlockWins: 9, cost: 6, hp: 1240, damage: 180, speed: 68, range: 28, radius: 21, color: '#c084fc' },
  { id: 'fisherman', name: 'Fisherman', rarity: 'Legendary', unlockWins: 15, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#f59e0b' },
  { id: 'magic-archer', name: 'Magic Archer', rarity: 'Legendary', unlockWins: 13, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#f59e0b' },
  { id: 'electro-dragon', name: 'Electro Dragon', rarity: 'Epic', unlockWins: 12, cost: 5, hp: 1070, damage: 156, speed: 64, range: 150, radius: 20, color: '#c084fc' },
  { id: 'firecracker', name: 'Firecracker', rarity: 'Common', unlockWins: 12, cost: 3, hp: 730, damage: 108, speed: 56, range: 150, radius: 18, color: '#94a3b8' },
  { id: 'mighty-miner', name: 'Mighty Miner', rarity: 'Champion', unlockWins: 17, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#f43f5e' },
  { id: 'super-witch', name: 'Super Witch', rarity: 'Legendary', unlockWins: 5, cost: 6, hp: 1240, damage: 180, speed: 68, range: 150, radius: 21, color: '#f59e0b' },
  { id: 'elixir-golem', name: 'Elixir Golem', rarity: 'Rare', unlockWins: 14, cost: 3, hp: 730, damage: 108, speed: 56, range: 28, radius: 18, color: '#38bdf8' },
  { id: 'battle-healer', name: 'Battle Healer', rarity: 'Rare', unlockWins: 8, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#38bdf8' },
  { id: 'skeleton-king', name: 'Skeleton King', rarity: 'Champion', unlockWins: 16, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#f43f5e' },
  { id: 'super-lava-hound', name: 'Super Lava Hound', rarity: 'Legendary', unlockWins: 10, cost: 8, hp: 1580, damage: 228, speed: 76, range: 28, radius: 23, color: '#f59e0b' },
  { id: 'super-magic-archer', name: 'Super Magic Archer', rarity: 'Legendary', unlockWins: 13, cost: 5, hp: 1070, damage: 156, speed: 64, range: 150, radius: 20, color: '#f59e0b' },
  { id: 'archer-queen', name: 'Archer Queen', rarity: 'Champion', unlockWins: 17, cost: 5, hp: 1070, damage: 156, speed: 64, range: 150, radius: 20, color: '#f43f5e' },
  { id: 'santa-hog-rider', name: 'Santa Hog Rider', rarity: 'Legendary', unlockWins: 5, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#f59e0b' },
  { id: 'golden-knight', name: 'Golden Knight', rarity: 'Champion', unlockWins: 16, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#f43f5e' },
  { id: 'super-ice-golem', name: 'Super Ice Golem', rarity: 'Legendary', unlockWins: 8, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#f59e0b' },
  { id: 'monk', name: 'Monk', rarity: 'Champion', unlockWins: 18, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#f43f5e' },
  { id: 'super-archers', name: 'Super Archers', rarity: 'Legendary', unlockWins: 24, cost: 3, hp: 730, damage: 108, speed: 56, range: 150, radius: 18, color: '#f59e0b' },
  { id: 'skeleton-dragons', name: 'Skeleton Dragons', rarity: 'Common', unlockWins: 4, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#94a3b8' },
  { id: 'terry', name: 'Terry', rarity: 'Champion', unlockWins: 16, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#f43f5e' },
  { id: 'super-mini-pekka', name: 'Super Mini P.E.K.K.A', rarity: 'Legendary', unlockWins: 14, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#f59e0b' },
  { id: 'mother-witch', name: 'Mother Witch', rarity: 'Legendary', unlockWins: 15, cost: 4, hp: 900, damage: 132, speed: 60, range: 150, radius: 19, color: '#f59e0b' },
  { id: 'electro-spirit', name: 'Electro Spirit', rarity: 'Common', unlockWins: 4, cost: 1, hp: 390, damage: 60, speed: 48, range: 150, radius: 16, color: '#94a3b8' },
  { id: 'electro-giant', name: 'Electro Giant', rarity: 'Epic', unlockWins: 13, cost: 7, hp: 1410, damage: 204, speed: 72, range: 28, radius: 22, color: '#c084fc' },
  { id: 'raging-prince', name: 'Raging Prince', rarity: 'Epic', unlockWins: 7, cost: 5, hp: 1070, damage: 156, speed: 64, range: 28, radius: 20, color: '#c084fc' },
  { id: 'phoenix', name: 'Phoenix', rarity: 'Legendary', unlockWins: 12, cost: 4, hp: 900, damage: 132, speed: 60, range: 28, radius: 19, color: '#f59e0b' },
  { id: 'cannon', name: 'Cannon', rarity: 'Common', unlockWins: 3, cost: 3, hp: 950, damage: 118, speed: 0, range: 180, radius: 18, color: '#94a3b8' },
  { id: 'goblin-hut', name: 'Goblin Hut', rarity: 'Rare', unlockWins: 1, cost: 5, hp: 1290, damage: 166, speed: 0, range: 180, radius: 20, color: '#38bdf8' },
  { id: 'mortar', name: 'Mortar', rarity: 'Common', unlockWins: 5, cost: 4, hp: 1120, damage: 142, speed: 0, range: 180, radius: 19, color: '#94a3b8' },
  { id: 'inferno-tower', name: 'Inferno Tower', rarity: 'Rare', unlockWins: 4, cost: 5, hp: 1290, damage: 166, speed: 0, range: 180, radius: 20, color: '#38bdf8' },
  { id: 'bomb-tower', name: 'Bomb Tower', rarity: 'Rare', unlockWins: 4, cost: 4, hp: 1120, damage: 142, speed: 0, range: 180, radius: 19, color: '#38bdf8' },
  { id: 'barbarian-hut', name: 'Barbarian Hut', rarity: 'Rare', unlockWins: 9, cost: 6, hp: 1460, damage: 190, speed: 0, range: 180, radius: 21, color: '#38bdf8' },
  { id: 'tesla', name: 'Tesla', rarity: 'Common', unlockWins: 10, cost: 4, hp: 1120, damage: 142, speed: 0, range: 180, radius: 19, color: '#94a3b8' },
  { id: 'elixir-collector', name: 'Elixir Collector', rarity: 'Rare', unlockWins: 15, cost: 6, hp: 1460, damage: 190, speed: 0, range: 180, radius: 21, color: '#38bdf8' },
  { id: 'x-bow', name: 'X-Bow', rarity: 'Epic', unlockWins: 10, cost: 6, hp: 1460, damage: 190, speed: 0, range: 180, radius: 21, color: '#c084fc' },
  { id: 'tombstone', name: 'Tombstone', rarity: 'Rare', unlockWins: 2, cost: 3, hp: 950, damage: 118, speed: 0, range: 180, radius: 18, color: '#38bdf8' },
  { id: 'furnace', name: 'Furnace', rarity: 'Rare', unlockWins: 10, cost: 4, hp: 1120, damage: 142, speed: 0, range: 180, radius: 19, color: '#38bdf8' },
  { id: 'goblin-cage', name: 'Goblin Cage', rarity: 'Rare', unlockWins: 1, cost: 4, hp: 1120, damage: 142, speed: 0, range: 180, radius: 19, color: '#38bdf8' },
  { id: 'goblin-drill', name: 'Goblin Drill', rarity: 'Epic', unlockWins: 14, cost: 4, hp: 1120, damage: 142, speed: 0, range: 180, radius: 19, color: '#c084fc' },
  { id: 'party-hut', name: 'Party Hut', rarity: 'Legendary', unlockWins: 10, cost: 5, hp: 1290, damage: 166, speed: 0, range: 180, radius: 20, color: '#f59e0b' },
  { id: 'rage', name: 'Rage', rarity: 'Epic', unlockWins: 14, cost: 2, spell: true, radius: 86, damage: 188, color: '#c084fc' },
  { id: 'goblin-barrel', name: 'Goblin Barrel', rarity: 'Epic', unlockWins: 6, cost: 3, spell: true, radius: 94, damage: 222, color: '#c084fc' },
  { id: 'mirror', name: 'Mirror', rarity: 'Epic', unlockWins: 15, cost: 1, spell: true, radius: 78, damage: 154, color: '#c084fc' },
  { id: 'zap', name: 'Zap', rarity: 'Common', unlockWins: 5, cost: 2, spell: true, radius: 86, damage: 188, color: '#94a3b8' },
  { id: 'poison', name: 'Poison', rarity: 'Epic', unlockWins: 9, cost: 4, spell: true, radius: 102, damage: 256, color: '#c084fc' },
  { id: 'graveyard', name: 'Graveyard', rarity: 'Legendary', unlockWins: 12, cost: 5, spell: true, radius: 110, damage: 290, color: '#f59e0b' },
  { id: 'the-log', name: 'The Log', rarity: 'Legendary', unlockWins: 11, cost: 2, spell: true, radius: 86, damage: 188, color: '#f59e0b' },
  { id: 'tornado', name: 'Tornado', rarity: 'Epic', unlockWins: 15, cost: 3, spell: true, radius: 94, damage: 222, color: '#c084fc' },
  { id: 'clone', name: 'Clone', rarity: 'Epic', unlockWins: 15, cost: 3, spell: true, radius: 94, damage: 222, color: '#c084fc' },
  { id: 'earthquake', name: 'Earthquake', rarity: 'Rare', unlockWins: 12, cost: 3, spell: true, radius: 94, damage: 222, color: '#38bdf8' },
  { id: 'barbarian-barrel', name: 'Barbarian Barrel', rarity: 'Epic', unlockWins: 9, cost: 2, spell: true, radius: 86, damage: 188, color: '#c084fc' },
  { id: 'heal-spirit', name: 'Heal Spirit', rarity: 'Rare', unlockWins: 13, cost: 1, hp: 390, damage: 60, speed: 48, range: 150, radius: 16, color: '#38bdf8' },
  // Hero Cards (Champion)
  { id: 'super-archer', name: 'Super Archer', rarity: 'Champion', unlockWins: 0, cost: 5, hp: 1000, damage: 150, speed: 60, range: 150, radius: 19, color: '#f43f5e' },
  { id: 'hero-wizard', name: 'Hero Wizard', rarity: 'Champion', unlockWins: 0, cost: 6, hp: 1200, damage: 180, speed: 64, range: 150, radius: 20, color: '#f43f5e' },
  { id: 'legendary-knight', name: 'Legendary Knight', rarity: 'Champion', unlockWins: 0, cost: 4, hp: 800, damage: 350, speed: 60, range: 28, radius: 19, color: '#f43f5e' },
  { id: 'champion-golem', name: 'Champion Golem', rarity: 'Champion', unlockWins: 0, cost: 9, hp: 1800, damage: 250, speed: 76, range: 28, radius: 23, color: '#f43f5e' },
  { id: 'ultimate-skeleton', name: 'Ultimate Skeleton', rarity: 'Champion', unlockWins: 0, cost: 2, hp: 500, damage: 100, speed: 48, range: 28, radius: 16, color: '#f43f5e' },
  // Evil Cards
  { id: 'dark-knight', name: 'Dark Knight', rarity: 'Epic', unlockWins: 2, cost: 4, hp: 600, damage: 400, speed: 60, range: 28, radius: 19, color: '#7c2d12', ability: { name: 'Rage', cost: 2, description: '+100% damage for 3s' } },
  { id: 'evil-witch', name: 'Evil Witch', rarity: 'Legendary', unlockWins: 5, cost: 3, hp: 1500, damage: 800, speed: 64, range: 190, radius: 20, color: '#581c87', ability: { name: 'Spell Surge', cost: 3, description: 'Clone nearby units' } },
  { id: 'shadow-golem', name: 'Shadow Golem', rarity: 'Epic', unlockWins: 3, cost: 8, hp: 1200, damage: 300, speed: 76, range: 28, radius: 23, color: '#1f2937', ability: { name: 'Shadow Cloak', cost: 2, description: 'Take 50% less damage for 2s' } },
  { id: 'demon-archer', name: 'Demon Archer', rarity: 'Epic', unlockWins: 2, cost: 4, hp: 700, damage: 350, speed: 60, range: 150, radius: 19, color: '#7c2d12', ability: { name: 'Infernal Shot', cost: 2, description: 'AOE explosion on hit' } },
  { id: 'cursed-wizard', name: 'Cursed Wizard', rarity: 'Legendary', unlockWins: 6, cost: 5, hp: 1300, damage: 700, speed: 64, range: 150, radius: 20, color: '#581c87', ability: { name: 'Curse', cost: 3, description: 'Slow enemies by 50%' } },
  { id: 'void-golem', name: 'Void Golem', rarity: 'Epic', unlockWins: 4, cost: 7, hp: 1400, damage: 280, speed: 76, range: 28, radius: 23, color: '#1f2937', ability: { name: 'Void Shift', cost: 2, description: 'Teleport and stun nearby enemies' } },
  { id: 'infernal-knight', name: 'Infernal Knight', rarity: 'Epic', unlockWins: 3, cost: 4, hp: 650, damage: 380, speed: 60, range: 28, radius: 19, color: '#7c2d12', ability: { name: 'Infernal Blade', cost: 2, description: 'Next hit burns enemies' } },
  { id: 'dark-sorceress', name: 'Dark Sorceress', rarity: 'Legendary', unlockWins: 5, cost: 4, hp: 1600, damage: 750, speed: 64, range: 150, radius: 20, color: '#581c87', ability: { name: 'Dark Ritual', cost: 3, description: 'Heal 30% of damage dealt' } },
  { id: 'abyssal-golem', name: 'Abyssal Golem', rarity: 'Epic', unlockWins: 7, cost: 9, hp: 1100, damage: 320, speed: 76, range: 28, radius: 23, color: '#1f2937', ability: { name: 'Abyss Call', cost: 3, description: 'Summon void minions' } },
  { id: 'shadow-archer', name: 'Shadow Archer', rarity: 'Epic', unlockWins: 2, cost: 3, hp: 750, damage: 320, speed: 60, range: 150, radius: 19, color: '#7c2d12', ability: { name: 'Shadow Strike', cost: 2, description: 'Invisible for 2 seconds' } },
  { id: 'evil-necromancer', name: 'Evil Necromancer', rarity: 'Legendary', unlockWins: 5, cost: 4, hp: 1400, damage: 680, speed: 64, range: 150, radius: 20, color: '#581c87', ability: { name: 'Resurrect', cost: 3, description: 'Revive fallen unit once' } },
  { id: 'dark-golem', name: 'Dark Golem', rarity: 'Epic', unlockWins: 4, cost: 8, hp: 1300, damage: 290, speed: 76, range: 28, radius: 23, color: '#1f2937', ability: { name: 'Void Anchor', cost: 2, description: 'Root enemies in place' } },
  { id: 'cursed-knight', name: 'Cursed Knight', rarity: 'Epic', unlockWins: 3, cost: 5, hp: 620, damage: 410, speed: 60, range: 28, radius: 19, color: '#7c2d12', ability: { name: 'Life Drain', cost: 2, description: 'Heal on each hit' } },
  { id: 'demon-witch', name: 'Demon Witch', rarity: 'Legendary', unlockWins: 6, cost: 5, hp: 1550, damage: 820, speed: 64, range: 190, radius: 20, color: '#581c87', ability: { name: 'Demonic Swarm', cost: 3, description: 'Spawn demons around target' } },
  { id: 'void-beast', name: 'Void Beast', rarity: 'Epic', unlockWins: 4, cost: 6, hp: 1000, damage: 260, speed: 72, range: 28, radius: 21, color: '#1f2937', ability: { name: 'Void Leap', cost: 2, description: 'Jump 3 tiles forward' } },
  { id: 'infernal-archer', name: 'Infernal Archer', rarity: 'Epic', unlockWins: 2, cost: 4, hp: 680, damage: 360, speed: 60, range: 150, radius: 19, color: '#7c2d12', ability: { name: 'Flame Arrow', cost: 2, description: 'Arrows set enemies on fire' } },
  { id: 'abyssal-witch', name: 'Abyssal Witch', rarity: 'Legendary', unlockWins: 5, cost: 4, hp: 1450, damage: 710, speed: 64, range: 150, radius: 20, color: '#581c87', ability: { name: 'Abyss Spell', cost: 3, description: 'Damage in large area' } },
  { id: 'shadow-beast', name: 'Shadow Beast', rarity: 'Epic', unlockWins: 6, cost: 7, hp: 1150, damage: 270, speed: 72, range: 28, radius: 21, color: '#1f2937', ability: { name: 'Shadow Pounce', cost: 2, description: 'Double speed for 2s' } },
  { id: 'dark-skeleton', name: 'Dark Skeleton', rarity: 'Epic', unlockWins: 1, cost: 2, hp: 450, damage: 120, speed: 48, range: 28, radius: 16, color: '#7c2d12', ability: { name: 'Bone Shield', cost: 1, description: 'Block next hit' } },
  { id: 'evil-dragon', name: 'Evil Dragon', rarity: 'Legendary', unlockWins: 8, cost: 6, hp: 1700, damage: 900, speed: 72, range: 150, radius: 22, color: '#581c87', ability: { name: 'Dragon Roar', cost: 3, description: 'Stun all nearby enemies' } },
  { id: 'void-giant', name: 'Void Giant', rarity: 'Epic', unlockWins: 5, cost: 8, hp: 1250, damage: 310, speed: 76, range: 28, radius: 23, color: '#1f2937', ability: { name: 'Void Smash', cost: 3, description: 'Area of Effect damage' } },
  { id: 'cursed-archer', name: 'Cursed Archer', rarity: 'Epic', unlockWins: 2, cost: 3, hp: 720, damage: 330, speed: 60, range: 150, radius: 19, color: '#7c2d12', ability: { name: 'Curse Arrows', cost: 2, description: 'Enemies take 30% more damage' } },
  { id: 'demon-sorcerer', name: 'Demon Sorcerer', rarity: 'Legendary', unlockWins: 7, cost: 5, hp: 1350, damage: 690, speed: 64, range: 150, radius: 20, color: '#581c87', ability: { name: 'Demonic Pact', cost: 3, description: 'Convert 1 enemy unit' } }
];

const RARITY_COLORS = { Common: '#94a3b8', Rare: '#38bdf8', Epic: '#c084fc', Legendary: '#f59e0b', Champion: '#f43f5e' };
const RARITY_REWARD = { Common: 2, Rare: 3, Epic: 4, Legendary: 5, Champion: 6 };
const RARITY_UPGRADE_COST = { Common: 80, Rare: 120, Epic: 170, Legendary: 250, Champion: 320 };

const QUEST_TEMPLATES = [
  { id: 'win2', label: 'Win 2 matches', target: 2, event: 'wins', reward: 90 },
  { id: 'deploy15', label: 'Deploy 15 cards', target: 15, event: 'deploys', reward: 80 },
  { id: 'fireball6', label: 'Cast Fireball 6 times', target: 6, event: 'fireballs', reward: 95 },
  { id: 'spend70', label: 'Spend 70 elixir', target: 70, event: 'elixirSpent', reward: 85 }
];

const challenge = { streak: 0, target: 5, chestReady: false };

const heroCards = ['mighty-miner', 'skeleton-king', 'archer-queen', 'golden-knight', 'monk', 'terry', 'super-archer', 'hero-wizard', 'legendary-knight', 'champion-golem', 'ultimate-skeleton'];
const evilCards = ['dark-knight', 'evil-witch', 'shadow-golem', 'demon-archer', 'cursed-wizard', 'void-golem', 'infernal-knight', 'dark-sorceress', 'abyssal-golem', 'shadow-archer', 'evil-necromancer', 'dark-golem', 'cursed-knight', 'demon-witch', 'void-beast', 'infernal-archer', 'abyssal-witch', 'shadow-beast', 'dark-skeleton', 'evil-dragon', 'void-giant', 'cursed-archer', 'demon-sorcerer'];

let currentDifficultyIndex = 0;
let progress = loadProgress();
let state = createInitialState();
let cardButtons = [];
let cardStateDirty = true;
let lastCardBucket = -1;
let last = performance.now();

function defaultDeckIds() {
  return ['knight', 'archers', 'fireball', 'giant'];
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateDailyQuests() {
  const pool = [...QUEST_TEMPLATES];
  const picked = [];
  while (picked.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const base = pool.splice(idx, 1)[0];
    picked.push({ ...base, progress: 0, claimed: false });
  }
  return picked;
}

function generateShopOffers() {
  const offers = [];
  const unlockedSet = new Set(progress.unlockedIds);
  const pool = CARD_POOL.filter((c) => unlockedSet.has(c.id));
  for (let i = 0; i < Math.min(3, pool.length); i += 1) {
    const card = randomFrom(pool);
    offers.push({ id: `${card.id}-${Date.now()}-${i}`, cardId: card.id, price: 40 + card.cost * 15, quantity: RARITY_REWARD[card.rarity] || 2 });
  }
  return offers;
}

function createFallbackProgress() {
  const unlockedIds = CARD_POOL.filter((card) => card.unlockWins === 0).map((card) => card.id);
  const cardLevels = {};
  const cardCopies = {};
  for (let i = 0; i < CARD_POOL.length; i += 1) {
    cardLevels[CARD_POOL[i].id] = 1;
    cardCopies[CARD_POOL[i].id] = CARD_POOL[i].unlockWins === 0 ? 4 : 0;
  }

  return {
    totalWins: 0,
    gold: 120,
    unlockedIds,
    deckIds: defaultDeckIds(),
    cardLevels,
    cardCopies,
    aiMode: 'aggressive',
    questsDate: todayKey(),
    quests: generateDailyQuests(),
    shopOffers: [],
    battleLog: []
  };
}

function loadProgress() {
  const fallback = createFallbackProgress();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return fallback;

    const progressModel = { ...fallback, ...parsed };
    if (!Array.isArray(progressModel.unlockedIds)) progressModel.unlockedIds = fallback.unlockedIds;
    if (!Array.isArray(progressModel.deckIds)) progressModel.deckIds = [...fallback.deckIds];
    if (!Array.isArray(progressModel.battleLog)) progressModel.battleLog = [];
    if (!progressModel.cardLevels || typeof progressModel.cardLevels !== 'object') progressModel.cardLevels = { ...fallback.cardLevels };
    if (!progressModel.cardCopies || typeof progressModel.cardCopies !== 'object') progressModel.cardCopies = { ...fallback.cardCopies };
    if (!AI_MODES[progressModel.aiMode]) progressModel.aiMode = 'aggressive';

    if (progressModel.questsDate !== todayKey() || !Array.isArray(progressModel.quests) || progressModel.quests.length === 0) {
      progressModel.questsDate = todayKey();
      progressModel.quests = generateDailyQuests();
    }

    for (let i = 0; i < CARD_POOL.length; i += 1) {
      const c = CARD_POOL[i];
      if (!progressModel.cardLevels[c.id]) progressModel.cardLevels[c.id] = 1;
      if (!Number.isInteger(progressModel.cardCopies[c.id])) progressModel.cardCopies[c.id] = 0;
      if (c.unlockWins === 0 && !progressModel.unlockedIds.includes(c.id)) progressModel.unlockedIds.push(c.id);
    }

    return progressModel;
  } catch {
    return fallback;
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getCardById(id) {
  return CARD_POOL.find((c) => c.id === id) || null;
}

function getDifficulty() {
  return DIFFICULTY_LEVELS[currentDifficultyIndex];
}

function levelMultiplier(level) {
  return 1 + (Math.max(1, level) - 1) * 0.12;
}

function getDeckCards() {
  const cards = [];
  for (let i = 0; i < progress.deckIds.length; i += 1) {
    const c = getCardById(progress.deckIds[i]);
    if (c) cards.push(c);
  }
  return cards;
}

function ensureDeckIsValid() {
  const unlocked = new Set(progress.unlockedIds);
  progress.deckIds = progress.deckIds.filter((id) => unlocked.has(id));

  const defaults = defaultDeckIds();
  for (let i = 0; i < defaults.length && progress.deckIds.length < DECK_SIZE; i += 1) {
    if (unlocked.has(defaults[i]) && !progress.deckIds.includes(defaults[i])) progress.deckIds.push(defaults[i]);
  }

  for (let i = 0; i < CARD_POOL.length && progress.deckIds.length < DECK_SIZE; i += 1) {
    const id = CARD_POOL[i].id;
    if (unlocked.has(id) && !progress.deckIds.includes(id)) progress.deckIds.push(id);
  }

  progress.deckIds = progress.deckIds.slice(0, DECK_SIZE);
}

function createInitialState() {
  const difficulty = getDifficulty();
  return {
    playerTower: { x: 120, y: canvas.height / 2, hp: 4200, maxHp: 4200, flash: 0, attackRange: 220, attackCooldown: 0, damage: 50 },
    enemyTower: { x: canvas.width - 120, y: canvas.height / 2, hp: difficulty.enemyTowerHp, maxHp: difficulty.enemyTowerHp, flash: 0, attackRange: 220, attackCooldown: 0, damage: 50 },
    units: [],
    projectiles: [],
    fx: [],
    elixir: 5,
    selectedCard: null,
    gameOver: false,
    battleStarted: false,
    isMultiplayer: false,
    aiTimer: 0,
    timeLeft: GAME_TIME,
    dragCardIndex: null,
    dragDepth: 0,
    dragPreview: { active: false, x: 0, y: 0, lane: 0, valid: false },
    splitLaneCursor: 0,
    matchStats: { deploys: 0, fireballs: 0, elixirSpent: 0 }
  };
}

function addFxText(text, x, y, color = '#fef08a') {
  state.fx.push({ type: 'text', text, x, y, life: 0.9, maxLife: 0.9, color });
}

function updateEffects(dt) {
  for (let i = state.fx.length - 1; i >= 0; i -= 1) {
    const fx = state.fx[i];
    fx.life -= dt;
    fx.y -= dt * 22;
    if (fx.life <= 0) state.fx.splice(i, 1);
  }
}

function drawEffects() {
  for (let i = 0; i < state.fx.length; i += 1) {
    const fx = state.fx[i];
    const alpha = Math.max(0, fx.life / fx.maxLife);
    ctx.fillStyle = `${fx.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.font = '700 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(fx.text, fx.x, fx.y);
  }
}

function showDeckStatus(text, isError = false) {
  if (!deckStatusNode) return;
  deckStatusNode.textContent = text;
  deckStatusNode.classList.toggle('error', isError);
}

function refreshProgressPanels(save = false) {
  updateProgressUI();
  renderDeckBuilder();
  renderCards();
  renderQuests();
  renderShop();
  if (save) saveProgress();
}

function refreshInteractiveButtonsTick() {
  if (state.dragCardIndex !== null) return;
  refreshProgressPanels(false);
}

function updateDifficultyUI() {
  if (difficultyLabel) difficultyLabel.textContent = getDifficulty().name;
  if (difficultySelect) difficultySelect.value = String(currentDifficultyIndex);
}

function updateChallengeUI() {
  if (streakValue) streakValue.textContent = `${challenge.streak} / ${challenge.target}`;
}

function updateProgressUI() {
  if (totalWinsNode) totalWinsNode.textContent = String(progress.totalWins);
  if (unlockedNode) unlockedNode.textContent = `${progress.unlockedIds.length} / ${CARD_POOL.length}`;
  if (goldValueNode) goldValueNode.textContent = String(progress.gold);
  if (aiModeSelect) aiModeSelect.value = progress.aiMode;
}

function resetMatch() {
  state = createInitialState();
  resultNode.classList.add('hidden');
  restartBtn.classList.add('hidden');
  if (startBattleBtn) startBattleBtn.classList.remove('hidden');
  selectedCardLabel.textContent = 'None';
  clearDragPreview();
  renderCards();
  markCardStateDirty();
}

function markCardStateDirty() {
  cardStateDirty = true;
}

function syncCardStatesIfNeeded(force = false) {
  const bucket = Math.floor(state.elixir * 10);
  if (!force && !cardStateDirty && bucket === lastCardBucket) return;

  cardStateDirty = false;
  lastCardBucket = bucket;

  const cards = getDeckCards();
  for (let i = 0; i < cardButtons.length; i += 1) {
    const btn = cardButtons[i];
    const c = cards[i];
    if (!c) continue;
    const disabled = state.gameOver || !state.battleStarted || state.elixir < c.cost;
    btn.classList.toggle('disabled', disabled);
    btn.classList.toggle('active', state.selectedCard === i);
    btn.draggable = !state.gameOver;
  }
}


function setupTabs() {
  if (!tabButtons.length || !tabPanels.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tabTarget;
      tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
      tabPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.tabPanel === target);
      });
    });
  });
}

function setupMusic() {
  if (!bgm || !musicToggle) return;
  const sync = () => {
    musicToggle.textContent = bgm.paused ? '▶ Music' : '⏸ Music';
  };
  musicToggle.addEventListener('click', async () => {
    try {
      if (bgm.paused) await bgm.play();
      else bgm.pause();
    } catch {
      // optional audio file
    }
    sync();
  });
  bgm.addEventListener('play', sync);
  bgm.addEventListener('pause', sync);
  sync();
}

function toCanvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height
  };
}

function getLaneFromY(y) {
  let best = 0;
  for (let i = 1; i < LANE_Y.length; i += 1) {
    if (Math.abs(y - LANE_Y[i]) < Math.abs(y - LANE_Y[best])) best = i;
  }
  return best;
}

function updateDragPreview(x, y) {
  const lane = getLaneFromY(y);
  const valid = x < MID_X - 20 && state.dragCardIndex !== null && !state.gameOver;
  state.dragPreview = { active: true, x, y, lane, valid };
  canvas.classList.toggle('drop-active', valid);
  canvas.classList.toggle('drop-invalid', !valid);
}

function clearDragPreview() {
  state.dragPreview.active = false;
  canvas.classList.remove('drop-active');
  canvas.classList.remove('drop-invalid');
}

function applyQuestProgress(eventName, amount) {
  if (!Array.isArray(progress.quests)) return;
  for (let i = 0; i < progress.quests.length; i += 1) {
    const quest = progress.quests[i];
    if (quest.claimed || quest.event !== eventName) continue;
    quest.progress = Math.min(quest.target, quest.progress + amount);
  }
}

function tryPlayerDeploy(cardIndex, x, y) {
  if (cardIndex === null || state.gameOver || !state.battleStarted || x >= MID_X - 20) return false;
  const cards = getDeckCards();
  const card = cards[cardIndex];
  if (!card || state.elixir < card.cost) return false;

  state.elixir -= card.cost;
  deploy('player', card.id, getLaneFromY(y));
  state.selectedCard = null;
  state.dragCardIndex = null;
  selectedCardLabel.textContent = 'None';

  state.matchStats.deploys += 1;
  state.matchStats.elixirSpent += card.cost;
  if (card.id === 'fireball') state.matchStats.fireballs += 1;

  applyQuestProgress('deploys', 1);
  applyQuestProgress('elixirSpent', card.cost);
  if (card.id === 'fireball') applyQuestProgress('fireballs', 1);

  if (state.isMultiplayer && typeof window.sendMultiplayerAction === 'function' && window.currentBattleId) {
    window.sendMultiplayerAction({
      type: 'deploy',
      cardId: card.id,
      lane: getLaneFromY(y)
    });
  }

  markCardStateDirty();
  return true;
}

function handleOpponentMultiplayerAction(action) {
  if (!action || action.type !== 'deploy') return;
  if (typeof deploy !== 'undefined') {
    deploy('enemy', action.cardId, action.lane);
  }
}

function renderCards() {
  cardsNode.innerHTML = '';
  cardButtons = [];
  const cards = getDeckCards();

  cards.forEach((card, i) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.dataset.index = String(i);
    const level = progress.cardLevels[card.id] || 1;
    const levelTag = `Lv.${level}`;
    const label = card.spell ? `Spell DMG ${Math.round(card.damage * levelMultiplier(level))}` : `HP ${Math.round(card.hp * levelMultiplier(level))} • DMG ${Math.round(card.damage * levelMultiplier(level))}`;
    const abilityInfo = card.ability ? `<p style="font-size: 0.68rem; color: var(--neon-cyan); margin-top: 0.2rem;">⚡ ${card.ability.name} (${card.ability.cost})</p>` : '';
    btn.innerHTML = `<h3>${card.name}<small>${card.cost} • ${levelTag}</small></h3><p>${card.rarity} • ${label}</p>${abilityInfo}`;

    btn.addEventListener('dragstart', (event) => {
      if (state.elixir < card.cost || state.gameOver) {
        event.preventDefault();
        return;
      }
      state.dragCardIndex = i;
      state.selectedCard = i;
      selectedCardLabel.textContent = `${card.name} (dragging)`;
      btn.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData('text/plain', String(i));
      markCardStateDirty();
    });

    btn.addEventListener('dragend', () => {
      state.dragCardIndex = null;
      state.dragDepth = 0;
      clearDragPreview();
      btn.classList.remove('dragging');
      selectedCardLabel.textContent = 'None';
      markCardStateDirty();
    });

    cardsNode.appendChild(btn);
    cardButtons.push(btn);
  });

  syncCardStatesIfNeeded(true);
}

function maybeUnlockCards() {
  let unlocked = 0;
  for (let i = 0; i < CARD_POOL.length; i += 1) {
    const card = CARD_POOL[i];
    if (progress.totalWins >= card.unlockWins && !progress.unlockedIds.includes(card.id)) {
      progress.unlockedIds.push(card.id);
      progress.cardCopies[card.id] = Math.max(progress.cardCopies[card.id] || 0, 3);
      unlocked += 1;
    }
  }
  if (unlocked > 0) {
    ensureDeckIsValid();
    renderDeckBuilder();
  }
  return unlocked;
}

function questCompletedCount() {
  if (!Array.isArray(progress.quests)) return 0;
  return progress.quests.filter((q) => q.progress >= q.target).length;
}

function renderQuests() {
  if (!questsNode) return;
  questsNode.innerHTML = '';
  progress.quests.forEach((quest) => {
    const card = document.createElement('article');
    const complete = quest.progress >= quest.target;
    card.className = `quest-card ${complete ? 'quest-complete' : ''}`;
    card.innerHTML = `<h4>${quest.label}</h4><p class="quest-progress">${quest.progress}/${quest.target}</p><p>Reward: ${quest.reward} gold</p>`;

    const claimBtn = document.createElement('button');
    claimBtn.className = 'mini-btn';
    claimBtn.textContent = quest.claimed ? 'Claimed' : complete ? 'Claim Reward' : 'In Progress';
    claimBtn.disabled = quest.claimed || !complete;
    claimBtn.addEventListener('click', () => {
      if (quest.claimed || !complete) return;
      quest.claimed = true;
      progress.gold += quest.reward;
      refreshProgressPanels(true);
      showDeckStatus(`Quest complete! +${quest.reward} gold.`);
    });

    card.appendChild(claimBtn);
    questsNode.appendChild(card);
  });
}

function renderShop() {
  if (!shopCardsNode) return;
  if (!Array.isArray(progress.shopOffers) || progress.shopOffers.length === 0) progress.shopOffers = generateShopOffers();

  shopCardsNode.innerHTML = '';
  progress.shopOffers.forEach((offer) => {
    const cardData = getCardById(offer.cardId);
    if (!cardData) return;

    const node = document.createElement('article');
    node.className = 'shop-card';
    node.innerHTML = `<h4>${cardData.name}</h4><p style="color:${RARITY_COLORS[cardData.rarity]}">${cardData.rarity}</p><p>+${offer.quantity} copies</p><p class="shop-price">${offer.price} Gold</p>`;

    const buyBtn = document.createElement('button');
    buyBtn.className = 'mini-btn';
    buyBtn.textContent = progress.gold >= offer.price ? 'Buy' : 'Not enough gold';
    buyBtn.disabled = progress.gold < offer.price;
    buyBtn.addEventListener('click', () => {
      if (progress.gold < offer.price) return;
      progress.gold -= offer.price;
      progress.cardCopies[offer.cardId] = (progress.cardCopies[offer.cardId] || 0) + offer.quantity;
      progress.shopOffers = progress.shopOffers.filter((s) => s.id !== offer.id);
      refreshProgressPanels(true);
    });

    node.appendChild(buyBtn);
    shopCardsNode.appendChild(node);
  });
}

function getUpgradeRequirement(card) {
  const level = progress.cardLevels[card.id] || 1;
  return {
    level,
    neededCopies: 2 + level,
    neededGold: (RARITY_UPGRADE_COST[card.rarity] || 100) + level * 25
  };
}


function getCardTypeLabel(card) {
  if (card.spell) return 'Spell';
  if (card.speed === 0) return 'Building';
  return 'Troop';
}

function openCardInfo(card) {
  if (!cardInfoModal || !cardInfoBody || !card) return;
  
  // Store current scroll position and scroll to center
  scrollPosition = window.scrollY;
  const centerScroll = (document.documentElement.scrollHeight - window.innerHeight) / 2;
  window.scrollTo(0, centerScroll);
  
  const level = progress.cardLevels[card.id] || 1;
  const copies = progress.cardCopies[card.id] || 0;
  const req = getUpgradeRequirement(card);
  const rows = [
    ['Name', card.name],
    ['ID', card.id],
    ['Type', getCardTypeLabel(card)],
    ['Rarity', card.rarity],
    ['Elixir Cost', String(card.cost)],
    ['Unlock Wins', String(card.unlockWins)],
    ['Current Level', String(level)],
    ['Copies', String(copies)],
    ['Upgrade Requirement', `${req.neededCopies} copies + ${req.neededGold} gold`]
  ];

  if (card.spell) {
    rows.push(['Spell Damage', String(card.damage)]);
    rows.push(['Spell Radius', String(card.radius)]);
  } else {
    rows.push(['HP', String(card.hp)]);
    rows.push(['Damage', String(card.damage)]);
    rows.push(['Speed', String(card.speed)]);
    rows.push(['Range', String(card.range)]);
    rows.push(['Radius', String(card.radius)]);
  }

  if (card.ability) {
    rows.push(['Special Ability', card.ability.name]);
    rows.push(['Ability Cost', `${card.ability.cost} Elixir`]);
    rows.push(['Ability Effect', card.ability.description]);
  }

  cardInfoBody.innerHTML = rows
    .map(([label, value]) => `<div class="card-info-row"><strong>${label}</strong><span>${value}</span></div>`)
    .join('');

  cardInfoModal.classList.remove('hidden');
}

function closeCardInfo() {
  if (!cardInfoModal) return;
  cardInfoModal.classList.add('hidden');
  
  // Restore scroll position
  window.scrollTo(0, scrollPosition);
}

function renderDeckBuilder() {
  if (!deckCardsNode || !deckCollectionNode) return;
  deckCardsNode.innerHTML = '';

  for (let i = 0; i < DECK_SIZE; i += 1) {
    const id = progress.deckIds[i];
    const card = getCardById(id);
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'deck-slot';

    if (card) {
      const level = progress.cardLevels[card.id] || 1;
      slot.innerHTML = `<strong>${card.name}</strong><span>${card.cost} • ${card.rarity} • Lv.${level}</span>`;
      slot.style.borderColor = RARITY_COLORS[card.rarity] || 'rgba(148, 163, 184, 0.4)';
    } else {
      slot.innerHTML = '<strong>Empty Slot</strong><span>Pick from collection</span>';
    }

    slot.addEventListener('click', () => {
      progress.deckIds.splice(i, 1);
      renderDeckBuilder();
      renderCards();
      showDeckStatus('Card removed from deck.');
    });

    deckCardsNode.appendChild(slot);
  }

  deckCollectionNode.innerHTML = '';
  const chosen = new Set(progress.deckIds);

  // Search filter
  const searchInput = document.getElementById('deckSearchInput');
  let searchValue = '';
  if (searchInput) searchValue = searchInput.value.trim().toLowerCase();

  // Filter cards
  const filteredCards = CARD_POOL.filter((card) => {
    if (!searchValue) return true;
    const type = getCardTypeLabel(card);
    return (
      card.name.toLowerCase().includes(searchValue) ||
      card.rarity.toLowerCase().includes(searchValue) ||
      type.toLowerCase().includes(searchValue)
    );
  });

  // Sort cards
  const sortSelect = document.getElementById('deckSortSelect');
  let sortValue = 'name';
  if (sortSelect) sortValue = sortSelect.value;

  filteredCards.sort((a, b) => {
    switch (sortValue) {
      case 'elixir':
        return a.cost - b.cost;
      case 'rarity':
        const rarityOrder = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Champion: 4 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      case 'type':
        const typeOrder = { Troop: 0, Building: 1, Spell: 2 };
        const aType = getCardTypeLabel(a);
        const bType = getCardTypeLabel(b);
        return typeOrder[aType] - typeOrder[bType];
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  filteredCards.forEach((card) => {
    const unlocked = progress.unlockedIds.includes(card.id);
    const currentCopies = progress.cardCopies[card.id] || 0;
    const req = getUpgradeRequirement(card);

    const box = document.createElement('article');
    box.className = `collection-card ${unlocked ? '' : 'locked'} ${chosen.has(card.id) ? 'chosen' : ''}`;
    box.innerHTML = `
      <h4>${card.name} <small>${card.cost}</small></h4>
      <p style="color:${RARITY_COLORS[card.rarity]}">${card.rarity}</p>
      <p>Lv.${req.level} • Copies: ${currentCopies}</p>
      <p>${unlocked ? 'Unlocked' : `Unlock at ${card.unlockWins} wins`}</p>
    `;

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const addBtn = document.createElement('button');
    addBtn.className = 'mini-btn';
    addBtn.textContent = chosen.has(card.id) ? 'In Deck' : 'Add';
    addBtn.disabled = !unlocked || chosen.has(card.id);
    addBtn.addEventListener('click', () => {
      if (progress.deckIds.length >= DECK_SIZE) progress.deckIds.shift();
      progress.deckIds.push(card.id);
      renderDeckBuilder();
      renderCards();
      showDeckStatus(`${card.name} added to deck.`);
    });

    const upBtn = document.createElement('button');
    upBtn.className = 'mini-btn';
    const canUpgrade = unlocked && currentCopies >= req.neededCopies && progress.gold >= req.neededGold;
    upBtn.textContent = `Upgrade (${req.neededCopies}c / ${req.neededGold}g)`;
    upBtn.disabled = !canUpgrade;
    upBtn.addEventListener('click', () => {
      if (!canUpgrade) return;
      progress.cardCopies[card.id] -= req.neededCopies;
      progress.gold -= req.neededGold;
      progress.cardLevels[card.id] = req.level + 1;
      refreshProgressPanels(true);
      showDeckStatus(`${card.name} upgraded to level ${progress.cardLevels[card.id]}!`);
    });

    const infoBtn = document.createElement('button');
    infoBtn.className = 'mini-btn';
    infoBtn.textContent = 'Info';
    infoBtn.addEventListener('click', () => openCardInfo(card));

    actions.append(addBtn, upBtn, infoBtn);
    box.appendChild(actions);
    deckCollectionNode.appendChild(box);
  });

  // Setup search input event
  if (searchInput && !searchInput._deckSearchSetup) {
    searchInput.addEventListener('input', () => renderDeckBuilder());
    searchInput._deckSearchSetup = true;
  }

  // Setup sort select event
  if (sortSelect && !sortSelect._deckSortSetup) {
    sortSelect.addEventListener('change', () => renderDeckBuilder());
    sortSelect._deckSortSetup = true;
  }
}

function addBattleLog(outcome) {
  const entry = `${new Date().toLocaleTimeString()} • ${outcome} • ${getDifficulty().name} • ${AI_MODES[progress.aiMode].label} AI • Deploys ${state.matchStats.deploys}`;
  progress.battleLog.unshift(entry);
  progress.battleLog = progress.battleLog.slice(0, 10);
  renderBattleLog();
}

function renderBattleLog() {
  if (!battleLogNode) return;
  battleLogNode.innerHTML = '';
  if (!Array.isArray(progress.battleLog) || progress.battleLog.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No matches logged yet.';
    battleLogNode.appendChild(li);
    return;
  }
  progress.battleLog.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = entry;
    battleLogNode.appendChild(li);
  });
}

function spawnUnit(card, side, lane) {
  if (card.spell) return;

  const x = side === 'player' ? 180 : canvas.width - 180;
  const difficulty = getDifficulty();
  const level = side === 'player' ? progress.cardLevels[card.id] || 1 : 1;
  const levelMult = side === 'player' ? levelMultiplier(level) : 1;

  const hp = side === 'enemy' ? Math.round(card.hp * difficulty.enemyHpMult) : Math.round(card.hp * levelMult);
  const damage = side === 'enemy' ? Math.round(card.damage * difficulty.enemyDamageMult) : Math.round(card.damage * levelMult);
  const speed = side === 'enemy' ? Math.round(card.speed * difficulty.enemySpeedMult) : card.speed;

  state.units.push({ cardId: card.id, side, lane, x, y: LANE_Y[lane], hp, maxHp: hp, damage, speed, range: card.range, radius: card.radius, accentColor: card.color, cooldown: 0, hitFlash: 0, abilityCooldown: 0 });
}

function castFireball(side, lane, card) {
  const y = LANE_Y[lane];
  const x = side === 'player' ? MID_X + 175 : MID_X - 175;
  state.projectiles.push({ x, y, life: 0.55, maxLife: 0.55 });

  const targetSide = side === 'player' ? 'enemy' : 'player';
  const level = side === 'player' ? progress.cardLevels[card.id] || 1 : 1;
  const dmg = side === 'player' ? Math.round(card.damage * levelMultiplier(level)) : card.damage;

  for (let i = 0; i < state.units.length; i += 1) {
    const u = state.units[i];
    if (u.side === targetSide && u.lane === lane && Math.abs(u.x - x) <= card.radius) {
      u.hp -= dmg;
      u.hitFlash = 0.2;
      addFxText(`-${dmg}`, u.x, u.y - 20, '#fca5a5');
    }
  }

  const tower = side === 'player' ? state.enemyTower : state.playerTower;
  if (Math.abs(tower.y - y) < 165 && Math.abs(tower.x - x) < 170) {
    const tDmg = Math.floor(dmg * 0.62);
    tower.hp -= tDmg;
    tower.flash = 0.25;
    addFxText(`-${tDmg}`, tower.x, tower.y - 90, '#fca5a5');
  }
}

function deploy(side, cardId, lane) {
  const card = getCardById(cardId);
  if (!card) return;
  if (card.spell) castFireball(side, lane, card);
  else spawnUnit(card, side, lane);
}

function activateUnitAbility(unit) {
  const card = getCardById(unit.cardId);
  if (!card || !card.ability) {
    addFxText('No ability!', unit.x, unit.y - 50, '#ff6b6b');
    return;
  }
  
  // Check cooldown
  if (unit.abilityCooldown > 0) {
    addFxText('Ability on cooldown', unit.x, unit.y - 50, '#ffa500');
    return;
  }
  
  // Check elixir cost
  if (state.elixir < card.ability.cost) {
    addFxText(`Need ${card.ability.cost} elixir`, unit.x, unit.y - 50, '#ff6b6b');
    return;
  }
  
  // Deduct elixir
  state.elixir -= card.ability.cost;
  addFxText(`-${card.ability.cost} ⚡`, unit.x, unit.y - 50, '#00d4ff');
  
  // Set cooldown (5 seconds)
  unit.abilityCooldown = 5;
  
  // Apply ability effect based on ability name
  const abilityName = card.ability.name.toLowerCase();
  
  if (abilityName.includes('shield') || abilityName.includes('bash')) {
    // Shield Bash - damage boost for 3 seconds
    const originalDamage = unit.damage;
    unit.damage = Math.round(unit.damage * 2);
    unit.abilityEndTime = 3;
    unit.abilityType = 'damageBoost';
    unit.originalDamage = originalDamage;
    addFxText('+100% DMG!', unit.x, unit.y - 30, '#ffff00');
  } else if (abilityName.includes('fireball') || abilityName.includes('burn') || abilityName.includes('explosion')) {
    // AOE damage to all enemies in lane
    const damage = Math.round(card.damage * 0.8);
    for (let i = 0; i < state.units.length; i++) {
      const u = state.units[i];
      if (u.side === 'enemy' && u.lane === unit.lane) {
        u.hp -= damage;
        u.hitFlash = 0.2;
        addFxText(`-${damage}`, u.x, u.y - 20, '#fca5a5');
      }
    }
    addFxText('🔥 Fireball!', unit.x, unit.y - 30, '#ff6b00');
  } else if (abilityName.includes('heal') || abilityName.includes('regenerate')) {
    // Healing
    const healAmount = Math.round(unit.maxHp * 0.4);
    unit.hp = Math.min(unit.hp + healAmount, unit.maxHp);
    addFxText(`+${healAmount} HP!`, unit.x, unit.y - 30, '#4ade80');
  } else if (abilityName.includes('freeze') || abilityName.includes('stun') || abilityName.includes('frost')) {
    // Crowd control - freeze enemies in lane
    for (let i = 0; i < state.units.length; i++) {
      const u = state.units[i];
      if (u.side === 'enemy' && u.lane === unit.lane) {
        u.speed = 0;
        u.frozenTime = 2;
        u.originalSpeed = card.speed || 50;
      }
    }
    addFxText('❄️ Frozen!', unit.x, unit.y - 30, '#0099ff');
  } else if (abilityName.includes('speed') || abilityName.includes('dash') || abilityName.includes('charge')) {
    // Speed boost
    const speedIncrease = Math.round(unit.speed * 0.75);
    unit.speed = unit.speed + speedIncrease;
    unit.speedBoostTime = 3;
    unit.speedBoostAmount = speedIncrease;
    addFxText('+75% Speed!', unit.x, unit.y - 30, '#00ffff');
  } else if (abilityName.includes('summon') || abilityName.includes('skeleton') || abilityName.includes('minion')) {
    // Summon - create 2 weaker units in the same lane
    const summonCard = { id: 'summon-minion', hp: 30, damage: 15, speed: 60, range: 100, radius: 30, color: '#b537f2' };
    for (let i = 0; i < 2; i++) {
      spawnUnit(summonCard, 'player', unit.lane);
    }
    addFxText('👻 Summon!', unit.x, unit.y - 30, '#b537f2');
  } else {
    // Generic ability effect - slight damage boost
    unit.damage = Math.round(unit.damage * 1.5);
    unit.abilityEndTime = 2;
    unit.abilityType = 'damageBoost';
    unit.originalDamage = card.damage;
    addFxText('Ability activated!', unit.x, unit.y - 30, '#00d4ff');
  }
}

function chooseAiCard(budget) {
  const list = CARD_POOL.filter((c) => c.cost <= budget);
  if (list.length === 0) return null;
  if (AI_MODES[progress.aiMode].preferHeavy) {
    list.sort((a, b) => b.cost - a.cost);
    return list[0];
  }
  return randomFrom(list);
}

function chooseAiLane() {
  if (progress.aiMode === 'defensive') {
    const playerLaneCounts = [0, 0, 0];
    state.units.forEach((u) => { if (u.side === 'player') playerLaneCounts[u.lane] += 1; });
    let maxLane = 0;
    for (let i = 1; i < playerLaneCounts.length; i += 1) if (playerLaneCounts[i] > playerLaneCounts[maxLane]) maxLane = i;
    return maxLane;
  }

  if (progress.aiMode === 'split') {
    const lane = state.splitLaneCursor % LANE_Y.length;
    state.splitLaneCursor += 1;
    return lane;
  }

  const centerBias = AI_MODES[progress.aiMode].bias;
  if (Math.random() < centerBias) return 1;
  return Math.random() < 0.5 ? 0 : 2;
}

function runAI(dt) {
  state.aiTimer -= dt;
  if (state.aiTimer > 0 || state.gameOver || state.isMultiplayer) return;

  const difficulty = getDifficulty();
  state.aiTimer = difficulty.aiMin + Math.random() * (difficulty.aiMax - difficulty.aiMin);
  const budget = Math.min(10, difficulty.aiBudgetMin + Math.random() * (difficulty.aiBudgetMax - difficulty.aiBudgetMin));

  const card = chooseAiCard(budget);
  if (!card) return;
  deploy('enemy', card.id, chooseAiLane());
}

function drawArena() {
  const grass = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grass.addColorStop(0, '#1f7a3e');
  grass.addColorStop(1, '#14532d');
  ctx.fillStyle = grass;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = 0; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 18);

  const river = ctx.createLinearGradient(MID_X - 60, 0, MID_X + 60, 0);
  river.addColorStop(0, '#1d4ed8');
  river.addColorStop(0.5, '#0ea5e9');
  river.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = river;
  ctx.fillRect(MID_X - 50, 0, 100, canvas.height);

  ctx.fillStyle = '#9ca3af';
  for (let i = 0; i < LANE_Y.length; i += 1) ctx.fillRect(MID_X - 62, LANE_Y[i] - 22, 124, 44);

  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  for (let i = 0; i < LANE_Y.length; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, LANE_Y[i]);
    ctx.lineTo(canvas.width, LANE_Y[i]);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(MID_X, 0);
  ctx.lineTo(MID_X, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawDragPreview() {
  if (!state.dragPreview.active || state.dragCardIndex === null) return;
  const laneY = LANE_Y[state.dragPreview.lane];
  ctx.save();
  ctx.strokeStyle = state.dragPreview.valid ? 'rgba(59,130,246,0.95)' : 'rgba(239,68,68,0.95)';
  ctx.fillStyle = state.dragPreview.valid ? 'rgba(59,130,246,0.18)' : 'rgba(239,68,68,0.18)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(state.dragPreview.x, laneY, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawTower(tower, side) {
  const isPlayer = side === 'player';
  const baseColor = isPlayer ? '#3b82f6' : '#ef4444';
  const darkColor = isPlayer ? '#1d4ed8' : '#991b1b';
  const lightColor = isPlayer ? '#60a5fa' : '#f87171';
  const accentColor = isPlayer ? '#06b6d4' : '#fbbf24';

  ctx.save();
  
  // Draw attack range circle
  if (tower.attackCooldown <= 0.3) {
    ctx.strokeStyle = `rgba(${isPlayer ? '0,212,255' : '255,107,107'}, 0.3)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.attackRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  if (tower.flash > 0) {
    ctx.shadowBlur = 35;
    ctx.shadowColor = isPlayer ? 'rgba(59,130,246,0.8)' : 'rgba(239,68,68,0.8)';
  }

  // Base/foundation
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(tower.x - 50, tower.y + 48, 100, 12);
  ctx.fillStyle = '#333';
  ctx.fillRect(tower.x - 52, tower.y + 54, 104, 4);

  // Main tower body - bottom section
  ctx.fillStyle = darkColor;
  ctx.fillRect(tower.x - 48, tower.y - 20, 96, 68);
  
  // Main tower body - top section (slightly narrower)
  ctx.fillStyle = baseColor;
  ctx.fillRect(tower.x - 42, tower.y - 50, 84, 30);

  // Stone/brick pattern on main body
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (let row = -20; row < 48; row += 10) {
    ctx.beginPath();
    ctx.moveTo(tower.x - 48, tower.y + row);
    ctx.lineTo(tower.x + 48, tower.y + row);
    ctx.stroke();
  }
  for (let col = -45; col <= 45; col += 15) {
    ctx.beginPath();
    ctx.moveTo(tower.x + col, tower.y - 20);
    ctx.lineTo(tower.x + col, tower.y + 48);
    ctx.stroke();
  }

  // Windows - large arched windows
  ctx.fillStyle = '#0f172a';
  // Left window
  ctx.fillRect(tower.x - 30, tower.y - 10, 18, 22);
  ctx.fillRect(tower.x - 33, tower.y - 10, 24, 4);
  // Right window
  ctx.fillRect(tower.x + 12, tower.y - 10, 18, 22);
  ctx.fillRect(tower.x + 9, tower.y - 10, 24, 4);
  // Center window (top)
  ctx.fillRect(tower.x - 10, tower.y - 35, 20, 16);

  // Window panes
  ctx.strokeStyle = lightColor;
  ctx.lineWidth = 2;
  // Left window panes
  ctx.beginPath();
  ctx.moveTo(tower.x - 21, tower.y - 10);
  ctx.lineTo(tower.x - 21, tower.y + 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tower.x - 30, tower.y - 1);
  ctx.lineTo(tower.x - 12, tower.y - 1);
  ctx.stroke();
  // Right window panes
  ctx.beginPath();
  ctx.moveTo(tower.x + 21, tower.y - 10);
  ctx.lineTo(tower.x + 21, tower.y + 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tower.x + 12, tower.y - 1);
  ctx.lineTo(tower.x + 30, tower.y - 1);
  ctx.stroke();

  // Crenellations (merlons) on top
  ctx.fillStyle = darkColor;
  ctx.lineWidth = 2;
  const battlments = [
    { x: tower.x - 40, w: 12 },
    { x: tower.x - 22, w: 12 },
    { x: tower.x - 4, w: 12 },
    { x: tower.x + 14, w: 12 },
    { x: tower.x + 32, w: 12 }
  ];
  for (const bat of battlments) {
    ctx.fillRect(bat.x, tower.y - 52, bat.w, 8);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeRect(bat.x, tower.y - 52, bat.w, 8);
  }

  // Central tower spire/keep
  ctx.fillStyle = baseColor;
  ctx.fillRect(tower.x - 16, tower.y - 65, 32, 18);
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(tower.x - 16, tower.y - 65, 32, 18);

  // Spire top (roof peak)
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(tower.x - 18, tower.y - 65);
  ctx.lineTo(tower.x, tower.y - 80);
  ctx.lineTo(tower.x + 18, tower.y - 65);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Flag
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tower.x + 18, tower.y - 78);
  ctx.lineTo(tower.x + 32, tower.y - 78);
  ctx.stroke();
  ctx.fillStyle = isPlayer ? 'rgba(59,130,246,0.8)' : 'rgba(239,68,68,0.8)';
  ctx.fillRect(tower.x + 32, tower.y - 82, 18, 8);
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(tower.x + 32, tower.y - 82, 18, 8);

  // Door
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(tower.x - 14, tower.y + 18, 28, 30);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(tower.x - 14, tower.y + 18, 28, 30);
  // Door frame
  ctx.fillStyle = accentColor;
  ctx.fillRect(tower.x - 12, tower.y + 20, 24, 2);
  ctx.fillRect(tower.x - 2, tower.y + 20, 3, 26);
  // Door knocker
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(tower.x, tower.y + 35, 2, 0, Math.PI * 2);
  ctx.fill();

  // HP Bar - styled
  const hpPct = Math.max(0, tower.hp) / tower.maxHp;
  const barWidth = 120;
  const barX = tower.x - barWidth / 2;
  const barY = tower.y - 105;

  // HP bar background with border
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(barX - 2, barY - 2, barWidth + 4, 14);
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, 14);

  // HP bar fill
  ctx.fillStyle = '#10b981';
  if (hpPct < 0.5) ctx.fillStyle = '#f59e0b';
  if (hpPct < 0.2) ctx.fillStyle = '#ef4444';
  ctx.fillRect(barX, barY, barWidth * hpPct, 10);

  // HP text
  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.ceil(tower.hp)}/${tower.maxHp}`, tower.x, barY + 5);

  ctx.restore();
}

function updateUnits(dt) {
  const units = state.units;

  for (let i = 0; i < units.length; i += 1) {
    const unit = units[i];
    unit.cooldown -= dt;
    unit.hitFlash = Math.max(0, unit.hitFlash - dt);
    unit.abilityCooldown = Math.max(0, unit.abilityCooldown - dt);

    // Handle ability duration effects
    if (unit.abilityEndTime !== undefined) {
      unit.abilityEndTime -= dt;
      if (unit.abilityEndTime <= 0) {
        // End ability effect
        if (unit.abilityType === 'damageBoost') {
          unit.damage = unit.originalDamage;
        } else if (unit.abilityType === 'speedBoost') {
          unit.speed = unit.speed - unit.speedBoostAmount;
        }
        unit.abilityEndTime = undefined;
        unit.abilityType = undefined;
      }
    }

    // Handle freeze effect
    if (unit.frozenTime !== undefined) {
      unit.frozenTime -= dt;
      if (unit.frozenTime <= 0) {
        unit.speed = unit.originalSpeed;
        unit.frozenTime = undefined;
        unit.originalSpeed = undefined;
      }
    }

    const enemySide = unit.side === 'player' ? 'enemy' : 'player';
    const targetTower = enemySide === 'enemy' ? state.enemyTower : state.playerTower;

    let nearest = null;
    let nearestDist = Infinity;

    for (let j = 0; j < units.length; j += 1) {
      if (i === j) continue;
      const other = units[j];
      if (other.side !== enemySide || other.lane !== unit.lane) continue;
      const d = Math.abs(other.x - unit.x);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = other;
      }
    }

    const towerDist = Math.abs(targetTower.x - unit.x);

    if (nearest && nearestDist <= unit.range + nearest.radius) {
      if (unit.cooldown <= 0) {
        nearest.hp -= unit.damage;
        nearest.hitFlash = 0.2;
        addFxText(`-${unit.damage}`, nearest.x, nearest.y - 18, '#fca5a5');
        unit.cooldown = 0.65;
      }
    } else if (towerDist <= unit.range + 38) {
      if (unit.cooldown <= 0) {
        targetTower.hp -= unit.damage;
        targetTower.flash = 0.18;
        addFxText(`-${unit.damage}`, targetTower.x, targetTower.y - 90, '#fca5a5');
        unit.cooldown = 0.75;
      }
    } else {
      const dir = unit.side === 'player' ? 1 : -1;
      unit.x += dir * unit.speed * dt;
    }
  }

  for (let i = units.length - 1; i >= 0; i -= 1) {
    if (units[i].hp <= 0) units.splice(i, 1);
  }
}

function drawUnitCharacter(unit, card, ctx) {
  const x = unit.x;
  const y = unit.y;
  const cardId = card.id.toLowerCase();
  
  ctx.save();

  // Determine character type and draw accordingly
  if (cardId.includes('knight') || cardId.includes('barbarian')) {
    drawKnight(x, y, ctx, unit.side);
  } else if (cardId.includes('archer') || cardId.includes('musketeer')) {
    drawArcher(x, y, ctx, unit.side);
  } else if (cardId.includes('witch') || cardId.includes('sorceress') || cardId.includes('necromancer')) {
    drawWitch(x, y, ctx, unit.side);
  } else if (cardId.includes('wizard')) {
    drawWizard(x, y, ctx, unit.side);
  } else if (cardId.includes('giant') || cardId.includes('golem')) {
    drawGiant(x, y, ctx, unit.side);
  } else if (cardId.includes('dragon') || cardId.includes('hound')) {
    drawDragon(x, y, ctx, unit.side);
  } else if (cardId.includes('skeleton') || cardId.includes('bones')) {
    drawSkeleton(x, y, ctx, unit.side);
  } else if (cardId.includes('goblin') || cardId.includes('hog') || cardId.includes('minion')) {
    drawGoblin(x, y, ctx, unit.side);
  } else if (cardId.includes('prince') || cardId.includes('king') || cardId.includes('queen')) {
    drawPrince(x, y, ctx, unit.side);
  } else if (cardId.includes('balloon') || cardId.includes('spirit')) {
    drawBalloon(x, y, ctx, unit.side);
  } else if (cardId.includes('tower') || cardId.includes('hut') || cardId.includes('cannon')) {
    drawBuilding(x, y, ctx, unit.side);
  } else {
    // Default character - simple warrior
    drawWarrior(x, y, ctx, unit.side);
  }
  
  ctx.restore();
}

function drawKnight(x, y, ctx, side) {
  const color = side === 'player' ? '#3b82f6' : '#ef4444';
  const trim = side === 'player' ? '#1d4ed8' : '#991b1b';
  
  ctx.save();
  
  // Legs
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(x - 3, y + 4, 2, 6);
  ctx.fillRect(x + 1, y + 4, 2, 6);
  
  // Feet
  ctx.fillStyle = '#444';
  ctx.fillRect(x - 4, y + 10, 3, 1);
  ctx.fillRect(x + 1, y + 10, 3, 1);
  
  // Body - Full armor suit
  ctx.fillStyle = color;
  ctx.fillRect(x - 6, y - 4, 12, 10);
  
  // Breastplate detail
  ctx.fillStyle = trim;
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x - 5, y - 2);
  ctx.lineTo(x + 5, y - 2);
  ctx.lineTo(x + 6, y);
  ctx.fill();
  
  // Arms
  ctx.fillStyle = color;
  ctx.fillRect(x - 8, y - 2, 2, 8);
  ctx.fillRect(x + 6, y - 2, 2, 8);
  
  // Gauntlets
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 8.5, y + 5, 3, 1);
  ctx.fillRect(x + 5.5, y + 5, 3, 1);
  
  // Head - Helmet
  ctx.fillStyle = trim;
  ctx.beginPath();
  ctx.arc(x, y - 8, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Face plate
  ctx.fillStyle = '#666';
  ctx.fillRect(x - 2, y - 8, 4, 4);
  
  // Eyes
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(x - 1, y - 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1, y - 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Plume on helmet
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x - 1, y - 12, 2, 3);
  
  // Sword
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 4);
  ctx.lineTo(x + 10, y - 12);
  ctx.stroke();
  
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(x + 9.5, y - 13, 1, 1);
  
  ctx.restore();
}

function drawArcher(x, y, ctx, side) {
  const color = side === 'player' ? '#10b981' : '#dc2626';
  
  ctx.save();
  
  // Legs
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(x - 3, y + 4, 2, 6);
  ctx.fillRect(x + 1, y + 4, 2, 6);
  
  // Feet
  ctx.fillStyle = '#644e2d';
  ctx.fillRect(x - 4, y + 10, 3, 1);
  ctx.fillRect(x + 1, y + 10, 3, 1);
  
  // Body - Tunic
  ctx.fillStyle = color;
  ctx.fillRect(x - 5, y - 4, 10, 10);
  
  // Belt
  ctx.fillStyle = '#654321';
  ctx.fillRect(x - 5, y + 2, 10, 1.5);
  
  // Arms
  ctx.fillStyle = '#d4d4d8';
  ctx.fillRect(x - 7, y - 1, 2, 7);
  ctx.fillRect(x + 5, y - 1, 2, 7);
  
  // Head
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(x, y - 7, 3.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Hair
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(x - 3, y - 10, 6, 2.5);
  
  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 1, y - 8, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1, y - 8, 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Bow
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 2);
  ctx.quadraticCurveTo(x + 10, y, x + 6, y + 6);
  ctx.stroke();
  
  // Arrow
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 2);
  ctx.lineTo(x + 12, y - 6);
  ctx.stroke();
  
  // Arrow tip
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(x + 12, y - 6, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawWitch(x, y, ctx, side) {
  const color = side === 'player' ? '#8b5cf6' : '#7c2d12';
  
  ctx.save();
  
  // Legs
  ctx.fillStyle = '#1f1f1f';
  ctx.fillRect(x - 2.5, y + 5, 2, 5);
  ctx.fillRect(x + 0.5, y + 5, 2, 5);
  
  // Feet
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 3.5, y + 10, 7, 0.8);
  
  // Body - Long robe
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 3);
  ctx.lineTo(x - 5, y + 8);
  ctx.lineTo(x + 5, y + 8);
  ctx.lineTo(x + 6, y - 3);
  ctx.quadraticCurveTo(x, y - 1, x, y - 3);
  ctx.fill();
  
  // Robe trim
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 3);
  ctx.lineTo(x + 6, y - 3);
  ctx.stroke();
  
  // Arms in sleeves
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(x - 6, y + 1, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 6, y + 1, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(x, y - 8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Witch hat - tall pointed cone
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.moveTo(x - 5.5, y - 11);
  ctx.lineTo(x, y - 23);
  ctx.lineTo(x + 5.5, y - 11);
  ctx.closePath();
  ctx.fill();
  
  // Hat brim
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x - 6.5, y - 11, 13, 1.5);
  
  // Hat band
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 6.5, y - 11.5, 13, 0.5);
  
  // Face
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 1, y - 9, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1, y - 9, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Wicked smile
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, y - 7.5, 1.5, 0, Math.PI);
  ctx.stroke();
  
  // Staff
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 4);
  ctx.lineTo(x + 6, y + 12);
  ctx.stroke();
  
  // Staff orb - glowing
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.arc(x + 6, y + 14, 2.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
  ctx.beginPath();
  ctx.arc(x + 6, y + 14, 3.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawWizard(x, y, ctx, side) {
  const color = side === 'player' ? '#0ea5e9' : '#f97316';
  
  ctx.save();
  
  // Legs
  ctx.fillStyle = color;
  ctx.fillRect(x - 2.5, y + 5, 2, 5);
  ctx.fillRect(x + 0.5, y + 5, 2, 5);
  
  // Feet - slippers
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(x - 2, y + 10.5, 1.5, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 10.5, 1.5, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body - Wizard robe
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 2);
  ctx.lineTo(x - 5, y + 8);
  ctx.lineTo(x + 5, y + 8);
  ctx.lineTo(x + 6, y - 2);
  ctx.quadraticCurveTo(x, y, x, y - 2);
  ctx.fill();
  
  // Belt with buckle
  ctx.fillStyle = '#644321';
  ctx.fillRect(x - 6, y + 2, 12, 1.2);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x, y + 2.6, 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Arms with hands
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(x - 6, y, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 6, y, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x, y - 8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Beard - long and magnificent
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.ellipse(x, y - 5, 2.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Beard swirl details
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - 1.5, y - 4);
  ctx.quadraticCurveTo(x - 2, y - 3, x - 1.5, y - 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 1.5, y - 4);
  ctx.quadraticCurveTo(x + 2, y - 3, x + 1.5, y - 2);
  ctx.stroke();
  
  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 1, y - 9, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1, y - 9, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Pointy wizard hat with stars
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 5.5, y - 11.5);
  ctx.lineTo(x, y - 26);
  ctx.lineTo(x + 5.5, y - 11.5);
  ctx.closePath();
  ctx.fill();
  
  // Hat brim
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y - 11.5, 6, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Stars on hat
  ctx.fillStyle = '#fbbf24';
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const sx = x + Math.cos(angle) * 3;
    const sy = y - 18 + Math.sin(angle) * 3;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Staff with orb
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 4);
  ctx.lineTo(x + 6, y + 12);
  ctx.stroke();
  
  // Glowing orb at top
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 6, y + 14, 2.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = `rgba(${color === '#0ea5e9' ? '14, 165, 233' : '249, 115, 22'}, 0.5)`;
  ctx.beginPath();
  ctx.arc(x + 6, y + 14, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawGiant(x, y, ctx, side) {
  const color = side === 'player' ? '#06b6d4' : '#b91c1c';
  
  ctx.save();
  
  // Massive legs
  ctx.fillStyle = color;
  ctx.fillRect(x - 4.5, y + 4, 3.5, 7);
  ctx.fillRect(x + 1, y + 4, 3.5, 7);
  
  // Feet - Large boots
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(x - 5, y + 11, 4, 1);
  ctx.fillRect(x + 1, y + 11, 4, 1);
  
  // Body - massive
  ctx.fillStyle = color;
  ctx.fillRect(x - 6, y - 3, 12, 8);
  
  // Chest plate
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(x - 5.5, y - 2, 11, 4);
  
  // Arms - thick and meaty
  ctx.fillStyle = '#d4d4d8';
  ctx.fillRect(x - 10, y - 1, 4, 9);
  ctx.fillRect(x + 6, y - 1, 4, 9);
  
  // Hands - huge fists
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(x - 10, y + 8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 10, y + 8, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Knuckles
  ctx.fillStyle = '#aaa';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x - 10 + (i - 1.5) * 0.7, y + 8.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Head - Tiny compared to body
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(x, y - 8, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Angry eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 1.2, y - 9, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.2, y - 9, 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Angry eyebrows
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 10);
  ctx.lineTo(x - 0.5, y - 10.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 10);
  ctx.lineTo(x + 0.5, y - 10.3);
  ctx.stroke();
  
  // Club/weapon - massive
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 10, y + 4, 2.5, 8);
  ctx.beginPath();
  ctx.ellipse(x + 11.25, y + 3, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawDragon(x, y, ctx, side) {
  const color = side === 'player' ? '#f97316' : '#7c2d12';
  
  ctx.save();
  
  // Tail curling
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.quadraticCurveTo(x - 12, y + 4, x - 10, y + 10);
  ctx.stroke();
  
  // Scales on tail
  ctx.strokeStyle = `rgba(0,0,0,0.2)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const tx = x - 8 - i * 2;
    const ty = y + i * 2.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Body - Long and sinuous
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 7, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Scales on body
  for (let i = -3; i <= 3; i++) {
    ctx.fillStyle = `rgba(0,0,0,0.15)`;
    ctx.beginPath();
    ctx.circle = true;
    ctx.arc(x + i * 2.5, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Neck and head area
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x + 8, y - 2, 5, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Head - Draconic
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + 12, y - 1);
  ctx.lineTo(x + 16, y - 4);
  ctx.lineTo(x + 17, y);
  ctx.lineTo(x + 16, y + 3);
  ctx.lineTo(x + 12, y + 1);
  ctx.closePath();
  ctx.fill();
  
  // Snout - pointy
  ctx.fillStyle = `rgba(${color === '#f97316' ? '249, 115, 22' : '124, 45, 18'}, 0.8)`;
  ctx.beginPath();
  ctx.moveTo(x + 17, y);
  ctx.lineTo(x + 22, y - 1);
  ctx.lineTo(x + 22, y + 1);
  ctx.closePath();
  ctx.fill();
  
  // Nostrils
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x + 20, y - 0.5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 20, y + 0.5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(x + 14, y - 3, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x + 14, y - 3, 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Horns
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 13, y - 5);
  ctx.lineTo(x + 12, y - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 15, y - 5);
  ctx.lineTo(x + 16, y - 10);
  ctx.stroke();
  
  // Wings - membranous
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 3, y - 4);
  ctx.quadraticCurveTo(x - 3, y - 12, x - 8, y - 8);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 4);
  ctx.quadraticCurveTo(x - 3, y + 12, x - 8, y + 8);
  ctx.stroke();
  
  // Wing membranes
  ctx.fillStyle = `rgba(${color === '#f97316' ? '249, 115, 22' : '124, 45, 18'}, 0.25)`;
  ctx.beginPath();
  ctx.moveTo(x + 3, y - 4);
  ctx.quadraticCurveTo(x - 3, y - 12, x - 8, y - 8);
  ctx.lineTo(x - 8, y);
  ctx.quadraticCurveTo(x - 3, y, x + 3, y);
  ctx.fill();
  
  // Fire breath effect
  if (Math.random() > 0.6) {
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)';
    ctx.beginPath();
    ctx.ellipse(x + 25, y, 4, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function drawSkeleton(x, y, ctx, side) {
  ctx.save();
  
  // Legs - Bones
  ctx.strokeStyle = '#f5f5f5';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 4);
  ctx.lineTo(x - 2, y + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 4);
  ctx.lineTo(x + 2, y + 10);
  ctx.stroke();
  
  // Feet - Bone
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(x - 3, y + 10, 6, 0.8);
  
  // Pelvis - Bone structure
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(x - 4, y + 3, 8, 1.5);
  
  // Ribs - Skeleton ribcage
  ctx.strokeStyle = '#d4d4d8';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 1 + i * 1.5);
    ctx.quadraticCurveTo(x - 6, y + i * 1.5, x - 3, y + 1 + i * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 1 + i * 1.5);
    ctx.quadraticCurveTo(x + 6, y + i * 1.5, x + 3, y + 1 + i * 1.5);
    ctx.stroke();
  }
  
  // Spine
  ctx.strokeStyle = '#f5f5f5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x, y + 5);
  ctx.stroke();
  
  // Spine segments
  ctx.fillStyle = '#d4d4d8';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(x, y - 2 + i * 1.8, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Arm bones
  ctx.strokeStyle = '#f5f5f5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 1);
  ctx.lineTo(x - 8, y - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 1);
  ctx.lineTo(x + 8, y - 4);
  ctx.stroke();
  
  // Hand bones
  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath();
  ctx.arc(x - 8, y - 5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 8, y - 5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Skull - Large cranium
  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath();
  ctx.arc(x, y - 9, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Jaw
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(x - 3.5, y - 5.5, 7, 1.5);
  
  // Eye sockets - Empty and dark
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(x - 1.5, y - 10, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.5, y - 10, 1.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Nasal cavity
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.moveTo(x - 0.5, y - 8);
  ctx.lineTo(x + 0.5, y - 8);
  ctx.lineTo(x, y - 7);
  ctx.closePath();
  ctx.fill();
  
  // Teeth on jaw
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 0.5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(x + i * 1.2, y - 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function drawGoblin(x, y, ctx, side) {
  const color = side === 'player' ? '#10b981' : '#991b1b';
  
  ctx.save();
  
  // Legs - Crooked
  ctx.fillStyle = color;
  ctx.fillRect(x - 2.5, y + 4, 2, 6);
  ctx.fillRect(x + 0.5, y + 4, 2, 6);
  
  // Feet - Clawed
  ctx.fillStyle = '#2d5a2d';
  ctx.beginPath();
  ctx.ellipse(x - 2, y + 10.5, 1.5, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 1.5, y + 10.5, 1.5, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body - Hunched
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 5, 6, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Chest bumps
  ctx.fillStyle = `rgba(0,0,0,0.2)`;
  ctx.beginPath();
  ctx.arc(x - 2, y - 1, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 2, y - 1, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Arms - Long and crooked
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 1);
  ctx.lineTo(x - 9, y + 3);
  ctx.lineTo(x - 8, y + 5);
  ctx.lineTo(x - 4, y + 2);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 1);
  ctx.lineTo(x + 9, y + 3);
  ctx.lineTo(x + 8, y + 5);
  ctx.lineTo(x + 4, y + 2);
  ctx.closePath();
  ctx.fill();
  
  // Hands - Claws
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x - 9, y + 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 9, y + 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Head - Pointy and evil
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 3.5, y - 8);
  ctx.lineTo(x, y - 14);
  ctx.lineTo(x + 3.5, y - 8);
  ctx.quadraticCurveTo(x, y - 6, x, y - 8);
  ctx.fill();
  
  // Face
  ctx.fillStyle = `rgba(${color === '#10b981' ? '16, 185, 129' : '153, 27, 27'}, 0.8)`;
  ctx.beginPath();
  ctx.ellipse(x, y - 9, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes - Glowing red
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(x - 1.2, y - 10, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.2, y - 10, 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 1.2, y - 10, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.2, y - 10, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Fangs
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 0.8, y - 7, 0.8, 1.2);
  ctx.fillRect(x, y - 7, 0.8, 1.2);
  
  // Ears - Pointy
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 11);
  ctx.lineTo(x - 4, y - 13);
  ctx.lineTo(x - 2, y - 11);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(x + 3, y - 11);
  ctx.lineTo(x + 4, y - 13);
  ctx.lineTo(x + 2, y - 11);
  ctx.closePath();
  ctx.fill();
  
  // Evil grin
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(x, y - 8, 1.2, 0, Math.PI);
  ctx.stroke();
  
  // Weapon - club or axe
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x + 6, y - 4, 2, 7);
  ctx.beginPath();
  ctx.ellipse(x + 7, y - 5, 2, 1.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawPrince(x, y, ctx, side) {
  const color = side === 'player' ? '#6366f1' : '#ea580c';
  
  ctx.save();
  
  // Legs - Royal leggings
  ctx.fillStyle = color;
  ctx.fillRect(x - 2.5, y + 4, 2, 6);
  ctx.fillRect(x + 0.5, y + 4, 2, 6);
  
  // Boots - Gold trim
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(x - 2, y + 10.5, 1.8, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 1.5, y + 10.5, 1.8, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body - Royal outfit
  ctx.fillStyle = color;
  ctx.fillRect(x - 5, y - 3, 10, 9);
  
  // Cape - flowing
  ctx.fillStyle = `rgba(255, 69, 0, 0.7)`;
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 2);
  ctx.quadraticCurveTo(x - 10, y + 2, x - 9, y + 8);
  ctx.lineTo(x - 5, y + 6);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 2);
  ctx.quadraticCurveTo(x + 10, y + 2, x + 9, y + 8);
  ctx.lineTo(x + 5, y + 6);
  ctx.closePath();
  ctx.fill();
  
  // Cape clasp
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x, y - 2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Royal emblem on chest
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 1.5, y + 1, 3, 3);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y + 2.5, 0.8, 0, Math.PI * 2);
  ctx.fill();
  
  // Arms with gauntlets
  ctx.fillStyle = '#d4d4d8';
  ctx.fillRect(x - 7, y - 1, 2, 7);
  ctx.fillRect(x + 5, y - 1, 2, 7);
  
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 7, y - 2, 2, 1);
  ctx.fillRect(x + 5, y - 2, 2, 1);
  
  // Head
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x, y - 7, 3.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Hair
  ctx.fillStyle = '#92400e';
  ctx.fillRect(x - 3, y - 10, 6, 2.5);
  
  // Crown - majestic
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 4.5, y - 11, 9, 1.5);
  
  // Crown jewels
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(x - 2, y - 12, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - 12.5, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 2, y - 12, 0.8, 0, Math.PI * 2);
  ctx.fill();
  
  // Crown spikes
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 11);
  ctx.lineTo(x - 3.5, y - 13);
  ctx.lineTo(x - 2.5, y - 11);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 3, y - 11);
  ctx.lineTo(x + 3.5, y - 13);
  ctx.lineTo(x + 2.5, y - 11);
  ctx.closePath();
  ctx.fill();
  
  // Face
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 1, y - 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1, y - 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Royal sword
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 2);
  ctx.lineTo(x + 9, y - 14);
  ctx.stroke();
  
  // Sword hilt
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(x + 9, y - 1, 1.5, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Sword tip
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 9, y - 15, 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawBalloon(x, y, ctx, side) {
  const color = side === 'player' ? '#fbbf24' : '#dc2626';
  
  ctx.save();
  
  // Ropes connecting to basket
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 3, y + 6);
    ctx.lineTo(x + i * 3, y + 10);
    ctx.stroke();
  }
  
  // Basket - wicker
  ctx.fillStyle = '#92400e';
  ctx.fillRect(x - 4, y + 10, 8, 3);
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 0.8;
  for (let i = -4; i <= 4; i += 2) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + 10);
    ctx.lineTo(x + i, y + 13);
    ctx.stroke();
  }
  for (let i = 10; i <= 13; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 4, y + i);
    ctx.lineTo(x + 4, y + i);
    ctx.stroke();
  }
  
  // Main balloon - large sphere
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 6, 8.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Balloon shine - highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x - 2, y - 11, 2.5, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Balloon seams
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 14);
  ctx.lineTo(x, y + 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 6);
  ctx.lineTo(x + 6, y - 6);
  ctx.stroke();
  
  // Balloon valve at top
  ctx.fillStyle = '#333';
  ctx.fillRect(x - 0.5, y - 15, 1, 1.5);
  
  ctx.restore();
}

function drawBuilding(x, y, ctx, side) {
  const color = side === 'player' ? '#06b6d4' : '#dc2626';
  
  ctx.save();
  
  // Foundation
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(x - 7, y + 8, 14, 2);
  
  // Building body
  ctx.fillStyle = color;
  ctx.fillRect(x - 6, y - 2, 12, 10);
  
  // Building detail/outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 6, y - 2, 12, 10);
  
  // Windows - 4 panes
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x - 4.5, y + 0.5, 2.5, 2.5);
  ctx.fillRect(x + 2, y + 0.5, 2.5, 2.5);
  ctx.fillRect(x - 4.5, y + 4, 2.5, 2.5);
  ctx.fillRect(x + 2, y + 4, 2.5, 2.5);
  
  // Window panes divisions
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 0.5;
  for (let j = -4.5; j <= 2; j += 6.5) {
    ctx.beginPath();
    ctx.moveTo(x + j + 1.25, y + 0.5);
    ctx.lineTo(x + j + 1.25, y + 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + j, y + 1.75);
    ctx.lineTo(x + j + 2.5, y + 1.75);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + j + 1.25, y + 4);
    ctx.lineTo(x + j + 1.25, y + 6.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + j, y + 5.25);
    ctx.lineTo(x + j + 2.5, y + 5.25);
    ctx.stroke();
  }
  
  // Door
  ctx.fillStyle = '#654321';
  ctx.fillRect(x - 1.5, y + 5, 3, 3);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x + 1.2, y + 6.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Roof - triangular
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 2);
  ctx.lineTo(x, y - 9);
  ctx.lineTo(x + 8, y - 2);
  ctx.closePath();
  ctx.fill();
  
  // Roof ridge
  ctx.strokeStyle = '#4b3410';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 2);
  ctx.lineTo(x + 8, y - 2);
  ctx.stroke();
  
  // Chimney
  ctx.fillStyle = '#92400e';
  ctx.fillRect(x + 4, y - 6, 1.5, 5);
  ctx.fillStyle = '#654321';
  ctx.fillRect(x + 4, y - 7, 1.5, 1);
  
  ctx.restore();
}

function drawWarrior(x, y, ctx, side) {
  const color = side === 'player' ? '#06b6d4' : '#dc2626';
  
  ctx.save();
  
  // Legs
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(x - 2.5, y + 4, 2, 6);
  ctx.fillRect(x + 0.5, y + 4, 2, 6);
  
  // Feet
  ctx.fillStyle = '#444';
  ctx.fillRect(x - 3.5, y + 10, 3, 0.8);
  ctx.fillRect(x + 0.5, y + 10, 3, 0.8);
  
  // Body
  ctx.fillStyle = color;
  ctx.fillRect(x - 5, y - 3, 10, 8);
  
  // Chest plate
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x, y - 0.5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Arms
  ctx.fillStyle = '#d4d4d8';
  ctx.fillRect(x - 7, y - 1, 2, 7);
  ctx.fillRect(x + 5, y - 1, 2, 7);
  
  // Head
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(x, y - 7, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 1, y - 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1, y - 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Sword - Dynamic
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 2);
  ctx.lineTo(x + 9, y - 12);
  ctx.stroke();
  
  // Sword hilt
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.ellipse(x + 9, y - 1, 1, 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Shield
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x - 7, y + 2, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x - 7, y + 2, 2, 3, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
}

function drawUnits() {
  for (let i = 0; i < state.units.length; i += 1) {
    const unit = state.units[i];
    const team = TEAM_STYLE[unit.side];
    const card = getCardById(unit.cardId);

    ctx.save();
    if (unit.hitFlash > 0) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(248,113,113,0.85)';
    }

    // Draw ability glow for player units with abilities
    if (unit.side === 'player' && card && card.ability) {
      if (unit.abilityCooldown <= 0) {
        // Ability is ready - cyan glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(unit.x, unit.y, unit.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw actual character
    drawUnitCharacter(unit, card, ctx);

    const hpPct = Math.max(0, unit.hp) / unit.maxHp;
    ctx.fillStyle = '#111827';
    ctx.fillRect(unit.x - 22, unit.y - unit.radius - 14, 44, 5);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(unit.x - 22, unit.y - unit.radius - 14, 44 * hpPct, 5);
    
    // Draw ability cooldown indicator for player units
    if (unit.side === 'player' && card && card.ability && unit.abilityCooldown > 0) {
      const cooldownPct = unit.abilityCooldown / 5; // 5 second max cooldown
      const cooldownAngle = Math.PI * 2 * Math.min(1, cooldownPct);
      ctx.fillStyle = '#ff6b00';
      ctx.beginPath();
      ctx.moveTo(unit.x, unit.y);
      ctx.arc(unit.x, unit.y, 8, -Math.PI / 2, -Math.PI / 2 + cooldownAngle);
      ctx.lineTo(unit.x, unit.y);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    state.projectiles[i].life -= dt;
    if (state.projectiles[i].life <= 0) state.projectiles.splice(i, 1);
  }
}

function drawProjectiles() {
  for (let i = 0; i < state.projectiles.length; i += 1) {
    const p = state.projectiles[i];
    const alpha = p.life / p.maxLife;
    ctx.fillStyle = `rgba(239,68,68,${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 120 * (1 - alpha + 0.2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateTowerFlashes(dt) {
  state.playerTower.flash = Math.max(0, state.playerTower.flash - dt);
  state.enemyTower.flash = Math.max(0, state.enemyTower.flash - dt);
  
  // Update tower attack cooldowns and perform attacks
  updateTowerAttacks(dt);
}

function updateTowerAttacks(dt) {
  // Player tower attacks enemy units
  state.playerTower.attackCooldown = Math.max(0, state.playerTower.attackCooldown - dt);
  if (state.playerTower.attackCooldown <= 0) {
    let target = null;
    let closestDist = state.playerTower.attackRange;
    
    // Find closest enemy unit in range
    for (let i = 0; i < state.units.length; i++) {
      const u = state.units[i];
      if (u.side === 'enemy') {
        const dist = Math.sqrt(Math.pow(u.x - state.playerTower.x, 2) + Math.pow(u.y - state.playerTower.y, 2));
        if (dist < closestDist) {
          closestDist = dist;
          target = u;
        }
      }
    }
    
    if (target) {
      target.hp -= state.playerTower.damage;
      target.hitFlash = 0.15;
      addFxText(`-${state.playerTower.damage}`, target.x, target.y - 25, '#0099ff');
      state.playerTower.attackCooldown = 1.2;
    }
  }
  
  // Enemy tower attacks player units
  state.enemyTower.attackCooldown = Math.max(0, state.enemyTower.attackCooldown - dt);
  if (state.enemyTower.attackCooldown <= 0) {
    let target = null;
    let closestDist = state.enemyTower.attackRange;
    
    // Find closest player unit in range
    for (let i = 0; i < state.units.length; i++) {
      const u = state.units[i];
      if (u.side === 'player') {
        const dist = Math.sqrt(Math.pow(u.x - state.enemyTower.x, 2) + Math.pow(u.y - state.enemyTower.y, 2));
        if (dist < closestDist) {
          closestDist = dist;
          target = u;
        }
      }
    }
    
    if (target) {
      target.hp -= state.enemyTower.damage;
      target.hitFlash = 0.15;
      addFxText(`-${state.enemyTower.damage}`, target.x, target.y - 25, '#fca5a5');
      state.enemyTower.attackCooldown = 1.2;
    }
  }
}

function formatTime(time) {
  const whole = Math.max(0, Math.ceil(time));
  const minutes = Math.floor(whole / 60);
  const seconds = String(whole % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function rewardVictory() {
  const baseGold = 45 + currentDifficultyIndex * 18;
  progress.gold += baseGold;
  const unlocked = progress.unlockedIds.length > 0 ? progress.unlockedIds : defaultDeckIds();
  const rewardCardId = randomFrom(unlocked);
  progress.cardCopies[rewardCardId] = (progress.cardCopies[rewardCardId] || 0) + 2;
  showDeckStatus(`Victory rewards: +${baseGold} gold and +2 ${getCardById(rewardCardId).name} copies.`);
}

function finishGame(text) {
  state.gameOver = true;
  resultNode.textContent = text;
  resultNode.classList.remove('hidden');

  if (text === 'Victory!') {
    challenge.streak += 1;
    progress.totalWins += 1;
    rewardVictory();

    applyQuestProgress('wins', 1);

    const unlockedNow = maybeUnlockCards();
    if (currentDifficultyIndex < DIFFICULTY_LEVELS.length - 1) currentDifficultyIndex += 1;

    if (challenge.streak >= challenge.target) {
      challenge.chestReady = true;
      if (challengeMessage) challengeMessage.textContent = unlockedNow > 0
        ? `You unlocked a Royal Chest and ${unlockedNow} new card(s). Open it to claim your hero or evil reward!`
        : 'You unlocked a Royal Chest. Open it to claim your hero or evil reward.';
      challengeModal.classList.remove('hidden');
      openChestBtn.classList.remove('hidden');
      continueBtn.classList.add('hidden');
    } else {
      restartBtn.classList.remove('hidden');
    }
  } else {
    challenge.streak = 0;
    challenge.chestReady = false;
    restartBtn.classList.remove('hidden');
  }

  if (state.isMultiplayer && typeof window.sendMultiplayerBattleResult === 'function') {
    window.sendMultiplayerBattleResult(text);
  }

  addBattleLog(text);
  updateProgressUI();
  updateChallengeUI();
  renderDeckBuilder();
  renderCards();
  renderQuests();
  saveProgress();
}

function checkEnd() {
  if (state.playerTower.hp <= 0 && state.enemyTower.hp <= 0) finishGame('Draw!');
  else if (state.enemyTower.hp <= 0) finishGame('Victory!');
  else if (state.playerTower.hp <= 0) finishGame('Defeat!');
  else if (state.timeLeft <= 0) {
    if (state.playerTower.hp > state.enemyTower.hp) finishGame('Victory!');
    else if (state.playerTower.hp < state.enemyTower.hp) finishGame('Defeat!');
    else finishGame('Draw!');
  }
}

function rerollShop() {
  if (progress.gold < 25) {
    showDeckStatus('Need 25 gold to reroll shop.', true);
    return;
  }
  progress.gold -= 25;
  progress.shopOffers = generateShopOffers();
  refreshProgressPanels(true);
}

function resetAllProgress() {
  progress = createFallbackProgress();
  ensureDeckIsValid();
  currentDifficultyIndex = 0;
  challenge.streak = 0;
  challenge.chestReady = false;
  state = createInitialState();
  saveProgress();

  updateDifficultyUI();
  updateProgressUI();
  updateChallengeUI();
  renderDeckBuilder();
  renderCards();
  renderQuests();
  progress.shopOffers = generateShopOffers();
  renderShop();
  renderBattleLog();

  resultNode.classList.add('hidden');
  restartBtn.classList.add('hidden');
  if (startBattleBtn) startBattleBtn.classList.remove('hidden');
  challengeModal.classList.add('hidden');
  showDeckStatus('Progress reset successfully.');
}

canvas.addEventListener('dragenter', (event) => {
  event.preventDefault();
  state.dragDepth += 1;
});

canvas.addEventListener('dragover', (event) => {
  event.preventDefault();
  if (state.dragCardIndex === null || state.gameOver) return;
  const { x, y } = toCanvasCoords(event);
  updateDragPreview(x, y);
  event.dataTransfer.dropEffect = state.dragPreview.valid ? 'copy' : 'none';
});

canvas.addEventListener('dragleave', () => {
  state.dragDepth = Math.max(0, state.dragDepth - 1);
  if (state.dragDepth === 0) clearDragPreview();
});

canvas.addEventListener('drop', (event) => {
  event.preventDefault();
  state.dragDepth = 0;
  const { x, y } = toCanvasCoords(event);
  updateDragPreview(x, y);
  const cardIndex = Number.parseInt(event.dataTransfer.getData('text/plain'), 10);
  if (Number.isInteger(cardIndex)) tryPlayerDeploy(cardIndex, x, y);
  clearDragPreview();
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  if (state.gameOver) return;
  
  const { x, y } = toCanvasCoords(event);
  const clickRadius = 40;
  
  // Find the closest player unit within click radius
  let targetUnit = null;
  let closestDistance = clickRadius;
  
  for (let i = 0; i < state.units.length; i++) {
    const unit = state.units[i];
    if (unit.side !== 'player') continue;
    
    const dx = unit.x - x;
    const dy = unit.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      targetUnit = unit;
    }
  }
  
  if (targetUnit) {
    activateUnitAbility(targetUnit);
  }
});

restartBtn.addEventListener('click', resetMatch);

if (startBattleBtn) {
  startBattleBtn.addEventListener('click', () => {
    state.battleStarted = true;
    startBattleBtn.classList.add('hidden');
    showDeckStatus('Battle started! Drag cards to deploy. Right-click units to use abilities!');
    markCardStateDirty();
  });
}

if (openChestBtn && continueBtn && challengeMessage) {
  openChestBtn.addEventListener('click', () => {
    const specialCards = heroCards.concat(evilCards);
    const randomSpecial = randomFrom(specialCards);
    const isHero = heroCards.includes(randomSpecial);
    const cardType = isHero ? 'hero' : 'evil';

    if (!progress.unlockedIds.includes(randomSpecial)) {
      progress.unlockedIds.push(randomSpecial);
      progress.cardCopies[randomSpecial] = 1;
      challengeMessage.textContent = `🎉 Congratulations! Chest opened. You unlocked the ${cardType} ${getCardById(randomSpecial).name}!`;
    } else {
      progress.cardCopies[randomSpecial] = (progress.cardCopies[randomSpecial] || 0) + 1;
      challengeMessage.textContent = `🎉 Congratulations! Chest opened. You earned +1 ${getCardById(randomSpecial).name}!`;
    }

    progress.gold += 100;

    openChestBtn.classList.add('hidden');
    continueBtn.classList.remove('hidden');
    updateProgressUI();
    renderDeckBuilder();
    saveProgress();
  });
}

if (continueBtn && challengeModal) {
  continueBtn.addEventListener('click', () => {
    challengeModal.classList.add('hidden');
    challenge.streak = 0;
    challenge.chestReady = false;
    updateChallengeUI();
    resetMatch();
  });
}

if (difficultySelect) {
  difficultySelect.addEventListener('change', (event) => {
    currentDifficultyIndex = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(currentDifficultyIndex)) currentDifficultyIndex = 0;
    currentDifficultyIndex = Math.max(0, Math.min(DIFFICULTY_LEVELS.length - 1, currentDifficultyIndex));
    updateDifficultyUI();
    resetMatch();
  });
}

if (aiModeSelect) {
  aiModeSelect.addEventListener('change', (event) => {
    const mode = String(event.target.value);
    if (!AI_MODES[mode]) return;
    progress.aiMode = mode;
    saveProgress();
    showDeckStatus(`AI mode set to ${AI_MODES[mode].label}.`);
  });
}

if (saveDeckBtn) {
  saveDeckBtn.addEventListener('click', () => {
    ensureDeckIsValid();
    if (progress.deckIds.length !== DECK_SIZE) {
      showDeckStatus(`Deck needs ${DECK_SIZE} cards before saving.`, true);
      return;
    }
    refreshProgressPanels(true);
    showDeckStatus('Deck saved successfully.');
  });
}

if (refreshQuestsBtn) {
  refreshQuestsBtn.addEventListener('click', () => {
    progress.questsDate = todayKey();
    progress.quests = generateDailyQuests();
    refreshProgressPanels(true);
    showDeckStatus('Daily quests refreshed.');
  });
}

if (rerollShopBtn) rerollShopBtn.addEventListener('click', rerollShop);
if (resetProgressBtn) resetProgressBtn.addEventListener('click', resetAllProgress);


if (closeCardInfoBtn) closeCardInfoBtn.addEventListener('click', closeCardInfo);
if (cardInfoModal) {
  cardInfoModal.addEventListener('click', (event) => {
    if (event.target === cardInfoModal) closeCardInfo();
  });
}

function gameLoop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (!state.gameOver && state.battleStarted) {
    state.timeLeft -= dt;
    state.elixir = Math.min(10, state.elixir + dt * (state.timeLeft <= 60 ? 1.4 : 1));
    runAI(dt);
    updateUnits(dt);
    updateProjectiles(dt);
    updateEffects(dt);
    updateTowerFlashes(dt);
    checkEnd();
  }

  drawArena();
  drawDragPreview();
  drawTower(state.playerTower, 'player');
  drawTower(state.enemyTower, 'enemy');
  drawProjectiles();
  drawUnits();
  drawEffects();

  enemyHpNode.textContent = Math.max(0, Math.floor(state.enemyTower.hp));
  playerHpNode.textContent = Math.max(0, Math.floor(state.playerTower.hp));
  timerNode.textContent = formatTime(state.timeLeft);
  elixirFill.style.width = `${(state.elixir / 10) * 100}%`;
  elixirValue.textContent = `${state.elixir.toFixed(1)} / 10`;
  syncCardStatesIfNeeded();

  requestAnimationFrame(gameLoop);
}

ensureDeckIsValid();
progress.shopOffers = Array.isArray(progress.shopOffers) && progress.shopOffers.length > 0 ? progress.shopOffers : generateShopOffers();
saveProgress();
updateDifficultyUI();
updateChallengeUI();
updateProgressUI();
renderDeckBuilder();
renderCards();
renderQuests();
renderShop();
renderBattleLog();
setupMusic();
setupTabs();
setInterval(refreshInteractiveButtonsTick, 1000);
showDeckStatus('Progression systems enabled: upgrades, quests, shop, battle log.');
requestAnimationFrame(gameLoop);