import React, { useEffect, useState } from 'react';
import { KEYWORD_MAP } from '../keyword-map';
import { MicState } from '../useSpeechRecognition';

interface SpeechStatusProps {
  micState: MicState;
  lastDetectedKeyword: string | null;
  currentTriggerIndex: number;
  restartWarning: boolean;
  speechApiAvailable: boolean;
}

const DOT_CONFIG: Record<MicState, { color: string; label: string; pulse: boolean }> = {
  listening:   { color: '#00ff88', label: 'Escuchando...',   pulse: true  },
  restarting:  { color: '#f59e0b', label: 'Reiniciando...', pulse: true  },
  error:       { color: '#ef4444', label: 'Error de mic',    pulse: false },
  paused:      { color: '#6b7280', label: 'En pausa',        pulse: false },
};

export const SpeechStatus: React.FC<SpeechStatusProps> = ({
  micState,
  lastDetectedKeyword,
  currentTriggerIndex,
  restartWarning,
  speechApiAvailable,
}) => {
  const [visibleKeyword, setVisibleKeyword] = useState<string | null>(null);
  const dot = DOT_CONFIG[micState];

  useEffect(() => {
    if (!lastDetectedKeyword) return;
    setVisibleKeyword(lastDetectedKeyword);
    const t = setTimeout(() => setVisibleKeyword(null), 3000);
    return () => clearTimeout(t);
  }, [lastDetectedKeyword]);

  return (
    <>
      <style>{css}</style>

      {/* Non-Chrome warning */}
      {!speechApiAvailable && (
        <div style={styles.noChromeWarning}>
          ⚠ Web Speech API no disponible. Usa <strong>ESPACIO</strong> o los botones para avanzar manualmente.
        </div>
      )}

      {/* Restart rate-limit warning */}
      {restartWarning && (
        <div style={styles.restartWarning}>
          ⚠️ Micrófono inestable — usa <strong>ESPACIO</strong> para avanzar
        </div>
      )}

      {/* Main status bar */}
      <div style={styles.bar}>
        {/* Left: mic status */}
        <div style={styles.left}>
          <span
            style={{
              ...styles.dot,
              background: dot.color,
              animation: dot.pulse ? 'pulse 1.2s ease-in-out infinite' : 'none',
            }}
          />
          <span style={{ color: dot.color, fontSize: 13 }}>
            {dot.label}
          </span>
        </div>

        {/* Center: last detected keyword */}
        <div style={styles.center}>
          {visibleKeyword && (
            <span style={styles.detected} key={visibleKeyword}>
              Detectado: <span style={styles.keyword}>«{visibleKeyword}»</span>
            </span>
          )}
        </div>

        {/* Right: progress + always-visible hint */}
        <div style={styles.right}>
          <span style={styles.hint}>ESPACIO = avanzar</span>
          <span style={styles.progress}>
            {currentTriggerIndex + 1} / {KEYWORD_MAP.length}
          </span>
        </div>
      </div>
    </>
  );
};

const css = `
@keyframes pulse {
  0%   { transform: scale(1);   opacity: 1; }
  50%  { transform: scale(1.3); opacity: 0.5; }
  100% { transform: scale(1);   opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

const styles: Record<string, React.CSSProperties> = {
  bar: {
    height: 40,
    background: '#111118',
    borderBottom: '1px solid #1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    flexShrink: 0,
  },
  noChromeWarning: {
    background: 'rgba(245,158,11,0.15)',
    borderBottom: '1px solid rgba(245,158,11,0.35)',
    color: '#f59e0b',
    fontSize: 13,
    padding: '7px 20px',
    flexShrink: 0,
    textAlign: 'center',
  },
  restartWarning: {
    background: 'rgba(239,68,68,0.15)',
    borderBottom: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
    fontSize: 13,
    padding: '6px 20px',
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 170,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  center: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 20,
  },
  detected: {
    fontSize: 13,
    color: '#9ca3af',
    animation: 'fadeIn 0.2s ease-out',
  },
  keyword: {
    color: '#00d4ff',
    fontFamily: '"JetBrains Mono", monospace',
    fontWeight: 500,
  },
  right: {
    minWidth: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 14,
  },
  hint: {
    fontSize: 11,
    color: '#4b5563',
    fontFamily: '"JetBrains Mono", monospace',
    letterSpacing: '0.04em',
  },
  progress: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: '"JetBrains Mono", monospace',
  },
};
