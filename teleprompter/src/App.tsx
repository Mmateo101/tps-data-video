import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PlayerRef } from '@remotion/player';
import { KEYWORD_MAP, KeywordTrigger } from './keyword-map';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useKeywordDetector } from './useKeywordDetector';
import { SpeechStatus } from './components/SpeechStatus';
import { ScriptDisplay } from './components/ScriptDisplay';
import { PlayerPanel } from './components/PlayerPanel';
import { ControlBar } from './components/ControlBar';

const SCENE_OFFSETS = [0, 1200, 2400, 3600, 4800, 6000, 7200, 8100, 9000];
function frameToScene(frame: number): number {
  for (let i = SCENE_OFFSETS.length - 1; i >= 0; i--) {
    if (frame >= SCENE_OFFSETS[i]) return i + 1;
  }
  return 1;
}

type FlashKind = 'advance' | 'jump' | null;

const App: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentTriggerIndex, setCurrentTriggerIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastDetectedKeyword, setLastDetectedKeyword] = useState<string | null>(null);

  // Countdown reset: increments to give the ScriptDisplay a fresh 12s window
  // without changing which trigger we're on (e.g. after auto-play finishes).
  const [countdownResetKey, setCountdownResetKey] = useState(0);

  // Flash overlay state ("→ Manual" / "↗ Salto manual")
  const [flashKind, setFlashKind] = useState<FlashKind>(null);

  const {
    isListening,
    recentWords,
    start: startListening,
    stop: stopListening,
    error,
    micState,
    restartWarning,
    speechApiAvailable,
  } = useSpeechRecognition();

  // ── Player event subscriptions ────────────────────────────────────────────

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrame = (e: Event) => {
      setCurrentFrame((e as CustomEvent<{ frame: number }>).detail.frame);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      // Give the presenter a fresh countdown window after any pause
      setCountdownResetKey(k => k + 1);
    };

    player.addEventListener('frameupdate', onFrame);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    return () => {
      player.removeEventListener('frameupdate', onFrame);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, []);

  // ── Core seek+play helper ─────────────────────────────────────────────────

  const seekAndPlay = useCallback((trigger: KeywordTrigger) => {
    const player = playerRef.current;
    if (!player) return;

    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }

    player.seekTo(trigger.seekToFrame);
    setCurrentFrame(trigger.seekToFrame);

    if (trigger.autoPlayDuration > 0) {
      player.play();
      setIsPlaying(true);
      const ms = (trigger.autoPlayDuration / 30) * 1000;
      autoPlayTimerRef.current = setTimeout(() => {
        player.pause();
        setIsPlaying(false);
      }, ms);
    }
  }, []);

  // ── Flash helper ──────────────────────────────────────────────────────────

  const showFlash = useCallback((kind: FlashKind) => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlashKind(kind);
    flashTimerRef.current = setTimeout(() => setFlashKind(null), 1500);
  }, []);

  // ── Speech-detected advance ───────────────────────────────────────────────

  const handleKeywordDetected = useCallback(
    (trigger: KeywordTrigger, detectedAtIndex: number) => {
      setLastDetectedKeyword(trigger.keyword);
      seekAndPlay(trigger);
      setCurrentTriggerIndex(detectedAtIndex + 1);
      // countdown resets automatically because currentTriggerIndex changed
    },
    [seekAndPlay]
  );

  useKeywordDetector({ recentWords, currentTriggerIndex, onKeywordDetected: handleKeywordDetected });

  // ── Layer 1: Manual advance (SPACE / ArrowRight) ──────────────────────────

  const handleManualAdvance = useCallback(() => {
    const trigger = KEYWORD_MAP[currentTriggerIndex];
    if (!trigger) return;
    seekAndPlay(trigger);
    setCurrentTriggerIndex(prev => Math.min(prev + 1, KEYWORD_MAP.length - 1));
    showFlash('advance');
  }, [currentTriggerIndex, seekAndPlay, showFlash]);

  // ── Layer 3: Click any script line ───────────────────────────────────────

  const handleJumpTo = useCallback((index: number) => {
    const trigger = KEYWORD_MAP[index];
    if (!trigger) return;
    playerRef.current?.seekTo(trigger.seekToFrame);
    setCurrentFrame(trigger.seekToFrame);
    setCurrentTriggerIndex(index);
    setCountdownResetKey(k => k + 1);
    showFlash('jump');
  }, [showFlash]);

  // ── Layer 2: Countdown expired ────────────────────────────────────────────

  const handleCountdownExpire = useCallback(() => {
    handleManualAdvance();
  }, [handleManualAdvance]);

  // ── Global keyboard listener (Layer 1) ───────────────────────────────────

  const handlePrev = useCallback(() => {
    const newIdx = Math.max(0, currentTriggerIndex - 1);
    const trigger = KEYWORD_MAP[newIdx];
    playerRef.current?.seekTo(trigger.seekToFrame);
    setCurrentFrame(trigger.seekToFrame);
    setCurrentTriggerIndex(newIdx);
    // countdown resets because currentTriggerIndex changed
  }, [currentTriggerIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleManualAdvance();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleManualAdvance, handlePrev]);

  // ── Standard controls ─────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    const newIdx = Math.min(KEYWORD_MAP.length - 1, currentTriggerIndex + 1);
    const trigger = KEYWORD_MAP[newIdx];
    playerRef.current?.seekTo(trigger.seekToFrame);
    setCurrentFrame(trigger.seekToFrame);
    setCurrentTriggerIndex(newIdx);
  }, [currentTriggerIndex]);

  const handlePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) { player.pause(); } else { player.play(); }
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    stopListening();
    playerRef.current?.pause();
    setIsPlaying(false);
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, [stopListening]);

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const currentScene = frameToScene(currentFrame);

  return (
    <div style={styles.root}>
      <SpeechStatus
        micState={micState}
        lastDetectedKeyword={lastDetectedKeyword}
        currentTriggerIndex={currentTriggerIndex}
        restartWarning={restartWarning}
        speechApiAvailable={speechApiAvailable}
      />

      {error && !restartWarning && (
        <div style={styles.errorBanner}>⚠ {error}</div>
      )}

      <div style={styles.body}>
        <div style={styles.leftPanel}>
          <ScriptDisplay
            currentTriggerIndex={currentTriggerIndex}
            countdownResetKey={countdownResetKey}
            onCountdownExpire={handleCountdownExpire}
            onTriggerClick={handleJumpTo}
          />
        </div>
        <div style={styles.rightPanel}>
          <PlayerPanel playerRef={playerRef} currentFrame={currentFrame} />
        </div>
      </div>

      <ControlBar
        onPrev={handlePrev}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        onStartListening={startListening}
        onStop={handleStop}
        isPlaying={isPlaying}
        isListening={isListening}
        currentScene={currentScene}
        canGoPrev={currentTriggerIndex > 0}
        canGoNext={currentTriggerIndex < KEYWORD_MAP.length - 1}
      />

      {/* Flash overlay — top-right */}
      {flashKind && (
        <div style={styles.flash}>
          {flashKind === 'advance' ? '→ Manual' : '↗ Salto manual'}
        </div>
      )}
    </div>
  );
};

export default App;

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0a0f',
    fontFamily: '"Inter", sans-serif',
    overflow: 'hidden',
    position: 'relative',
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.15)',
    borderBottom: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
    fontSize: 13,
    padding: '6px 20px',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  leftPanel: {
    width: '45%',
    borderRight: '1px solid #1a1a2e',
    overflow: 'hidden',
  },
  rightPanel: {
    width: '55%',
    overflow: 'hidden',
  },
  flash: {
    position: 'fixed',
    top: 52,
    right: 20,
    background: 'rgba(0,212,255,0.15)',
    border: '1px solid rgba(0,212,255,0.4)',
    color: '#00d4ff',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13,
    fontWeight: 600,
    padding: '5px 14px',
    borderRadius: 6,
    pointerEvents: 'none',
    animation: 'flashFade 1.5s ease-out forwards',
    zIndex: 100,
  },
};
