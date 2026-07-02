import { useState, useEffect } from 'react';
import { Test, Question, Option } from '../types';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  ArrowLeft, 
  Shuffle, 
  Timer, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  CornerDownRight,
  AlertCircle,
  FileEdit,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TestCreatorProps {
  existingTest: Test | null; // null if creating a new test
  onSave: (test: Test) => void;
  onCancel: () => void;
  onProceedToMapping: (testId: string) => void;
}

export default function TestCreator({
  existingTest,
  onSave,
  onCancel,
  onProceedToMapping
}: TestCreatorProps) {
  // Main fields
  const [title, setTitle] = useState('');
  const [timer, setTimer] = useState(15); // Default to 15 minutes
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Validation error state
  const [error, setError] = useState<string | null>(null);

  // Initialize fields if we are editing an existing test
  useEffect(() => {
    if (existingTest) {
      setTitle(existingTest.title);
      setTimer(existingTest.timer);
      setShuffleQuestions(existingTest.shuffleQuestions);
      setShuffleOptions(existingTest.shuffleOptions);
      setQuestions(JSON.parse(JSON.stringify(existingTest.questions))); // deep copy
    } else {
      // Start with 1 default empty question
      setTitle('');
      setTimer(15);
      setShuffleQuestions(false);
      setShuffleOptions(false);
      setQuestions([createEmptyQuestion()]);
    }
  }, [existingTest]);

  // Helper to create an empty question
  function createEmptyQuestion(): Question {
    return {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
        { key: 'E', text: '' }
      ]
    };
  }

  // Add Question
  const handleAddQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };

  // Duplicate Question
  const handleDuplicateQuestion = (index: number) => {
    const original = questions[index];
    const duplicate: Question = {
      ...JSON.parse(JSON.stringify(original)),
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const updated = [...questions];
    updated.splice(index + 1, 0, duplicate);
    setQuestions(updated);
  };

  // Delete Question
  const handleDeleteQuestion = (index: number) => {
    if (questions.length === 1) {
      setError('You must have at least one question in your exam.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  // Question Text Change
  const handleQuestionTextChange = (index: number, val: string) => {
    const updated = [...questions];
    updated[index].text = val;
    setQuestions(updated);
  };

  // Option Text Change
  const handleOptionTextChange = (qIndex: number, optKey: 'A' | 'B' | 'C' | 'D' | 'E', val: string) => {
    const updated = [...questions];
    const optIndex = updated[qIndex].options.findIndex(opt => opt.key === optKey);
    if (optIndex !== -1) {
      updated[qIndex].options[optIndex].text = val;
    }
    setQuestions(updated);
  };

  // Move questions up or down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    // swap
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setQuestions(updated);
  };

  // Validate entire test
  const validateTest = (): boolean => {
    if (!title.trim()) {
      setError('Please provide an Exam Title.');
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} text is empty.`);
        return false;
      }
      for (const opt of q.options) {
        if (!opt.text.trim()) {
          setError(`Option ${opt.key} for Question ${i + 1} is empty.`);
          return false;
        }
      }
    }
    setError(null);
    return true;
  };

  // Save Test
  const handleSave = (isProceeding: boolean) => {
    if (!validateTest()) return;

    const testId = existingTest?.id || `test-${Date.now()}`;
    const testStatus = existingTest ? existingTest.status : 'pending_mapping';

    const testToSave: Test = {
      id: testId,
      title: title.trim(),
      timer: timer,
      shuffleQuestions,
      shuffleOptions,
      questions,
      // If we added or deleted questions, let's keep previous mappings if they match existing questionIds,
      // but otherwise reset or keep previous.
      answerMap: existingTest ? { ...existingTest.answerMap } : {},
      status: testStatus === 'published' ? 'published' : 'pending_mapping',
      createdAt: existingTest ? existingTest.createdAt : Date.now()
    };

    // Clean up any answer mappings for questions we deleted
    const currentQIds = questions.map(q => q.id);
    const cleanedAnswerMap = {} as Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
    currentQIds.forEach(id => {
      if (testToSave.answerMap[id]) {
        cleanedAnswerMap[id] = testToSave.answerMap[id];
      }
    });
    testToSave.answerMap = cleanedAnswerMap;

    // If answerMap doesn't cover all questions, status is pending_mapping
    const allQuestionsMapped = currentQIds.every(id => testToSave.answerMap[id]);
    if (!allQuestionsMapped && testToSave.status === 'published') {
      testToSave.status = 'pending_mapping';
    }

    onSave(testToSave);

    if (isProceeding) {
      onProceedToMapping(testToSave.id);
    }
  };

  return (
    <div className="space-y-8 py-6" id="test-creator-root">
      {/* Sticky top-control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 sticky top-16 z-30 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 bg-white"
            id="creator-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display font-bold text-slate-800 tracking-tight flex items-center gap-1.5 text-base sm:text-lg">
              <FileEdit className="w-5 h-5 text-indigo-600" />
              <span>{existingTest ? 'Edit Exam Questions' : 'Create New Exam'}</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-sans tracking-wide">
              {questions.length} Question{questions.length !== 1 ? 's' : ''} • Correct answers are mapped in the next step
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs tracking-wide border border-slate-200 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            id="creator-save-draft"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          
          <button
            onClick={() => handleSave(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs tracking-wide shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            id="creator-proceed-mapping"
          >
            <span>Set Answer Key</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Errors display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
            id="creator-error-banner"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Questions Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-slate-700 text-sm tracking-wide uppercase">Questions Inventory</h3>
            
            <AnimatePresence initial={false}>
              {questions.map((question, qIndex) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors p-5 relative group"
                  id={`question-editor-card-${qIndex}`}
                >
                  {/* Top header within question card */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      QUESTION {qIndex + 1}
                    </span>
                    
                    {/* Move and control tools */}
                    <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMoveQuestion(qIndex, 'up')}
                        disabled={qIndex === 0}
                        className={`p-1 hover:bg-slate-100 text-slate-500 rounded transition-colors ${qIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(qIndex, 'down')}
                        disabled={qIndex === questions.length - 1}
                        className={`p-1 hover:bg-slate-100 text-slate-500 rounded transition-colors ${qIndex === questions.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-px h-3.5 bg-slate-200 mx-1" />
                      <button
                        onClick={() => handleDuplicateQuestion(qIndex)}
                        className="p-1 hover:bg-slate-100 text-indigo-600 rounded transition-colors"
                        title="Duplicate Question"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(qIndex)}
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content Input */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">Question Text</label>
                      <textarea
                        value={question.text}
                        onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                        placeholder="e.g., What is the capital city of Australia?"
                        rows={3}
                        className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 bg-slate-50/50"
                        id={`question-input-text-${qIndex}`}
                      />
                    </div>

                    {/* Options inputs */}
                    <div className="grid grid-cols-1 gap-3.5 pt-2">
                      <label className="text-xs font-bold text-slate-500 block -mb-1">Answer Options (A through E)</label>
                      {['A', 'B', 'C', 'D', 'E'].map((key) => {
                        const opt = question.options.find(o => o.key === key);
                        return (
                          <div key={key} className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200">
                              {key}
                            </span>
                            <input
                              type="text"
                              value={opt?.text || ''}
                              onChange={(e) => handleOptionTextChange(qIndex, key as 'A' | 'B' | 'C' | 'D' | 'E', e.target.value)}
                              placeholder={`Option ${key} text`}
                              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                              id={`question-${qIndex}-option-${key}-input`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Question Button */}
            <button
              onClick={handleAddQuestion}
              className="w-full py-4 border-2 border-dashed border-slate-200/80 hover:border-indigo-400/80 rounded-2xl text-center bg-slate-50/30 hover:bg-indigo-50/10 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
              id="creator-add-question-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Question</span>
            </button>
          </div>
        </div>

        {/* Right 1 Column: Settings Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-sm sticky top-[280px]">
            <h3 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Exam Configuration</h3>
            
            {/* Title field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 block">Exam Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CS101 final exam"
                className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                id="creator-input-title"
              />
            </div>

            {/* Timer setting */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 block">Countdown Timer</label>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {timer > 0 ? `${timer} Minutes` : 'Unlimited'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Timer className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={timer}
                  onChange={(e) => setTimer(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <p className="text-[10px] text-slate-400">Set to 0 for unlimited take-time.</p>
            </div>

            {/* Shuffle switches */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-slate-200 rounded focus:ring-indigo-500"
                />
                <div>
                  <label htmlFor="shuffleQuestions" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                    Shuffle Questions order
                  </label>
                  <p className="text-[10px] text-slate-400">Display questions in a random order to students.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="shuffleOptions"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-slate-200 rounded focus:ring-indigo-500"
                />
                <div>
                  <label htmlFor="shuffleOptions" className="text-xs font-semibold text-slate-700 block cursor-pointer">
                    Shuffle Options A-E
                  </label>
                  <p className="text-[10px] text-slate-400">Automatically shuffle options on each attempt while keeping the correct answer key correctly linked.</p>
                </div>
              </div>
            </div>

            {/* Creator Help */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 flex gap-2.5 items-start">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-500 leading-relaxed space-y-1">
                <span className="font-bold text-slate-700">Examly Lifecycle:</span>
                <p>1. Compose questions & options here (no correct answers specified yet).</p>
                <p>2. Tap "Set Answer Key" to open the notebook-style Mapping tool.</p>
                <p>3. Complete mappings to publish and make immediately open for exam taking!</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
