import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CircularProgressProps {
  value: number; // Score from 0 to 10
  size?: number; // Outer diameter in pixels
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 80,
  strokeWidth = 6,
}) => {
  const prefersReduced = useReducedMotion();
  const clampedValue = Math.max(0, Math.min(10, value));
  const progressRatio = clampedValue / 10;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Color logic based on score:
  // <=3 = cp-teal (#00CED1)
  // 4-6 = cp-amber (#F59E0B)
  // >=7 = cp-coral (#EF4444)
  let progressColor = '#00CED1'; // Default teal
  if (clampedValue > 3 && clampedValue <= 6) {
    progressColor = '#F59E0B'; // Amber
  } else if (clampedValue > 6) {
    progressColor = '#EF4444'; // Coral
  }

  const pathTransition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.8, ease: 'easeOut' };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1E3A52" // cp-border
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progressRatio) }}
          transition={pathTransition}
          style={{ originX: '50%', originY: '50%' }}
        />
      </svg>
      {/* Centered value label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display font-bold text-[1.5rem] tracking-tight"
          style={{ color: progressColor }}
        >
          {clampedValue}
        </span>
      </div>
    </div>
  );
};
export default CircularProgress;
