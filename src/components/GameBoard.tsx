import { useEffect, useState } from 'react';
import { GameEngine } from '../game/gameEngine';
import { PatternDisplay } from './PatternDisplay';
import { GameSession, PlayerState } from '../types';

interface GameBoardProps {
  jevApiKey?: string;
  mode: 'single' | 'local-multiplayer';
  playerName?: string;
  multiplayerPlayerIds?: string[];
  multiplayerPlayerNames?: string[];
  onGameOver: (score: number, player: PlayerState) => void;
  onBack: () => void;
}

export const GameBoard = ({ jevApiKey, mode, playerName, multiplayerPlayerIds, multiplayerPlayerNames, onGameOver, onBack }: GameBoardProps) => {
  const [gameEngine] = useState(() => new GameEngine(jevApiKey));
  const [session, setSession] = useState<GameSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    startGame();
  }, [mode, playerName, multiplayerPlayerIds, multiplayerPlayerNames]);

  useEffect(() => {
    if (session?.currentPattern && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session?.currentPattern, timeRemaining]);

  const startGame = async () => {
    setLoading(true);
    try {
      let newSession: GameSession;
      
      if (mode === 'single') {
        newSession = await gameEngine.startSinglePlayerGame('player-1', playerName || 'Player');
        setTimeRemaining(newSession.currentPattern?.timeLimit || 10);
        setMessage('Game started! Solve the pattern:');
      } else if (mode === 'local-multiplayer' && multiplayerPlayerIds && multiplayerPlayerNames) {
        newSession = await gameEngine.startLocalMultiplayerGame(multiplayerPlayerIds, multiplayerPlayerNames);
        setTimeRemaining(newSession.currentPattern?.timeLimit || 10);
        setMessage(`Multiplayer game started! ${multiplayerPlayerNames[0]}'s turn:`);
      } else {
        throw new Error('Invalid game mode or missing multiplayer data');
      }
      
      setSession(newSession);
      setLoading(false);
    } catch (error) {
      setMessage('Failed to start game. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: any) => {
    if (!session) return;

    const timeTaken = 1.0; // Simplified timing for MVP
    const currentPlayer = session.players[currentPlayerIndex];

    try {
      const result = await gameEngine.submitAnswer(currentPlayer.id, answer, timeTaken);
      
      if (result.isMultiplayerTurn && result.nextPlayerIndex !== undefined) {
        setCurrentPlayerIndex(result.nextPlayerIndex);
        const nextPlayer = session.players[result.nextPlayerIndex];
        setMessage(`${nextPlayer.name}'s turn: ${result.message}`);
      } else {
        setMessage(result.message);
      }
      
      if (result.nextPattern) {
        setTimeRemaining(result.nextPattern.timeLimit);
      } else {
        // Game over
        await gameEngine.endGame();
        onGameOver(currentPlayer.score, currentPlayer);
      }
    } catch (error) {
      setMessage('Error submitting answer. Please try again.');
    }
  };

  const handleHint = async () => {
    if (!session) return;
    const hint = await gameEngine.getHint();
    if (session.currentPattern) {
      setSession({
        ...session,
        currentPattern: { ...session.currentPattern, hint }
      });
    }
  };

  const handleTimeOut = () => {
    if (!session) return;
    handleAnswer(null); // Submit null answer on timeout
  };

  if (loading) {
    return (
      <div className="game-board loading">
        <div className="spinner">Loading game...</div>
      </div>
    );
  }

  if (!session || !session.currentPattern) {
    return (
      <div className="game-board error">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="error-message">{message}</div>
        <button onClick={startGame} className="retry-btn">Try Again</button>
      </div>
    );
  }

  const currentPlayer = session.players[currentPlayerIndex];

  return (
    <div className="game-board">
      <div className="game-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="player-info">
          <span className="player-name">{currentPlayer.name || 'Player'}</span>
          <span className="score">Score: {currentPlayer.score}</span>
          <span className="level">Level: {currentPlayer.level}</span>
          <span className="streak">Streak: {currentPlayer.streak}🔥</span>
        </div>
        <div className="game-mode">{mode === 'single' ? 'SINGLE PLAYER' : 'LOCAL MULTIPLAYER'}</div>
      </div>

      {mode === 'local-multiplayer' && (
        <div className="multiplayer-status">
          <span className="current-player">Current: {currentPlayer.name}</span>
          <span className="player-count">{session.players.length} players</span>
        </div>
      )}

      <div className="message-bar">{message}</div>

      {session.currentPattern && (
        <PatternDisplay
          pattern={session.currentPattern}
          onAnswer={handleAnswer}
          onHint={handleHint}
          timeRemaining={timeRemaining}
        />
      )}

      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">Solved:</span>
          <span className="stat-value">{currentPlayer.patternsSolved}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Failed:</span>
          <span className="stat-value">{currentPlayer.patternsFailed}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Avg Time:</span>
          <span className="stat-value">{currentPlayer.averageTime.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};