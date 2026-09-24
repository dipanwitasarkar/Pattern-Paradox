import localforage from 'localforage';

export interface PlayerData {
  id: string;
  name: string;
  score: number;
  level: number;
  patternsSolved: number;
  patternsFailed: number;
  strengths: Record<string, number>;
  weaknesses: Record<string, number>;
  averageTime: number;
  streak: number;
  createdAt: number;
  lastPlayed: number;
}

export interface GameData {
  id: string;
  playerId: string;
  score: number;
  level: number;
  patternsSolved: number;
  patternsFailed: number;
  duration: number;
  completedAt: number;
}

export interface AnalyticsEvent {
  id: string;
  playerId: string;
  eventType: string;
  properties: Record<string, any>;
  timestamp: number;
}

class LocalDatabase {
  private static instance: LocalDatabase;
  private db: LocalForage;

  private constructor() {
    this.db = localforage.createInstance({
      name: 'pattern-paradox',
      storeName: 'game-data'
    });
  }

  static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase();
    }
    return LocalDatabase.instance;
  }

  // Player data management
  async savePlayerData(playerData: PlayerData): Promise<void> {
    await this.db.setItem(`player-${playerData.id}`, playerData);
  }

  async getPlayerData(playerId: string): Promise<PlayerData | null> {
    return await this.db.getItem<PlayerData>(`player-${playerId}`);
  }

  async getAllPlayers(): Promise<PlayerData[]> {
    const players: PlayerData[] = [];
    await this.db.iterate<PlayerData, void>((value, _key) => {
      if (_key && _key.toString().startsWith('player-')) {
        players.push(value);
      }
    });
    return players.sort((a, b) => b.score - a.score);
  }

  // Game history management
  async saveGameResult(gameData: GameData): Promise<void> {
    const history = await this.getGameHistory(gameData.playerId);
    history.push(gameData);
    // Keep only last 100 games
    if (history.length > 100) {
      history.shift();
    }
    await this.db.setItem(`history-${gameData.playerId}`, history);
  }

  async getGameHistory(playerId: string): Promise<GameData[]> {
    return await this.db.getItem<GameData[]>(`history-${playerId}`) || [];
  }

  // Analytics management
  async trackAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    const events = await this.getAnalyticsEvents(event.playerId);
    events.push(event);
    
    // Keep only last 1000 events per player
    if (events.length > 1000) {
      events.shift();
    }
    
    await this.db.setItem(`analytics-${event.playerId}`, events);
  }

  async getAnalyticsEvents(playerId: string): Promise<AnalyticsEvent[]> {
    return await this.db.getItem<AnalyticsEvent[]>(`analytics-${playerId}`) || [];
  }

  // Settings management
  async saveSetting(key: string, value: any): Promise<void> {
    await this.db.setItem(`setting-${key}`, value);
  }

  async getSetting(key: string, defaultValue: any = null): Promise<any> {
    return await this.db.getItem(`setting-${key}`) || defaultValue;
  }

  // Database cleanup and maintenance
  async getDatabaseSize(): Promise<number> {
    let totalSize = 0;
    await this.db.iterate((value) => {
      if (value) {
        const size = JSON.stringify(value).length;
        totalSize += size;
      }
    });
    return totalSize; // Size in bytes
  }

  async getDatabaseStats(): Promise<{
    totalPlayers: number;
    totalGames: number;
    totalEvents: number;
    estimatedSize: string;
  }> {
    let totalPlayers = 0;
    let totalGames = 0;
    let totalEvents = 0;

    await this.db.iterate((value, _key) => {
      if (_key) {
        const keyStr = _key.toString();
        if (keyStr.startsWith('player-')) totalPlayers++;
        if (keyStr.startsWith('history-')) {
          const games = value as GameData[];
          totalGames += games.length;
        }
        if (keyStr.startsWith('analytics-')) {
          const events = value as AnalyticsEvent[];
          totalEvents += events.length;
        }
      }
    });

    const sizeBytes = await this.getDatabaseSize();
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    return {
      totalPlayers,
      totalGames,
      totalEvents,
      estimatedSize: `${sizeMB} MB`
    };
  }

  async cleanupOldData(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    await this.db.iterate(async (value, key) => {
      if (key) {
        const keyStr = key.toString();
        
        // Clean old game history
        if (keyStr.startsWith('history-')) {
          const games = value as GameData[];
          const filteredGames = games.filter(game => game.completedAt > cutoffDate);
          if (filteredGames.length !== games.length) {
            await this.db.setItem(key, filteredGames);
            deletedCount += (games.length - filteredGames.length);
          }
        }

        // Clean old analytics events
        if (keyStr.startsWith('analytics-')) {
          const events = value as AnalyticsEvent[];
          const filteredEvents = events.filter(event => event.timestamp > cutoffDate);
          if (filteredEvents.length !== events.length) {
            await this.db.setItem(key, filteredEvents);
            deletedCount += (events.length - filteredEvents.length);
          }
        }

        // Remove inactive players (no activity for 90 days)
        if (keyStr.startsWith('player-')) {
          const player = value as PlayerData;
          if (player.lastPlayed < Date.now() - (90 * 24 * 60 * 60 * 1000) && player.patternsSolved === 0) {
            await this.db.removeItem(key);
            deletedCount++;
          }
        }
      }
    });

    return deletedCount;
  }

  async clearAllData(): Promise<void> {
    await this.db.clear();
  }

  async exportData(): Promise<string> {
    const data: Record<string, any> = {};
    await this.db.iterate((value, _key) => {
      if (_key) {
        data[_key.toString()] = value;
      }
    });
    return JSON.stringify(data);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    for (const [_key, value] of Object.entries(data)) {
      await this.db.setItem(_key, value);
    }
  }

  // Viral metrics (local tracking)
  async trackViralMetric(metricName: string, value: number): Promise<void> {
    const metrics = await this.getViralMetrics();
    const today = new Date().toISOString().split('T')[0];
    
    if (!metrics[today]) {
      metrics[today] = {};
    }
    
    metrics[today][metricName] = (metrics[today][metricName] || 0) + value;
    await this.db.setItem('viral-metrics', metrics);
  }

  async getViralMetrics(): Promise<Record<string, Record<string, number>>> {
    return await this.db.getItem<Record<string, Record<string, number>>>('viral-metrics') || {};
  }

  async getViralSummary(days: number = 7): Promise<{
    totalGames: number;
    totalShares: number;
    viralCoefficient: number;
    retentionRate: number;
  }> {
    const metrics = await this.getViralMetrics();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let totalGames = 0;
    let totalShares = 0;
    let returningPlayers = 0;
    let totalPlayers = 0;

    for (const [date, dayMetrics] of Object.entries(metrics)) {
      const metricDate = new Date(date);
      if (metricDate >= cutoffDate) {
        totalGames += dayMetrics['games_completed'] || 0;
        totalShares += dayMetrics['share_attempts'] || 0;
        returningPlayers += dayMetrics['returning_players'] || 0;
        totalPlayers += dayMetrics['unique_players'] || 0;
      }
    }

    const viralCoefficient = totalShares > 0 ? totalPlayers / totalShares : 0;
    const retentionRate = totalPlayers > 0 ? returningPlayers / totalPlayers : 0;

    return {
      totalGames,
      totalShares,
      viralCoefficient,
      retentionRate
    };
  }
}

export default LocalDatabase;