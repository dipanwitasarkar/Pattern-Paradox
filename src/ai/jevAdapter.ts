import { PlayerState, PatternType } from '../types';

export class JevAdapter {
  private apiKey: string;
  private baseUrl: string = 'https://api.typesafe.ai/v1/systemone';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async selectPatternType(playerState: PlayerState): Promise<PatternType> {
    const request = {
      state: playerState,
      model: 'jev-latest',
      questions: {
        pattern_type: {
          type: 'choice',
          instructions: 'Which pattern type should be generated to challenge this player based on their weaknesses?',
          criteria: {
            numeric: 'Number sequences and arithmetic patterns',
            visual: 'Color and shape patterns in grids',
            logical: 'Mathematical expressions and operations',
            sequence: 'Fibonacci and mathematical sequences',
            geometric: 'Shape rotations and transformations'
          }
        }
      }
    };

    try {
      const response = await this.callJev(request);
      return response.answers.pattern_type.choice as PatternType;
    } catch (error) {
      console.error('Jev API call failed, using fallback logic:', error);
      return this.fallbackPatternType(playerState);
    }
  }

  async evaluatePerformance(playerState: PlayerState, timeTaken: number): Promise<number> {
    const request = {
      state: { ...playerState, lastTimeTaken: timeTaken },
      model: 'jev-latest',
      questions: {
        performance: {
          type: 'score',
          instructions: 'Rate the player\'s performance considering their accuracy, speed, and current skill level',
          criteria: ['Poor', 'Fair', 'Good', 'Excellent', 'Outstanding']
        }
      }
    };

    try {
      const response = await this.callJev(request);
      // Convert score (0-4) to percentage (0-100)
      return Math.round((response.answers.performance.score / 4) * 100);
    } catch (error) {
      console.error('Jev API call failed, using fallback logic:', error);
      return this.fallbackPerformance(playerState);
    }
  }

  async shouldIncreaseDifficulty(playerState: PlayerState): Promise<boolean> {
    const request = {
      state: playerState,
      model: 'jev-latest',
      questions: {
        should_increase: {
          type: 'noul',
          instructions: 'Has the player demonstrated consistent mastery at their current difficulty level?',
          criteria: {
            true: 'Player consistently solves patterns quickly and accurately',
            false: 'Player struggles with current difficulty level'
          }
        }
      }
    };

    try {
      const response = await this.callJev(request);
      return response.answers.should_increase.noul > 0.7;
    } catch (error) {
      console.error('Jev API call failed, using fallback logic:', error);
      return this.fallbackDifficultyIncrease(playerState);
    }
  }

  async generateHint(pattern: any, playerState: PlayerState): Promise<string> {
    const request = {
      state: { pattern, playerState },
      model: 'jev-latest',
      questions: {
        hint: {
          type: 'choice',
          instructions: 'Select the most helpful hint for this pattern based on the player\'s skill level',
          criteria: {
            arithmetic: 'Look for a simple arithmetic progression',
            relationship: 'Consider the relationship between adjacent elements',
            repeating: 'Try to find a repeating pattern',
            geometric: 'Think about geometric transformations',
            operations: 'Consider mathematical operations'
          }
        }
      }
    };

    try {
      const response = await this.callJev(request);
      return response.answers.hint.choice;
    } catch (error) {
      console.error('Jev API call failed, using fallback logic:', error);
      return this.fallbackHint(pattern);
    }
  }

  private async callJev(request: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Jev API error: ${response.statusText}`);
    }

    return await response.json();
  }

  // Fallback methods when Jev API is unavailable
  private fallbackPatternType(playerState: PlayerState): PatternType {
    const types: PatternType[] = ['numeric', 'visual', 'logical', 'sequence', 'geometric'];
    
    // Select from player's weaknesses
    const weaknesses = Object.entries(playerState.weaknesses)
      .filter(([_, score]) => score > 0.5)
      .map(([type]) => type as PatternType);
    
    if (weaknesses.length > 0) {
      return weaknesses[Math.floor(Math.random() * weaknesses.length)];
    }
    
    return types[Math.floor(Math.random() * types.length)];
  }

  private fallbackPerformance(playerState: PlayerState): number {
    const accuracy = playerState.patternsSolved / (playerState.patternsSolved + playerState.patternsFailed || 1);
    return Math.round(accuracy * 100);
  }

  private fallbackDifficultyIncrease(playerState: PlayerState): boolean {
    return playerState.streak >= 3 && playerState.patternsSolved > 0;
  }

  private fallbackHint(pattern: any): string {
    const hints: Record<string, string> = {
      numeric: 'Look for arithmetic progressions',
      visual: 'Find the repeating color pattern',
      logical: 'Apply the mathematical operation',
      sequence: 'Each number is the sum of the previous two',
      geometric: 'Look for rotation patterns'
    };
    
    return hints[pattern.type] || 'Think about the pattern carefully';
  }
}