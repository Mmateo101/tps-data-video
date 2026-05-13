import React, { useState, useEffect } from 'react';
import { interpolate, spring, staticFile, Video } from 'remotion';
import { COLORS, FONTS, PEOPLE } from '../constants';
import {
  runDetection,
  onDetectionComplete,
  detectedMode,
} from '../utils/videoDetector';

interface PersonPanelProps {
  personId: number | null;
  frame: number;
  sceneNumber?: number;
}

export const PersonPanel: React.FC<PersonPanelProps> = ({ personId, frame, sceneNumber }) => {
  const [mode, setMode] = useState(detectedMode);

  useEffect(() => {
    if (!personId) return;
    runDetection();
    const unsub = onDetectionComplete(() => setMode(detectedMode));
    return unsub;
  }, [personId]);

  if (!personId) return null;

  const person = PEOPLE[personId];
  const breathe = interpolate(frame % 60, [0, 30, 60], [0.6, 1, 0.6]);
  const nameOpacity = spring({
    frame: frame - 10,
    fps: 30,
    config: { damping: 14, stiffness: 120 },
  });

  let videoSrc: string | null = null;
  if (mode === 'scenes') {
    videoSrc = staticFile(`videos/scene${sceneNumber ?? 1}.mp4`);
  } else if (mode === 'single') {
    videoSrc = staticFile('videos/scene1.mp4');
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: 32,
      }}
    >
      <div
        style={{
          width: 340,
          height: 440,
          borderRadius: 16,
          border: '2px dashed #333',
          background: '#0d0d14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {videoSrc ? (
          <Video
            src={videoSrc}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.gray,
              opacity: breathe,
            }}
          >
            [ Video ]
          </span>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          opacity: Math.min(nameOpacity, 1),
        }}
      >
        <span
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 700,
            fontSize: 18,
            color: COLORS.white,
          }}
        >
          {person.name}
        </span>
        <span
          style={{
            fontFamily: FONTS.heading,
            fontSize: 11,
            color: person.color,
            background: person.color + '33',
            border: `1px solid ${person.color}`,
            borderRadius: 100,
            padding: '4px 14px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {person.role}
        </span>
      </div>
    </div>
  );
};
