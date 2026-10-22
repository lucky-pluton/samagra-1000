import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Unlock,
  CheckCircle,
  Play,
  Search,
  Filter,
  Flame,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import type { Problem, StudentProgress } from '../../../shared/types';

export const ProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Array<Problem & { is_unlocked: boolean; is_completed: boolean }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userProgress, setUserProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [probRes, statsRes] = await Promise.all([
        fetchApi<{ success: boolean; problems: Array<Problem & { is_unlocked: boolean; is_completed: boolean }> }>('/problems'),
        fetchApi<{ success: boolean; stats: { progress: StudentProgress } }>('/dashboard/stats')
      ]);

      if (probRes.problems) setProblems(probRes.problems);
      if (statsRes.stats?.progress) setUserProgress(statsRes.stats.progress);
    } catch (err) {
      console.error('[Problems Load Error]', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProblems = problems.filter((p) => {
    if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
    if (stageFilter !== 'all' && p.stage.toString() !== stageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTopic = p.topic.toLowerCase().includes(q);
      const matchSeq = p.sequence_number.toString() === q;
      if (!matchTitle && !matchTopic && !matchSeq) return false;
    }
    return true;
  });

  const currentUnlocked = userProgress?.current_unlocked_sequence || 1;
  const currentProblem = problems.find((p) => p.sequence_number === currentUnlocked) || problems[0];

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Resume CTA Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Sequential Learning Journey</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            1,000 Python Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Each problem you solve unlocks the next. Progress persistently toward the 1,000 milestone and earn your guaranteed Samagra scholarship seat.
          </p>
        </div>

        {currentProblem && (
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex items-center space-x-4 shadow-xl shrink-0">
            <div>
              <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                Current Objective
              </div>
              <div className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[250px]">
                #{currentProblem.sequence_number}. {currentProblem.title}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {currentProblem.topic} • {currentProblem.points} pts
              </div>
            </div>
            <Link
              to={`/problems/${currentProblem.id}`}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105"
            >
              <span>{userProgress && userProgress.completed_count > 0 ? 'Resume' : 'Start'}</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </Link>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, topic, or challenge #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['all', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  difficultyFilter === d
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d === 'all' ? 'All Tiers' : d}
              </button>
            ))}
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Stages (1-10)</option>
            {Array.from({ length: 10 }).map((_, i) => (
              <option key={i + 1} value={(i + 1).toString()}>
                Stage {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem Cards / List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading 1,000-Question Challenge Bank...
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
          No questions matched your current filter criteria.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProblems.map((prob) => {
            const isCurrent = prob.sequence_number === currentUnlocked && !prob.is_completed;
            const isUnlocked = prob.is_unlocked;

            return (
              <div
                key={prob.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-indigo-950/20 border-indigo-500/60 shadow-lg shadow-indigo-900/10'
                    : isUnlocked
                    ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    : 'bg-slate-950/40 border-slate-900/80 opacity-60'
                }`}
              >
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                      prob.is_completed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isUnlocked
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    {prob.is_completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isUnlocked ? (
                      `#${prob.sequence_number}`
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`text-sm font-semibold ${
                          isUnlocked ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {prob.title}
                      </h3>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white animate-pulse">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                      <span>{prob.topic}</span>
                      <span>•</span>
                      <span>Stage {prob.stage}</span>
                      <span>•</span>
                      <span className="font-mono text-indigo-300">{prob.points} pts</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${getDifficultyBadge(
                      prob.difficulty
                    )}`}
                  >
                    {prob.difficulty}
                  </span>

                  {isUnlocked ? (
                    <Link
                      to={`/problems/${prob.id}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                        prob.is_completed
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      <span>{prob.is_completed ? 'Review' : 'Solve'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg text-xs text-slate-600 bg-slate-900 flex items-center space-x-1 cursor-not-allowed">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
