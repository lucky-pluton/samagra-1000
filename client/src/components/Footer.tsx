import React from 'react';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-base">Samagra 1000</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Crafting Initiative
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Organized for Samagra by <strong>ANNAM.AI Foundation</strong> (Center of Excellence for AI in Agriculture at IIT Ropar) in collaboration with <strong>Vicharanashala Lab for Education Design</strong>.
            </p>
            <div className="pt-2">
              <a
                href="https://samagra.annam.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Visit Official Samagra Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Guaranteed Scholarship Rules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Exactly 1,000 verified Python challenges</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% Free participation & verification</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>No arbitrary interview or hidden cap</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Automatic system-verified seat qualification</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Program Transparency
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="hover:text-slate-200 cursor-pointer">Privacy Notice & Leaderboard Policy</span>
              </li>
              <li>
                <span className="hover:text-slate-200 cursor-pointer">Judge Execution Limits & Sandboxing</span>
              </li>
              <li>
                <span className="hover:text-slate-200 cursor-pointer">Academic Integrity & Appeal Process</span>
              </li>
              <li>
                <span className="hover:text-slate-200 cursor-pointer">Terms of Participation</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Samagra 1000. Built for ambitious programmers seeking real mastery.</p>
          <p className="flex items-center space-x-1">
            <span>Your effort is your investment. Your skills are your reward.</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
