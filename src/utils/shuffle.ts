import { Question, Option } from '../types';

/**
 * Fisher-Yates Shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Prepares options for a question during an exam.
 * If shuffleOptions is true, it shuffles the option texts,
 * but keeps the display keys as 'A', 'B', 'C', 'D', 'E'.
 * It also returns information about how display keys match original keys.
 */
export interface ShuffledQuestionInfo {
  question: Question;
  displayedOptions: Option[]; // text shuffled, keys still A-E
  // maps displayed key (A-E) to original key (A-E)
  displayToOriginalMap: Record<'A' | 'B' | 'C' | 'D' | 'E', 'A' | 'B' | 'C' | 'D' | 'E'>;
  // maps original key (A-E) to displayed key (A-E)
  originalToDisplayMap: Record<'A' | 'B' | 'C' | 'D' | 'E', 'A' | 'B' | 'C' | 'D' | 'E'>;
}

export function prepareQuestionForExam(
  question: Question,
  shuffleOptions: boolean
): ShuffledQuestionInfo {
  const originalOptions = question.options; // keys: A, B, C, D, E
  
  if (!shuffleOptions) {
    const defaultMap: Record<'A' | 'B' | 'C' | 'D' | 'E', 'A' | 'B' | 'C' | 'D' | 'E'> = {
      A: 'A', B: 'B', C: 'C', D: 'D', E: 'E'
    };
    return {
      question,
      displayedOptions: originalOptions,
      displayToOriginalMap: defaultMap,
      originalToDisplayMap: defaultMap
    };
  }

  // Shuffle the texts/options
  const shuffledTexts = shuffleArray(originalOptions);
  
  // Re-assign display keys A, B, C, D, E to the shuffled order
  const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  const displayedOptions: Option[] = shuffledTexts.map((opt, index) => ({
    key: keys[index],
    text: opt.text
  }));

  // Build maps
  const displayToOriginalMap = {} as Record<'A' | 'B' | 'C' | 'D' | 'E', 'A' | 'B' | 'C' | 'D' | 'E'>;
  const originalToDisplayMap = {} as Record<'A' | 'B' | 'C' | 'D' | 'E', 'A' | 'B' | 'C' | 'D' | 'E'>;

  displayedOptions.forEach((dispOpt, index) => {
    const originalOpt = shuffledTexts[index]; // this was the original option
    displayToOriginalMap[dispOpt.key] = originalOpt.key;
    originalToDisplayMap[originalOpt.key] = dispOpt.key;
  });

  return {
    question,
    displayedOptions,
    displayToOriginalMap,
    originalToDisplayMap
  };
}
