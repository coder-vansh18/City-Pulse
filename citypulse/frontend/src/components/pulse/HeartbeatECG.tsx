import React, { useEffect, useRef } from 'react';
import { Status } from '../../api/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface HeartbeatECGProps {
  bpm: number;
  irregularity?: number;
  status: Status;
  confidence?: number;
  degraded?: boolean;
  height?: number;
  className?: string;
}

export const HeartbeatECG: React.FC<HeartbeatECGProps> = ({
  bpm,
  irregularity = 0,
  status,
  confidence = 0.95,
  degraded = false,
  height = 96,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Waveform state
  const offsetRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(performance.now());
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  const statusColors: Record<Status, string> = {
    calm: '#2DD4A7',
    watch: '#F5C542',
    strained: '#FF8A3D',
    critical: '#FF4D6D',
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    canvas.height = height;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        canvas.height = height;
      }
    };
    window.addEventListener('resize', handleResize);

    // If reduced motion is requested, render static calm or stressed line
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = statusColors[status];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const midY = height / 2;
      ctx.moveTo(0, midY);
      for (let x = 0; x < width; x += 60) {
        ctx.lineTo(x + 20, midY);
        ctx.lineTo(x + 25, midY - 6); // P wave
        ctx.lineTo(x + 30, midY);
        ctx.lineTo(x + 35, midY + 5); // Q
        ctx.lineTo(x + 40, midY - 25); // R
        ctx.lineTo(x + 45, midY + 8); // S
        ctx.lineTo(x + 50, midY);
        ctx.lineTo(x + 55, midY - 8); // T
        ctx.lineTo(x + 60, midY);
      }
      ctx.stroke();
      return () => window.removeEventListener('resize', handleResize);
    }

    // Animation Loop
    let running = true;
    const strokeColor = statusColors[status];
    const midY = height / 2;
    const speed = 2.2; // px per frame

    // PQRST generator function
    const generatePQRST = (progress: number, qrsHeight: number): number => {
      // progress 0..1 across a beat cycle
      if (progress > 0.15 && progress < 0.25) {
        // P Wave
        return -Math.sin(((progress - 0.15) / 0.1) * Math.PI) * 7;
      }
      if (progress >= 0.28 && progress < 0.32) {
        // Q Wave
        return Math.sin(((progress - 0.28) / 0.04) * Math.PI) * 8;
      }
      if (progress >= 0.32 && progress < 0.38) {
        // R Wave (tall spike)
        return -Math.sin(((progress - 0.32) / 0.06) * Math.PI) * qrsHeight;
      }
      if (progress >= 0.38 && progress < 0.44) {
        // S Wave
        return Math.sin(((progress - 0.38) / 0.06) * Math.PI) * 12;
      }
      if (progress >= 0.52 && progress < 0.68) {
        // T Wave
        return -Math.sin(((progress - 0.52) / 0.16) * Math.PI) * 10;
      }
      return 0;
    };

    const beatInterval = 60000 / Math.max(40, Math.min(180, bpm));

    const render = (now: number) => {
      if (!running) return;

      const elapsedSinceBeat = now - lastBeatTimeRef.current;
      // Add irregularity jitter
      const effectiveInterval = beatInterval * (1 + (Math.random() - 0.5) * irregularity * 0.4);

      let currentY = midY;
      const progress = (elapsedSinceBeat % effectiveInterval) / effectiveInterval;
      
      // QRS stress scaling: higher stress = higher QRS peak
      const qrsHeight = Math.min(height * 0.42, 18 + (bpm - 60) * 0.35);

      if (degraded && Math.sin(now / 1500) > 0.4) {
        // Flat dotted line segment when degraded
        currentY = midY;
      } else {
        currentY = midY + generatePQRST(progress, qrsHeight);
      }

      // Append point
      pointsRef.current.push({ x: width, y: currentY });

      // Move points left
      for (let i = 0; i < pointsRef.current.length; i++) {
        pointsRef.current[i].x -= speed;
      }

      // Remove off-screen points
      pointsRef.current = pointsRef.current.filter((p) => p.x >= -10);

      // Draw canvas
      ctx.clearRect(0, 0, width, height);

      // Grid lines background
      ctx.strokeStyle = 'rgba(38, 50, 90, 0.25)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw ECG Waveform
      if (pointsRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = status === 'critical' ? 14 : status === 'strained' ? 10 : 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (confidence < 0.6) {
          ctx.setLineDash([4, 4]);
          ctx.globalAlpha = 0.6;
        }

        ctx.beginPath();
        ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
        for (let i = 1; i < pointsRef.current.length; i++) {
          ctx.lineTo(pointsRef.current[i].x, pointsRef.current[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [bpm, irregularity, status, confidence, degraded, height, prefersReducedMotion]);

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-surface/50 border border-border/60 ${className}`}>
      <canvas ref={canvasRef} className="w-full block" />
      {confidence < 0.7 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface-2/90 border border-border text-[10px] text-muted font-mono tracking-wider uppercase">
          Limited Telemetry Data
        </div>
      )}
      {degraded && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-mono tracking-wider uppercase">
          Degraded Stream Active
        </div>
      )}
    </div>
  );
};
