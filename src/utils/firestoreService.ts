import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { Test, Attempt } from '../types';

// Seed initial tests if the database is empty
const INITIAL_TESTS: Test[] = [
  {
    id: 'test-1',
    title: 'Web Development Basics',
    timer: 10,
    shuffleQuestions: true,
    shuffleOptions: true,
    createdAt: Date.now() - 86400000 * 3,
    status: 'published',
    creatorId: 'system',
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
      'q1': 'B',
      'q2': 'C',
      'q3': 'C',
      'q4': 'B',
      'q5': 'D'
    }
  },
  {
    id: 'test-2',
    title: 'Notion & Productivity Tools Quiz',
    timer: 5,
    shuffleQuestions: false,
    shuffleOptions: true,
    createdAt: Date.now() - 86400000,
    status: 'pending_mapping',
    creatorId: 'system',
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
    answerMap: {}
  }
];

export async function seedInitialTestsIfEmpty() {
  try {
    const testsRef = collection(db, 'tests');
    const q = query(testsRef, limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log('Seeding initial tests to Firestore...');
      for (const test of INITIAL_TESTS) {
        await setDoc(doc(db, 'tests', test.id), test);
      }
    }
  } catch (err) {
    console.error('Error seeding initial tests:', err);
  }
}

export function subscribeToTests(userId: string | null, onUpdate: (tests: Test[]) => void) {
  let publishedTests: Test[] = [];
  let draftTests: Test[] = [];

  const updateMerged = () => {
    const all = [...publishedTests];
    draftTests.forEach(draft => {
      if (!all.some(t => t.id === draft.id)) {
        all.push(draft);
      }
    });
    // Sort tests by creation time descending
    all.sort((a, b) => b.createdAt - a.createdAt);
    onUpdate(all);
  };

  // Subscribe to published tests (everyone can see them)
  const qPublished = query(collection(db, 'tests'), where('status', '==', 'published'));
  const unsubPublished = onSnapshot(qPublished, (snapshot) => {
    publishedTests = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Test));
    updateMerged();
  }, (err) => {
    console.error('Published tests listener error:', err);
  });

  let unsubDrafts = () => {};
  if (userId) {
    // Subscribe to drafts owned by this user
    const qDrafts = query(
      collection(db, 'tests'), 
      where('creatorId', '==', userId), 
      where('status', '!=', 'published')
    );
    unsubDrafts = onSnapshot(qDrafts, (snapshot) => {
      draftTests = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Test));
      updateMerged();
    }, (err) => {
      console.error('Drafts listener error:', err);
    });
  } else {
    draftTests = [];
    updateMerged();
  }

  return () => {
    unsubPublished();
    unsubDrafts();
  };
}

export function subscribeToAttempts(userId: string | null, onUpdate: (attempts: Attempt[]) => void) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, 'attempts'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const attemptsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Attempt));
    // Sort by date descending
    attemptsList.sort((a, b) => b.date - a.date);
    onUpdate(attemptsList);
  }, (err) => {
    console.error('Attempts listener error:', err);
  });
}

export async function saveTest(test: Test, userId: string | null) {
  const testRef = doc(db, 'tests', test.id);
  const testData = {
    ...test,
    creatorId: test.creatorId || userId || 'system'
  };
  await setDoc(testRef, testData);
}

export async function deleteTest(testId: string) {
  await deleteDoc(doc(db, 'tests', testId));
}

export async function saveAttempt(attempt: Attempt, userId: string | null) {
  const attemptRef = doc(db, 'attempts', attempt.id);
  const attemptData = {
    ...attempt,
    userId: userId || 'guest'
  };
  await setDoc(attemptRef, attemptData);
}

export async function deleteAttempt(attemptId: string) {
  await deleteDoc(doc(db, 'attempts', attemptId));
}
