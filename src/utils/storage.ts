import { Test, Attempt, UserType, Question } from '../types';

const TESTS_KEY = 'exam_platform_tests';
const ATTEMPTS_KEY = 'exam_platform_attempts';
const USER_KEY = 'exam_platform_current_user';

const INITIAL_TESTS: Test[] = [
  {
    id: 'test-1',
    title: 'Web Development Basics',
    timer: 10, // 10 minutes
    shuffleQuestions: true,
    shuffleOptions: true,
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'Which HTML5 element is used to represent the main content of a document?',
        options: [
          { key: 'A', text: '<content>' },
          { key: 'B', text: '<main>' },
          { key: 'C', text: '<section>' },
          { key: 'D', text: '<body>' },
          { key: 'E', text: '<primary>' }
        ]
      },
      {
        id: 'q2',
        text: 'Which CSS property is used to change the background color?',
        options: [
          { key: 'A', text: 'color' },
          { key: 'B', text: 'bgcolor' },
          { key: 'C', text: 'background-color' },
          { key: 'D', text: 'canvas-color' },
          { key: 'E', text: 'fill-color' }
        ]
      },
      {
        id: 'q3',
        text: 'What is the correct syntax for referring to an external script named "xxx.js"?',
        options: [
          { key: 'A', text: '<script href="xxx.js">' },
          { key: 'B', text: '<script name="xxx.js">' },
          { key: 'C', text: '<script src="xxx.js">' },
          { key: 'D', text: '<script file="xxx.js">' },
          { key: 'E', text: '<script link="xxx.js">' }
        ]
      },
      {
        id: 'q4',
        text: 'Which CSS flexbox property controls the alignment of items along the main axis?',
        options: [
          { key: 'A', text: 'align-items' },
          { key: 'B', text: 'justify-content' },
          { key: 'C', text: 'align-content' },
          { key: 'D', text: 'flex-direction' },
          { key: 'E', text: 'place-items' }
        ]
      },
      {
        id: 'q5',
        text: 'In JavaScript, which of the following is NOT a primitive data type?',
        options: [
          { key: 'A', text: 'undefined' },
          { key: 'B', text: 'boolean' },
          { key: 'C', text: 'number' },
          { key: 'D', text: 'array' },
          { key: 'E', text: 'string' }
        ]
      }
    ],
    answerMap: {
      'q1': 'B', // <main>
      'q2': 'C', // background-color
      'q3': 'C', // src="xxx.js"
      'q4': 'B', // justify-content
      'q5': 'D'  // array
    }
  },
  {
    id: 'test-2',
    title: 'Notion & Productivity Tools Quiz',
    timer: 5,
    shuffleQuestions: false,
    shuffleOptions: true,
    createdAt: Date.now() - 86400000, // 1 day ago
    status: 'pending_mapping',
    questions: [
      {
        id: 'q2-1',
        text: 'In Notion, what shortcut is used to create a toggle list?',
        options: [
          { key: 'A', text: '>/' },
          { key: 'B', text: '> ' },
          { key: 'C', text: '- ' },
          { key: 'D', text: '[]' },
          { key: 'E', text: 'toggle' }
        ]
      },
      {
        id: 'q2-2',
        text: 'Which view is NOT natively supported in Notion databases?',
        options: [
          { key: 'A', text: 'Kanban Board' },
          { key: 'B', text: 'Gantt Chart (Timeline)' },
          { key: 'C', text: 'Mind Map Diagram' },
          { key: 'D', text: 'Calendar' },
          { key: 'E', text: 'Gallery' }
        ]
      }
    ],
    answerMap: {} // User must map answers before publishing!
  }
];

const INITIAL_ATTEMPTS: Attempt[] = [
  {
    id: 'attempt-1',
    testId: 'test-1',
    testTitle: 'Web Development Basics',
    user: 'Me',
    score: 80,
    correctCount: 4,
    wrongCount: 1,
    unansweredCount: 0,
    timeTaken: 145, // 2 mins 25 secs
    totalQuestions: 5,
    date: Date.now() - 86400000 * 2,
    questionsReview: [
      {
        questionId: 'q1',
        questionText: 'Which HTML5 element is used to represent the main content of a document?',
        originalCorrectKey: 'B',
        selectedKey: 'B',
        displayedOptions: [
          { key: 'A', text: '<content>' },
          { key: 'B', text: '<main>' },
          { key: 'C', text: '<section>' },
          { key: 'D', text: '<body>' },
          { key: 'E', text: '<primary>' }
        ],
        displayedSelectedKey: 'B',
        displayedCorrectKey: 'B'
      },
      {
        questionId: 'q2',
        questionText: 'Which CSS property is used to change the background color?',
        originalCorrectKey: 'C',
        selectedKey: 'C',
        displayedOptions: [
          { key: 'A', text: 'color' },
          { key: 'B', text: 'bgcolor' },
          { key: 'C', text: 'background-color' },
          { key: 'D', text: 'canvas-color' },
          { key: 'E', text: 'fill-color' }
        ],
        displayedSelectedKey: 'C',
        displayedCorrectKey: 'C'
      },
      {
        questionId: 'q3',
        questionText: 'What is the correct syntax for referring to an external script named "xxx.js"?',
        originalCorrectKey: 'C',
        selectedKey: 'A', // Wrong option
        displayedOptions: [
          { key: 'A', text: '<script href="xxx.js">' },
          { key: 'B', text: '<script name="xxx.js">' },
          { key: 'C', text: '<script src="xxx.js">' },
          { key: 'D', text: '<script file="xxx.js">' },
          { key: 'E', text: '<script link="xxx.js">' }
        ],
        displayedSelectedKey: 'A',
        displayedCorrectKey: 'C'
      },
      {
        questionId: 'q4',
        questionText: 'Which CSS flexbox property controls the alignment of items along the main axis?',
        originalCorrectKey: 'B',
        selectedKey: 'B',
        displayedOptions: [
          { key: 'A', text: 'align-items' },
          { key: 'B', text: 'justify-content' },
          { key: 'C', text: 'align-content' },
          { key: 'D', text: 'flex-direction' },
          { key: 'E', text: 'place-items' }
        ],
        displayedSelectedKey: 'B',
        displayedCorrectKey: 'B'
      },
      {
        questionId: 'q5',
        questionText: 'In JavaScript, which of the following is NOT a primitive data type?',
        originalCorrectKey: 'D',
        selectedKey: 'D',
        displayedOptions: [
          { key: 'A', text: 'undefined' },
          { key: 'B', text: 'boolean' },
          { key: 'C', text: 'number' },
          { key: 'D', text: 'array' },
          { key: 'E', text: 'string' }
        ],
        displayedSelectedKey: 'D',
        displayedCorrectKey: 'D'
      }
    ]
  }
];

export function getStoredCurrentUser(): UserType {
  const user = localStorage.getItem(USER_KEY);
  if (user === 'Me' || user === 'Friend') {
    return user;
  }
  localStorage.setItem(USER_KEY, 'Me');
  return 'Me';
}

export function setStoredCurrentUser(user: UserType): void {
  localStorage.setItem(USER_KEY, user);
}

export function getStoredTests(): Test[] {
  const stored = localStorage.getItem(TESTS_KEY);
  if (!stored) {
    localStorage.setItem(TESTS_KEY, JSON.stringify(INITIAL_TESTS));
    return INITIAL_TESTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing tests from localStorage', e);
    return INITIAL_TESTS;
  }
}

export function saveStoredTests(tests: Test[]): void {
  localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
}

export function getStoredAttempts(): Attempt[] {
  const stored = localStorage.getItem(ATTEMPTS_KEY);
  if (!stored) {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(INITIAL_ATTEMPTS));
    return INITIAL_ATTEMPTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing attempts from localStorage', e);
    return INITIAL_ATTEMPTS;
  }
}

export function saveStoredAttempts(attempts: Attempt[]): void {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}
