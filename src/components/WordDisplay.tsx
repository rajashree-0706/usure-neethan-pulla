import React from 'react';

interface WordDisplayProps {
  revealedPattern: string[];
  wordLength: number;
  solved?: boolean;
  revealedWord?: string;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  revealedPattern,
  wordLength,
  solved = false,
  revealedWord
}) => {
  const pattern = revealedWord 
    ? revealedWord.split('') 
    : (revealedPattern && revealedPattern.length === wordLength ? revealedPattern : Array(wordLength).fill('_'));

  return (
    <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2.5 my-4 px-2 max-w-full select-none">
      {pattern.map((letter, index) => {
        const isRevealed = letter !== '_';
        const isMissed = revealedWord && revealedPattern[index] === '_';

        return (
          <div
            key={index}
            className={`
              w-9 h-12 sm:w-12 sm:h-16 md:w-14 md:h-20
              flex items-center justify-center
              rounded-xl font-mono text-2xl sm:text-3xl md:text-4xl font-black
              border-2 transition-all duration-200
              ${solved 
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300' 
                : isMissed
                ? 'bg-red-950 border-red-500 text-red-300'
                : isRevealed 
                ? 'bg-blue-950 border-blue-400 text-blue-200' 
                : 'bg-slate-900 border-slate-700 text-slate-500'
              }
            `}
          >
            {isRevealed ? letter : ''}
          </div>
        );
      })}
    </div>
  );
};
