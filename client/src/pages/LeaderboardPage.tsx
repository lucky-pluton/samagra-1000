import React, { useEffect, useState } from 'react';
import { Trophy, Award, Calendar, Zap, Shield, Search } from 'lucide-react';
import { fetchApi } from '../lib/api';
import type { LeaderboardEntry } from '../../../shared/types';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<'all-time' | 'weekly'>('all-time');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadLeaderboard(tab);
  }, [tab]);

  async function loadLeaderboard(type: 'all-time' | 'weekly') {
    setLoading(true);
    try {
      const res = await fetchApi<{ success: boolean; leaderboard: LeaderboardEntry[] }>(
        `/leaderboard?type=${type}`
      );
      if (res.leaderboard) {
        setLeaderboard(res.leaderboard);
      }
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = leaderboard.filter((entry) => {
    if (!searchTerm.trim()) return true;
    return entry.display_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
          <Trophy className="w-3.5 h-3.5" />
          <span>Verified Student Standings</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Public Leaderboard</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Deterministic rankings updated in real time. Ranked by distinct verified completed challenges, then difficulty-weighted score, and timestamp.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('all-time')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              tab === 'all-time'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>All-Time Challenge</span>
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              tab === 'weekly'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Sprint</span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Fetching verified standings from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Zap className="w-8 h-8 text-indigo-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">
              Be among the first students to start the Samagra 1000 journey.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No students have completed questions in this view yet. Start now to set the benchmark!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Completed</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Breakdown (E / M / H)</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Seat Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((entry) => (
                  <tr key={entry.user_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-200">
                      {entry.rank === 1 ? (
                        <span className="text-amber-400 flex items-center space-x-1 font-bold">
                          <span>🥇 #1</span>
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="text-slate-300 flex items-center space-x-1 font-bold">
                          <span>🥈 #2</span>
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="text-amber-600 flex items-center space-x-1 font-bold">
                          <span>🥉 #3</span>
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {entry.display_name}
                    </td>
                    <td className="py-4 px-4 font-mono text-indigo-300 font-bold">
                      {entry.completed_count} / 1000
                    </td>
                    <td className="py-4 px-4 font-mono text-amber-400 font-semibold">
                      {entry.total_points.toLocaleString()} pts
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      <span className="text-emerald-400">{entry.easy_completed}</span>
                      <span className="text-slate-600"> / </span>
                      <span className="text-amber-400">{entry.medium_completed}</span>
                      <span className="text-slate-600"> / </span>
                      <span className="text-rose-400">{entry.hard_completed}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                            style={{ width: `${entry.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {entry.progress_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {entry.is_qualified ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center space-x-1 w-fit">
                          <Award className="w-3.5 h-3.5" />
                          <span>Qualified</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">In Progress</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tie-breaking rules notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
        <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          <strong>Official Tie-Breaking Protocol:</strong> 1) Number of distinct verified challenges completed. 2) Difficulty-weighted score (Easy = 10, Medium = 20, Hard = 30 pts). 3) Timestamp of the verified solution. Failed attempts are not penalized.
        </p>
      </div>
    </div>
  );
};
