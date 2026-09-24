import { PatternGenerator } from './patternGenerator';
import { JevAdapter } from '../ai/jevAdapter';
import { Pattern, PlayerState, GameSession, PatternType } from '../types';
import LocalDatabase from '../utils/localDatabase';

export class GameEngine {
  private patternGenerator: PatternGenerator;
  private jevAdapter: JevAdapter | null;
  private currentSession: GameSession | null = null;
  private localDatabase: LocalDatabase;
  private gameMode: 'single' | 'local-multiplayer' = 'single';
  private currentPlayerIndex: number = 0;

  constructor(jevApiKey?: string) {
    this.patternGenerator = new PatternGenerator();
    this.jevAdapter = jevApiKey ? new JevAdapter(jevApiKey) : null;
    this.localDatabase = LocalDatabase.getInstance();
  }

  async startSinglePlayerGame(playerId: string, playerName: string): Promise<GameSession> {
    // Load existing player data or create new
    let playerData = await this.localDatabase.getPlayerData(playerId);
    
    if (!playerData) {
      playerData = {
        id: playerId,
        name: playerName,
        score: 0,
        level: 1,
        patternsSolved: 0,
        patternsFailed: 0,
        strengths: {
          numeric: 0.5,
          visual: 0.5,
          logical: 0.5,
          sequence: 0.5,
          geometric: 0.5
        },
        weaknesses: {
          numeric: 0.5,
          visual: 0.5,
          logical: 0.5,
          sequence: 0.5,
          geometric: 0.5
        },
        averageTime: 0,
        streak: 0,
        createdAt: Date.now(),
        lastPlayed: Date.now()
      };
    } else {
      playerData.lastPlayed = Date.now();
    }

    const playerState: PlayerState = {
      id: playerData.id,
      name: playerData.name,
      score: playerData.score,
      level: playerData.level,
      patternsSolved: playerData.patternsSolved,
      patternsFailed: playerData.patternsFailed,
      strengths: playerData.strengths,
      weaknesses: playerData.weaknesses,
      averageTime: playerData.averageTime,
      streak: playerData.streak
    };

    this.currentSession = {
      id: `session-${Date.now()}`,
      mode: 'local',
      players: [playerState],
      currentPattern: null,
      status: 'active',
      startTime: Date.now()
    };

    this.gameMode = 'single';
    this.currentPlayerIndex = 0;
    await this.generateNextPattern();
    
    // Track analytics
    await this.localDatabase.trackAnalyticsEvent({
      id: `event-${Date.now()}`,
      playerId,
      eventType: 'game_started',
      properties: { mode: 'single-player', timestamp: Date.now() },
      timestamp: Date.now()
    });

    return this.currentSession;
  }

  async startLocalMultiplayerGame(playerIds: string[], playerNames: string[]): Promise<GameSession> {
    const players: PlayerState[] = [];
    
    for (let i = 0; i < playerIds.length; i++) {
      let playerData = await this.localDatabase.getPlayerData(playerIds[i]);
      
      if (!playerData) {
        playerData = {
          id: playerIds[i],
          name: playerNames[i],
          score: 0,
          level: 1,
          patternsSolved: 0,
          patternsFailed: 0,
          strengths: {
            numeric: 0.5,
            visual: 0.5,
            logical: 0.5,
            sequence: 0.5,
            geometric: 0.5
          },
          weaknesses: {
            numeric: 0.5,
            visual: 0.5,
            logical: 0.5,
            sequence: 0.5,
            geometric: 0.5
          },
          averageTime: 0,
          streak: 0,
          createdAt: Date.now(),
          lastPlayed: Date.now()
        };
      } else {
        playerData.lastPlayed = Date.now();
      }

      players.push({
        id: playerData.id,
        name: playerData.name,
        score: 0, // Reset score for multiplayer match
        level: playerData.level,
        patternsSolved: 0,
        patternsFailed: 0,
        strengths: playerData.strengths,
        weaknesses: playerData.weaknesses,
        averageTime: 0,
        streak: 0
      });
    }

    this.currentSession = {
      id: `multiplayer-${Date.now()}`,
      mode: 'local',
      players,
      currentPattern: null,
      status: 'active',
      startTime: Date.now()
    };

    this.gameMode = 'local-multiplayer';
    this.currentPlayerIndex = 0;
    await this.generateNextPattern();
    
    // Track analytics
    for (const playerId of playerIds) {
      await this.localDatabase.trackAnalyticsEvent({
        id: `event-${Date.now()}-${playerId}`,
        playerId,
        eventType: 'multiplayer_started',
        properties: { playerCount: playerIds.length, timestamp: Date.now() },
        timestamp: Date.now()
      });
    }

    return this.currentSession;
  }

  private async generateNextPattern(): Promise<void> {
    if (!this.currentSession) return;

    const currentPlayer = this.currentSession.players[this.currentPlayerIndex];
    let patternType: PatternType | undefined;

    if (this.jevAdapter) {
      // Use Jev to select pattern type based on player weaknesses
      patternType = await this.jevAdapter.selectPatternType(currentPlayer);
    }

    const difficulty = this.calculateDifficulty(currentPlayer);
    const pattern = this.patternGenerator.generatePattern(difficulty, patternType);
    this.currentSession.currentPattern = pattern;
  }

  private calculateDifficulty(player: PlayerState): number {
    // Base difficulty on player level and performance
    const baseDifficulty = player.level;
    const performanceFactor = player.patternsSolved / (player.patternsSolved + player.patternsFailed || 1);
    return Math.min(10, Math.max(1, Math.floor(baseDifficulty * performanceFactor)));
  }

  async submitAnswer(playerId: string, answer: any, timeTaken: number): Promise<{
    correct: boolean;
    score: number;
    nextPattern: Pattern | null;
    message: string;
    isMultiplayerTurn: boolean;
    nextPlayerIndex?: number;
  }> {
    if (!this.currentSession || !this.currentSession.currentPattern) {
      throw new Error('No active game session');
    }

    const pattern = this.currentSession.currentPattern;
    const playerIndex = this.currentSession.players.findIndex(p => p.id === playerId);
    const player = this.currentSession.players[playerIndex];
    
    if (!player) throw new Error('Player not found');

    const correct = this.patternGenerator.validateSolution(pattern, answer);
    let score = 0;

    if (correct) {
      // Calculate score based on difficulty and time
      const timeBonus = Math.max(0, (pattern.timeLimit - timeTaken) / pattern.timeLimit);
      score = Math.round(pattern.difficulty * 10 * (1 + timeBonus));
      
      player.score += score;
      player.patternsSolved++;
      player.streak++;
      
      // Update strengths
      player.strengths[pattern.type] = Math.min(1, player.strengths[pattern.type] + 0.1);
      player.weaknesses[pattern.type] = Math.max(0, player.weaknesses[pattern.type] - 0.1);
      
      // Check for level up
      if (player.patternsSolved % 5 === 0) {
        player.level = Math.min(10, player.level + 1);
      }
    } else {
      player.patternsFailed++;
      player.streak = 0;
      
      // Update weaknesses
      player.weaknesses[pattern.type] = Math.min(1, player.weaknesses[pattern.type] + 0.1);
      player.strengths[pattern.type] = Math.max(0, player.strengths[pattern.type] - 0.1);
    }

    // Update average time
    const totalTime = player.averageTime * (player.patternsSolved + player.patternsFailed - 1) + timeTaken;
    player.averageTime = totalTime / (player.patternsSolved + player.patternsFailed);

    // Use Jev to evaluate performance and adjust difficulty
    if (this.jevAdapter) {
      await this.jevAdapter.evaluatePerformance(player, timeTaken);
      const shouldIncrease = await this.jevAdapter.shouldIncreaseDifficulty(player);
      
      if (shouldIncrease && correct) {
        player.level = Math.min(10, player.level + 1);
      }
    }

    // Track analytics
    await this.localDatabase.trackAnalyticsEvent({
      id: `event-${Date.now()}-${playerId}`,
      playerId,
      eventType: 'answer_submitted',
      properties: {
        isCorrect: correct,
        timeTaken,
        patternType: pattern.type,
        difficulty: pattern.difficulty
      },
      timestamp: Date.now()
    });

    // Handle multiplayer turn logic
    let isMultiplayerTurn = false;
    let nextPlayerIndex = this.currentPlayerIndex;

    if (this.gameMode === 'local-multiplayer') {
      isMultiplayerTurn = true;
      nextPlayerIndex = (this.currentPlayerIndex + 1) % this.currentSession.players.length;
      this.currentPlayerIndex = nextPlayerIndex;
    }

    // Generate next pattern
    await this.generateNextPattern();

    return {
      correct,
      score,
      nextPattern: this.currentSession.currentPattern,
      message: correct 
        ? `Correct! +${score} points. Streak: ${player.streak}` 
        : `Wrong! The answer was ${pattern.solution}. Try again!`,
      isMultiplayerTurn,
      nextPlayerIndex
    };
  }

  async getHint(): Promise<string> {
    if (!this.currentSession || !this.currentSession.currentPattern) {
      return 'No active pattern';
    }

    if (this.jevAdapter) {
      const player = this.currentSession.players[this.currentPlayerIndex];
      return await this.jevAdapter.generateHint(this.currentSession.currentPattern, player);
    }

    // Fallback hints
    const pattern = this.currentSession.currentPattern;
    switch (pattern.type) {
      case 'numeric': return 'Look for arithmetic progressions';
      case 'visual': return 'Find the repeating color pattern';
      case 'logical': return 'Apply the mathematical operation';
      case 'sequence': return 'Each number is the sum of the previous two';
      case 'geometric': return 'Look for rotation patterns';
      default: return 'Think about the pattern carefully';
    }
  }

  async endGame(): Promise<void> {
    if (!this.currentSession) return;

    const duration = Date.now() - this.currentSession.startTime;

    // Save player data and game results
    for (const player of this.currentSession.players) {
      const playerData = {
        id: player.id,
        name: player.name || 'Player',
        score: player.score,
        level: player.level,
        patternsSolved: player.patternsSolved,
        patternsFailed: player.patternsFailed,
        strengths: player.strengths,
        weaknesses: player.weaknesses,
        averageTime: player.averageTime,
        streak: player.streak,
        createdAt: Date.now(),
        lastPlayed: Date.now()
      };

      await this.localDatabase.savePlayerData(playerData);
      
      await this.localDatabase.saveGameResult({
        id: `game-${Date.now()}-${player.id}`,
        playerId: player.id,
        score: player.score,
        level: player.level,
        patternsSolved: player.patternsSolved,
        patternsFailed: player.patternsFailed,
        duration,
        completedAt: Date.now()
      });

      // Track completion analytics
      await this.localDatabase.trackAnalyticsEvent({
        id: `event-${Date.now()}-${player.id}`,
        playerId: player.id,
        eventType: 'game_completed',
        properties: {
          finalScore: player.score,
          patternsSolved: player.patternsSolved,
          duration,
          gameMode: this.gameMode
        },
        timestamp: Date.now()
      });
    }

    this.currentSession = null;
  }

  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  getGameMode(): 'single' | 'local-multiplayer' {
    return this.gameMode;
  }

  // Local database management
  async getDatabaseStats() {
    return await this.localDatabase.getDatabaseStats();
  }

  async cleanupOldData(daysToKeep: number = 30) {
    return await this.localDatabase.cleanupOldData(daysToKeep);
  }

  async clearAllData() {
    return await this.localDatabase.clearAllData();
  }

  async exportData() {
    return await this.localDatabase.exportData();
  }

  async importData(jsonData: string) {
    return await this.localDatabase.importData(jsonData);
  }

  async getLeaderboard(limit: number = 10) {
    return await this.localDatabase.getAllPlayers().then(players => 
      players.slice(0, limit)
    );
  }

  async getViralMetrics(days: number = 7) {
    return await this.localDatabase.getViralSummary(days);
  }
}