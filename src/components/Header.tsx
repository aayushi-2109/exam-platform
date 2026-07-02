import { UserType } from '../types';
import { User, ShieldAlert, Sparkles, GraduationCap } from 'lucide-react';

interface HeaderProps {
  currentUser: UserType;
  onUserChange: (user: UserType) => void;
  onGoHome: () => void;
}

export default function Header({ currentUser, onUserChange, onGoHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={onGoHome} 
          className="flex items-center gap-2.5 cursor-pointer group"
          id="header-brand-container"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Examly</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                OFFLINE
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-sans tracking-wide">Notion-Style Exam Engine</p>
          </div>
        </div>

        {/* User Switcher */}
        <div className="flex items-center gap-3" id="header-user-switcher">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Active Workspace</span>
            <span className="text-sm font-semibold text-slate-700">
              {currentUser === 'Me' ? 'My Workspace' : "Friend's Workspace"}
            </span>
          </div>
          
          <div className="flex bg-slate-100 p-1.2 rounded-xl border border-slate-200">
            <button
              onClick={() => onUserChange('Me')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentUser === 'Me'
                  ? 'bg-white text-indigo-600 shadow-sm border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="user-me-btn"
            >
              <User className="w-3.5 h-3.5" />
              <span>Me</span>
            </button>
            <button
              onClick={() => onUserChange('Friend')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentUser === 'Friend'
                  ? 'bg-white text-indigo-600 shadow-sm border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="user-friend-btn"
            >
              <User className="w-3.5 h-3.5" />
              <span>Friend</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
