import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Volume2, VolumeX, Shield, Users } from 'lucide-react';
import { soundService } from '../services/soundService';

export const Navbar: React.FC = () => {
  const [muted, setMuted] = useState(soundService.isMuted());
  const location = useLocation();

  const handleToggleSound = () => {
    const isMuted = soundService.toggleMute();
    setMuted(isMuted);
  };

  return (
    <header className="w-full bg-[#0d111c] sticky top-0 z-50 px-4 py-3 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg tracking-wider text-white uppercase leading-none">
              USURE NEEDHAN PULLA
            </h1>
            <p className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
              HANGMAN CHALLENGE
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {location.pathname !== '/host' && (
            <Link
              to="/join"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Join Team
            </Link>
          )}

          {location.pathname !== '/host' && (
            <Link
              to="/host"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-900/60 border border-blue-500/50 text-blue-200 hover:bg-blue-800/60 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" /> Host Panel
            </Link>
          )}

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={muted ? "Unmute sound" : "Mute sound"}
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
