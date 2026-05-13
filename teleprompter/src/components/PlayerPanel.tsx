import React from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { MainVideo } from '@video/MainVideo';

interface PlayerPanelProps {
  playerRef: React.RefObject<PlayerRef>;
  currentFrame: number;
}

const TOTAL_FRAMES = 9300;
const FPS = 30;

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ playerRef, currentFrame }) => {
  const progressPct = (currentFrame / TOTAL_FRAMES) * 100;
  const seconds = (currentFrame / FPS).toFixed(1);

  return (
    <div style={styles.panel}>
      <div style={styles.playerWrapper}>
        <Player
          ref={playerRef}
          component={MainVideo}
          durationInFrames={TOTAL_FRAMES}
          fps={FPS}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{ width: '100%', aspectRatio: '16/9' }}
          controls={false}
          loop={false}
          autoPlay={false}
          clickToPlay={false}
        />
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
      </div>
      <div style={styles.frameLabel}>
        Frame {currentFrame} / {TOTAL_FRAMES} · {seconds}s
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '16px 16px 8px',
    background: '#0a0a0f',
  },
  playerWrapper: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 0 0 1px #1a1a2e',
  },
  progressTrack: {
    marginTop: 10,
    width: '100%',
    height: 4,
    background: '#1a1a2e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#00d4ff',
    borderRadius: 2,
    transition: 'width 0.1s linear',
  },
  frameLabel: {
    marginTop: 6,
    fontSize: 11,
    color: '#6b7280',
    fontFamily: '"JetBrains Mono", monospace',
    textAlign: 'center',
  },
};
