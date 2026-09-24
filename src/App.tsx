import { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { LocalMultiplayerSetup } from './components/LocalMultiplayerSetup';
import { PlayerState } from './types';
import LocalDatabase from './utils/localDatabase';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState<'single' | 'local-multiplayer' | null>(null);
  const [jevApiKey, setJevApiKey] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [multiplayerPlayerIds, setMultiplayerPlayerIds] = useState<string[]>([]);
  const [multiplayerPlayerNames, setMultiplayerPlayerNames] = useState<string[]>([]);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showPlayerNameInput, setShowPlayerNameInput] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalPlayer, setFinalPlayer] = useState<PlayerState | null>(null);
  const [showMultiplayerSetup, setShowMultiplayerSetup] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [databaseStats, setDatabaseStats] = useState<any>(null);
  const [dataMessage, setDataMessage] = useState('');

  const db = LocalDatabase.getInstance();

  // Load Jev API key from localStorage on app start
  useEffect(() => {
    const savedKey = localStorage.getItem('jevApiKey');
    if (savedKey) {
      setJevApiKey(savedKey);
    }
  }, []);

  // Save Jev API key to localStorage when user enters it
  useEffect(() => {
    if (jevApiKey) {
      localStorage.setItem('jevApiKey', jevApiKey);
    }
  }, [jevApiKey]);

  const handleGameOver = (score: number, player: PlayerState) => {
    setFinalScore(score);
    setFinalPlayer(player);
    setGameMode(null);
  };

  const handleStartSinglePlayer = () => {
    if (!playerName.trim()) {
      setShowPlayerNameInput(true);
      return;
    }
    setGameMode('single');
    setFinalScore(null);
    setFinalPlayer(null);
  };

  const handleStartLocalMultiplayer = () => {
    setShowMultiplayerSetup(true);
  };

  const handleMultiplayerStart = (playerIds: string[], playerNames: string[]) => {
    setMultiplayerPlayerIds(playerIds);
    setMultiplayerPlayerNames(playerNames);
    setGameMode('local-multiplayer');
    setShowMultiplayerSetup(false);
    setFinalScore(null);
    setFinalPlayer(null);
  };

  const handleBackToMenu = () => {
    setGameMode(null);
    setFinalScore(null);
    setFinalPlayer(null);
    setShowMultiplayerSetup(false);
    setShowDataManagement(false);
  };

  const handleShowDataManagement = async () => {
    setShowDataManagement(true);
    try {
      const stats = await db.getDatabaseStats();
      setDatabaseStats(stats);
      setDataMessage('');
    } catch (error) {
      setDataMessage('Failed to load database stats');
    }
  };

  const handleClearOldData = async () => {
    try {
      const deleted = await db.cleanupOldData(30);
      setDataMessage(`Cleared ${deleted} old records`);
      const stats = await db.getDatabaseStats();
      setDatabaseStats(stats);
    } catch (error) {
      setDataMessage('Failed to clear old data');
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      try {
        await db.clearAllData();
        setDataMessage('All data cleared successfully');
        const stats = await db.getDatabaseStats();
        setDatabaseStats(stats);
      } catch (error) {
        setDataMessage('Failed to clear all data');
      }
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await db.exportData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pattern-paradox-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDataMessage('Data exported successfully');
    } catch (error) {
      setDataMessage('Failed to export data');
    }
  };

  const handleClearApiKey = () => {
    if (window.confirm('Are you sure you want to remove your Jev API key? The game will use fallback logic instead.')) {
      setJevApiKey('');
      localStorage.removeItem('jevApiKey');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          await db.importData(text);
          setDataMessage('Data imported successfully');
          const stats = await db.getDatabaseStats();
          setDatabaseStats(stats);
        } catch (error) {
          setDataMessage('Failed to import data');
        }
      }
    };
    input.click();
  };

  if (showDataManagement) {
    return (
      <div className="app">
        <DataManagement 
          onBack={handleBackToMenu}
          onClearOldData={handleClearOldData}
          onClearAllData={handleClearAllData}
          onExportData={handleExportData}
          onImportData={handleImportData}
          stats={databaseStats}
          message={dataMessage}
        />
      </div>
    );
  }

  if (showMultiplayerSetup) {
    return (
      <div className="app">
        <LocalMultiplayerSetup 
          onStartMultiplayer={handleMultiplayerStart}
          onBack={handleBackToMenu}
        />
      </div>
    );
  }

  if (gameMode) {
    return (
      <div className="app">
        <GameBoard 
          jevApiKey={jevApiKey || undefined}
          mode={gameMode}
          playerName={playerName || undefined}
          multiplayerPlayerIds={multiplayerPlayerIds}
          multiplayerPlayerNames={multiplayerPlayerNames}
          onGameOver={handleGameOver}
          onBack={handleBackToMenu}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="main-menu">
        <h1 className="game-title">Pattern Paradox</h1>
        <p className="game-subtitle">Adaptive Pattern Recognition with AI</p>

        {finalScore !== null && finalPlayer && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <div className="final-stats">
              <div className="stat-item">
                <span className="stat-label">Final Score:</span>
                <span className="stat-value">{finalScore}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Level Reached:</span>
                <span className="stat-value">{finalPlayer.level}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Patterns Solved:</span>
                <span className="stat-value">{finalPlayer.patternsSolved}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Streak:</span>
                <span className="stat-value">{finalPlayer.streak}</span>
              </div>
            </div>
          </div>
        )}

        <div className="menu-options">
          <button 
            onClick={handleStartSinglePlayer}
            className="menu-btn primary"
          >
            🎮 Single Player
          </button>
          <button 
            onClick={handleStartLocalMultiplayer}
            className="menu-btn secondary"
          >
            👥 Local Multiplayer
          </button>
        </div>

        {showPlayerNameInput && (
          <div className="player-name-input">
            <label htmlFor="player-name">Enter your name:</label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your display name"
              maxLength={20}
            />
            <div className="name-input-actions">
              <button 
                onClick={() => {
                  if (playerName.trim()) {
                    handleStartSinglePlayer();
                  }
                }}
                disabled={!playerName.trim()}
                className="start-online-btn"
              >
                Start Game
              </button>
              <button 
                onClick={() => setShowPlayerNameInput(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="settings-section">
          <button 
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="settings-btn"
          >
            ⚙️ Settings
          </button>
          
          {showApiKeyInput && (
            <div className="api-key-input">
              <label htmlFor="jev-api-key">Jev API Key (optional):</label>
              <input
                id="jev-api-key"
                type="password"
                value={jevApiKey}
                onChange={(e) => setJevApiKey(e.target.value)}
                placeholder="Enter your TypeSafe Jev API key"
              />
              {jevApiKey && (
                <div className="api-key-status">
                  <span className="api-key-saved">✓ API key saved</span>
                  <button 
                    onClick={handleClearApiKey}
                    className="clear-api-key-btn"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="api-note">
                Without API key, the game uses local fallback logic. 
                Get your key at <a href="https://typesafe.ai" target="_blank" rel="noopener noreferrer">typesafe.ai</a>
              </p>
            </div>
          )}
        </div>

        <div className="game-info">
          <h3>How to Play</h3>
          <div className="how-to-play-content">
            <p><strong>🎯 Objective:</strong> Solve patterns as fast as possible before time runs out!</p>
            
            <p><strong>🧩 Pattern Types:</strong></p>
            <ul>
              <li><strong>Numeric:</strong> 2, 4, 6, 8, ? → Answer: 10</li>
              <li><strong>Visual:</strong> 🔴 🔵 🔴 🔵 ? → Answer: 🔴</li>
              <li><strong>Logical:</strong> 5+3=8, 6+4=10, 7+5=? → Answer: 12</li>
            </ul>
            
            <p><strong>⏱️ Time Limit:</strong> Each pattern has a time limit (10-30 seconds)</p>
            
            <p><strong>🎯 Scoring:</strong></p>
            <ul>
              <li>Base points for difficulty</li>
              <li>Time bonus for fast answers</li>
              <li>Streak multiplier for consecutive correct answers</li>
            </ul>
            
            <p><strong>🤖 AI Adaptation:</strong> The game learns your strengths and weaknesses, creating personalized challenges that target your weak spots.</p>
            
            <p><strong>🎮 Game Modes:</strong></p>
            <ul>
              <li>Single Player: Play solo at your own pace</li>
              <li>Local Multiplayer: 2-4 players on same device</li>
            </ul>
          </div>
        </div>

        <div className="data-management">
          <h3>Data Management</h3>
          <button onClick={handleShowDataManagement} className="data-btn">
            📊 Manage Data
          </button>
        </div>
      </div>
    </div>
  );
}

function DataManagement({ 
  onBack, 
  onClearOldData, 
  onClearAllData, 
  onExportData, 
  onImportData, 
  stats, 
  message 
}: { 
  onBack: () => void;
  onClearOldData: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: () => void;
  stats: any;
  message: string;
}) {
  return (
    <div className="app">
      <div className="data-management-panel">
        <div className="panel-header">
          <button onClick={onBack} className="back-btn">← Back</button>
          <h2>Data Management</h2>
        </div>

        {message && (
          <div className="data-message">{message}</div>
        )}

        {stats && (
          <div className="database-stats">
            <h3>Database Statistics</h3>
            <div className="stat-row">
              <span className="stat-label">Total Players:</span>
              <span className="stat-value">{stats.totalPlayers}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total Games:</span>
              <span className="stat-value">{stats.totalGames}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Analytics Events:</span>
              <span className="stat-value">{stats.totalEvents}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Database Size:</span>
              <span className="stat-value">{stats.estimatedSize}</span>
            </div>
          </div>
        )}

        <div className="data-actions">
          <h3>Data Actions</h3>
          <button onClick={onClearOldData} className="data-action-btn">
            🧹 Clear Old Data (30+ days)
          </button>
          <button onClick={onClearAllData} className="data-action-btn danger">
            🗑️ Clear All Data
          </button>
          <button onClick={onExportData} className="data-action-btn">
            📤 Export Data (Backup)
          </button>
          <button onClick={onImportData} className="data-action-btn">
            📥 Import Data (Restore)
          </button>
        </div>

        <div className="data-info">
          <h3>Information</h3>
          <p>• Old data is automatically cleaned up every 30 days</p>
          <p>• Export data to backup your progress</p>
          <p>• Import data to restore from backup</p>
          <p>• Clear all data to reset the game completely</p>
        </div>
      </div>
    </div>
  );
}

export default App;