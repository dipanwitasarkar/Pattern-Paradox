import { PatternGenerator } from '../game/patternGenerator';
import { PatternType } from '../types';

describe('PatternGenerator', () => {
  let generator: PatternGenerator;

  beforeEach(() => {
    generator = new PatternGenerator();
  });

  describe('generatePattern', () => {
    it('should generate a pattern with valid structure', () => {
      const pattern = generator.generatePattern(1);
      
      expect(pattern).toBeDefined();
      expect(pattern).toHaveProperty('id');
      expect(pattern).toHaveProperty('type');
      expect(pattern).toHaveProperty('difficulty');
      expect(pattern).toHaveProperty('sequence');
      expect(pattern).toHaveProperty('solution');
      expect(pattern).toHaveProperty('timeLimit');
    });

    it('should generate pattern with specified type', () => {
      const pattern = generator.generatePattern(1, 'numeric');
      
      expect(pattern.type).toBe('numeric');
    });

    it('should generate pattern with specified difficulty', () => {
      const pattern = generator.generatePattern(3);
      
      expect(pattern.difficulty).toBe(3);
    });

    it('should generate unique pattern IDs', () => {
      const pattern1 = generator.generatePattern(1);
      const pattern2 = generator.generatePattern(1);
      
      expect(pattern1.id).not.toBe(pattern2.id);
    });
  });

  describe('generateNumericPattern', () => {
    it('should generate arithmetic progression', () => {
      const pattern = generator.generateNumericPattern('test-1', 1);
      
      expect(pattern.type).toBe('numeric');
      expect(pattern.sequence).toBeInstanceOf(Array);
      expect(pattern.sequence.length).toBeGreaterThan(0);
    });

    it('should calculate correct solution for arithmetic progression', () => {
      const pattern = generator.generateNumericPattern('test-1', 1);
      const sequence = pattern.sequence as number[];
      const lastValue = sequence[sequence.length - 1];
      const step = sequence[1] - sequence[0];
      
      expect(pattern.solution).toBe(lastValue + step);
    });

    it('should increase sequence length with difficulty', () => {
      const pattern1 = generator.generateNumericPattern('test-1', 1);
      const pattern2 = generator.generateNumericPattern('test-2', 5);
      
      expect(pattern2.sequence.length).toBeGreaterThanOrEqual(pattern1.sequence.length);
    });

    it('should decrease time limit with difficulty', () => {
      const pattern1 = generator.generateNumericPattern('test-1', 1);
      const pattern2 = generator.generateNumericPattern('test-2', 5);
      
      expect(pattern2.timeLimit).toBeLessThanOrEqual(pattern1.timeLimit);
    });
  });

  describe('generateVisualPattern', () => {
    it('should generate visual pattern with colors', () => {
      const pattern = generator.generateVisualPattern('test-1', 1);
      
      expect(pattern.type).toBe('visual');
      expect(pattern.sequence).toBeInstanceOf(Array);
      expect(pattern.sequence.length).toBeGreaterThan(0);
    });

    it('should use valid color emojis', () => {
      const pattern = generator.generateVisualPattern('test-1', 1);
      const validColors = ['🔴', '🔵', '🟢', '🟡', '🟣'];
      
      pattern.sequence.forEach((color: string) => {
        expect(validColors).toContain(color);
      });
    });

    it('should return a color as solution', () => {
      const pattern = generator.generateVisualPattern('test-1', 1);
      
      expect(typeof pattern.solution).toBe('string');
      expect(pattern.solution.length).toBeGreaterThan(0);
    });
  });

  describe('generateLogicalPattern', () => {
    it('should generate logical pattern with operation', () => {
      const pattern = generator.generateLogicalPattern('test-1', 1);
      
      expect(pattern.type).toBe('logical');
      expect(pattern.sequence).toBeInstanceOf(Array);
      expect(pattern.sequence.length).toBe(4);
    });

    it('should use valid operations', () => {
      const pattern = generator.generateLogicalPattern('test-1', 1);
      const validOps = ['+', '-', '*', '/'];
      
      expect(validOps).toContain(pattern.sequence[1]);
    });

    it('should calculate correct solution for addition', () => {
      const pattern = generator.generateLogicalPattern('test-1', 1);
      if (pattern.sequence[1] === '+') {
        const a = pattern.sequence[0] as number;
        const b = pattern.sequence[2] as number;
        expect(pattern.solution).toBe(a + b);
      }
    });

    it('should calculate correct solution for subtraction', () => {
      const pattern = generator.generateLogicalPattern('test-1', 1);
      if (pattern.sequence[1] === '-') {
        const a = pattern.sequence[0] as number;
        const b = pattern.sequence[2] as number;
        expect(pattern.solution).toBe(a - b);
      }
    });
  });

  describe('generateSequencePattern', () => {
    it('should generate Fibonacci sequence', () => {
      const pattern = generator.generateSequencePattern('test-1', 1);
      
      expect(pattern.type).toBe('sequence');
      expect(pattern.sequence).toBeInstanceOf(Array);
    });

    it('should use correct Fibonacci numbers', () => {
      const pattern = generator.generateSequencePattern('test-1', 3);
      const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
      
      pattern.sequence.forEach((num: number) => {
        expect(fib).toContain(num);
      });
    });

    it('should calculate correct next Fibonacci number', () => {
      const pattern = generator.generateSequencePattern('test-1', 3);
      const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
      const length = pattern.sequence.length;
      
      expect(pattern.solution).toBe(fib[length]);
    });
  });

  describe('generateGeometricPattern', () => {
    it('should generate geometric pattern with shapes', () => {
      const pattern = generator.generateGeometricPattern('test-1', 1);
      
      expect(pattern.type).toBe('geometric');
      expect(pattern.sequence).toBeInstanceOf(Array);
      expect(pattern.sequence.length).toBe(4);
    });

    it('should use valid shapes', () => {
      const pattern = generator.generateGeometricPattern('test-1', 1);
      const validShapes = ['△', '○', '□', '☆'];
      
      pattern.sequence.forEach((item: any) => {
        expect(validShapes).toContain(item.shape);
      });
    });

    it('should include rotation in pattern', () => {
      const pattern = generator.generateGeometricPattern('test-1', 1);
      
      pattern.sequence.forEach((item: any) => {
        expect(item).toHaveProperty('rotation');
        expect([0, 90, 180, 270]).toContain(item.rotation);
      });
    });
  });

  describe('validateSolution', () => {
    it('should validate numeric solution correctly', () => {
      const pattern = generator.generateNumericPattern('test-1', 1);
      
      expect(generator.validateSolution(pattern, pattern.solution)).toBe(true);
      expect(generator.validateSolution(pattern, 999)).toBe(false);
    });

    it('should validate visual solution correctly', () => {
      const pattern = generator.generateVisualPattern('test-1', 1);
      
      expect(generator.validateSolution(pattern, pattern.solution)).toBe(true);
      expect(generator.validateSolution(pattern, 'invalid')).toBe(false);
    });

    it('should validate logical solution correctly', () => {
      const pattern = generator.generateLogicalPattern('test-1', 1);
      
      expect(generator.validateSolution(pattern, pattern.solution)).toBe(true);
      expect(generator.validateSolution(pattern, 999)).toBe(false);
    });

    it('should validate geometric solution correctly', () => {
      const pattern = generator.generateGeometricPattern('test-1', 1);
      
      expect(generator.validateSolution(pattern, pattern.solution)).toBe(true);
      expect(generator.validateSolution(pattern, { shape: 'invalid', rotation: 0 })).toBe(false);
    });
  });

  describe('selectRandomType', () => {
    it('should return a valid pattern type', () => {
      const type = generator['selectRandomType']();
      const validTypes: PatternType[] = ['numeric', 'visual', 'logical', 'sequence', 'geometric'];
      
      expect(validTypes).toContain(type);
    });

    it('should return different types on multiple calls', () => {
      const types = new Set();
      for (let i = 0; i < 20; i++) {
        types.add(generator['selectRandomType']());
      }
      
      expect(types.size).toBeGreaterThan(1);
    });
  });
});
