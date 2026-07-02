import { Attempt, Option } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ArrowLeft, 
  BarChart2, 
  RotateCcw,
  BookOpen,
  Calendar,
  ThumbsUp,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface ResultsViewProps {
  attempt: Attempt;
  onGoHome: () => void;
  onViewAnalytics: () => void;
  onRetake: () => void; // allow quick retake of this exam!
}

export default function ResultsView({
  attempt,
  onGoHome,
  onViewAnalytics,
  onRetake
}: ResultsViewProps) {
  
  // Scoring summary helper
  const getFeedback = (score: number) => {
    if (score >= 90) return { title: 'Masterful Performance!', text: 'Outstanding! You have mastered this exam content.', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' };
    if (score >= 70) return { title: 'Excellent Work!', text: 'Great job! You achieved a very solid score.', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' };
    if (score >= 50) return { title: 'Passed!', text: 'Good effort, you passed! Review missed questions to improve.', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' };
    return { title: 'Needs Practice', text: 'Do not be discouraged! Review the answer key and try again.', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' };
  };

  const feedback = getFeedback(attempt.score);

  // Format seconds to text helper
  const formatSecondsToText = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto" id="results-view-root">
      
      {/* Top action header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoHome}
            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 bg-white"
            id="results-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Exam Completed</span>
            <h2 className="font-display font-bold text-slate-800 tracking-tight text-base sm:text-lg">
              Results: {attempt.testTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetake}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs tracking-wide shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            id="results-retake-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>
          <button
            onClick={onViewAnalytics}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs tracking-wide shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            id="results-analytics-btn"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Main feedback & performance showcase block */}
      <div className={`border rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center ${feedback.bg}`}>
        {/* Radial Percent meter */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center bg-white rounded-full shadow-md border border-slate-150">
            {/* SVG circle track */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className={
                  attempt.score >= 80 
                    ? 'stroke-emerald-500' 
                    : attempt.score >= 50 
                      ? 'stroke-amber-400' 
                      : 'stroke-rose-500'
                }
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - attempt.score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center space-y-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 font-mono">
                {attempt.score}%
              </span>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Score</span>
            </div>
          </div>
        </div>

        {/* Evaluation Texts */}
        <div className="md:col-span-8 space-y-3.5 text-center md:text-left">
          <div className="space-y-1">
            <h3 className={`text-lg sm:text-xl font-display font-extrabold tracking-tight ${feedback.color} flex items-center justify-center md:justify-start gap-2`}>
              <Award className="w-5.5 h-5.5" />
              <span>{feedback.title}</span>
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm">{feedback.text}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 font-medium pt-1">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-150 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Time Elapsed: <b>{formatSecondsToText(attempt.timeTaken)}</b></span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-150 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Completed on: <b>{new Date(attempt.date).toLocaleDateString()}</b></span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid boxes for scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="results-count-badges">
        {/* Correct Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Correct Answers</span>
              <span className="text-lg font-extrabold text-slate-800 tracking-tight font-mono">{attempt.correctCount}</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">/ {attempt.totalQuestions}</span>
        </div>

        {/* Wrong Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Wrong Answers</span>
              <span className="text-lg font-extrabold text-slate-800 tracking-tight font-mono">{attempt.wrongCount}</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">/ {attempt.totalQuestions}</span>
        </div>

        {/* Unanswered Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Skipped / Blanks</span>
              <span className="text-lg font-extrabold text-slate-800 tracking-tight font-mono">{attempt.unansweredCount}</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">/ {attempt.totalQuestions}</span>
        </div>
      </div>

      {/* Accordion List for "Review Answers" */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Interactive Answer Sheet Review</span>
        </h3>

        <div className="space-y-4" id="results-review-list">
          {attempt.questionsReview.map((rev, index) => {
            const isCorrect = rev.selectedKey === rev.originalCorrectKey;
            const isUnanswered = rev.selectedKey === null;

            return (
              <div
                key={rev.questionId}
                className={`rounded-2xl border bg-white p-5 space-y-4 shadow-xs transition-colors ${
                  isUnanswered
                    ? 'border-amber-200/60'
                    : isCorrect
                      ? 'border-emerald-200/60'
                      : 'border-rose-200/60'
                }`}
              >
                {/* Review Card Header */}
                <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md ${
                      isUnanswered
                        ? 'bg-amber-50 text-amber-700 border border-amber-100/50'
                        : isCorrect
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                          : 'bg-rose-50 text-rose-700 border border-rose-100/50'
                    }`}>
                      QUESTION {index + 1}
                    </span>
                    <span className="text-[11px] font-semibold">
                      {isUnanswered ? (
                        <span className="text-amber-600">Skipped (No selection)</span>
                      ) : isCorrect ? (
                        <span className="text-emerald-600">✓ Correct</span>
                      ) : (
                        <span className="text-rose-600">✗ Incorrect</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Question Prompt Text */}
                <p className="text-sm font-semibold text-slate-800 pl-1 leading-relaxed">
                  {rev.questionText}
                </p>

                {/* Options display */}
                <div className="space-y-2.5 pl-0 sm:pl-4">
                  {rev.displayedOptions.map((opt) => {
                    // Check if this option was selected by the student
                    const isOptionSelected = rev.displayedSelectedKey === opt.key;
                    // Check if this option is the correct answer
                    const isOptionCorrect = rev.displayedCorrectKey === opt.key;

                    return (
                      <div
                        key={opt.key}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 ${
                          isOptionCorrect
                            ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                            : isOptionSelected
                              ? 'bg-rose-50/50 border-rose-300 text-rose-900'
                              : 'bg-white border-slate-150 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6.5 h-6.5 rounded-lg font-mono text-xs font-black flex items-center justify-center ${
                            isOptionCorrect
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : isOptionSelected
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400'
                          }`}>
                            {opt.key}
                          </span>
                          <span className="text-xs sm:text-sm font-medium">
                            {opt.text}
                          </span>
                        </div>

                        {/* Status Right Badge */}
                        <div>
                          {isOptionCorrect && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded border border-emerald-200">
                              CORRECT KEY
                            </span>
                          )}
                          {!isOptionCorrect && isOptionSelected && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100/50 px-2 py-0.5 rounded border border-rose-200">
                              YOUR ANSWER
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
