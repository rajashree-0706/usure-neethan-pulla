import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { GameService } from '../services/gameService';
import type { MemberData } from '../types/game';

export const PlayerJoinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [gamePin, setGamePin] = useState(searchParams.get('pin') || '');
  const [teamName, setTeamName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [joinedSession, setJoinedSession] = useState<{ gameId: string; teamId: string; memberId: string } | null>(() => {
    const saved = localStorage.getItem('hangman_challenge_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [teamMembers, setTeamMembers] = useState<MemberData[]>([]);

  useEffect(() => {
    if (!joinedSession) return;

    const unsubGame = GameService.subscribeToGame(joinedSession.gameId, (gameData) => {
      if (gameData && gameData.status === 'active') {
        navigate(`/play?gameId=${joinedSession.gameId}&teamId=${joinedSession.teamId}`);
      }
    });

    const unsubMembers = GameService.subscribeToTeamMembers(
      joinedSession.gameId, 
      joinedSession.teamId, 
      (members) => {
        setTeamMembers(members);
      }
    );

    return () => {
      unsubGame();
      unsubMembers();
    };
  }, [joinedSession, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamePin || !teamName || !playerName) {
      setError("Please enter Game PIN, Team Name, and Player Name.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      const session = await GameService.joinGame(gamePin, teamName, playerName);
      localStorage.setItem('hangman_challenge_session', JSON.stringify(session));
      setJoinedSession(session);
    } catch (err: any) {
      setError(err.message || "Failed to join game. Please verify the Game PIN.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveLobby = () => {
    localStorage.removeItem('hangman_challenge_session');
    setJoinedSession(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {!joinedSession ? (
          <div className="bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-amber-400 mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black uppercase text-white">Join Team Arena</h1>
              <p className="text-xs text-slate-400 mt-1">Enter 6-digit Game PIN and Team details</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950 border border-red-500 text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Game PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 482931"
                  value={gamePin}
                  onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-center text-2xl font-mono font-black tracking-widest text-amber-400 focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Team Name / Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. Team Alpha"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-base font-bold text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Your Player Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Raji"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-base font-bold text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-lg bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    JOIN GAME <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800 text-center shadow-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-400" /> Waiting for Host to Start...
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>GAME PIN</span>
                <span className="font-mono text-amber-400 font-bold">{gamePin}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>YOUR TEAM</span>
                <span className="text-blue-300 font-bold">{teamName || joinedSession.teamId}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>PLAYER NAME</span>
                <span className="text-white font-bold">{playerName || 'You'}</span>
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" /> Online Team Members ({teamMembers.length})
              </h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    {member.name}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLeaveLobby}
              className="text-xs font-bold text-slate-500 hover:text-red-400 underline pt-2"
            >
              Leave / Change Team
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
