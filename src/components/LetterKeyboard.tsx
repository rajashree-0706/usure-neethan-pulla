import React from 'react';
import { soundService } from '../services/soundService';

interface LetterKeyboardProps {
  guessedLetters: string[];
  correctLetters?: string[];
  wrongLetters?: string[];
  disabled?: boolean;
  onSelectLetter: (letter: string) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const LetterKeyboard: React.FC<LetterKeyboardProps> = ({
  guessedLetters = [],
  correctLetters = [],
  wrongLetters = [],
  disabled = false,
  onSelectLetter
}) => {
  const handleLetterClick = (letter: string) => {
    if (disabled || guessedLetters.includes(letter)) return;
    soundService.playClick();
    onSelectLetter(letter);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-1 py-2 select-none">
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1 sm:gap-2">
        {ALPHABET.map((letter) => {
          const isGuessed = guessedLetters.includes(letter);
          const isCorrect = isGuessed && correctLetters.includes(letter);
          const isWrong = isGuessed && wrongLetters.includes(letter);

          return (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={disabled || isGuessed}
              className={`
                h-11 sm:h-13 rounded-xl font-bold text-base sm:text-lg transition-all duration-150
                flex items-center justify-center border shadow-sm active:scale-95 touch-manipulation
                ${isCorrect 
                  ? 'bg-emerald-900/80 border-emerald-500 text-emerald-200 cursor-not-allowed font-black'
                  : isWrong 
                  ? 'bg-red-950/80 border-red-900 text-red-400 opacity-50 cursor-not-allowed line-through'
                  : disabled
                  ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                  : 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:border-slate-500 hover:text-white'
                }
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};
