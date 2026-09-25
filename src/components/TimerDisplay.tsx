import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { soundService } from '../services/soundService';

interface TimerDisplayProps {
  startTime?: any;
  durationSeconds: number;
  onTimeUp?: () => void;
  status: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  startTime,
  durationSeconds,
  onTimeUp,
  status
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);

  useEffect(() => {
    if (status !== 'active' || !startTime) {
      if (status === 'waiting') setTimeLeft(durationSeconds);
      return;
    }

    const startMs = startTime.toMillis 
      ? startTime.toMillis() 
      : (typeof startTime === 'number' ? startTime : Date.now());

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startMs) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      
      setTimeLeft(remaining);

      if (remaining <= 10 && remaining > 0) {
        soundService.playTick();
      }

      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationSeconds, status, onTimeUp]);

  const isWarning = timeLeft <= 10 && timeLeft > 0;

  return (
    <div className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-300
      ${isWarning 
        ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(255,42,109,0.5)]' 
        : 'bg-slate-900/80 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.15)]'
      }
    `}>
      <Clock className={`w-5 h-5 ${isWarning ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}`} />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold -mb-1">Time Left</span>
        <span className="font-mono font-black text-xl sm:text-2xl tracking-wider">
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
          {String(timeLeft % 60).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};
