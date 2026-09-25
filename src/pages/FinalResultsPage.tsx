import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, RefreshCw, Home } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { GameService } from '../services/gameService';
import type { TeamPublicData } from '../types/game';
import confetti from 'canvas-confetti';

export const FinalResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameId = searchParams.get('id') || searchParams.get('gameId');

  const [teams, setTeams] = useState<TeamPublicData[]>([]);

  useEffect(() => {
    if (!gameId) return;

    const unsubTeams = GameService.subscribeToTeams(gameId, (t) => {
      const sorted = [...t].sort((a, b) => b.totalScore - a.totalScore);
      setTeams(sorted);
    });

    try {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
        confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
      }, 250);
    } catch (e) {
      // Ignore
    }

    return () => {
      unsubTeams();
    };
  }, [gameId]);

  const champion = teams[0];
  const runnerUp = teams[1];
  const thirdPlace = teams[2];
  const rest = teams.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 flex flex-col items-center justify-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400 text-xs font-black uppercase tracking-widest mb-4">
          🏆 FINAL CHAMPIONS CEREMONY
        </div>

        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-8">
          USURE NEEDHAN PULLA CHAMPIONS
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl items-end mb-12">
          {runnerUp && (
            <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-700 text-center order-2 md:order-1">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center mx-auto mb-3 text-slate-300">
                <Medal className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">2nd Place</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider my-1">{runnerUp.teamName}</h3>
              <div className="text-3xl font-black text-slate-200 font-mono">{runnerUp.totalScore} <span className="text-xs font-normal">pts</span></div>
            </div>
          )}

          {champion && (
            <div className="bg-[#131b2e] p-8 rounded-3xl border-2 border-amber-400 text-center order-1 md:order-2 shadow-2xl transform md:-translate-y-4">
              <div className="w-20 h-20 rounded-3xl bg-amber-500 text-black flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-10 h-10" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-1">👑 GRAND CHAMPION</span>
              <h2 className="text-3xl sm:text-4xl font-black text-amber-300 uppercase tracking-wider my-1">{champion.teamName}</h2>
              <div className="text-4xl font-black text-amber-400 font-mono my-2">{champion.totalScore} <span className="text-sm font-normal">pts</span></div>
            </div>
          )}

          {thirdPlace && (
            <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-700 text-center order-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center mx-auto mb-3 text-amber-600">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">3rd Place</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-wider my-1">{thirdPlace.teamName}</h3>
              <div className="text-3xl font-black text-slate-200 font-mono">{thirdPlace.totalScore} <span className="text-xs font-normal">pts</span></div>
            </div>
          )}
        </div>

        {rest.length > 0 && (
          <div className="w-full max-w-2xl bg-[#131b2e] p-6 rounded-3xl border border-slate-800 text-left mb-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Honorable Mentions</h4>
            <div className="space-y-2">
              {rest.map((t, idx) => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold">
                  <span className="text-slate-300">#{idx + 4} {t.teamName}</span>
                  <span className="font-mono text-amber-400">{t.totalScore} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-3.5 rounded-2xl font-black text-base bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> HOST NEW COMPETITION
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-6 py-3.5 rounded-2xl font-black text-base bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <Home className="w-5 h-5" /> BACK TO HOME
          </button>
        </div>
      </main>
    </div>
  );
};
