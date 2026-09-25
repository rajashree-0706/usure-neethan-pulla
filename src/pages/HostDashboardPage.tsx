import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Play, 
  RotateCcw, 
  Eye, 
  Trash2, 
  Users, 
  AlertCircle,
  Copy,
  Check,
  Award,
  List
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { GameService } from '../services/gameService';
import type { GameSession, TeamPublicData, MemberData, PublicQuestionData, QuestionItem } from '../types/game';
import { TimerDisplay } from '../components/TimerDisplay';
import { LeaderboardTable } from '../components/LeaderboardTable';

export const HostDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameId = searchParams.get('id');

  const [game, setGame] = useState<GameSession | null>(null);
  const [teams, setTeams] = useState<TeamPublicData[]>([]);
  const [teamMembersMap, setTeamMembersMap] = useState<Record<string, MemberData[]>>({});
  const [currentQuestion, setCurrentQuestion] = useState<PublicQuestionData | null>(null);
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([]);
  const [secretWord, setSecretWord] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!gameId) return;

    const unsubGame = GameService.subscribeToGame(gameId, (gameData) => {
      setGame(gameData);
    });

    const unsubTeams = GameService.subscribeToTeams(gameId, (teamsData) => {
      setTeams(teamsData);

      teamsData.forEach((team) => {
        GameService.subscribeToTeamMembers(gameId, team.id, (members) => {
          setTeamMembersMap(prev => ({ ...prev, [team.id]: members }));
        });
      });
    });

    GameService.getQuestionsBank(gameId).then((items) => {
      setQuestionsList(items);
    });

    return () => {
      unsubGame();
      unsubTeams();
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !game || game.currentQuestionIndex === 0) return;

    const unsubQ = GameService.subscribeToQuestion(gameId, game.currentQuestionIndex, (qData) => {
      setCurrentQuestion(qData);
    });

    GameService.getHostSecretWord(gameId, game.currentQuestionIndex).then((word) => {
      setSecretWord(word);
    });

    return () => unsubQ();
  }, [gameId, game?.currentQuestionIndex]);

  if (!gameId) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-[#131b2e] p-8 rounded-3xl text-center max-w-md border border-slate-800">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-black uppercase text-white mb-2">No Active Host Session</h2>
            <p className="text-xs text-slate-400 mb-6">Please create a game session to access the host dashboard.</p>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold uppercase hover:bg-amber-400 transition-colors"
            >
              Create New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/join?pin=${game?.gamePin}`;
  const totalMembers = Object.values(teamMembersMap).reduce((acc, arr) => acc + arr.length, 0);

  const handleCopyPin = () => {
    if (game?.gamePin) {
      navigator.clipboard.writeText(game.gamePin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartQuestion = async () => {
    if (!game) return;
    try {
      setLoading(true);
      setError('');
      await GameService.startNextQuestion(game.id);
    } catch (err: any) {
      setError(err.message || "Failed to start question.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndQuestion = async () => {
    if (!game || !game.currentQuestionIndex) return;
    try {
      setLoading(true);
      await GameService.endQuestion(game.id, game.currentQuestionIndex);
    } catch (err: any) {
      setError(err.message || "Failed to end question.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!game) return;
    if (window.confirm("Remove this team from the game?")) {
      await GameService.removeTeam(game.id, teamId);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!game) return;
    await GameService.removeMember(game.id, teamId, memberId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Game Status & Host Controls */}
        <div className="lg:col-span-8 space-y-6">

          {/* Huge PIN Banner Header */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="text-center md:text-left">
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                HOST DASHBOARD • GAME PIN
              </span>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-widest text-white">
                  {game?.gamePin || '------'}
                </span>
                <button
                  onClick={handleCopyPin}
                  className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors"
                  title="Copy PIN"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">Teams Joined</span>
                <span className="text-3xl font-black text-amber-400 font-mono">{teams.length}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Players</span>
                <span className="text-3xl font-black text-blue-400 font-mono">{totalMembers}</span>
              </div>
            </div>
          </div>

          {/* Question Control Panel */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Question</span>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  Question: <span className="text-amber-400">{game?.currentQuestionIndex || 0}</span> / {game?.totalQuestions || questionsList.length}
                  {game?.status === 'active' && (
                    <span className="px-3 py-0.5 rounded-full text-xs bg-emerald-950 border border-emerald-500 text-emerald-400 font-bold">
                      🟢 LIVE QUESTION
                    </span>
                  )}
                  {game?.status === 'question_result' && (
                    <span className="px-3 py-0.5 rounded-full text-xs bg-amber-950 border border-amber-500 text-amber-300 font-bold">
                      🟡 QUESTION ENDED
                    </span>
                  )}
                  {game?.status === 'lobby' && (
                    <span className="px-3 py-0.5 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                      ⚪ LOBBY WAITING
                    </span>
                  )}
                  {game?.status === 'game_over' && (
                    <span className="px-3 py-0.5 rounded-full text-xs bg-purple-950 border border-purple-500 text-purple-300 font-bold">
                      🏆 GAME OVER
                    </span>
                  )}
                </h2>
              </div>

              {currentQuestion && game?.status === 'active' && (
                <TimerDisplay
                  startTime={currentQuestion.startTime}
                  durationSeconds={game.roundDuration}
                  status={currentQuestion.status}
                  onTimeUp={handleEndQuestion}
                />
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-500 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Current Clue for Host */}
            {currentQuestion?.clue && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Active Question Clue</span>
                <div className="text-lg font-bold text-white">{currentQuestion.clue}</div>
              </div>
            )}

            {/* Target Secret Answer for Host */}
            {secretWord && game?.status === 'active' && (
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Host Secret Answer</span>
                  <div className="font-mono text-2xl font-black text-blue-300 tracking-widest">
                    {showSecret ? secretWord : '••••••••••'}
                  </div>
                </div>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> {showSecret ? 'Hide Answer' : 'Reveal Answer'}
                </button>
              </div>
            )}

            {/* Revealed Answer when question ends */}
            {currentQuestion?.revealedWord && game?.status === 'question_result' && (
              <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-center">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Tech Word Answer Was</span>
                <div className="text-3xl font-black text-emerald-300 font-mono tracking-widest mt-1">
                  {currentQuestion.revealedWord}
                </div>
              </div>
            )}

            {/* Action Control Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {game?.status === 'lobby' && (
                <button
                  onClick={handleStartQuestion}
                  disabled={loading || teams.length === 0}
                  className="px-8 py-3.5 rounded-2xl font-black text-base bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" /> START GAME (QUESTION 1)
                </button>
              )}

              {game?.status === 'active' && (
                <button
                  onClick={handleEndQuestion}
                  disabled={loading}
                  className="px-6 py-3.5 rounded-2xl font-black text-base bg-red-600 text-white hover:bg-red-500 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> END QUESTION & REVEAL
                </button>
              )}

              {game?.status === 'question_result' && (
                <button
                  onClick={handleStartQuestion}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-2xl font-black text-base bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" /> NEXT QUESTION (Q{game.currentQuestionIndex + 1})
                </button>
              )}

              {game?.status === 'game_over' && (
                <button
                  onClick={() => navigate(`/final?id=${game.id}`)}
                  className="px-8 py-3.5 rounded-2xl font-black text-base bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center gap-2"
                >
                  <Award className="w-5 h-5" /> VIEW FINAL LEADERBOARD & PODIUM
                </button>
              )}
            </div>
          </div>

          {/* Question Bank Preview */}
          {questionsList.length > 0 && (
            <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <List className="w-4 h-4 text-amber-400" /> Host Questions Sequence ({questionsList.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {questionsList.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                      idx + 1 === game?.currentQuestionIndex
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-white">{q.clue}</span>
                    <span className="font-mono font-black text-amber-400 tracking-wider">{q.word}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Live Status Table */}
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800">
            <h3 className="text-lg font-black uppercase text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Connected Teams Status
            </h3>

            {teams.length === 0 ? (
              <div className="text-center py-8 text-slate-500 italic">
                No teams joined yet. Tell participants to enter Game PIN: <strong className="text-amber-400">{game?.gamePin}</strong>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => {
                  const members = teamMembersMap[team.id] || [];
                  return (
                    <div
                      key={team.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-white">{team.teamName}</span>
                            {team.solved ? (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-400">
                                🟢 SOLVED ({team.solveTime}s)
                              </span>
                            ) : game?.status === 'active' ? (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-950 border border-blue-500 text-blue-300">
                                🟢 Playing
                              </span>
                            ) : null}
                          </div>

                          <button
                            onClick={() => handleRemoveTeam(team.id)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Remove Team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 my-2">
                          {members.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {m.name}
                              <button
                                onClick={() => handleRemoveMember(team.id, m.id)}
                                className="text-slate-500 hover:text-red-400 ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
                        <span>Total Score: <strong className="text-amber-400 font-bold">{team.totalScore} pts</strong></span>
                        {team.currentQuestionScore > 0 && <span className="text-emerald-400">+{team.currentQuestionScore}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): QR Code & Live Leaderboard */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#131b2e] p-6 rounded-3xl border border-slate-800 text-center flex flex-col items-center">
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase mb-2">
              SCAN TO JOIN TEAM
            </span>

            <div className="p-4 bg-white rounded-2xl shadow-md my-3">
              <QRCodeSVG value={joinUrl} size={160} />
            </div>

            <p className="text-xs text-slate-400 font-medium mt-1">
              Scan with phone camera or visit:
            </p>
            <span className="text-xs font-mono font-bold text-cyan-300 break-all mt-1">
              {joinUrl}
            </span>
          </div>

          <LeaderboardTable teams={teams} currentQuestionIndex={game?.currentQuestionIndex} />
        </div>
      </main>
    </div>
  );
};
