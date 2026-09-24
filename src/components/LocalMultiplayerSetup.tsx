import { useState } from 'react';

interface LocalMultiplayerSetupProps {
  onStartMultiplayer: (playerIds: string[], playerNames: string[]) => void;
  onBack: () => void;
}

export const LocalMultiplayerSetup = ({ onStartMultiplayer, onBack }: LocalMultiplayerSetupProps) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const newNames = [...playerNames];
    while (newNames.length < count) {
      newNames.push(`Player ${newNames.length + 1}`);
    }
    while (newNames.length > count) {
      newNames.pop();
    }
    setPlayerNames(newNames);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    const playerIds = playerNames.map((_, i) => `local-player-${Date.now()}-${i}`);
    onStartMultiplayer(playerIds, playerNames);
  };

  return (
    <div className="local-multiplayer-setup">
      <div className="setup-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h2>Local Multiplayer</h2>
      </div>

      <div className="player-count-selector">
        <label>Number of Players:</label>
        <div className="player-count-buttons">
          {[2, 3, 4].map(count => (
            <button
              key={count}
              onClick={() => handlePlayerCountChange(count)}
              className={playerCount === count ? 'active' : ''}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="player-names">
        <h3>Enter Player Names:</h3>
        {playerNames.map((name, index) => (
          <div key={index} className="player-name-input">
            <label>Player {index + 1}:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`Player ${index + 1}`}
              maxLength={15}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={handleStart}
        className="start-multiplayer-btn"
        disabled={playerNames.some(name => !name.trim())}
      >
        🎮 Start Local Multiplayer
      </button>

      <div className="setup-info">
        <p>📱 Players will take turns on the same device</p>
        <p>⏱️ Each player gets the same time limit per pattern</p>
        <p>🏆 Scores are tracked individually</p>
      </div>
    </div>
  );
};