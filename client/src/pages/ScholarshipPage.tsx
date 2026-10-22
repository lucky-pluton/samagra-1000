import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, ArrowRight, Download, ExternalLink, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { StudentProgress, ScholarshipQualification } from '../../../shared/types';

export const ScholarshipPage: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [qualification, setQualification] = useState<ScholarshipQualification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        setLoading(true);
        if (user) {
          const [prog, qual] = await Promise.all([
            api.getProgress(user.id),
            api.getScholarshipStatus(user.id)
          ]);
          setProgress(prog);
          setQualification(qual);
        }
      } catch (err: any) {
        console.error('Error fetching scholarship status:', err);
        setError(err.message || 'Failed to load scholarship details');
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center py-20 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Verifying scholarship records with backend...</p>
        </div>
      </div>
    );
  }

  const isQualified = qualification?.qualification_status === 'qualified' || progress?.completed_count === 1000;
  const completedCount = progress?.completed_count || 0;
  const pct = Math.min(100, Math.round((completedCount / 1000) * 100));

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb / Top badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Scholarship Qualification</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Guaranteed Policy — Zero Seat Caps
          </span>
        </div>

        {isQualified ? (
          /* QUALIFIED CERTIFICATE & CELEBRATION VIEW */
          <div className="space-y-8 animate-fadeIn">
            {/* Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-slate-900 border-2 border-amber-500/40 p-8 sm:p-12 shadow-2xl shadow-amber-500/10 text-center">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="inline-flex p-4 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner mb-6 animate-bounce">
                <Award className="w-14 h-14" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                YOU DID IT. ALL 1,000 QUESTIONS COMPLETED!
              </h1>
              <p className="text-lg sm:text-xl text-amber-200/90 max-w-2xl mx-auto leading-relaxed mb-6">
                You demonstrated your commitment through 1,000 verified Python challenges. You’ve officially earned your guaranteed Samagra scholarship seat.
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-amber-500/30 text-xs text-amber-300 font-mono">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Verification Hash: {qualification?.id || 'SAMAGRA-QUAL-VERIFIED-1000'}</span>
              </div>
            </div>

            {/* Official Credential Certificate Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl backdrop-blur-md relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
                <div>
                  <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase mb-1">
                    Samagra 1000 — Official Seat Award
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {user?.display_name || user?.email || 'Samagra Scholar'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Account: <span className="font-mono text-slate-300">{user?.id}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Seat Confirmed
                  </span>
                  <button 
                    onClick={() => window.print()}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Print or Save Certificate"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Verified Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20 text-center">
                  <span className="text-xs text-slate-400 font-medium">Easy Challenges</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">300 / 300</p>
                  <span className="text-[11px] text-emerald-500/70 font-mono">100% Passed</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/20 text-center">
                  <span className="text-xs text-slate-400 font-medium">Medium Challenges</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">400 / 400</p>
                  <span className="text-[11px] text-amber-500/70 font-mono">100% Passed</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20 text-center">
                  <span className="text-xs text-slate-400 font-medium">Hard Challenges</span>
                  <p className="text-2xl font-black text-purple-400 mt-1">300 / 300</p>
                  <span className="text-[11px] text-purple-500/70 font-mono">100% Passed</span>
                </div>
              </div>

              {/* Verification Details */}
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Verified Completion Timestamp
                  </span>
                  <span className="font-mono text-slate-200">
                    {qualification?.qualified_at ? new Date(qualification.qualified_at).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    Automated Test Suite Verification
                  </span>
                  <span className="text-emerald-400 font-medium">1,000 / 1,000 Verified Accepted</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    Program Affiliation
                  </span>
                  <span className="text-slate-200">ANNAM.AI Foundation &amp; Vicharanashala Lab</span>
                </div>
              </div>

              {/* Next Steps for Qualified Scholar */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 text-center sm:text-left">
                  Our admissions office has received your qualification token. You will receive program onboarding details via email.
                </p>
                <a
                  href="https://samagra.annam.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
                >
                  Visit Samagra Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* IN-PROGRESS SCHOLARSHIP TRACKER */
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
                <Award className="w-10 h-10" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Your Samagra Scholarship Tracker
              </h1>
              <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed mb-8">
                Complete all 1,000 Python questions to automatically unlock your 100% free Samagra seat. No interview. No discretionary selection. Pure verified skill.
              </p>

              {/* Main Progress Ring / Bar */}
              <div className="max-w-md mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800/80 mb-8">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-semibold text-slate-300">Challenge Completion</span>
                  <span className="font-mono font-bold text-amber-400">{completedCount} / 1,000 Questions</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>{pct}% Qualified</span>
                  <span>{1000 - completedCount} Questions Remaining</span>
                </div>
              </div>

              {/* Call to action */}
              <Link
                to={progress ? `/problems/${progress.current_unlocked_sequence}` : '/problems'}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <span>Continue Solving Problem #{progress?.current_unlocked_sequence || 1}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Program Principles Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
                <div className="text-amber-400 font-bold text-base mb-2">1. No Separate Interview</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your code speaks for itself. Passing all test suites across the 1,000 questions is the sole qualification metric.
                </p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
                <div className="text-emerald-400 font-bold text-base mb-2">2. Zero Hidden Caps</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every single student who solves all 1,000 challenges earns a seat. There are no limits or cutoff ranks.
                </p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
                <div className="text-purple-400 font-bold text-base mb-2">3. ₹0 Free Participation</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The ₹1,000 challenge value is assigned for educational worth. Students pay nothing to participate or qualify.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
