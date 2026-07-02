export type UserType = 'Me' | 'Friend';

export interface Option {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export type TestStatus = 'draft' | 'pending_mapping' | 'published';

export interface Test {
  id: string;
  title: string;
  timer: number; // minutes, 0 means unlimited
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  questions: Question[];
  status: TestStatus;
  answerMap: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>; // questionId -> original correct option key
  createdAt: number;
}

export interface Attempt {
  id: string;
  testId: string;
  testTitle: string;
  user: UserType;
  score: number; // percentage (0-100)
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeTaken: number; // in seconds
  totalQuestions: number;
  date: number; // timestamp
  // To review answers, we store the question states as they were presented
  // including shuffles if any, what was selected, and what was correct.
  questionsReview: {
    questionId: string;
    questionText: string;
    originalCorrectKey: 'A' | 'B' | 'C' | 'D' | 'E';
    selectedKey: 'A' | 'B' | 'C' | 'D' | 'E' | null; // original key of selected option
    displayedOptions: Option[]; // the options in the order they were displayed
    displayedSelectedKey: 'A' | 'B' | 'C' | 'D' | 'E' | null; // A-E as displayed
    displayedCorrectKey: 'A' | 'B' | 'C' | 'D' | 'E'; // A-E as displayed
  }[];
}
