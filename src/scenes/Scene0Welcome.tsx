import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../constants';

export const Scene0Welcome: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        opacity,
      }}
    >
      <svg width="140" height="70" viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
        <rect width="140" height="70" rx="10" fill="#0070f2" />
        <text
          x="70"
          y="50"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="38"
          fill="white"
        >
          SAP
        </text>
      </svg>
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 72,
          fontWeight: 800,
          color: COLORS.white,
          letterSpacing: '-0.02em',
          textAlign: 'center',
        }}
      >
        Hackathon SAP
      </div>
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 38,
          fontWeight: 600,
          color: '#0070f2',
          letterSpacing: '0.18em',
          textAlign: 'center',
        }}
      >
        SEIDM
      </div>
    </div>
  );
};
