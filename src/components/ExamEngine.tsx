import { useState, useEffect, useRef } from 'react';
import { Test, Question, Option, UserType } from '../types';
import { prepareQuestionForExam, shuffleArray, ShuffledQuestionInfo } from '../utils/shuffle';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  X,
  FileText,
  Flag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExamEngineProps {
  test: Test;
  currentUser: UserType;
  onSubmitExam: (
    testId: string,
    answers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E' | null>,
    timeTaken: number,
    preparedList: ShuffledQuestionInfo[]
  ) => void;
  onCancel: () => void;
}

export default function ExamEngine({
  test,
  currentUser,
  onSubmitExam,
  onCancel
}: ExamEngineProps) {
  // Shuffled and prepared question instances
  const [preparedList, setPreparedList] = useState<ShuffledQuestionInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Student selections mapping: questionId -> SELECTED ORIGINAL option key (or null if skipped)
  const [selections, setSelections] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E' | null>>({});

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timerInitialized, setTimerInitialized] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Prepare questions on mount
  useEffect(() => {
    // 1. Determine question order
    let questionsOrder = [...test.questions];
    if (test.shuffleQuestions) {
      questionsOrder = shuffleArray(questionsOrder);
    }

    // 2. Prepare each question (including option shuffling)
    const prepared = questionsOrder.map(q => 
      prepareQuestionForExam(q, test.shuffleOptions)
    );

    setPreparedList(prepared);
    console.log("Questions in test:", test.questions);
console.log("Prepared:", prepared);

    // 3. Initialize selections with null for all questions
    const initialSelections = {} as Record<string, 'A' | 'B' | 'C' | 'D' | 'E' | null>;
    test.questions.forEach(q => {
      initialSelections[q.id] = null;
    });
    setSelections(initialSelections);

    // 4. Initialize countdown timer
    if (test.timer > 0) {
      setTimeLeft(test.timer * 60);
    } else {
      setTimeLeft(-1); // infinite timer
    }
    setTimerInitialized(true);
    console.log("Timer from Firestore:", test.timer);
console.log("Starting time:", test.timer * 60);
    
    startTimeRef.current = Date.now();
  }, [test]);

  // Countdown clock loop
useEffect(() => {
  if (!timerInitialized) return;

  if (timeLeft === -1) return; // Unlimited timer

  if (timeLeft <= 0) {
    handleFinalSubmit();
    return;
  }

  const interval = setInterval(() => {
    setTimeLeft(prev => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timeLeft, timerInitialized]);

  // Calculate elapsed time taken
  const getElapsedSeconds = () => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (test.timer > 0) {
      return Math.min(elapsed, test.timer * 60);
    }
    return elapsed;
  };

  // Convert seconds to readable MM:SS
  const formatTimeLeft = () => {
    if (timeLeft === -1) return 'Unlimited';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Select option handler
  // Note: displayKey is what the student sees (A-E)
  // We must map it back to originalKey so our master grading is robust and unaffected by option shuffle!
  const handleSelectOption = (qId: string, displayKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const activePrep = preparedList.find(p => p.question.id === qId);
    if (!activePrep) return;

    const originalKey = activePrep.displayToOriginalMap[displayKey];
    
    setSelections(prev => ({
      ...prev,
      [qId]: prev[qId] === originalKey ? null : originalKey // toggle selection
    }));
  };

  // Auto/Manual Final Submit execution
  const handleFinalSubmit = () => {
    const totalTimeTaken = getElapsedSeconds();
    onSubmitExam(test.id, selections, totalTimeTaken, preparedList);
  };

  // Navigate checks
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < preparedList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  if (preparedList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3" id="exam-loading">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-500 font-medium text-xs font-mono">Assembling exam questions...</span>
      </div>
    );
  }

  const activePrep = preparedList[currentIndex];
  const activeQuestion = activePrep.question;
  const activeSelectedOriginalKey = selections[activeQuestion.id];
  
  // Translate the original selected key to whatever display key it holds currently
  const activeSelectedDisplayKey = activeSelectedOriginalKey 
    ? activePrep.originalToDisplayMap[activeSelectedOriginalKey]
    : null;

  // Counts for completion metrics
  const answeredCount = Object.values(selections).filter(v => v !== null).length;
  const progressPercent = Math.round((answeredCount / preparedList.length) * 100);

  return (
    <div className="space-y-6 py-6" id="exam-engine-root">
      
      {/* Top sticky exam bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 sticky top-16 z-30 shadow-lg border border-slate-800">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-md">
            STUDENT COMPANION
          </span>
          <h2 className="font-display font-bold text-base sm:text-lg tracking-tight truncate max-w-sm" title={test.title}>
            {test.title}
          </h2>
        </div>

        {/* Timer and Submit triggers */}
        <div className="flex items-center justify-between sm:justify-end gap-5">
          {timeLeft !== -1 && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-xs border ${
              timeLeft < 60 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' 
                : timeLeft < 180
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTimeLeft()}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs tracking-wide shadow-md shadow-indigo-700/20 transition-all cursor-pointer"
              id="exam-top-submit-btn"
            >
              Submit Exam
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              id="exam-top-exit-btn"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Progress status line */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span className="font-semibold">Question {currentIndex + 1} of {preparedList.length}</span>
          <span className="font-mono font-bold text-indigo-600">{progressPercent}% Completed ({answeredCount}/{preparedList.length})</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200/50">
          <div 
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex + 1) / preparedList.length * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column (3/4): Main Question Board */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm min-h-[40vh] flex flex-col justify-between">
            
            {/* Active Question Area */}
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm font-black text-indigo-600 bg-indigo-50 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100/50">
                  Q{currentIndex + 1}
                </span>
                <p className="text-base font-semibold text-slate-800 pt-1 leading-relaxed">
                  {activeQuestion.text}
                </p>
              </div>

              {/* Shuffled Display Option Cards */}
              <div className="space-y-3.5 pl-0 sm:pl-12" id="exam-options-container">
                {activePrep.displayedOptions.map((opt) => {
                  const isSelected = activeSelectedDisplayKey === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(activeQuestion.id, opt.key)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-400 shadow-sm shadow-indigo-100/30'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                      id={`exam-opt-btn-${opt.key}`}
                    >
                      <span className={`w-7 h-7 rounded-lg font-mono text-xs font-black flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                      }`}>
                        {opt.key}
                      </span>
                      <span className={`text-xs sm:text-sm font-medium ${
                        isSelected ? 'text-indigo-900 font-semibold' : 'text-slate-600 group-hover:text-slate-800'
                      }`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                  currentIndex === 0
                    ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-850 border-slate-200 cursor-pointer'
                }`}
                id="exam-prev-btn"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex === preparedList.length - 1 ? (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wider rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
                  id="exam-final-finish-btn"
                >
                  <span>Finish Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-850 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  id="exam-next-btn"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column (1/4): Question Grid Palette */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm sticky top-[280px]">
            <h3 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-2.5">
              Question Palette
            </h3>

            {/* Palette Grid buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-2" id="exam-palette-grid">
              {preparedList.map((prep, idx) => {
                const isActive = idx === currentIndex;
                const isAnswered = selections[prep.question.id] !== null;

                return (
                  <button
                    key={prep.question.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                        : isAnswered
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200/60'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-150'
                    }`}
                    id={`exam-palette-idx-${idx}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Palette legend */}
            <div className="pt-3 border-t border-slate-150 space-y-2 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-600 shrink-0" />
                <span>Active Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200/60 shrink-0" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-50 border border-slate-150 shrink-0" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Manual Submit Confirmation Modal Backdrop */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-xl"
              id="submit-confirmation-modal"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <CheckSquare className="w-5.5 h-5.5" />
                </div>
                <button 
                  onClick={() => setShowSubmitConfirm(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-800">Submit Exam Attempt</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you absolutely sure you want to finish and submit your exam answers? You will not be able to change your selections after submission.
                </p>
              </div>

              {/* Stats within modal */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total Questions:</span>
                  <span className="font-mono font-bold text-slate-800">{preparedList.length}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Answered:</span>
                  <span className="font-mono font-bold text-emerald-600">{answeredCount}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Unanswered/Skipped:</span>
                  <span className="font-mono font-bold text-rose-500">{preparedList.length - answeredCount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-colors"
                  id="confirm-submit-button"
                >
                  Yes, Submit Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
