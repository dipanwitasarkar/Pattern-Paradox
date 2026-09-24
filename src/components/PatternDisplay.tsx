import { useState } from 'react';
import { Pattern } from '../types';

interface PatternDisplayProps {
  pattern: Pattern;
  onAnswer: (answer: any) => void;
  onHint: () => void;
  timeRemaining: number;
}

export const PatternDisplay = ({ 
  pattern, 
  onAnswer, 
  onHint,
  timeRemaining 
}: PatternDisplayProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (pattern.type === 'geometric') {
      // For geometric patterns, we'd need a more complex input
      onAnswer({ shape: '○', rotation: 0 });
    } else {
      onAnswer(userAnswer);
    }
    setUserAnswer('');
  };

  const renderPattern = () => {
    switch (pattern.type) {
      case 'numeric':
      case 'sequence':
        return (
          <div className="pattern-sequence">
            {pattern.sequence.map((item: any, index: number) => (
              <span key={index} className="pattern-item">
                {item}
                {index < pattern.sequence.length - 1 && <span className="separator">→</span>}
              </span>
            ))}
            <span className="pattern-item placeholder">?</span>
          </div>
        );

      case 'visual':
        return (
          <div className="pattern-grid">
            {pattern.sequence.map((item: string, index: number) => (
              <div key={index} className="grid-item">
                {item}
              </div>
            ))}
          </div>
        );

      case 'logical':
        return (
          <div className="pattern-expression">
            {pattern.sequence.map((item: any, index: number) => (
              <span key={index} className="expression-item">
                {item}
              </span>
            ))}
          </div>
        );

      case 'geometric':
        return (
          <div className="pattern-geometric">
            {pattern.sequence.map((item: any, index: number) => (
              <div key={index} className="geometric-item">
                <span className="shape">{item.shape}</span>
                <span className="rotation">{item.rotation}°</span>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Unknown pattern type</div>;
    }
  };

  return (
    <div className="pattern-display">
      <div className="pattern-header">
        <span className="pattern-type">{pattern.type.toUpperCase()}</span>
        <span className="difficulty">Level {pattern.difficulty}</span>
        <span className={`timer ${timeRemaining <= 5 ? 'urgent' : ''}`}>
          {timeRemaining}s
        </span>
      </div>

      <div className="pattern-content">
        {renderPattern()}
      </div>

      <div className="pattern-input">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter your answer..."
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={timeRemaining <= 0}
        />
        <button 
          onClick={handleSubmit}
          disabled={timeRemaining <= 0 || !userAnswer}
          className="submit-btn"
        >
          Submit
        </button>
      </div>

      <div className="pattern-actions">
        <button onClick={() => { setShowHint(!showHint); onHint(); }} className="hint-btn">
          {showHint ? 'Hide Hint' : 'Get Hint'}
        </button>
        {showHint && (
          <div className="hint-text">
            💡 Hint: {pattern.hint || 'Think about the pattern carefully'}
          </div>
        )}
      </div>
    </div>
  );
};