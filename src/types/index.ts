export interface Pattern {
  id: string;
  type: PatternType;
  difficulty: number;
  sequence: any[];
  solution: any;
  timeLimit: number;
  hint?: string;
}

export type PatternType = 
  | 'numeric' 
  | 'visual' 
  | 'logical' 
  | 'sequence' 
  | 'geometric';

export interface PlayerState {
  id: string;
  name?: string;
  score: number;
  level: number;
  patternsSolved: number;
  patternsFailed: number;
  strengths: Record<PatternType, number>;
  weaknesses: Record<PatternType, number>;
  averageTime: number;
  streak: number;
}

export interface GameSession {
  id: string;
  mode: 'local' | 'online';
  players: PlayerState[];
  currentPattern: Pattern | null;
  status: 'waiting' | 'active' | 'completed';
  startTime: number;
}