import { useState, useRef, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const ROLLING_BUFFER_SIZE = 50;
const MAX_RESTARTS_PER_MINUTE = 10;
const RESTART_WINDOW_MS = 60_000;
const RESTART_DELAY_MS = 300;

export type MicState = 'listening' | 'restarting' | 'error' | 'paused';

export interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  lastWord: string;
  recentWords: string[];
  start: () => void;
  stop: () => void;
  error: string | null;
  micState: MicState;
  isRestarting: boolean;
  restartWarning: boolean;
  speechApiAvailable: boolean;
}

const speechApiAvailable =
  typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastWord, setLastWord] = useState('');
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartWarning, setRestartWarning] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const rollingBufferRef = useRef<string[]>([]);
  const restartCountRef = useRef(0);
  const restartWindowStartRef = useRef(Date.now());

  const micState: MicState = isRestarting
    ? 'restarting'
    : isListening
    ? 'listening'
    : error !== null
    ? 'error'
    : 'paused';

  const pushWords = useCallback((text: string) => {
    const words = text.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return;
    rollingBufferRef.current = [
      ...rollingBufferRef.current,
      ...words,
    ].slice(-ROLLING_BUFFER_SIZE);
    setRecentWords([...rollingBufferRef.current]);
    setLastWord(words[words.length - 1]);
  }, []);

  // Rate-limited restart. Returns false if the rate limit was hit.
  const tryRestart = useCallback(() => {
    const now = Date.now();
    if (now - restartWindowStartRef.current > RESTART_WINDOW_MS) {
      restartWindowStartRef.current = now;
      restartCountRef.current = 0;
      setRestartWarning(false);
    }

    if (restartCountRef.current >= MAX_RESTARTS_PER_MINUTE) {
      setRestartWarning(true);
      setIsListening(false);
      isListeningRef.current = false;
      return;
    }

    restartCountRef.current++;
    setIsRestarting(true);

    setTimeout(() => {
      if (!isListeningRef.current) return;
      setIsRestarting(false);
      try {
        recognitionRef.current?.start();
      } catch (_) {
        // already started
      }
    }, RESTART_DELAY_MS);
  }, []);

  const createRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
          for (let j = 0; j < result.length; j++) {
            pushWords(result[j].transcript);
          }
        } else {
          interimText += result[0].transcript;
          pushWords(result[0].transcript);
        }
      }

      if (finalText) setTranscript(prev => prev + ' ' + finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return; // non-fatal
      setError(`Error: ${event.error}`);
      if (isListeningRef.current) tryRestart();
    };

    recognition.onend = () => {
      setInterimTranscript('');
      if (isListeningRef.current) {
        tryRestart();
      } else {
        setIsListening(false);
        setIsRestarting(false);
      }
    };

    return recognition;
  }, [pushWords, tryRestart]);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  const start = useCallback(() => {
    setError(null);
    setRestartWarning(false);
    restartCountRef.current = 0;
    restartWindowStartRef.current = Date.now();

    const recognition = createRecognition();
    if (!recognition) {
      setError('Web Speech API no disponible. Usa Chrome o ESPACIO para avanzar.');
      return;
    }
    recognitionRef.current = recognition;
    isListeningRef.current = true;
    setIsListening(true);
    setIsRestarting(false);
    try {
      recognition.start();
    } catch (_) {
      // already started
    }
  }, [createRecognition]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setIsRestarting(false);
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    lastWord,
    recentWords,
    start,
    stop,
    error,
    micState,
    isRestarting,
    restartWarning,
    speechApiAvailable,
  };
}
