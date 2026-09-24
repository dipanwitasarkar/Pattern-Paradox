import { JevAdapter } from '../ai/jevAdapter';
import { PlayerState, PatternType } from '../types';

// Mock fetch
global.fetch = jest.fn();

describe('JevAdapter', () => {
  let adapter: JevAdapter;
  let mockPlayer: PlayerState;

  beforeEach(() => {
    adapter = new JevAdapter('test-api-key');
    mockPlayer = {
      id: 'test-player-1',
      name: 'Test Player',
      score: 100,
      level: 1,
      streak: 3,
      patternsSolved: 10,
      patternsFailed: 2,
      weaknesses: {
        numeric: 0.3,
        visual: 0.7,
        logical: 0.5,
        sequence: 0.4,
        geometric: 0.6
      },
      lastPlayed: new Date()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with API key', () => {
      expect(adapter).toBeDefined();
    });

    it('should set base URL correctly', () => {
      expect(adapter['baseUrl']).toBe('https://api.typesafe.ai/v1/systemone');
    });
  });

  describe('selectPatternType', () => {
    it('should call Jev API with correct parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          answers: {
            pattern_type: {
              choice: 'numeric'
            }
          }
        })
      });

      const result = await adapter.selectPatternType(mockPlayer);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.typesafe.ai/v1/systemone',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
      expect(result).toBe('numeric');
    });

    it('should use fallback logic on API failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await adapter.selectPatternType(mockPlayer);
      
      expect(result).toBeDefined();
      expect(['numeric', 'visual', 'logical', 'sequence', 'geometric']).toContain(result);
    });

    it('should use fallback logic on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));

      const result = await adapter.selectPatternType(mockPlayer);
      
      expect(result).toBeDefined();
    });
  });

  describe('evaluatePerformance', () => {
    it('should call Jev API with performance data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          answers: {
            performance: {
              score: 2
            }
          }
        })
      });

      const result = await adapter.evaluatePerformance(mockPlayer, 5);
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(50); // 2/4 * 100
    });

    it('should use fallback logic on API failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await adapter.evaluatePerformance(mockPlayer, 5);
      
      expect(result).toBe(83); // 10/12 * 100 ≈ 83
    });

    it('should convert score to percentage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          answers: {
            performance: {
              score: 3
            }
          }
        })
      });

      const result = await adapter.evaluatePerformance(mockPlayer, 5);
      
      expect(result).toBe(75); // 3/4 * 100
    });
  });

  describe('shouldIncreaseDifficulty', () => {
    it('should call Jev API with player state', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          answers: {
            should_increase: {
              noul: 0.8
            }
          }
        })
      });

      const result = await adapter.shouldIncreaseDifficulty(mockPlayer);
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should use fallback logic on API failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await adapter.shouldIncreaseDifficulty(mockPlayer);
      
      expect(result).toBe(true); // streak >= 3
    });

    it('should return false if noul < 0.7', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          answers: {
            should_increase: {
              noul: 0.5
            }
          }
        })
      });

      const result = await adapter.shouldIncreaseDifficulty(mockPlayer);
      
      expect(result).toBe(false);
    });
  });

  describe('generateHint', () => {
    it('should call Jev API with pattern data', async () => {
      const pattern = {
        id: 'test-1',
        type: 'numeric' as PatternType,
        difficulty: 1,
        sequence: [2, 4, 6, 8],
        solution: 10,
        timeLimit: 10
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          answers: {
            hint: {
              choice: 'arithmetic'
            }
          }
        })
      });

      const result = await adapter.generateHint(pattern, mockPlayer);
      
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toBe('arithmetic');
    });

    it('should use fallback logic on API failure', async () => {
      const pattern = {
        id: 'test-1',
        type: 'numeric' as PatternType,
        difficulty: 1,
        sequence: [2, 4, 6, 8],
        solution: 10,
        timeLimit: 10
      };

      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await adapter.generateHint(pattern, mockPlayer);
      
      expect(result).toBe('Look for arithmetic progressions');
    });
  });

  describe('fallback logic', () => {
    it('fallbackPatternType should select from weaknesses', () => {
      const result = adapter['fallbackPatternType'](mockPlayer);
      
      // Should select from weaknesses > 0.5
      const validTypes = ['visual', 'logical', 'geometric'];
      expect(validTypes).toContain(result);
    });

    it('fallbackPatternType should select random if no weaknesses', () => {
      const playerNoWeakness = { ...mockPlayer, weaknesses: {} };
      const result = adapter['fallbackPatternType'](playerNoWeakness);
      
      expect(['numeric', 'visual', 'logical', 'sequence', 'geometric']).toContain(result);
    });

    it('fallbackPerformance should calculate accuracy', () => {
      const result = adapter['fallbackPerformance'](mockPlayer);
      
      expect(result).toBe(83); // 10/12 * 100 ≈ 83
    });

    it('fallbackDifficultyIncrease should check streak', () => {
      const result = adapter['fallbackDifficultyIncrease'](mockPlayer);
      
      expect(result).toBe(true); // streak = 3
    });

    it('fallbackDifficultyIncrease should return false for low streak', () => {
      const lowStreakPlayer = { ...mockPlayer, streak: 1 };
      const result = adapter['fallbackDifficultyIncrease'](lowStreakPlayer);
      
      expect(result).toBe(false);
    });

    it('fallbackHint should return pre-defined hint', () => {
      const pattern = {
        id: 'test-1',
        type: 'numeric' as PatternType,
        difficulty: 1,
        sequence: [2, 4, 6, 8],
        solution: 10,
        timeLimit: 10
      };

      const result = adapter['fallbackHint'](pattern);
      
      expect(result).toBe('Look for arithmetic progressions');
    });
  });

  describe('error handling', () => {
    it('should handle 401 unauthorized error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = await adapter.selectPatternType(mockPlayer);
      
      expect(result).toBeDefined(); // Should use fallback
    });

    it('should handle 429 rate limit error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      const result = await adapter.selectPatternType(mockPlayer);
      
      expect(result).toBeDefined(); // Should use fallback
    });

    it('should handle 500 server error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await adapter.selectPatternType(mockPlayer);
      
      expect(result).toBeDefined(); // Should use fallback
    });
  });
});