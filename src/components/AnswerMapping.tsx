import { useState, useEffect } from 'react';
import { Test } from '../types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Settings, 
  HelpCircle,
  Sparkles,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnswerMappingProps {
  test: Test;
  onSaveMapping: (testId: string, answerMap: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>, shouldPublish: boolean) => void;
  onCancel: () => void;
}

export default function AnswerMapping({
  test,
  onSaveMapping,
  onCancel
}: AnswerMappingProps) {
  // Local answer map state
  const [localMap, setLocalMap] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  // Selected/focused question index for keyboard/scrolling convenience
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Load existing mappings if they exist
  useEffect(() => {
    if (test.answerMap) {
      setLocalMap({ ...test.answerMap });
    }
  }, [test]);

  // Handle setting a key
  const handleSetKey = (qId: string, key: 'A' | 'B' | 'C' | 'D' | 'E', index: number) => {
    const updated = { ...localMap, [qId]: key };
    setLocalMap(updated);
    
    // Auto focus/scroll to the next question for quick, uninterrupted flow!
    if (index < test.questions.length - 1) {
      setFocusedIndex(index + 1);
      // scroll question into view
      const element = document.getElementById(`mapping-row-${index + 1}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Keyboard navigation for hyper-fast notebook-style mapping!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeQ = test.questions[focusedIndex];
      if (!activeQ) return;

      const keyPressed = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E'].includes(keyPressed)) {
        handleSetKey(activeQ.id, keyPressed as 'A' | 'B' | 'C' | 'D' | 'E', focusedIndex);
      } else if (e.key === 'ArrowDown') {
        if (focusedIndex < test.questions.length - 1) {
          setFocusedIndex(focusedIndex + 1);
          document.getElementById(`mapping-row-${focusedIndex + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        if (focusedIndex > 0) {
          setFocusedIndex(focusedIndex - 1);
          document.getElementById(`mapping-row-${focusedIndex - 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, test, localMap]);

  // Count total mapped
  const totalQuestions = test.questions.length;
  const mappedCount = Object.keys(localMap).filter(id => test.questions.some(q => q.id === id)).length;
  const isFullyMapped = mappedCount === totalQuestions;

  // Handle saving
  const handlePublish = () => {
    if (!isFullyMapped) return;
    onSaveMapping(test.id, localMap, true);
  };

  const handleSaveAsDraft = () => {
    onSaveMapping(test.id, localMap, false);
  };

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto" id="answer-mapping-root">
      {/* Sticky top-control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 sticky top-16 z-30 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 bg-white"
            id="mapping-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display font-bold text-slate-800 tracking-tight flex items-center gap-1.5 text-base sm:text-lg">
              <Settings className="w-5 h-5 text-indigo-600" />
              <span>Answer Key Mapping</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-sans tracking-wide">
              {test.title} • {mappedCount} of {totalQuestions} answers mapped
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveAsDraft}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs tracking-wide border border-slate-200 shadow-sm transition-all"
            id="mapping-save-draft"
          >
            Save Key as Draft
          </button>
          
          <button
            disabled={!isFullyMapped}
            onClick={handlePublish}
            className={`px-4 py-2 rounded-xl font-semibold text-xs tracking-wide shadow-md flex items-center gap-1.5 transition-all ${
              isFullyMapped
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-100 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            id="mapping-publish-btn"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Publish Test</span>
          </button>
        </div>
      </div>

      {/* Guide message */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-200/30">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">Notebook-Style Direct Mapper</h4>
          <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed">
            Quickly input the correct option keys directly from your personal reference booklet. Option texts are hidden to keep your workspace uncluttered.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[10px] text-indigo-600 font-medium font-mono">
            <span>🖱️ Click a bubble to select</span>
            <span>⌨️ Press A, B, C, D, or E on keyboard</span>
            <span>↕️ Arrow Up/Down to navigate rows</span>
          </div>
        </div>
      </div>

      {/* Mapping Notebook Table */}
      <div className="bg-white rounded-2xl border border-slate-200/85 overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-150 grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-3 sm:col-span-4">Question Row</div>
          <div className="col-span-9 sm:col-span-8 text-center sm:text-left">Correct Option Key Mapping</div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto" id="mapping-list-container">
          {test.questions.map((q, index) => {
            const isFocused = index === focusedIndex;
            const mappedKey = localMap[q.id];

            return (
              <div
                key={q.id}
                id={`mapping-row-${index}`}
                onClick={() => setFocusedIndex(index)}
                className={`px-5 py-4 grid grid-cols-12 items-center transition-all cursor-pointer ${
                  isFocused 
                    ? 'bg-indigo-50/30 border-l-4 border-indigo-600 pl-4' 
                    : 'hover:bg-slate-50/50 border-l-4 border-transparent'
                }`}
              >
                {/* Question index tag */}
                <div className="col-span-3 sm:col-span-4 flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${
                    isFocused 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : mappedKey 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                  }`}>
                    Q{index + 1}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {mappedKey ? '✓ Mapped' : '• Unmapped'}
                  </span>
                </div>

                {/* Option button group */}
                <div className="col-span-9 sm:col-span-8 flex justify-center sm:justify-start items-center gap-2 sm:gap-3.5">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((key) => {
                    const isSelected = mappedKey === key;
                    return (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click focus conflict
                          handleSetKey(q.id, key, index);
                        }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono font-bold text-xs sm:text-sm tracking-wide border transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                            : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-850 border-slate-200'
                        }`}
                        id={`mapping-row-${index}-opt-${key}`}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer statistics warnings */}
      {!isFullyMapped && (
        <div className="p-4 bg-amber-50 border border-amber-100/80 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-700 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            You still have {totalQuestions - mappedCount} unmapped question{totalQuestions - mappedCount !== 1 ? 's' : ''}. You can save your key as a draft, but you must complete all question mappings to Publish this exam.
          </div>
        </div>
      )}
    </div>
  );
}
