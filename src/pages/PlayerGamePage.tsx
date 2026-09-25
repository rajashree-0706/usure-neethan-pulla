import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { GameService } from '../services/gameService';
import { soundService } from '../services/soundService';
import type { GameSession, TeamPublicData, PublicQuestionData, TeamPrivateState } from '../types/game';
import { WordDisplay } from '../components/WordDisplay';
import { LetterKeyboard } from '../components/LetterKeyboard';
import { HangmanGraphic } from '../components/HangmanGraphic';
import { TimerDisplay } from '../components/TimerDisplay';
import confetti from 'canvas-confetti';

export const PlayerGamePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gameId = searchParams.get('gameId') || JSON.parse(localStorage.getItem('hangman_session') || '{}').gameId;
  const teamId = searchParams.get('teamId') || JSON.parse(localStorage.getItem('hangman_session') || '{}').teamId;

  const [game, setGame] = useState<GameSession | null>(null);
  const [team, setTeam] = useState<TeamPublicData | null>(null);
  const [question, setQuestion] = useState<PublicQuestionData | null>(null);
  const [privateState, setPrivateState] = useState<TeamPrivateState | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });

  // Subscribe to game session
  useEffect(() => {
    if (!gameId) {
      navigate('/join');
      return;
    }

    const unsubGame = GameService.subscribeToGame(gameId, (gameData) => {
      setGame(gameData);
      if (gameData?.status === 'question_result' || gameData?.status === 'game_over') {
        navigate(`/results?gameId=${gameId}&teamId=${teamId}`);
      }
    });

    return () => unsubGame();
  }, [gameId, teamId, navigate]);

  // Subscribe to public team summary
  useEffect(() => {
    if (!gameId || !teamId) return;

    const unsubTeams = GameService.subscribeToTeams(gameId, (teams) => {
      const currentTeam = teams.find(t => t.id === teamId);
      if (currentTeam) {
        setTeam(currentTeam);
      }
    });

    return () => unsubTeams();
  }, [gameId, teamId]);

  // Subscribe to current question
  useEffect(() => {
    if (!gameId || !game?.currentQuestionIndex) return;

    const unsubQ = GameService.subscribeToQuestion(gameId, game.currentQuestionIndex, (qData) => {
      setQuestion(qData);
    });

    return () => unsubQ();
  }, [gameId, game?.currentQuestionIndex]);

  // Subscribe to private team state for this question
  useEffect(() => {
    if (!gameId || !teamId || !game?.currentQuestionIndex) return;

    const unsubPrivate = GameService.subscribeToPrivateTeamState(
      gameId, 
      teamId, 
      game.currentQuestionIndex, 
      (state) => {
        setPrivateState(state);
      }
    );

    return () => unsubPrivate();
  }, [gameId, teamId, game?.currentQuestionIndex]);

  // Solved fanfare trigger
  useEffect(() => {
    if (privateState?.solved) {
      soundService.playSolved();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignore
      }
    }
  }, [privateState?.solved]);

  const handleSelectLetter = async (letter: string) => {
    if (!gameId || !teamId || !game || !question || submitting || privateState?.solved) return;

    try {
      setSubmitting(true);
      const res = await GameService.submitGuess(
        gameId,
        teamId,
        letter,
        game.currentQuestionIndex,
        game.roundDuration
      );

      if (res.isCorrect) {
        soundService.playCorrect();
        setFeedback({ type: 'correct', message: `Letter ${letter} is CORRECT!` });
      } else {
        soundService.playWrong();
        setFeedback({ type: 'wrong', message: `Letter ${letter} is WRONG!` });
      }

      setTimeout(() => setFeedback({ type: null, message: '' }), 1500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!game || !team) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-amber-400 font-bold animate-pulse">Connecting to Team Board...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-3 py-4 flex flex-col justify-between">
        
        {/* Header Summary */}
        <div className="bg-[#131b2e] p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                QUESTION {String(game.currentQuestionIndex).padStart(2, '0')} / {game.totalQuestions}
              </span>
              <h2 className="text-xl font-black text-amber-400 uppercase tracking-wider">
                {team.teamName}
              </h2>
            </div>

            {question && (
              <TimerDisplay
                startTime={question.startTime}
                durationSeconds={game.roundDuration}
                status={question.status}
              />
            )}
          </div>

          {/* Clue Section */}
          {question?.clue && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-400">Host's Clue</span>
                <span className="font-semibold text-sm">{question.clue}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-xs font-semibold">
            <span className="text-slate-400">Team Score: <strong className="text-amber-400 font-mono text-sm">{team.totalScore} pts</strong></span>
            {privateState?.wrongGuessesCount !== undefined && (
              <span className="text-slate-400">Wrong Guesses: <strong className="text-red-400 font-mono">{privateState.wrongGuessesCount}</strong></span>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.type && (
          <div className={`
            my-2 p-2.5 rounded-xl text-center font-bold text-xs transition-all
            ${feedback.type === 'correct' 
              ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' 
              : 'bg-red-950 border border-red-500 text-red-300'
            }
          `}>
            {feedback.message}
          </div>
        )}

        {/* HERO: Hangman Graphic & Word Blanks */}
        <div className="my-2 flex flex-col items-center">
          <HangmanGraphic wrongGuessesCount={privateState?.wrongGuessesCount || 0} size="sm" />

          <WordDisplay
            revealedPattern={privateState?.revealedPattern || []}
            wordLength={question?.wordLength || 0}
            solved={privateState?.solved}
          />
        </div>

        {/* Solved Banner or Virtual Keyboard */}
        {privateState?.solved ? (
          <div className="p-6 rounded-2xl bg-[#131b2e] border-2 border-emerald-500 text-center space-y-2 my-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-emerald-300 uppercase tracking-wider">WORD SOLVED! 🎉</h3>
            <p className="text-xs text-slate-200 font-medium">
              Solved in <span className="text-cyan-300 font-mono font-bold text-sm">{privateState.solveTime}s</span> • Score: <span className="text-amber-400 font-mono font-bold text-sm">+{privateState.score} pts</span>
            </p>
            <div className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-800">
              Waiting for host to move to the next question...
            </div>
          </div>
        ) : (
          <LetterKeyboard
            guessedLetters={privateState?.guessedLetters || []}
            correctLetters={privateState?.correctLetters || []}
            wrongLetters={privateState?.wrongLetters || []}
            disabled={submitting || question?.status !== 'active'}
            onSelectLetter={handleSelectLetter}
          />
        )}
      </main>
    </div>
  );
};
