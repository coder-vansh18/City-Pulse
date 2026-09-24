import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { Status } from '../../api/types';

interface BpmCounterProps {
  bpm: number;
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

export const BpmCounter: React.FC<BpmCounterProps> = ({ bpm, status, size = 'md' }) => {
  const [displayBpm, setDisplayBpm] = useState(bpm);

  useEffect(() => {
    // Smooth interpolation to target BPM
    const step = bpm > displayBpm ? 1 : -1;
    if (displayBpm !== bpm) {
      const timer = setTimeout(() => {
        setDisplayBpm((prev) => prev + step);
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [bpm, displayBpm]);

  const colorClasses = {
    calm: 'text-status-calm',
    watch: 'text-status-watch',
    strained: 'text-status-strained',
    critical: 'text-status-critical animate-pulse',
  };

  const fontSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-baseline gap-1.5 font-mono">
      <Activity className={`w-4 h-4 self-center ${colorClasses[status]}`} />
      <span className={`font-bold tracking-tight ${fontSizes[size]} ${colorClasses[status]}`}>
        {displayBpm}
      </span>
      <span className="text-xs text-muted font-sans font-medium uppercase tracking-wider">BPM</span>
    </div>
  );
};
