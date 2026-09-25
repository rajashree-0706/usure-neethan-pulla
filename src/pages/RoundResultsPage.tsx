import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { GameService } from '../services/gameService';
import type { GameSession, TeamPublicData, PublicQuestionData } from '../types/game';
import { LeaderboardTable } from '../components/LeaderboardTable';

export const RoundResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gameId = searchParams.get('gameId') || JSON.parse(localStorage.getItem('hangman_challenge_session') || '{}').gameId;
  const teamId = searchParams.get('teamId') || JSON.parse(localStorage.getItem('hangman_challenge_session') || '{}').teamId;

  const [game, setGame] = useState<GameSession | null>(null);
  const [teams, setTeams] = useState<TeamPublicData[]>([]);
  const [question, setQuestion] = useState<PublicQuestionData | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const unsubGame = GameService.subscribeToGame(gameId, (gameData) => {
      setGame(gameData);
      if (gameData?.status === 'active') {
        navigate(`/play?gameId=${gameId}&teamId=${teamId}`);
      } else if (gameData?.status === 'game_over') {
        navigate(`/final?id=${gameId}`);
      }
    });

    const unsubTeams = GameService.subscribeToTeams(gameId, (teamsData) => {
      setTeams(teamsData);
    });

    return () => {
      unsubGame();
      unsubTeams();
    };
  }, [gameId, teamId, navigate]);

  useEffect(() => {
    if (!gameId || !game?.currentQuestionIndex) return;

    const unsubQ = GameService.subscribeToQuestion(gameId, game.currentQuestionIndex, (qData) => {
      setQuestion(qData);
    });

    return () => unsubQ();
  }, [gameId, game?.currentQuestionIndex]);

  const handleNextQuestion = async () => {
    if (!gameId) return;
    await GameService.startNextQuestion(gameId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800 text-center shadow-xl space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            QUESTION {game?.currentQuestionIndex || 1} RESULT 🎉
          </span>

          {question?.clue && (
            <p className="text-sm font-semibold text-slate-300 max-w-xl mx-auto italic">
              "{question.clue}"
            </p>
          )}

          <div className="py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              THE CORRECT TECH WORD WAS
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-emerald-400">
              {question?.revealedWord || '------'}
            </div>
          </div>
        </div>

        <LeaderboardTable teams={teams} currentQuestionIndex={game?.currentQuestionIndex} highlightTeamId={teamId} />

        <div className="text-center pt-2">
          {game?.hostId && (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-4 rounded-2xl font-black text-lg bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Play className="w-6 h-6 fill-current" /> START NEXT QUESTION (Q{(game?.currentQuestionIndex || 0) + 1})
            </button>
          )}

          <p className="text-xs text-slate-400 mt-3 font-semibold">
            Waiting for host to trigger the next question...
          </p>
        </div>
      </main>
    </div>
  );
};
