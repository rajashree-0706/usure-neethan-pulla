import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Play, Plus, Trash2, Copy, MoveUp, MoveDown, Clock, FileText, Users, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { GameService, parseBulkQuestions } from '../services/gameService';
import { isFirebaseConfigured } from '../services/firebase';
import type { QuestionItem } from '../types/game';

export const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [roundDuration, setRoundDuration] = useState<number>(60);
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState<number>(10);
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>(
    "PYTHON | A popular programming language known for clean syntax\n" +
    "JAVASCRIPT | The primary language of web browsers\n" +
    "FIREBASE | Google cloud application platform\n" +
    "ALGORITHM | Step-by-step procedure for calculations\n" +
    "BLOCKCHAIN | Decentralized digital ledger technology"
  );

  const [questions, setQuestions] = useState<QuestionItem[]>([
    { id: 'q1', word: 'PYTHON', clue: 'A popular programming language known for clean syntax' },
    { id: 'q2', word: 'JAVASCRIPT', clue: 'The primary language of web browsers' },
    { id: 'q3', word: 'FIREBASE', clue: 'Google cloud application platform' }
  ]);

  const [newWord, setNewWord] = useState('');
  const [newClue, setNewClue] = useState('');

  const handleAddQuestion = () => {
    if (!newWord.trim() || !newClue.trim()) {
      setError("Please enter both a Tech Word and a Clue.");
      return;
    }
    const cleanWord = newWord.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const item: QuestionItem = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      word: cleanWord,
      clue: newClue.trim()
    };
    setQuestions([...questions, item]);
    setNewWord('');
    setNewClue('');
    setError('');
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleDuplicate = (item: QuestionItem) => {
    const dup: QuestionItem = {
      ...item,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      clue: `${item.clue} (Copy)`
    };
    setQuestions([...questions, dup]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setQuestions(updated);
  };

  const handleApplyBulk = () => {
    const parsed = parseBulkQuestions(bulkText);
    if (parsed.length === 0) {
      setError("No valid format found. Use format: WORD | Clue description");
      return;
    }
    setQuestions(parsed);
    setBulkMode(false);
    setError('');
  };

  const handleCreate = async () => {
    if (questions.length === 0) {
      setError("Please create at least one question item before starting.");
      return;
    }

    if (!isFirebaseConfigured()) {
      console.error("[CREATE] Firebase configuration missing");
      setError("Firebase is not configured. Please create a .env file with VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID credentials.");
      return;
    }

    console.log("[CREATE] Starting game creation workflow");
    setLoading(true);
    setError('');

    const createPromise = GameService.createGame(questions, roundDuration, maxMembersPerTeam);

    const overallTimeout = new Promise<{ gameId: string; gamePin: string }>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Unable to start the game (Timeout after 15 seconds). Please check your Firebase project configuration and internet connection."));
      }, 15000);
    });

    try {
      const { gameId } = await Promise.race([createPromise, overallTimeout]);
      console.log("[CREATE] Navigating to /host?id=" + gameId);
      navigate(`/host?id=${gameId}`);
    } catch (err: any) {
      console.error("[CREATE] Game initialization failed:", err);
      const msg = err.message || String(err);

      if (msg.includes('api-key-not-valid')) {
        setError("Firebase API Key mismatch! If you recently updated .env, please click 'Reload Page & Retry' so the browser loads the new .env configuration.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReloadPage = () => {
    window.location.reload();
  };

  const handleBackToSetup = () => {
    setError('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-black">
                <Settings className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase text-white">Host Question Editor</h1>
                <p className="text-xs text-slate-400">Create tech clues & hidden words for the competition</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBulkMode(!bulkMode)}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-amber-400" /> {bulkMode ? "Switch to Editor" : "Bulk Paste Format"}
            </button>
          </div>

          {/* Error Alert Box with Reload & Retry */}
          {error && (
            <div className="mb-6 p-5 rounded-2xl bg-red-950 border border-red-500 text-red-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-base text-red-300">
                <AlertTriangle className="w-5 h-5 shrink-0" /> Unable to start the game
              </div>
              <p className="text-xs text-red-200 leading-relaxed">{error}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReloadPage}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Reload Page & Retry
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Now
                </button>
                <button
                  type="button"
                  onClick={handleBackToSetup}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Setup
                </button>
              </div>
            </div>
          )}

          {/* Game Duration & Max Members settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                <Clock className="w-4 h-4 text-amber-400" /> Question Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 45, 60, 90].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRoundDuration(t)}
                    className={`py-2 rounded-lg font-bold text-xs border transition-all ${
                      roundDuration === t
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                <Users className="w-4 h-4 text-blue-400" /> Max Players Per Team
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxMembersPerTeam}
                onChange={(e) => setMaxMembersPerTeam(parseInt(e.target.value) || 10)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {bulkMode ? (
            <div className="space-y-4 mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Bulk Questions Format (WORD | Clue)
              </label>
              <textarea
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyBulk}
                className="px-6 py-3 rounded-xl bg-amber-500 text-black font-black uppercase text-sm hover:bg-amber-400"
              >
                Parse & Load Questions List
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Add Question / Tech Word</h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Tech Word (e.g. PYTHON)"
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono font-bold text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Clue / Question description"
                      value={newClue}
                      onChange={(e) => setNewClue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full h-full py-3 rounded-xl bg-amber-500 text-black font-black text-sm flex items-center justify-center gap-1 hover:bg-amber-400"
                    >
                      <Plus className="w-4 h-4" /> ADD
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Game Question Sequence ({questions.length} Items)
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-mono font-black text-base text-amber-400 tracking-wider">{q.word}</div>
                          <div className="text-xs text-slate-300 font-medium">{q.clue}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === questions.length - 1}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(q)}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading || questions.length === 0}
            className="w-full py-4 rounded-2xl font-black text-lg bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" /> Initializing Competition...
              </span>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" /> LAUNCH HANGMAN CHALLENGE SESSION
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};
