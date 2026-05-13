import { useEffect, useRef } from 'react';
import { KEYWORD_MAP, KeywordTrigger } from './keyword-map';

interface KeywordDetectorProps {
  recentWords: string[];
  currentTriggerIndex: number;
  onKeywordDetected: (trigger: KeywordTrigger, index: number) => void;
}

const DEBOUNCE_MS = 2000;
const FALSE_POSITIVE_GUARD_MS = 3000;
const LOOKAHEAD = 2;

function wordsContain(recentWords: string[], phrase: string): boolean {
  const normalized = phrase.toLowerCase().trim();
  // Single word — check direct inclusion
  if (!normalized.includes(' ')) {
    return recentWords.some(w => w.includes(normalized));
  }
  // Multi-word phrase — join buffer and check substring
  const buffer = recentWords.join(' ');
  return buffer.includes(normalized);
}

export function useKeywordDetector({
  recentWords,
  currentTriggerIndex,
  onKeywordDetected,
}: KeywordDetectorProps): void {
  const lastFiredAt = useRef<Record<string, number>>({});
  const globalLockUntil = useRef<number>(0);

  useEffect(() => {
    if (recentWords.length === 0) return;

    const now = Date.now();

    // Global debounce: no trigger fires within DEBOUNCE_MS of the last one
    if (now < globalLockUntil.current) return;

    const maxIdx = Math.min(
      currentTriggerIndex + LOOKAHEAD,
      KEYWORD_MAP.length - 1
    );

    for (let i = currentTriggerIndex; i <= maxIdx; i++) {
      const trigger = KEYWORD_MAP[i];

      // False-positive guard: same trigger can't re-fire within 3s
      const lastFired = lastFiredAt.current[trigger.id] ?? 0;
      if (now - lastFired < FALSE_POSITIVE_GUARD_MS) continue;

      const allPhrases = [trigger.keyword, ...trigger.alternatives];
      const matched = allPhrases.some(phrase => wordsContain(recentWords, phrase));

      if (matched) {
        lastFiredAt.current[trigger.id] = now;
        globalLockUntil.current = now + DEBOUNCE_MS;
        onKeywordDetected(trigger, i);
        break; // fire at most one trigger per speech result cycle
      }
    }
  }, [recentWords, currentTriggerIndex, onKeywordDetected]);
}
