import React from 'react';
import { Status } from '../../api/types';

interface PulseGaugeProps {
  score: number;
  status: Status;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const PulseGauge: React.FC<PulseGaugeProps> = ({
  score,
  status,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Score 0..100 maps to strokeDashoffset
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = circumference - progress * circumference;

  const strokeColors = {
    calm: 'var(--status-calm)',
    watch: 'var(--status-watch)',
    strained: 'var(--status-strained)',
    critical: 'var(--status-critical)',
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColors[status]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-bold tracking-tight text-text">
            {score.toFixed(0)}
          </span>
          <span className="text-[10px] text-muted uppercase font-heading tracking-wider">Score</span>
        </div>
      )}
    </div>
  );
};
