import React from 'react';
import { Box } from '@mui/material';

interface GoldenGlowProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center-right';
  size?: string;
  opacity?: number;
  blur?: string;
  zIndex?: number;
}

// Define types for position styles to handle the transform property properly
type PositionStyle = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  transform?: string;
};

export default function GoldenGlow({
  position = 'top-right',
  size = '30vw',
  opacity = 0.15,
  blur = '150px',
  zIndex = 0,
}: GoldenGlowProps) {
  // Define position styling based on the position prop
  const positionStyles: Record<string, PositionStyle> = {
    'top-right': {
      top: '-10vh',
      right: '-5vw',
    },
    'top-left': {
      top: '-10vh',
      left: '-5vw',
    },
    'bottom-right': {
      bottom: '-10vh',
      right: '-5vw',
    },
    'bottom-left': {
      bottom: '-10vh',
      left: '-5vw',
    },
    'center-right': {
      top: '50%',
      right: '-5vw',
      transform: 'translateY(-50%)',
    },
  };

  // Get the current position style
  const currentPositionStyle = positionStyles[position];
  // Get transform or empty string if it doesn't exist
  const transformValue = currentPositionStyle.transform || '';

  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 204, 127, 0.8) 0%, rgba(245, 204, 127, 0.3) 50%, rgba(245, 204, 127, 0) 70%)',
        filter: `blur(${blur})`,
        opacity,
        zIndex,
        pointerEvents: 'none',
        ...currentPositionStyle,
        animation: 'pulse 10s infinite alternate',
        '@keyframes pulse': {
          '0%': {
            opacity: opacity - 0.05,
            transform: transformValue 
              ? `${transformValue} scale(0.95)` 
              : 'scale(0.95)',
          },
          '50%': {
            opacity: opacity + 0.03,
            transform: transformValue 
              ? `${transformValue} scale(1)` 
              : 'scale(1)',
          },
          '100%': {
            opacity: opacity - 0.02,
            transform: transformValue 
              ? `${transformValue} scale(0.98)` 
              : 'scale(0.98)',
          },
        },
      }}
    />
  );
} 