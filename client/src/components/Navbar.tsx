import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Trophy, User, Award, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-indigo-400 bg-slate-900/80 border-indigo-500/30'
      : 'text-slate-300 hover:text-white hover:bg-slate-900/50 border-transparent';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                    Samagra 1000
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Free Challenge
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  1,000 Questions. Earn Your Samagra Seat.
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/problems"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center space-x-1.5 ${isActive('/problems')}`}
            >
              <Terminal className="w-4 h-4" />
              <span>Challenges</span>
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center space-x-1.5 ${isActive('/leaderboard')}`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center space-x-1.5 ${isActive('/dashboard')}`}
            >
              <User className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/scholarship"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center space-x-1.5 ${isActive('/scholarship')}`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Scholarship</span>
            </Link>
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center space-x-1.5 ${isActive('/admin')}`}
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Admin</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {profile ? (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-200 flex items-center justify-end space-x-1">
                    <span>{profile.display_name}</span>
                    {profile.is_verified && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Verified Account" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {profile.email || 'Verified Student'}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
