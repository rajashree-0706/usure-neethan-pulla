import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Clock, Zap } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Zap className="w-4 h-4 text-amber-400" /> Real-Time Multiplayer Tech Event
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none mb-4">
          <span className="text-amber-400">USURE NEEDHAN PULLA</span>
          <br />
          <span className="text-white text-3xl sm:text-5xl md:text-6xl">
            HANGMAN CHALLENGE
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-medium">
          “Think Fast. Guess Faster. Win Together.”
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={() => navigate('/create')}
            className="w-full sm:w-64 py-4 px-8 rounded-2xl font-black text-lg bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-6 h-6" /> HOST GAME
          </button>

          <button
            onClick={() => navigate('/join')}
            className="w-full sm:w-64 py-4 px-8 rounded-2xl font-black text-lg bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Users className="w-6 h-6 text-blue-400" /> JOIN TEAM
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          <div className="bg-[#131b2e] p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 text-amber-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-1">1. HOST CREATES</h3>
            <p className="text-xs text-slate-400">Host manually creates clues & hidden tech words for the competition.</p>
          </div>

          <div className="bg-[#131b2e] p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-1">2. TEAMS JOIN</h3>
            <p className="text-xs text-slate-400">Participants join from their phones using Game PIN & Team Name.</p>
          </div>

          <div className="bg-[#131b2e] p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-1">3. PRIVATE HANGMAN</h3>
            <p className="text-xs text-slate-400">All teams solve the same tech word simultaneously on private team boards.</p>
          </div>

          <div className="bg-[#131b2e] p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 text-purple-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-1">4. TIME SCORING</h3>
            <p className="text-xs text-slate-400">Faster solve times award higher points to climb the live auditorium leaderboard.</p>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        USURE NEEDHAN PULLA – HANGMAN CHALLENGE &copy; {new Date().getFullYear()} • Real-Time Team Platform
      </footer>
    </div>
  );
};
