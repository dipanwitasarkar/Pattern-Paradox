import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { LocalMultiplayerSetup } from './components/LocalMultiplayerSetup';
import { PlayerState } from './types';
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
  };

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
              <p className="api-note">
                Without API key, the game uses local fallback logic. 
                Get your key at <a href="https://typesafe.ai" target="_blank" rel="noopener noreferrer">typesafe.ai</a>
              </p>
            </div>
          )}
        </div>

        <div className="game-info">
          <h3>How to Play</h3>
          <ul>
            <li>Solve patterns as fast as possible</li>
            <li>AI adapts to your strengths and weaknesses</li>
            <li>Build streaks for bonus points</li>
            <li>Play solo or with friends locally</li>
          </ul>
        </div>

        <div className="data-management">
          <h3>Data Management</h3>
          <button onClick={() => window.location.reload()} className="data-btn">
            🔄 Refresh App
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;