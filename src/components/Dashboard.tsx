import { Test, Attempt, UserType } from '../types';
import { 
  Plus, 
  Play, 
  BarChart2, 
  Clock, 
  Shuffle, 
  Award, 
  Percent, 
  BookOpen, 
  ClipboardCheck, 
  ArrowRight, 
  AlertCircle, 
  Settings, 
  FileText,
  Copy,
  Trash2,
  CheckCircle,
  HelpCircle,
  Calendar,
  History
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  currentUser: UserType;
  tests: Test[];
  attempts: Attempt[];
  onCreateNewTest: () => void;
  onTakeTest: (testId: string) => void;
  onMapAnswers: (testId: string) => void;
  onEditTest: (testId: string) => void;
  onDeleteTest: (testId: string) => void;
  onDuplicateTest: (testId: string) => void;
  onViewAnalytics: () => void;
  onViewResults: (attemptId: string) => void;
}

export default function Dashboard({
  currentUser,
  tests,
  attempts,
  onCreateNewTest,
  onTakeTest,
  onMapAnswers,
  onEditTest,
  onDeleteTest,
  onDuplicateTest,
  onViewAnalytics,
  onViewResults
}: DashboardProps) {
  // Filter attempts for the current active user
  const userAttempts = attempts.filter(att => att.user === currentUser);
  
  // Calculate stats for active user
  const totalAttempts = userAttempts.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(userAttempts.reduce((acc, att) => acc + att.score, 0) / totalAttempts) 
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...userAttempts.map(att => att.score)) 
    : 0;

  const publishedTests = tests.filter(t => t.status === 'published');
  const otherTests = tests.filter(t => t.status !== 'published');

  // Format date helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format relative time helper
  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return formatDate(timestamp);
  };

  return (
    <div className="space-y-8 py-2" id="dashboard-root">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.04),transparent)] pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-600">
            <Award className="w-3.5 h-3.5" />
            <span>Workspace: {currentUser === 'Me' ? 'Personal' : currentUser === 'Guest' ? 'Guest' : `${currentUser}'s Shared Workspace`}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900">
            Welcome, {currentUser === 'Me' ? 'Aayushi' : currentUser}!
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Create customizable exams, map correct answers directly from your notebook, shuffle options automatically, and track metrics.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onCreateNewTest}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs tracking-wide shadow-sm transition-all flex items-center gap-1.5"
              id="dashboard-cta-create"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Test</span>
            </button>
            <button
              onClick={onViewAnalytics}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-medium text-xs tracking-wide transition-all border border-slate-200 flex items-center gap-1.5"
              id="dashboard-cta-analytics"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-statistics">
        {/* Stat 1: Attempts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Attempts</p>
            <p className="text-3xl font-bold text-slate-900">{totalAttempts}</p>
          </div>
          <p className="text-emerald-600 text-[10px] font-semibold mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Active user tracking
          </p>
        </div>

        {/* Stat 2: Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Avg Score</p>
            <p className="text-3xl font-bold text-slate-900">
              {totalAttempts > 0 ? `${averageScore}%` : '0%'}
            </p>
          </div>
          <p className="text-indigo-600 text-[10px] font-semibold mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            Performance indicator
          </p>
        </div>

        {/* Stat 3: Best Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Best Score</p>
            <p className="text-3xl font-bold text-slate-900">
              {totalAttempts > 0 ? `${bestScore}%` : '0%'}
            </p>
          </div>
          <p className="text-amber-600 text-[10px] font-semibold mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            Top submission score
          </p>
        </div>

        {/* Stat 4: Available Exams */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Tests Published</p>
            <p className="text-3xl font-bold text-slate-900">{publishedTests.length}</p>
          </div>
          <p className="text-slate-500 text-[10px] font-semibold mt-2 flex items-center gap-1 font-mono">
            Offline Storage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Published Exams & Manage Drafts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Published Exams Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                <span>Published Exams</span>
                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {publishedTests.length}
                </span>
              </h3>
            </div>

            {publishedTests.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No published exams available yet.</p>
                <p className="text-slate-400 text-xs mt-1">Create an exam and map its answers to publish it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="published-tests-grid">
                {publishedTests.map(test => {
                  const userTestAttempts = userAttempts.filter(att => att.testId === test.id);
                  const hasTaken = userTestAttempts.length > 0;
                  const maxPercent = hasTaken ? Math.max(...userTestAttempts.map(a => a.score)) : 0;

                  return (
                    <motion.div
                      key={test.id}
                      layoutId={`test-${test.id}`}
                      className="notion-card p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {test.title}
                          </h4>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full shrink-0 border border-indigo-100/50">
                            PUBLISHED
                          </span>
                        </div>

                        {/* Test Attributes */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs">
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            {test.questions.length} Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {test.timer > 0 ? `${test.timer}m` : 'No Timer'}
                          </span>
                          {(test.shuffleQuestions || test.shuffleOptions) && (
                            <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium text-[10px]">
                              <Shuffle className="w-2.5 h-2.5" />
                              Shuffling
                            </span>
                          )}
                        </div>

                        {/* User Record */}
                        {hasTaken && (
                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-between text-xs mt-2">
                            <span className="text-slate-500 font-medium">Your Best Score:</span>
                            <span className={`font-bold ${maxPercent >= 80 ? 'text-emerald-600' : maxPercent >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {maxPercent}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                        {/* Management menu */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDuplicateTest(test.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Duplicate Exam"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTest(test.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Play action */}
                        <button
                          onClick={() => onTakeTest(test.id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs tracking-wide shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all"
                        >
                          <span>Start Exam</span>
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drafts & Pending Mapping Panel */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              <span>Drafts & Pending Mapping</span>
              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {otherTests.length}
              </span>
            </h3>

            {otherTests.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No pending drafts. All created exams are published!</p>
            ) : (
              <div className="space-y-3" id="draft-tests-list">
                {otherTests.map(test => {
                  const isPendingMap = test.status === 'pending_mapping';
                  return (
                    <div
                      key={test.id}
                      className="notion-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-semibold text-slate-800">{test.title}</h4>
                          <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                            isPendingMap 
                              ? 'bg-amber-50 text-amber-600 border-amber-100' 
                              : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                            {isPendingMap ? 'PENDING MAPPING' : 'DRAFT'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-xs">
                          <span>{test.questions.length} Questions</span>
                          <span>•</span>
                          <span>Created {formatTimeAgo(test.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        {/* Duplicate and Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDuplicateTest(test.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Duplicate Test"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTest(test.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Test"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTest(test.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 text-xs font-semibold px-2 py-1"
                            title="Edit Questions"
                          >
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Main Call to action */}
                        {isPendingMap ? (
                          <button
                            onClick={() => onMapAnswers(test.id)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-semibold text-xs tracking-wide shadow-sm flex items-center gap-1.5 transition-all"
                          >
                            <span>Map Answers</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onMapAnswers(test.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs tracking-wide flex items-center gap-1.5 transition-all"
                          >
                            <span>Set Key</span>
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Attempts Log */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Recent Attempts</span>
            <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {userAttempts.length}
            </span>
          </h3>

          {userAttempts.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50">
              <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-medium">No attempts logged yet.</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Start an exam to begin tracking scores.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="recent-attempts-list">
              {userAttempts.slice(0, 8).map(attempt => {
                return (
                  <div
                    key={attempt.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-800 truncate" title={attempt.testTitle}>
                        {attempt.testTitle}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatTimeAgo(attempt.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className={`text-sm font-extrabold tracking-tight block ${
                          attempt.score >= 80 
                            ? 'text-emerald-600' 
                            : attempt.score >= 50 
                              ? 'text-amber-500' 
                              : 'text-rose-500'
                        }`}>
                          {attempt.score}%
                        </span>
                        <span className="text-[9px] font-medium text-slate-400">
                          {attempt.correctCount}/{attempt.totalQuestions} Right
                        </span>
                      </div>
                      
                      <button
                        onClick={() => onViewResults(attempt.id)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg hover:text-slate-800 transition-colors"
                        title="Review Results"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
