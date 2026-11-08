import { QUIZ_QUESTIONS } from './quiz-questions.js';

const STORAGE_KEY = 'quantum-image-mixer-quiz-v1';
const ids = QUIZ_QUESTIONS.map((question) => question.id);
const byId = new Map(QUIZ_QUESTIONS.map((question) => [question.id, question]));

export function createQuizSession({ random = Math.random, storage } = {}) {
  let current;
  let remaining;
  let cleared = new Set();
  const readStorage = () => storage === undefined ? globalThis.localStorage : storage;
  try {
    const saved = JSON.parse(readStorage()?.getItem(STORAGE_KEY) ?? 'null');
    if (saved && byId.has(saved.current) && Array.isArray(saved.remaining)
      && saved.remaining.every((id) => byId.has(id) && id !== saved.current)
      && new Set(saved.remaining).size === saved.remaining.length) {
      current = saved.current;
      remaining = saved.remaining;
      if (Array.isArray(saved.cleared)) cleared = new Set(saved.cleared.filter((id) => byId.has(id)));
    }
  } catch { /* 古い保存値や保存不可のブラウザでも出題できる。 */ }

  function persist() {
    try { readStorage()?.setItem(STORAGE_KEY, JSON.stringify({ current, remaining, cleared: [...cleared] })); }
    catch { /* 保存できなくても、その場でクイズを続けられる。 */ }
  }
  function shuffle() {
    const deck = [...ids];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (deck.at(-1) === current) [deck[0], deck[deck.length - 1]] = [deck.at(-1), deck[0]];
    return deck;
  }
  function next() {
    if (!remaining?.length) remaining = shuffle();
    current = remaining.pop();
    persist();
    return byId.get(current);
  }
  if (!current) next();
  return {
    current: () => byId.get(current),
    remainingCount: () => remaining.length,
    clearedCount: () => cleared.size,
    isCleared: () => cleared.has(current),
    next,
    markCleared() {
      const fresh = !cleared.has(current);
      cleared.add(current);
      persist();
      return fresh;
    },
  };
}
