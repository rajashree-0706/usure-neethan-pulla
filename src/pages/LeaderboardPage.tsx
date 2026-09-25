import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { GameService } from '../services/gameService';
import type { TeamPublicData, GameSession } from '../types/game';
import { LeaderboardTable } from '../components/LeaderboardTable';

export const LeaderboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id') || searchParams.get('gameId');

  const [game, setGame] = useState<GameSession | null>(null);
  const [teams, setTeams] = useState<TeamPublicData[]>([]);

  useEffect(() => {
    if (!gameId) return;

    const unsubGame = GameService.subscribeToGame(gameId, (g) => setGame(g));
    const unsubTeams = GameService.subscribeToTeams(gameId, (t) => setTeams(t));

    return () => {
      unsubGame();
      unsubTeams();
    };
  }, [gameId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <LeaderboardTable teams={teams} currentQuestionIndex={game?.currentQuestionIndex} />
      </main>
    </div>
  );
};
