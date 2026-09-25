import React from 'react';
import { Trophy, Medal, CheckCircle2, Clock } from 'lucide-react';
import type { TeamPublicData } from '../types/game';

interface LeaderboardTableProps {
  teams: TeamPublicData[];
  currentQuestionIndex?: number;
  highlightTeamId?: string;
  compact?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  teams = [],
  currentQuestionIndex,
  highlightTeamId,
  compact = false
}) => {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const timeA = a.solveTime || 9999;
    const timeB = b.solveTime || 9999;
    return timeA - timeB;
  });

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <span className="flex items-center gap-1 text-amber-400 font-bold"><Trophy className="w-5 h-5" /> 1st</span>;
      case 1:
        return <span className="flex items-center gap-1 text-slate-300 font-bold"><Medal className="w-5 h-5" /> 2nd</span>;
      case 2:
        return <span className="flex items-center gap-1 text-amber-600 font-bold"><Medal className="w-5 h-5" /> 3rd</span>;
      default:
        return <span className="font-mono text-slate-400 font-bold">#{index + 1}</span>;
    }
  };

  return (
    <div className="w-full bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-black uppercase tracking-wider text-white">Live Leaderboard</h2>
        </div>
        <div className="flex items-center gap-2">
          {currentQuestionIndex ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              Q{currentQuestionIndex}
            </span>
          ) : null}
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            {teams.length} Teams
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {sortedTeams.length === 0 ? (
          <p className="text-center text-slate-500 py-6 italic text-sm">No teams joined yet</p>
        ) : (
          sortedTeams.map((team, index) => {
            const isHighlighted = team.id === highlightTeamId;

            return (
              <div
                key={team.id}
                className={`
                  flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200
                  ${isHighlighted 
                    ? 'bg-blue-950/60 border-blue-500' 
                    : index === 0
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 flex justify-center text-sm">
                    {getRankBadge(index)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{team.teamName}</span>
                      {team.solved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                          Playing / Not Solved
                        </span>
                      )}
                    </div>

                    {!compact && team.solveTime && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                        <Clock className="w-3 h-3 text-cyan-400" /> Solved in {team.solveTime}s
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xl font-black text-amber-400">
                    {team.totalScore} <span className="text-xs font-normal text-slate-400">pts</span>
                  </div>
                  {team.currentQuestionScore > 0 && (
                    <div className="text-xs font-semibold text-emerald-400 font-mono">
                      +{team.currentQuestionScore}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
