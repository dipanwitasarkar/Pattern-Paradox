# 🧩 Pattern Paradox

An AI-powered adaptive brain game that learns your strengths and weaknesses to create personalized pattern challenges. Built for viral growth with a fully local, serverless architecture.

## ✨ Features

- 🤖 **Jev AI Integration**: Uses TypeSafe's System One model for adaptive difficulty
- 🧩 **5 Pattern Types**: Numeric, visual, logical, sequence, and geometric challenges
- 👥 **Local Multiplayer**: Hot-seat mode for 2-4 players on the same device
- 📊 **Local Analytics**: Comprehensive performance tracking stored locally
- 📱 **Cross-Platform**: Works on web, mobile, and desktop
- 💾 **Lightweight**: Only 2-3 MB storage, 30-50 MB RAM
- 🌐 **Offline-First**: Fully functional without internet connection
- 🏆 **Competitive**: Leaderboards, streaks, and scoring systems
- 🔒 **Privacy-Focused**: All data stored locally on device
- 📦 **PWA Ready**: Installable as a progressive web app
- 🎨 **Social Media Optimized**: Open Graph tags for better link sharing
- 📱 **QR Code**: Easy mobile sharing and distribution
- 🔧 **Data Management**: In-app panel for backup, restore, and cleanup
- 🔑 **Persistent API Key**: Enter Jev API key once, use forever

## 🎮 How to Play

1. **Single Player Mode**: Solve patterns as fast as possible while the AI adapts to your playing style
2. **Local Multiplayer**: 2-4 players take turns on the same device, competing for the highest score
3. **Adaptive Difficulty**: The AI learns your strengths and weaknesses, generating patterns that target your weak spots
4. **Scoring**: Earn points based on difficulty, time bonuses, and streak multipliers
5. **Progression**: Level up every 5 patterns solved to unlock harder challenges

## 🚀 Tech Stack

- **Frontend**: React + TypeScript
- **Storage**: IndexedDB via localforage (local, serverless)
- **AI**: TypeSafe Jev (System One model) with local fallback
- **Build**: Create React App with optimized production bundle

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/dipanwitasarkar/Pattern-Paradox.git
cd Pattern-Paradox

# Install dependencies
npm install

# Start development server
npm run web

# Build for production
npm run build
```

## 🎯 Game Modes

### Single Player
- Solve patterns at your own pace
- AI adapts to your playing style
- Track personal progress and improvement
- Unlock achievements and levels

### Local Multiplayer
- 2-4 players on the same device
- Turn-based hot-seat gameplay
- Individual scoring and leaderboards
- Perfect for parties and family game nights

## 🧠 AI Integration

Pattern Paradox uses TypeSafe's Jev AI for adaptive gameplay:

- **Choice**: Selects pattern types based on player weaknesses
- **Score**: Evaluates performance (0-100 scale)
- **Noul**: Determines when to increase difficulty

### API Key Management
- **Persistent Storage**: API key is saved to localStorage (enter once, use forever)
- **Optional**: Game works perfectly without API key using local fallback logic
- **Easy Setup**: Enter your key in Settings → Get full AI features
- **Removable**: Can remove API key anytime to use fallback logic

### Without API Key
The game includes robust local fallback logic, so it works perfectly without the Jev API key:
- **Pattern Selection**: Random selection from player's weak areas
- **Performance**: Simple accuracy-based scoring
- **Difficulty**: Rule-based progression (3+ streak = level up)
- **Hints**: Pre-defined hints for each pattern type

### Get Jev API Key
Sign up at [typesafe.ai](https://typesafe.ai) to enable full AI features.

## 📱 Mobile Device Storage

**Initial Install:**
- App: ~2-3 MB
- Database: ~100 KB (empty)
- Total: ~3 MB

**After Heavy Usage:**
- App: ~2-3 MB (unchanged)
- Database: ~10-50 MB (depending on usage)
- Cache: ~2-5 MB
- Total: ~15-60 MB

**With Local Cleanup:**
- App: ~2-3 MB
- Database: ~5-10 MB (after cleanup)
- Cache: ~1-2 MB
- Total: ~8-15 MB

## 🔧 Data Management

### Local Database
- **Storage**: IndexedDB via localforage
- **Retention**: 30 days for detailed analytics
- **Cleanup**: Automatic and manual options
- **Backup**: Export/import functionality
- **API Key**: Persistent localStorage storage (enter once, use forever)

### In-App Data Management
The game includes a comprehensive data management panel accessible from the main menu:
- **View Statistics**: See total players, games, events, and database size
- **Clear Old Data**: Remove data older than 30 days to free up space
- **Clear All Data**: Complete factory reset with confirmation
- **Export Data**: Download backup as JSON file
- **Import Data**: Restore from backup file
- **API Key Management**: Enter, view, and remove Jev API key with persistence

### Database Cleanup
The game automatically manages local storage:
- Removes analytics events older than 30 days
- Removes gameplay answers older than 30 days
- Removes inactive players (90+ days, no games played)
- Optimizes database performance
- Reclaims disk space

### Manual Data Management
```javascript
// Access database statistics
const stats = await gameEngine.getDatabaseStats();

// Clean old data
await gameEngine.cleanupOldData(30); // Keep 30 days

// Export data
const exportData = await gameEngine.exportData();

// Import data
await gameEngine.importData(jsonData);

// Clear all data
await gameEngine.clearAllData();
```

## 🎨 Pattern Types

### 1. Numeric Patterns
- Arithmetic progressions
- Number sequences
- Mathematical relationships

### 2. Visual Patterns
- Color sequences
- Shape arrangements
- Grid-based patterns

### 3. Logical Patterns
- Mathematical expressions
- Operation sequences
- Logic puzzles

### 4. Sequence Patterns
- Fibonacci sequences
- Mathematical progressions
- Complex number patterns

### 5. Geometric Patterns
- Shape rotations
- Transformations
- Spatial relationships

## 🏆 Scoring System

- **Base Score**: Difficulty × 10 points
- **Time Bonus**: Up to 2× multiplier for fast answers
- **Streak Multiplier**: 1.1× per consecutive correct answer
- **Level Bonus**: +50 points per level achieved

## 📊 Analytics Tracking

The game tracks comprehensive local analytics:
- Player performance by pattern type
- Strengths and weaknesses analysis
- Average solving time
- Streak and completion rates
- Game history and progression

## 🌐 Deployment

### Live Game URL
**Play the game now:** https://dipanwitasarkar.github.io/Pattern-Paradox/

### QR Code for Easy Sharing
![QR Code](https://dipanwitasarkar.github.io/Pattern-Paradox/qr-code.png)

**How to use the QR code:**
- Mobile users can scan the QR code to open the game directly
- Print the QR code on flyers, posters, or business cards
- Share the QR code image on social media
- Display at events or presentations

### Static Hosting
The game is a static React app deployed to GitHub Pages and can be deployed to:
- Vercel
- Netlify
- GitHub Pages (current deployment)
- Any static file hosting service

### Build Commands
```bash
# Development
npm run web

# Production build
npm run build

# Serve production build
npx serve -s build
```

## 🔒 Privacy & Security

- **100% Local**: All data stored on device
- **No Cloud**: No server or cloud dependencies
- **No Tracking**: No external analytics or tracking
- **Offline Capable**: Works without internet
- **Data Control**: Full export/import functionality

## 🎯 Perfect For

- Brain training and cognitive enhancement
- Educational AI demonstrations
- Viral game development case study
- Local multiplayer gaming
- Privacy-focused applications
- Offline-first web development

## 📝 Development

### Project Structure
```
pattern-paradox/
├── src/
│   ├── ai/
│   │   └── jevAdapter.ts          # Jev AI integration
│   ├── components/
│   │   ├── GameBoard.tsx          # Main game interface
│   │   ├── PatternDisplay.tsx    # Pattern rendering
│   │   └── LocalMultiplayerSetup.tsx  # Multiplayer setup
│   ├── game/
│   │   ├── gameEngine.ts          # Game logic engine
│   │   └── patternGenerator.ts    # Pattern generation
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── utils/
│   │   └── localDatabase.ts       # IndexedDB management
│   ├── App.tsx                    # Main app component
│   └── index.tsx                  # Entry point
├── public/                        # Static assets
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript config
```

### Key Technologies
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **localforage**: IndexedDB wrapper for local storage
- **TypeSafe Jev**: AI-powered adaptive difficulty

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🎮 Acknowledgments

- **Jev AI** by TypeSafe for the adaptive AI system
- **React** for the frontend framework
- **localforage** for local storage management

---

**Built with ❤️ for viral brain training with local-first architecture**

**Ready to go viral. 🚀**