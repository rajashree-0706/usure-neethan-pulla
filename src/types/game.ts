export type GameStatus = 'lobby' | 'active' | 'question_result' | 'game_over';
export type QuestionStatus = 'waiting' | 'active' | 'ended';

export interface QuestionItem {
  id: string;
  clue: string;
  word: string; // Used in host editor
}

export interface PublicQuestionData {
  id: string;
  questionIndex: number;
  clue: string;
  wordLength: number;
  status: QuestionStatus;
  startTime?: any;
  endTime?: any;
  revealedWord?: string; // Exposed ONLY when question ends
}

export interface GameSession {
  id: string;
  gamePin: string;
  hostId: string;
  title: string;
  status: GameStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  roundDuration: number; // 30, 45, 60, 90 seconds
  maxMembersPerTeam: number;
  createdAt: any;
  startedAt?: any;
}

export interface TeamPublicData {
  id: string;
  teamName: string;
  teamCode: string;
  totalScore: number;
  currentQuestionScore: number;
  status: 'playing' | 'solved' | 'failed' | 'idle';
  solved: boolean;
  solveTime?: number; // seconds
  joinedAt: any;
}

export interface TeamPrivateState {
  questionId: string;
  guessedLetters: string[];
  correctLetters: string[];
  wrongLetters: string[];
  revealedPattern: string[]; // e.g. ["P", "_", "T", "H", "O", "N"]
  wrongGuessesCount: number; // 0 to 6 for Hangman SVG
  solved: boolean;
  solveTime?: number;
  score?: number;
}

export interface MemberData {
  id: string;
  name: string;
  online: boolean;
  joinedAt: any;
  lastSeen?: any;
}

export interface GuessResult {
  isCorrect: boolean;
  letter: string;
  revealedPattern: string[];
  solved: boolean;
  wrongGuessesCount: number;
}
