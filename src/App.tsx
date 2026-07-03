import { useState, useEffect } from 'react';
import { UserType, Test, Attempt } from './types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, signOut } from './firebase';
import { 
  seedInitialTestsIfEmpty, 
  subscribeToTests, 
  subscribeToAttempts, 
  saveTest, 
  deleteTest, 
  saveAttempt, 
  deleteAttempt 
} from './utils/firestoreService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TestCreator from './components/TestCreator';
import AnswerMapping from './components/AnswerMapping';
import ExamEngine from './components/ExamEngine';
import ResultsView from './components/ResultsView';
import AnalyticsView from './components/AnalyticsView';
import { ShuffledQuestionInfo } from './utils/shuffle';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Plus, 
  BarChart2, 
  GraduationCap, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft, 
  Menu, 
  X,
  FileText
} from 'lucide-react';

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<UserType>('Me');
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'create-test' | 'answer-mapping' | 'take-test' | 'results' | 'analytics'>('dashboard');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Google Sign-In & Sign-Out handlers
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Error signing in with Google:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentView('dashboard');
      setSelectedTestId(null);
      setSelectedAttemptId(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Seed on mount once
  useEffect(() => {
    seedInitialTestsIfEmpty();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setCurrentUser(firebaseUser.displayName || firebaseUser.email || 'Me');
      } else {
        setCurrentUser('Guest');
      }
    });
    return () => unsubAuth();
  }, []);

  // Sync Tests from Firestore (real-time)
  useEffect(() => {
    const unsubTests = subscribeToTests(user?.uid || null, (updatedTests) => {
      setTests(updatedTests);
    });
    return () => unsubTests();
  }, [user?.uid]);

  // Sync Attempts from Firestore (real-time)
  useEffect(() => {
    const unsubAttempts = subscribeToAttempts(user?.uid || null, (updatedAttempts) => {
      setAttempts(updatedAttempts);
    });
    return () => unsubAttempts();
  }, [user?.uid]);

  // Create Test trigger
  const handleCreateNewTest = () => {
    setSelectedTestId(null);
    setCurrentView('create-test');
  };

  // Edit Test trigger
  const handleEditTest = (testId: string) => {
    setSelectedTestId(testId);
    setCurrentView('create-test');
  };

  // Map Answers trigger
  const handleMapAnswers = (testId: string) => {
    setSelectedTestId(testId);
    setCurrentView('answer-mapping');
  };

  // Take Test trigger
  const handleTakeTest = (testId: string) => {
    setSelectedTestId(testId);
    setCurrentView('take-test');
  };

  // Save Test from Creator
const handleSaveTest = async (savedTest: Test) => {
  try {
    await saveTest(savedTest, user?.uid || null);
    setCurrentView('dashboard');
  } catch (err) {
    console.error('Failed to save test:', err);
  }
};

  // Delete Test
  const handleDeleteTest = async (testId: string) => {
    try {
      await deleteTest(testId);
      
      // Also clean up any attempts associated with this test
      const associatedAttempts = attempts.filter(att => att.testId === testId);
      for (const att of associatedAttempts) {
        await deleteAttempt(att.id);
      }
    } catch (err) {
      console.error('Failed to delete test:', err);
    }
  };

  // Duplicate Test
  const handleDuplicateTest = async (testId: string) => {
    const target = tests.find(t => t.id === testId);
    if (!target) return;

    const duplicated: Test = {
      ...JSON.parse(JSON.stringify(target)),
      id: `test-${Date.now()}`,
      title: `${target.title} (Copy)`,
      status: target.status === 'published' ? 'published' : 'pending_mapping',
      createdAt: Date.now(),
      creatorId: user?.uid || 'system'
    };

    try {
      await saveTest(duplicated, user?.uid || null);
    } catch (err) {
      console.error('Failed to duplicate test:', err);
    }
  };

  // Save Answer Key Mappings & update test status
  const handleSaveMapping = async (
    testId: string, 
    answerMap: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>, 
    shouldPublish: boolean
  ) => {
    const targetTest = tests.find(t => t.id === testId);
    if (!targetTest) return;

    const updatedTest: Test = {
      ...targetTest,
      answerMap,
      status: shouldPublish ? 'published' : 'pending_mapping'
    };

    try {
      await saveTest(updatedTest, user?.uid || null);
      setCurrentView('dashboard');
      setSelectedTestId(null);
    } catch (err) {
      console.error('Failed to save mapping:', err);
    }
  };

  // Submit Exam & Automatic grading
  const handleSubmitExam = async (
    testId: string,
    answers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E' | null>,
    timeTaken: number,
    preparedList: ShuffledQuestionInfo[]
  ) => {
    const activeTest = tests.find(t => t.id === testId);
    if (!activeTest) return;

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const questionsReview = preparedList.map(prep => {
      const qId = prep.question.id;
      const correctOriginalKey = activeTest.answerMap[qId];
      const selectedOriginalKey = answers[qId] || null;

      if (selectedOriginalKey === null) {
        unansweredCount++;
      } else if (selectedOriginalKey === correctOriginalKey) {
        correctCount++;
      } else {
        wrongCount++;
      }

      // Translate original key references back to displayed options letters
      const dispCorrectKey = prep.originalToDisplayMap[correctOriginalKey];
      const dispSelectedKey = selectedOriginalKey 
        ? prep.originalToDisplayMap[selectedOriginalKey]
        : null;

      return {
        questionId: qId,
        questionText: prep.question.text,
        originalCorrectKey: correctOriginalKey,
        selectedKey: selectedOriginalKey,
        displayedOptions: prep.displayedOptions,
        displayedSelectedKey: dispSelectedKey,
        displayedCorrectKey: dispCorrectKey
      };
    });

    const totalQuestions = preparedList.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const newAttempt: Attempt = {
      id: `attempt-${Date.now()}`,
      testId: activeTest.id,
      testTitle: activeTest.title,
      user: currentUser,
      score,
      correctCount,
      wrongCount,
      unansweredCount,
      timeTaken,
      totalQuestions,
      date: Date.now(),
      userId: user?.uid || 'guest',
      questionsReview
    };

    try {
      await saveAttempt(newAttempt, user?.uid || null);
      setCurrentAttempt(newAttempt);
      setSelectedAttemptId(newAttempt.id);
      setCurrentView('results');
    } catch (err) {
      console.error('Failed to save attempt:', err);
    }
  };

  // Navigate to results
  const handleViewResults = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setCurrentView('results');
  };

  // Quick retake of an exam
  const handleRetakeExam = (testId: string) => {
    handleTakeTest(testId);
  };

  // Select test for editing
  const editingTest = selectedTestId ? tests.find(t => t.id === selectedTestId) || null : null;
  // Select test for mapping
  const mappingTest = selectedTestId ? tests.find(t => t.id === selectedTestId) || null : null;
  // Select test for taking
  const activeExamTest = selectedTestId ? tests.find(t => t.id === selectedTestId) || null : null;
  // Select attempt for reviewing results
  const activeAttempt =
  currentAttempt ||
  (selectedAttemptId
    ? attempts.find(a => a.id === selectedAttemptId) || null
    : null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-800 antialiased">
      {/* Mobile Header Bar */}
      <header className="md:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-40">
        <div 
          onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 font-display">Examly</span>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <button 
              onClick={handleSignOut}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              {user.displayName?.split(' ')[0] || 'Sign Out'}
            </button>
          ) : (
            <button 
              onClick={handleGoogleSignIn}
              className="text-xs font-semibold px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-6 space-y-6 animate-in slide-in-from-top duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <nav className="space-y-1">
              <button
                onClick={() => { setCurrentView('dashboard'); setSelectedTestId(null); setSelectedAttemptId(null); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => { handleCreateNewTest(); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  currentView === 'create-test' 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Create Test</span>
              </button>
              <button
                onClick={() => { setCurrentView('analytics'); setSelectedTestId(null); setSelectedAttemptId(null); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  currentView === 'analytics' 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </nav>

            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100/80">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Pro Tip</p>
              <p className="text-xs text-indigo-700/90 leading-relaxed">
                Use Answer Mapping to batch assign keys after building questions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-6 h-screen sticky top-0 shrink-0">
        <div className="space-y-8">
          {/* Logo / Brand */}
          <div 
            onClick={() => { setCurrentView('dashboard'); setSelectedTestId(null); setSelectedAttemptId(null); }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 font-display">Examly</h1>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            <button 
              onClick={() => { setCurrentView('dashboard'); setSelectedTestId(null); setSelectedAttemptId(null); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm w-full text-left transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={handleCreateNewTest}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm w-full text-left transition-colors ${
                currentView === 'create-test' 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Create Test</span>
            </button>

            <button 
              onClick={() => { setCurrentView('analytics'); setSelectedTestId(null); setSelectedAttemptId(null); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm w-full text-left transition-colors ${
                currentView === 'analytics' 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Pro Tip Box */}
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100/80">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pro Tip</span>
            </p>
            <p className="text-xs text-indigo-700/90 leading-relaxed">
              Use Answer Mapping to batch assign keys after building questions.
            </p>
          </div>
        </div>

        {/* User Workspace Indicator & Switcher */}
        <div className="mt-auto border-t border-slate-100 pt-5">
          {user ? (
            <div className="flex items-center justify-between px-1.5">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full shadow-sm" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold font-display shadow-sm shrink-0">
                    {(user.displayName || 'M')[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-none truncate">
                    {user.displayName || 'Me'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
                    Active
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer shrink-0"
                title="Sign Out"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="px-1.5">
              <button 
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Sign In with Google</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC]">
        {/* Main Sticky/Fixed Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sm:px-8 shrink-0 z-10 sticky top-0">
          <h2 className="text-lg font-bold font-display text-slate-950 capitalize tracking-tight">
            {currentView === 'dashboard' ? 'Overview' : currentView.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-3">
            {currentView === 'dashboard' && (
              <>
                <button 
                  onClick={() => {
                    const draftsEl = document.getElementById('draft-tests-list');
                    if (draftsEl) {
                      draftsEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                >
                  Drafts
                </button>
                <button 
                  onClick={handleCreateNewTest}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Test</span>
                </button>
              </>
            )}
            
            {currentView !== 'dashboard' && (
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200/80 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Dashboard
                    currentUser={currentUser}
                    tests={tests}
                    attempts={attempts}
                    onCreateNewTest={handleCreateNewTest}
                    onTakeTest={handleTakeTest}
                    onMapAnswers={handleMapAnswers}
                    onEditTest={handleEditTest}
                    onDeleteTest={handleDeleteTest}
                    onDuplicateTest={handleDuplicateTest}
                    onViewAnalytics={() => setCurrentView('analytics')}
                    onViewResults={handleViewResults}
                  />
                </motion.div>
              )}

              {currentView === 'create-test' && (
                <motion.div
                  key="create-test"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <TestCreator
                    existingTest={editingTest}
                    onSave={handleSaveTest}
                    onCancel={() => setCurrentView('dashboard')}
                    onProceedToMapping={(id) => {
                      setSelectedTestId(id);
                      setCurrentView('answer-mapping');
                    }}
                  />
                </motion.div>
              )}

              {currentView === 'answer-mapping' && mappingTest && (
                <motion.div
                  key="answer-mapping"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnswerMapping
                    test={mappingTest}
                    onSaveMapping={handleSaveMapping}
                    onCancel={() => setCurrentView('dashboard')}
                  />
                </motion.div>
              )}

              {currentView === 'take-test' && activeExamTest && (
                <motion.div
                  key="take-test"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExamEngine
                    test={activeExamTest}
                    currentUser={currentUser}
                    onSubmitExam={handleSubmitExam}
                    onCancel={() => setCurrentView('dashboard')}
                  />
                </motion.div>
              )}

              {currentView === 'results' && activeAttempt && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <ResultsView
                    attempt={activeAttempt}
                    onGoHome={() => setCurrentView('dashboard')}
                    onViewAnalytics={() => setCurrentView('analytics')}
                    onRetake={() => handleRetakeExam(activeAttempt.testId)}
                  />
                </motion.div>
              )}

              {currentView === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnalyticsView
                    currentUser={currentUser}
                    attempts={attempts}
                    onGoHome={() => setCurrentView('dashboard')}
                    onViewAttemptResults={handleViewResults}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}