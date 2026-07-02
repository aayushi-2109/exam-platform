import { Attempt, UserType } from '../types';
import { 
  BarChart2, 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  Award, 
  Percent, 
  Calendar,
  CheckCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsViewProps {
  currentUser: UserType;
  attempts: Attempt[];
  onGoHome: () => void;
  onViewAttemptResults: (attemptId: string) => void;
}

export default function AnalyticsView({
  currentUser,
  attempts,
  onGoHome,
  onViewAttemptResults
}: AnalyticsViewProps) {
  // Filter attempts for the current user
  const userAttempts = attempts
    .filter(att => att.user === currentUser)
    .sort((a, b) => b.date - a.date); // Sort newest first

  const chronAttempts = [...userAttempts].sort((a, b) => a.date - b.date); // Sort oldest first for trends

  // Core metrics
  const totalAttempts = userAttempts.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(userAttempts.reduce((acc, att) => acc + att.score, 0) / totalAttempts) 
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...userAttempts.map(att => att.score)) 
    : 0;
  const totalSeconds = userAttempts.reduce((acc, att) => acc + att.timeTaken, 0);

  // Convert seconds to readable text
  const formatTimeSpent = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs % 60}s`;
  };

  // Convert date to readable text
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // SVG Chart Calculation
  const chartHeight = 160;
  const chartPadding = 30;
  
  return (
    <div className="space-y-8 py-6" id="analytics-root">
      {/* Top action header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-150 pb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoHome}
            className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm"
            id="analytics-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Workspace Reports</span>
            <h2 className="font-display font-bold text-slate-850 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>{currentUser === 'Me' ? 'My Analytics' : "Friend's Analytics"}</span>
            </h2>
          </div>
        </div>

        <button
          onClick={onGoHome}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs tracking-wide transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>

      {/* Primary Analytics overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="analytics-overview-metrics">
        {/* Metric 1: Total Attempts */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attempts Logged</span>
            <span className="text-2xl font-bold text-slate-850 tracking-tight font-mono">{totalAttempts}</span>
          </div>
        </div>

        {/* Metric 2: Average Score */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
            <span className="text-2xl font-bold text-slate-850 tracking-tight font-mono">
              {totalAttempts > 0 ? `${averageScore}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Metric 3: Best Score */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High Score</span>
            <span className="text-2xl font-bold text-slate-850 tracking-tight font-mono">
              {totalAttempts > 0 ? `${bestScore}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Metric 4: Total Time Spent */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Spent Test-Taking</span>
            <span className="text-2xl font-bold text-slate-850 tracking-tight font-mono">
              {totalAttempts > 0 ? formatTimeSpent(totalSeconds) : '0s'}
            </span>
          </div>
        </div>
      </div>

      {/* Score Trend Vector Graphic */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Performance Score Trend</span>
        </h3>

        {chronAttempts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            Not enough exam records to draw trend chart. Complete at least one exam!
          </div>
        ) : (
          <div className="pt-2">
            <div className="relative w-full overflow-x-auto">
              <svg 
                className="w-full min-w-[500px]" 
                height={chartHeight + chartPadding} 
                viewBox={`0 0 600 ${chartHeight + chartPadding}`}
              >
                {/* Y Axis reference lines */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = chartPadding + chartHeight * (1 - val / 100);
                  return (
                    <g key={val}>
                      <line
                        x1="45"
                        y1={y}
                        x2="590"
                        y2={y}
                        className="stroke-slate-100"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x="30"
                        y={y + 4}
                        className="fill-slate-400 font-mono text-[9px] text-right font-semibold"
                        textAnchor="end"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Draw line and dots if multiple, else draw bars */}
                {chronAttempts.length === 1 ? (
                  // Single item - draw a clean tall bar
                  <g>
                    <rect
                      x="285"
                      y={chartPadding + chartHeight * (1 - chronAttempts[0].score / 100)}
                      width="30"
                      height={chartHeight * (chronAttempts[0].score / 100)}
                      className="fill-indigo-600/80 hover:fill-indigo-600 cursor-pointer"
                      rx="4"
                    />
                    <text
                      x="300"
                      y={chartPadding + chartHeight * (1 - chronAttempts[0].score / 100) - 6}
                      className="fill-indigo-600 font-mono font-bold text-[10px]"
                      textAnchor="middle"
                    >
                      {chronAttempts[0].score}%
                    </text>
                    <text
                      x="300"
                      y={chartPadding + chartHeight + 16}
                      className="fill-slate-400 font-sans text-[9px] font-semibold"
                      textAnchor="middle"
                    >
                      First attempt
                    </text>
                  </g>
                ) : (
                  // Multiple items - draw a beautiful trend path with shadow curve
                  (() => {
                    const stepX = (600 - 45 - 20) / (chronAttempts.length - 1);
                    const points = chronAttempts.map((att, i) => {
                      const x = 45 + 15 + i * stepX;
                      const y = chartPadding + chartHeight * (1 - att.score / 100);
                      return { x, y, score: att.score, title: att.testTitle };
                    });

                    // Build SVG path definition
                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const fillAreaD = `${pathD} L ${points[points.length - 1].x} ${chartPadding + chartHeight} L ${points[0].x} ${chartPadding + chartHeight} Z`;

                    return (
                      <g>
                        {/* Gradient Area */}
                        <defs>
                          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={fillAreaD} fill="url(#chart-grad)" />

                        {/* Line Stroke */}
                        <path
                          d={pathD}
                          fill="none"
                          className="stroke-indigo-600"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Interactive Data Nodes */}
                        {points.map((p, i) => (
                          <g key={i} className="group/node cursor-pointer">
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="5.5"
                              className="fill-white stroke-indigo-600"
                              strokeWidth="2.5"
                            />
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="9"
                              className="fill-indigo-600/0 hover:fill-indigo-600/10 transition-colors"
                            />
                            
                            {/* Score Text above */}
                            <text
                              x={p.x}
                              y={p.y - 10}
                              className="fill-indigo-700 font-mono font-bold text-[10px] opacity-0 group-hover/node:opacity-100 transition-opacity"
                              textAnchor="middle"
                            >
                              {p.score}%
                            </text>

                            {/* Label underneath */}
                            <text
                              x={p.x}
                              y={chartPadding + chartHeight + 16}
                              className="fill-slate-400 font-sans text-[8px] font-semibold"
                              textAnchor="middle"
                            >
                              Try #{i + 1}
                            </text>
                          </g>
                        ))}
                      </g>
                    );
                  })()
                )}
              </svg>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3">Hover over nodes to inspect test score achievements.</p>
          </div>
        )}
      </div>

      {/* Comprehensive Attempts Log Table */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
          <span>Historical Exam Attempt Logs</span>
        </h3>

        {userAttempts.length === 0 ? (
          <p className="text-slate-400 text-xs italic">No historic attempts recorded in this workspace.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="analytics-attempts-table">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-5 py-3">Exam Title</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="px-5 py-3">Accuracy (Right)</th>
                    <th className="px-5 py-3">Time Taken</th>
                    <th className="px-5 py-3">Completion Date</th>
                    <th className="px-5 py-3 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userAttempts.map(attempt => {
                    return (
                      <tr key={attempt.id} className="hover:bg-slate-50/50 text-xs text-slate-600 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{attempt.testTitle}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono font-bold ${
                            attempt.score >= 80 
                              ? 'text-emerald-600' 
                              : attempt.score >= 50 
                                ? 'text-amber-500' 
                                : 'text-rose-500'
                          }`}>
                            {attempt.score}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          {attempt.correctCount} of {attempt.totalQuestions} questions
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-500">
                          {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{formatDate(attempt.date)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => onViewAttemptResults(attempt.id)}
                            className="p-1.5 hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                            title="Open review sheet"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
