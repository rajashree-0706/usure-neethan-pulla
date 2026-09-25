import React from 'react';

interface HangmanGraphicProps {
  wrongGuessesCount: number;
  maxWrongGuesses?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const HangmanGraphic: React.FC<HangmanGraphicProps> = ({ 
  wrongGuessesCount, 
  maxWrongGuesses = 6,
  size = 'md' 
}) => {
  const dimensions = {
    sm: { width: 140, height: 160 },
    md: { width: 200, height: 220 },
    lg: { width: 280, height: 300 }
  }[size];

  const stage = Math.min(wrongGuessesCount, maxWrongGuesses);

  return (
    <div className="flex flex-col items-center justify-center p-2 relative select-none">
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        viewBox="0 0 200 240" 
        className="filter drop-shadow-md"
      >
        {/* Gallows Base */}
        <line x1="20" y1="220" x2="180" y2="220" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        {/* Vertical Post */}
        <line x1="50" y1="220" x2="50" y2="20" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
        {/* Top Beam */}
        <line x1="48" y1="20" x2="140" y2="20" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
        {/* Diagonal Support */}
        <line x1="50" y1="60" x2="90" y2="20" stroke="#475569" strokeWidth="3" />
        {/* Noose Rope */}
        <line x1="140" y1="20" x2="140" y2="50" stroke="#f59e0b" strokeWidth="3" strokeDasharray="3,2" />

        {/* Stage 1: Head */}
        {stage >= 1 && (
          <circle 
            cx="140" 
            cy="70" 
            r="20" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="4" 
          />
        )}

        {/* Stage 2: Body */}
        {stage >= 2 && (
          <line 
            x1="140" y1="90" 
            x2="140" y2="150" 
            stroke="#ef4444" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
        )}

        {/* Stage 3: Left Arm */}
        {stage >= 3 && (
          <line 
            x1="140" y1="105" 
            x2="110" y2="135" 
            stroke="#ef4444" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
        )}

        {/* Stage 4: Right Arm */}
        {stage >= 4 && (
          <line 
            x1="140" y1="105" 
            x2="170" y2="135" 
            stroke="#ef4444" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
        )}

        {/* Stage 5: Left Leg */}
        {stage >= 5 && (
          <line 
            x1="140" y1="150" 
            x2="115" y2="195" 
            stroke="#ef4444" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
        )}

        {/* Stage 6: Right Leg */}
        {stage >= 6 && (
          <line 
            x1="140" y1="150" 
            x2="165" y2="195" 
            stroke="#ef4444" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
        Hangman Progress: <span className="text-red-400 font-mono">{wrongGuessesCount} / {maxWrongGuesses}</span>
      </div>
    </div>
  );
};
