# Pattern Paradox - High-Level Design (HLD)

## 1. System Overview

Pattern Paradox is a fully local, serverless brain training game that uses adaptive AI to create personalized pattern challenges. The application is built as a Progressive Web App (PWA) with local-only data storage.

### 1.1 System Purpose
- Provide an adaptive brain training game that learns player strengths and weaknesses
- Enable local multiplayer gameplay on the same device
- Maintain complete privacy by storing all data locally
- Support offline functionality through PWA capabilities

### 1.2 System Scope
**In Scope:**
- Single-player adaptive pattern solving
- Local multiplayer (hot-seat mode)
- Jev AI integration for adaptive difficulty
- Local data storage (IndexedDB)
- PWA capabilities (offline, installable)
- Data management (backup, restore, cleanup)

**Out of Scope:**
- Online multiplayer (requires server)
- Cloud synchronization
- Real-time leaderboards
- Social media integration (beyond sharing links)
- In-app purchases or monetization

## 2. Architecture Overview

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Main Menu  │  │  Game Board  │  │ Data Mgmt UI │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    App.tsx   │  │ GameEngine   │  │PatternGen    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ JevAdapter   │  │LocalDatabase │  │ Components   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  IndexedDB   │  │ LocalStorage │  │  In-Memory   │       │
│  │ (localforage)│  │ (API Keys)   │  │  (Game State) │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Jev API     │  │ GitHub Pages │  │  PWA Cache   │       │
│  │ (Optional)   │  │ (Deployment) │  │ (ServiceWorker)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Frontend:**
- React 18 - UI framework
- TypeScript - Type-safe development
- CSS3 - Styling

**Storage:**
- IndexedDB (via localforage) - Primary data storage
- localStorage - API key persistence
- In-memory state - Game session data

**AI Integration:**
- TypeSafe Jev API - Adaptive difficulty (optional)
- Local fallback logic - Works without API

**Build & Deployment:**
- Create React App - Build tooling
- GitHub Actions - CI/CD
- GitHub Pages - Static hosting

## 3. Component Architecture

### 3.1 Core Components

#### 3.1.1 App Component (App.tsx)
**Responsibility:**
- Main application container
- State management for game modes
- Navigation between screens
- API key management

**Key Functions:**
- Game mode selection (single/multiplayer)
- Player name input
- API key input and persistence
- Data management panel
- Navigation routing

#### 3.1.2 GameBoard Component
**Responsibility:**
- Main game interface
- Pattern display
- Answer input
- Timer management
- Score display

**Key Functions:**
- Render current pattern
- Handle user input
- Display timer
- Show score and streak
- Game over handling

#### 3.1.3 PatternDisplay Component
**Responsibility:**
- Render patterns based on type
- Visual representation of sequences
- Solution display

**Key Functions:**
- Numeric pattern rendering
- Visual pattern rendering (colors/shapes)
- Logical pattern rendering
- Sequence pattern rendering
- Geometric pattern rendering

#### 3.1.4 LocalMultiplayerSetup Component
**Responsibility:**
- Multiplayer game setup
- Player registration
- Turn management

**Key Functions:**
- Player count selection (2-4)
- Player name input
- Game initialization
- Turn order management

#### 3.1.5 DataManagement Component
**Responsibility:**
- Database statistics display
- Data operations
- Backup/restore functionality

**Key Functions:**
- Display database stats
- Clear old data
- Clear all data
- Export data
- Import data

### 3.2 Core Services

#### 3.2.1 GameEngine (gameEngine.ts)
**Responsibility:**
- Game logic coordination
- Pattern generation coordination
- Score calculation
- Difficulty management

**Key Functions:**
- Initialize game session
- Generate patterns
- Validate answers
- Calculate scores
- Manage difficulty progression
- Track player performance

#### 3.2.2 PatternGenerator (patternGenerator.ts)
**Responsibility:**
- Procedural pattern generation
- Pattern type selection
- Solution calculation

**Key Functions:**
- Generate numeric patterns
- Generate visual patterns
- Generate logical patterns
- Generate sequence patterns
- Generate geometric patterns
- Validate solutions

#### 3.2.3 JevAdapter (jevAdapter.ts)
**Responsibility:**
- Jev API integration
- AI decision making
- Fallback logic

**Key Functions:**
- Select pattern type (Choice primitive)
- Evaluate performance (Score primitive)
- Determine difficulty increase (Noul primitive)
- Generate hints
- Fallback to local logic

#### 3.2.4 LocalDatabase (localDatabase.ts)
**Responsibility:**
- IndexedDB management
- Data persistence
- Data operations

**Key Functions:**
- Store player data
- Store game history
- Store analytics
- Database cleanup
- Data export/import
- Database statistics

## 4. Data Flow

### 4.1 Game Start Flow

```
User clicks "Single Player"
    ↓
App.tsx shows player name input
    ↓
User enters name
    ↓
App.tsx initializes GameEngine
    ↓
GameEngine loads player data from LocalDatabase
    ↓
GameEngine generates first pattern via PatternGenerator
    ↓
GameBoard renders pattern
    ↓
Game starts
```

### 4.2 Pattern Solving Flow

```
GameEngine generates pattern
    ↓
PatternGenerator creates pattern based on type
    ↓
GameBoard displays pattern
    ↓
User enters answer
    ↓
GameEngine validates answer
    ↓
If correct:
    - Calculate score
    - Update streak
    - Track performance
    - Check for difficulty increase (Jev or fallback)
    - Generate next pattern
If incorrect:
    - Reset streak
    - Track failure
    - Provide feedback
    - Generate next pattern
```

### 4.3 AI Decision Flow (With Jev API)

```
Player completes pattern
    ↓
GameEngine sends performance data to JevAdapter
    ↓
JevAdapter calls Jev API
    ↓
Jev API returns:
    - Choice: Next pattern type
    - Score: Performance rating (0-100)
    - Noul: Should increase difficulty?
    ↓
GameEngine uses AI decisions for next pattern
```

### 4.4 AI Decision Flow (Without Jev API - Fallback)

```
Player completes pattern
    ↓
GameEngine uses local fallback logic
    ↓
Fallback logic:
    - Choice: Random from player's weak areas
    - Score: Simple accuracy percentage
    - Noul: Rule-based (3+ streak = increase)
    ↓
GameEngine uses fallback decisions for next pattern
```

### 4.5 Data Persistence Flow

```
Game session ends
    ↓
GameEngine saves player data to LocalDatabase
    ↓
LocalDatabase stores in IndexedDB
    ↓
Data persists across sessions
    ↓
User can manage data via DataManagement panel
```

## 5. Data Model

### 5.1 Player State
```typescript
interface PlayerState {
  id: string;
  name: string;
  score: number;
  level: number;
  streak: number;
  patternsSolved: number;
  patternsFailed: number;
  weaknesses: Record<string, number>;
  lastPlayed: Date;
}
```

### 5.2 Pattern
```typescript
interface Pattern {
  id: string;
  type: PatternType;
  difficulty: number;
  sequence: any[];
  solution: any;
  timeLimit: number;
}
```

### 5.3 Game Session
```typescript
interface GameSession {
  id: string;
  playerId: string;
  startTime: Date;
  endTime: Date;
  patterns: Pattern[];
  answers: any[];
  finalScore: number;
  finalLevel: number;
}
```

### 5.4 Analytics Event
```typescript
interface AnalyticsEvent {
  id: string;
  playerId: string;
  timestamp: Date;
  eventType: string;
  data: any;
}
```

## 6. Non-Functional Requirements

### 6.1 Performance
- Pattern generation: < 100ms
- Game response time: < 50ms
- Database operations: < 200ms
- Initial load: < 3 seconds

### 6.2 Scalability
- Single-user focus (local-only)
- No server-side scaling needed
- IndexedDB handles ~50MB per domain

### 6.3 Security
- No external data transmission
- API keys stored locally (localStorage)
- No authentication needed
- Privacy-first design

### 6.4 Reliability
- Works offline (PWA)
- Graceful degradation without Jev API
- Automatic data cleanup
- Backup/restore functionality

### 6.5 Usability
- Intuitive UI
- Clear instructions
- Responsive design (mobile/desktop)
- Accessible patterns

## 7. Deployment Architecture

### 7.1 Build Process
```
Source Code (TypeScript/React)
    ↓
Create React App Build
    ↓
Optimized JavaScript/CSS
    ↓
Static Assets (HTML, CSS, JS, Icons)
    ↓
GitHub Pages Deployment
```

### 7.2 PWA Architecture
```
Service Worker Registration
    ↓
Cache Static Assets
    ↓
Offline Capability
    ↓
Installable as App
```

### 7.3 CI/CD Pipeline
```
Git Push to Master
    ↓
GitHub Actions Triggered
    ↓
Build Project
    ↓
Copy PWA Files
    ↓
Upload Artifact
    ↓
Deploy to GitHub Pages
```

## 8. External Dependencies

### 8.1 Jev API (Optional)
- **Purpose**: Adaptive difficulty
- **Usage**: Pattern selection, performance evaluation
- **Fallback**: Local logic if unavailable
- **Cost**: Depends on TypeSafe pricing

### 8.2 GitHub Pages
- **Purpose**: Static hosting
- **Cost**: Free
- **Limitations**: Static files only

### 8.3 Browser APIs
- **IndexedDB**: Local data storage
- **localStorage**: API key persistence
- **Service Worker**: PWA functionality
- **Web Audio**: (Future) Sound effects

## 9. Future Enhancements

### 9.1 Planned Features
- Sound effects and music
- More pattern types
- Achievement system
- Daily challenges
- Pattern difficulty presets

### 9.2 Potential Features
- Export/import across devices
- Pattern editor (user-created patterns)
- Tutorial mode
- Performance graphs
- Custom themes

## 10. Constraints and Assumptions

### 10.1 Constraints
- Local-only architecture (no server)
- Browser storage limits (~50MB IndexedDB)
- No external dependencies for core functionality
- Must work offline

### 10.2 Assumptions
- Users have modern browsers (Chrome, Firefox, Safari, Edge)
- Users have JavaScript enabled
- Users have sufficient storage space
- Jev API is reliable (when used)

---

**Document Version:** 1.0  
**Last Updated:** 2024-09-24  
**Author:** Pattern Paradox Development Team