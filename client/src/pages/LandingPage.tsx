import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Trophy,
  Award,
  CheckCircle2,
  ArrowRight,
  Code2,
  Zap,
  ShieldCheck,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import type { LeaderboardEntry } from '../../../shared/types';

export const LandingPage: React.FC = () => {
  const [topLeaders, setTopLeaders] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(true);

  useEffect(() => {
    async function loadPreview() {
      try {
        const res = await fetchApi<{ success: boolean; leaderboard: LeaderboardEntry[] }>('/leaderboard?type=all-time');
        if (res.leaderboard) {
          setTopLeaders(res.leaderboard.slice(0, 5));
        }
      } catch {
        setTopLeaders([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    }
    loadPreview();
  }, []);

  return (
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300 shadow-inner">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">ANNAM.AI & Vicharanashala Educational Initiative</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            1,000 Questions. One Journey.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              Earn Your Samagra Seat.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
            Build your Python problem-solving skills one challenge at a time. Progress from easy to advanced problems, track your achievements, and earn your free Samagra seat by completing all 1,000 questions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/problems"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-base shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/problems"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base transition-all flex items-center justify-center space-x-2"
            >
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span>Explore the Challenges</span>
            </Link>
          </div>

          {/* Three Prominent Facts Banner */}
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">1,000</div>
              <div className="text-sm font-semibold text-slate-300">Python Coding Questions</div>
              <p className="text-xs text-slate-400 mt-2">
                Carefully structured progression from fundamentals to complex data structures and dynamic programming.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">₹1,000</div>
              <div className="text-sm font-semibold text-slate-300">Assigned Challenge Value</div>
              <p className="text-xs text-slate-400 mt-2">
                Assigned at ₹1 per problem as an educational value benchmark. <strong>Students pay ₹0</strong>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">100% Free</div>
              <div className="text-sm font-semibold text-slate-300">Guaranteed Seat Upon 1,000</div>
              <p className="text-xs text-slate-400 mt-2">
                No application fees, no interviews, and no undisclosed scholarship caps. Complete all 1,000 and qualify.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Transparent Progression
          </h2>
          <h3 className="text-3xl font-bold text-white">How The Journey Works</h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Four clear steps between your first code submission and your guaranteed seat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative">
            <div className="text-3xl font-black text-slate-800 absolute top-4 right-4">01</div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200 mb-4 font-bold text-sm">
              1
            </div>
            <h4 className="font-bold text-white text-base mb-2">Sign Up With Email</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Register free with your email, choose your unique public display name, and verify your account.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative">
            <div className="text-3xl font-black text-slate-800 absolute top-4 right-4">02</div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200 mb-4 font-bold text-sm">
              2
            </div>
            <h4 className="font-bold text-white text-base mb-2">Solve & Pass Tests</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Write Python code in Monaco Editor. Test with public examples, then submit against the isolated judge suite.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative">
            <div className="text-3xl font-black text-slate-800 absolute top-4 right-4">03</div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200 mb-4 font-bold text-sm">
              3
            </div>
            <h4 className="font-bold text-white text-base mb-2">Sequential Unlocking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every accepted solution unlocks the next problem, climbing from 300 Easy through 400 Medium to 300 Hard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-emerald-500/30 bg-emerald-950/10 relative">
            <div className="text-3xl font-black text-emerald-900/40 absolute top-4 right-4">04</div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 font-bold text-sm">
              4
            </div>
            <h4 className="font-bold text-white text-base mb-2">Earn Your Samagra Seat</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upon verifying completion of problem 1,000, your free scholarship seat is automatically recorded and certified.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Difficulty Breakdown */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 md:p-12 rounded-3xl bg-slate-900/50 border border-slate-800">
          <div className="text-center space-y-2 mb-10">
            <h3 className="text-2xl font-bold text-white">Three Calibrated Difficulty Tiers</h3>
            <p className="text-sm text-slate-400">
              Balanced to teach deep fundamental intuition before accelerating into advanced algorithmic mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                  Easy Tier
                </span>
                <span className="text-xl font-extrabold text-white">300 Questions</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Variables, arithmetic, conditionals, loops, string operations, lists, tuples, dictionaries, sets, basic recursion, and fundamental math.
              </p>
              <div className="text-xs text-slate-500 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>10 Stages • 10 Points each</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                  Medium Tier
                </span>
                <span className="text-xl font-extrabold text-white">400 Questions</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Two pointers, sliding window, binary search, stacks & queues, prefix sums, backtracking, tree traversals, greedy intervals, and basic DP.
              </p>
              <div className="text-xs text-slate-500 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>10 Stages • 20 Points each</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/20">
                  Hard Tier
                </span>
                <span className="text-xl font-extrabold text-white">300 Questions</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Advanced 2D/grid dynamic programming, shortest-path algorithms, DSU, segment trees, combinatorial search, string KMP, and complex edge cases.
              </p>
              <div className="text-xs text-slate-500 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                <span>10 Stages • 30 Points each</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Leaderboard Preview */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Live Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic rankings based on verified completed questions and difficulty-weighted score.
            </p>
          </div>
          <Link
            to="/leaderboard"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loadingLeaderboard ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading live standings...</div>
          ) : topLeaders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Zap className="w-8 h-8 text-indigo-400 mx-auto" />
              <h4 className="text-base font-semibold text-white">
                Be among the first students to start the Samagra 1000 journey.
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No one has verified solutions yet. Start with Challenge #1 now to claim the #1 spot on the leaderboard!
              </p>
              <div className="pt-2">
                <Link
                  to="/problems"
                  className="inline-flex px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Solve Question #1
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Coder</th>
                    <th className="py-3 px-4">Completed</th>
                    <th className="py-3 px-4">Points</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Seat Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topLeaders.map((leader) => (
                    <tr key={leader.user_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        {leader.rank === 1 ? '🥇 1' : leader.rank === 2 ? '🥈 2' : leader.rank === 3 ? '🥉 3' : `#${leader.rank}`}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {leader.display_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-300">
                        {leader.completed_count} / 1000
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-400">
                        {leader.total_points.toLocaleString()} pts
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${leader.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{leader.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {leader.is_qualified ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            Qualified
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* 5. Policy & Verification Guarantees */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Why Samagra 1000 is Different</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">Zero Subjective Selection:</strong>
              No interview rounds, no essay evaluations, and no discretionary committee voting. If you solve 1,000 problems, you are qualified.
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">Zero Arbitrary Seat Cap:</strong>
              The scholarship reward is open-ended. Every student who satisfies the 1,000-challenge requirement qualifies for a free seat.
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">Private Automated Judge:</strong>
              Solutions are verified against thorough hidden test cases to guarantee authenticity, correctness, and performance.
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">100% Free Participation:</strong>
              No purchase is required to unlock problems, gain retry attempts, or claim your seat qualification certificate.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
