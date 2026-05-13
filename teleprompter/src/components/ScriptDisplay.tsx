import React, { useEffect, useRef, useState, useCallback } from 'react';
import { KEYWORD_MAP } from '../keyword-map';
import { PEOPLE } from '@video/constants';

interface ScriptDisplayProps {
  currentTriggerIndex: number;
  countdownResetKey: number;
  onCountdownExpire: () => void;
  onTriggerClick: (index: number) => void;
}

const SCENE_COLORS: Record<number, string> = {
  1: '#ff6b35', 2: '#ff6b35',
  3: '#a855f7', 4: '#a855f7',
  5: '#3b82f6',
  6: '#00d4ff',
  7: '#ec4899',
  8: '#ff6b35',
};

export const ScriptDisplay: React.FC<ScriptDisplayProps> = ({
  currentTriggerIndex,
  countdownResetKey,
  onCountdownExpire,
  onTriggerClick,
}) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [countdownMs, setCountdownMs] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Keep callback ref stable to avoid restarting the countdown when only the
  // callback identity changes (e.g. after React re-renders).
  const onExpireRef = useRef(onCountdownExpire);
  useEffect(() => { onExpireRef.current = onCountdownExpire; }, [onCountdownExpire]);

  // Auto-scroll current item into view
  useEffect(() => {
    itemRefs.current[currentTriggerIndex]?.scrollIntoView({
      behavior: 'smooth', block: 'center',
    });
  }, [currentTriggerIndex]);

  // Countdown timer — resets whenever trigger index or reset key changes
  useEffect(() => {
    const trigger = KEYWORD_MAP[currentTriggerIndex];
    if (!trigger || trigger.timeoutSeconds === 0) {
      setCountdownMs(0);
      return;
    }

    const totalMs = trigger.timeoutSeconds * 1000;
    setCountdownMs(totalMs);

    const interval = setInterval(() => {
      setCountdownMs(prev => {
        if (prev <= 100) {
          clearInterval(interval);
          onExpireRef.current();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentTriggerIndex, countdownResetKey]);

  const handleClick = useCallback((idx: number) => {
    onTriggerClick(idx);
  }, [onTriggerClick]);

  const currentTrigger = KEYWORD_MAP[currentTriggerIndex];
  const totalMs = (currentTrigger?.timeoutSeconds ?? 12) * 1000;
  const barPct = totalMs > 0 ? (countdownMs / totalMs) * 100 : 0;
  const isWarning = countdownMs <= 3000 && countdownMs > 0;

  return (
    <div style={styles.outer}>
      <style>{css}</style>
      <div style={styles.fadeTop} />
      <div style={styles.fadeBottom} />

      <div style={styles.list}>
        {KEYWORD_MAP.map((trigger, idx) => {
          const state: 'past' | 'current' | 'upcoming' =
            idx < currentTriggerIndex ? 'past'
            : idx === currentTriggerIndex ? 'current'
            : 'upcoming';

          const personColor = PEOPLE[trigger.person]?.color ?? '#6b7280';
          const sceneColor = SCENE_COLORS[trigger.scene] ?? '#6b7280';
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={trigger.id}
              ref={el => { itemRefs.current[idx] = el; }}
              onClick={() => handleClick(idx)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                ...styles.item,
                ...(state === 'past' ? styles.past : {}),
                ...(state === 'current' ? styles.current : {}),
                ...(state === 'upcoming' ? styles.upcoming : {}),
                cursor: 'pointer',
                position: 'relative',
                ...(isHovered && state !== 'current' ? styles.itemHover : {}),
              }}
            >
              {/* Badges row */}
              <div style={styles.badges}>
                <span style={{ ...styles.badge, background: sceneColor + '33', color: sceneColor }}>
                  ESC. {trigger.scene}
                </span>
                <span style={{ ...styles.badge, background: personColor + '33', color: personColor }}>
                  P{trigger.person}
                </span>
                <span style={styles.keywordBadge}>
                  «{trigger.keyword}»
                </span>
                {state === 'current' && (
                  <span style={styles.animLabel}>{trigger.animationLabel}</span>
                )}

                {/* Hover "go here" label */}
                {state !== 'current' && (
                  <span
                    style={{
                      ...styles.goHereLabel,
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    ▶ ir aquí
                  </span>
                )}
              </div>

              {/* Script line */}
              <div
                style={{
                  ...styles.scriptLine,
                  textDecoration: state === 'past' ? 'line-through' : 'none',
                  position: 'relative',
                  overflow: state === 'current' ? 'hidden' : 'visible',
                }}
              >
                {state === 'current' && <div style={styles.sweepOverlay} />}
                {trigger.scriptLine}
              </div>

              {/* Countdown bar — only on current item */}
              {state === 'current' && barPct > 0 && (
                <div style={styles.countdownTrack}>
                  <div
                    style={{
                      ...styles.countdownFill,
                      width: `${barPct}%`,
                      background: isWarning ? '#ef4444' : '#00d4ff',
                      animation: isWarning ? 'countdownPulse 0.5s ease-in-out infinite' : 'none',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Keyboard hint — bottom-left */}
      <div style={styles.kbHint}>
        ESPACIO = avanzar · ← → = navegar
      </div>
    </div>
  );
};

const css = `
@keyframes sweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
@keyframes countdownPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}
`;

const styles: Record<string, React.CSSProperties> = {
  outer: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  fadeTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 60,
    background: 'linear-gradient(to bottom, #0a0a0f 0%, transparent 100%)',
    zIndex: 2, pointerEvents: 'none',
  },
  fadeBottom: {
    position: 'absolute', bottom: 36, left: 0, right: 0, height: 60,
    background: 'linear-gradient(to top, #0a0a0f 0%, transparent 100%)',
    zIndex: 2, pointerEvents: 'none',
  },
  list: {
    height: 'calc(100% - 28px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '60px 20px 60px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#1a1a2e #0a0a0f',
  },
  item: {
    padding: '12px 16px',
    marginBottom: 8,
    borderRadius: 8,
    borderLeft: '3px solid transparent',
    transition: 'background 0.2s ease, opacity 0.2s ease',
  },
  itemHover: {
    background: 'rgba(255,255,255,0.04)',
  },
  past: {
    opacity: 0.3,
    color: '#6b7280',
  },
  current: {
    background: '#1a2a1a',
    borderLeft: '3px solid #00ff88',
    color: '#ffffff',
    fontWeight: 600,
  },
  upcoming: {
    opacity: 0.7,
    color: '#ffffff',
  },
  badges: {
    display: 'flex',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 999,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  keywordBadge: {
    fontSize: 11,
    fontFamily: '"JetBrains Mono", monospace',
    color: '#00d4ff',
    background: 'rgba(0,212,255,0.1)',
    padding: '2px 7px',
    borderRadius: 4,
    border: '1px solid rgba(0,212,255,0.3)',
  },
  animLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic' as const,
  },
  goHereLabel: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#00d4ff',
    fontFamily: '"JetBrains Mono", monospace',
    transition: 'opacity 0.15s ease',
    pointerEvents: 'none',
  },
  scriptLine: {
    fontSize: 16,
    lineHeight: 1.6,
  },
  sweepOverlay: {
    position: 'absolute',
    top: 0, left: 0,
    width: '30%', height: '100%',
    background: 'linear-gradient(to right, transparent 0%, rgba(0,255,136,0.12) 50%, transparent 100%)',
    animation: 'sweep 2.5s ease-in-out infinite',
    pointerEvents: 'none',
  },
  countdownTrack: {
    marginTop: 8,
    width: '100%',
    height: 3,
    background: '#1a1a2e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  countdownFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.1s linear, background 0.3s ease',
  },
  kbHint: {
    position: 'absolute',
    bottom: 8,
    left: 20,
    fontSize: 11,
    color: '#374151',
    fontFamily: '"JetBrains Mono", monospace',
    letterSpacing: '0.04em',
    zIndex: 3,
    pointerEvents: 'none',
  },
};
