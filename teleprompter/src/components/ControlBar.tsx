import React from 'react';

interface ControlBarProps {
  onPrev: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onStartListening: () => void;
  onStop: () => void;
  isPlaying: boolean;
  isListening: boolean;
  currentScene: number;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onPrev,
  onNext,
  onPlayPause,
  onStartListening,
  onStop,
  isPlaying,
  isListening,
  currentScene,
  canGoPrev,
  canGoNext,
}) => {
  return (
    <div style={styles.bar}>
      <style>{hoverStyles}</style>

      <Btn onClick={onPrev} disabled={!canGoPrev} label="← Anterior" />
      <Btn onClick={onPlayPause} label={isPlaying ? '⏸ Pausa' : '▶ Play'} accent />
      <Btn onClick={onNext} disabled={!canGoNext} label="Siguiente →" />

      <div style={styles.divider} />

      <Btn
        onClick={onStartListening}
        label="🎤 Iniciar escucha"
        disabled={isListening}
        active={isListening}
      />
      <Btn onClick={onStop} label="⏹ Detener" disabled={!isListening} />

      <div style={styles.divider} />

      <span style={styles.sceneLabel}>
        Escena: <strong style={{ color: '#00d4ff' }}>{currentScene}</strong>
      </span>
    </div>
  );
};

interface BtnProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  accent?: boolean;
  active?: boolean;
}

const Btn: React.FC<BtnProps> = ({ onClick, label, disabled, accent, active }) => (
  <button
    className="tp-btn"
    onClick={onClick}
    disabled={disabled}
    style={{
      ...btnBase,
      ...(accent ? btnAccent : {}),
      ...(active ? btnActive : {}),
      ...(disabled ? btnDisabled : {}),
    }}
  >
    {label}
  </button>
);

const hoverStyles = `
.tp-btn:hover:not(:disabled) {
  background: rgba(0, 212, 255, 0.1) !important;
  border-color: #00d4ff !important;
  color: #00d4ff !important;
}
`;

const btnBase: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#ffffff',
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: '"Inter", sans-serif',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
};

const btnAccent: React.CSSProperties = {
  borderColor: 'rgba(0,212,255,0.4)',
  color: '#00d4ff',
};

const btnActive: React.CSSProperties = {
  background: 'rgba(0,255,136,0.1)',
  borderColor: '#00ff88',
  color: '#00ff88',
};

const btnDisabled: React.CSSProperties = {
  opacity: 0.35,
  cursor: 'not-allowed',
};

const styles: Record<string, React.CSSProperties> = {
  bar: {
    height: 60,
    background: '#111118',
    borderTop: '1px solid #1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 20px',
    flexShrink: 0,
  },
  divider: {
    width: 1,
    height: 24,
    background: '#1a1a2e',
    margin: '0 4px',
  },
  sceneLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
};
