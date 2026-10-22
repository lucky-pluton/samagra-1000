import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Target,
  Crown,
  Medal,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { StudentProgress, Submission, Profile } from '../../../shared/types';

export const DashboardPage: React.FC = () => {
  const { profile, updateDisplayName } = useAuth();
  const [stats, setStats] = useState<{
    profile: Profile;
    progress: StudentProgress;
    rank: number;
    recentSubmissions: Submission[];
    completionPercentage: number;
    isQualified: boolean;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await fetchApi<{
        success: boolean;
        stats: {
          profile: Profile;
          progress: StudentProgress;
          rank: number;
          recentSubmissions: Submission[];
          completionPercentage: number;
          isQualified: boolean;
        };
      }>('/dashboard/stats');

      if (res.stats) {
        setStats(res.stats);
        setNewName(res.stats.profile?.display_name || '');
      }
    } catch (err) {
      console.error('[Dashboard Load Error]', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    const res = await updateDisplayName(newName);
    if (res.error) {
      setNameError(res.error);
    } else {
      setEditingName(false);
      loadDashboard();
    }
  };

  const milestones = [
    { id: 'first_accepted', name: 'First Accepted', target: 1, icon: Zap },
    { id: 'milestone_10', name: 'Getting Traction', target: 10, icon: Flame },
    { id: 'milestone_50', name: 'Consistent Coder', target: 50, icon: Target },
    { id: 'milestone_100', name: 'Century Mark', target: 100, icon: ShieldCheck },
    { id: 'milestone_250', name: 'Quarter Way', target: 250, icon: Medal },
    { id: 'milestone_500', name: 'Halfway Hero', target: 500, icon: Trophy },
    { id: 'milestone_750', name: 'The Final Stretch', target: 750, icon: Award },
    { id: 'milestone_1000', name: 'Samagra Scholar', target: 1000, icon: Crown }
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading Student Dashboard...
      </div>
    );
  }

  const prog = stats?.progress;
  const completed = prog?.completed_count || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile & Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {editingName ? (
              <form onSubmit={handleUpdateName} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-1 text-sm bg-slate-950 border border-indigo-500 rounded-lg text-white font-bold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="px-2 py-1 text-slate-400 text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h1 className="text-2xl font-black text-white">
                  {stats?.profile?.display_name || profile?.display_name}
                </h1>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Edit
                </button>
              </>
            )}
            {stats?.profile?.is_verified && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Student
              </span>
            )}
          </div>
          {nameError && <div className="text-xs text-rose-400">{nameError}</div>}
          <p className="text-xs text-slate-400">
            {completed === 0
              ? 'Your journey has started. Solve your first problem to appear on the leaderboard.'
              : completed < 500
              ? 'Every accepted solution brings you closer. Keep up the steady momentum!'
              : completed < 1000
              ? 'Halfway there — keep going! The finish line is in sight.'
              : 'All 1,000 questions completed! Your free Samagra seat is qualified.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to={`/problems/${prog?.current_unlocked_sequence || 1}`}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume Challenge #{prog?.current_unlocked_sequence || 1}</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Total Completed</div>
          <div className="text-3xl font-black text-white mt-1 font-mono">
            {completed}{' '}
            <span className="text-xs text-slate-500 font-sans font-normal">/ 1,000</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${stats?.completionPercentage || 0}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {stats?.completionPercentage}% completed
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Leaderboard Rank</div>
          <div className="text-3xl font-black text-amber-400 mt-1 font-mono">
            #{stats?.rank || 1}
          </div>
          <div className="text-xs text-slate-400 mt-3 flex items-center space-x-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{prog?.total_points.toLocaleString()} points accumulated</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Current Unlocked</div>
          <div className="text-3xl font-black text-indigo-400 mt-1 font-mono">
            #{prog?.current_unlocked_sequence || 1}
          </div>
          <div className="text-xs text-slate-400 mt-3">
            Stage {Math.ceil((prog?.current_unlocked_sequence || 1) / 100)} of 10
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Scholarship Seat</div>
          <div className="text-2xl font-black mt-1">
            {stats?.isQualified ? (
              <span className="text-emerald-400">QUALIFIED</span>
            ) : (
              <span className="text-slate-300">
                {1000 - completed} to go
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-3">
            {stats?.isQualified ? (
              <Link to="/scholarship" className="text-emerald-400 font-semibold hover:underline">
                View Certificate →
              </Link>
            ) : (
              <span>Automatic upon 1,000</span>
            )}
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Bars */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Difficulty Progression
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 uppercase">Easy Tier</span>
              <span className="font-mono text-slate-300">{prog?.easy_completed || 0} / 300</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(((prog?.easy_completed || 0) / 300) * 100).toFixed(1)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 uppercase">Medium Tier</span>
              <span className="font-mono text-slate-300">{prog?.medium_completed || 0} / 400</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${(((prog?.medium_completed || 0) / 400) * 100).toFixed(1)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-400 uppercase">Hard Tier</span>
              <span className="font-mono text-slate-300">{prog?.hard_completed || 0} / 300</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${(((prog?.hard_completed || 0) / 300) * 100).toFixed(1)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Achievements */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Challenge Milestones
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {milestones.map((m) => {
            const Icon = m.icon;
            const isUnlocked = completed >= m.target;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/80 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                    : 'bg-slate-950/40 border-slate-900 opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center ${
                    isUnlocked
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">{m.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {m.target} Problems
                </div>
                {isUnlocked ? (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Earned
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] text-slate-600">
                    Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Submissions Activity */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Recent Activity
        </h3>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          {!stats?.recentSubmissions || stats.recentSubmissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No code submissions recorded yet. Start Challenge #1 to begin tracking your activity.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 text-xs">
              {stats.recentSubmissions.map((sub) => (
                <div key={sub.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        sub.status === 'Accepted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <span className="font-semibold text-white">Problem #{sub.problem_id}</span>
                    <span className="text-slate-400 font-mono">
                      {sub.passed_count}/{sub.total_tests} passed
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(sub.submitted_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
