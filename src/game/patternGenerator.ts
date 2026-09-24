import { Pattern, PatternType } from '../types';

export class PatternGenerator {
  private patternTypes: PatternType[] = ['numeric', 'visual', 'logical', 'sequence', 'geometric'];

  generatePattern(difficulty: number, type?: PatternType): Pattern {
    const selectedType = type || this.selectRandomType();
    const patternId = `${selectedType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    switch (selectedType) {
      case 'numeric':
        return this.generateNumericPattern(patternId, difficulty);
      case 'visual':
        return this.generateVisualPattern(patternId, difficulty);
      case 'logical':
        return this.generateLogicalPattern(patternId, difficulty);
      case 'sequence':
        return this.generateSequencePattern(patternId, difficulty);
      case 'geometric':
        return this.generateGeometricPattern(patternId, difficulty);
      default:
        return this.generateNumericPattern(patternId, difficulty);
    }
  }

  private selectRandomType(): PatternType {
    return this.patternTypes[Math.floor(Math.random() * this.patternTypes.length)];
  }

  private generateNumericPattern(id: string, difficulty: number): Pattern {
    const base = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 5) + 1;
    const length = Math.min(3 + Math.floor(difficulty / 2), 8);
    
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(base + (i * step));
    }

    return {
      id,
      type: 'numeric',
      difficulty,
      sequence,
      solution: base + (length * step),
      timeLimit: Math.max(10 - difficulty, 3)
    };
  }

  private generateVisualPattern(id: string, difficulty: number): Pattern {
    const gridSize = Math.min(2 + Math.floor(difficulty / 3), 4);
    const colors = ['🔴', '🔵', '🟢', '🟡', '🟣'];
    const pattern = [];
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      pattern.push(colors[Math.floor(Math.random() * colors.length)]);
    }

    // Find the pattern (e.g., alternating colors)
    const solution = this.findVisualPattern(pattern);

    return {
      id,
      type: 'visual',
      difficulty,
      sequence: pattern,
      solution,
      timeLimit: Math.max(15 - difficulty, 5)
    };
  }

  private generateLogicalPattern(id: string, difficulty: number): Pattern {
    const operations = ['+', '-', '*', '/'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    
    let result: number;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = Math.floor(a / b); break;
      default: result = a + b;
    }

    return {
      id,
      type: 'logical',
      difficulty,
      sequence: [a, op, b, '?'],
      solution: result,
      timeLimit: Math.max(8 - difficulty, 2)
    };
  }

  private generateSequencePattern(id: string, difficulty: number): Pattern {
    const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
    const length = Math.min(3 + Math.floor(difficulty / 2), 6);
    const sequence = fib.slice(0, length);
    
    return {
      id,
      type: 'sequence',
      difficulty,
      sequence,
      solution: fib[length],
      timeLimit: Math.max(12 - difficulty, 4)
    };
  }

  private generateGeometricPattern(id: string, difficulty: number): Pattern {
    const shapes = ['△', '○', '□', '☆'];
    const rotations = [0, 90, 180, 270];
    const pattern = [];
    
    for (let i = 0; i < 4; i++) {
      pattern.push({
        shape: shapes[i % shapes.length],
        rotation: rotations[i % rotations.length]
      });
    }

    const solution = {
      shape: shapes[4 % shapes.length],
      rotation: rotations[4 % rotations.length]
    };

    return {
      id,
      type: 'geometric',
      difficulty,
      sequence: pattern,
      solution,
      timeLimit: Math.max(15 - difficulty, 5)
    };
  }

  private findVisualPattern(pattern: string[]): string {
    // Simple pattern detection - find the most common color
    const counts: Record<string, number> = {};
    pattern.forEach(color => {
      counts[color] = (counts[color] || 0) + 1;
    });
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  validateSolution(pattern: Pattern, userAnswer: any): boolean {
    if (pattern.type === 'geometric') {
      return JSON.stringify(userAnswer) === JSON.stringify(pattern.solution);
    }
    return userAnswer === pattern.solution;
  }
}