'use client';

import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerOrbProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  volumeLevel?: number; // 0 to 100
  color?: string;
  size?: number;
  onClick?: () => void;
}

export const VoiceVisualizerOrb: React.FC<VoiceVisualizerOrbProps> = ({
  isActive,
  isListening,
  isSpeaking,
  volumeLevel = 0,
  color = '#00F0FF',
  size = 140,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = size * 0.28;

      // Calculate dynamic radius based on voice activity
      const dynamicBoost = isActive
        ? (isSpeaking ? 18 : isListening ? Math.max(volumeLevel * 0.25, 8) : 4)
        : 0;

      const currentRadius = baseRadius + dynamicBoost;

      // 1. Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, currentRadius * 0.4, cx, cy, currentRadius * 1.8);
      glowGrad.addColorStop(0, `${color}66`);
      glowGrad.addColorStop(0.5, `${color}22`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 2. Multi-Layer Frequency Waves
      const wavesCount = isSpeaking || isListening ? 4 : 2;
      for (let w = 0; w < wavesCount; w++) {
        ctx.beginPath();
        const waveRadius = currentRadius + Math.sin(phase * 2 + w * 1.2) * (dynamicBoost + 3);
        const wavePoints = 48;

        for (let i = 0; i <= wavePoints; i++) {
          const angle = (i / wavePoints) * Math.PI * 2;
          const noise = Math.sin(angle * (5 + w) + phase * 3 + w) * (isSpeaking ? 8 : isListening ? 6 : 2);
          const r = waveRadius + noise;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = w === 0 ? color : `${color}88`;
        ctx.lineWidth = w === 0 ? 2.5 : 1.2;
        ctx.stroke();
      }

      // 3. Central Core Neural Sphere
      const coreGrad = ctx.createRadialGradient(
        cx - currentRadius * 0.3,
        cy - currentRadius * 0.3,
        currentRadius * 0.1,
        cx,
        cy,
        currentRadius
      );
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.3, color);
      coreGrad.addColorStop(0.8, '#060B18');
      coreGrad.addColorStop(1, '#02040A');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Orbiting Data Photons
      const photonCount = isActive ? 6 : 3;
      for (let p = 0; p < photonCount; p++) {
        const pAngle = phase * (p % 2 === 0 ? 1.5 : -1.2) + (p * Math.PI * 2) / photonCount;
        const pDist = currentRadius * (1.2 + Math.sin(phase + p) * 0.2);
        const px = cx + Math.cos(pAngle) * pDist;
        const py = cy + Math.sin(pAngle) * pDist;

        ctx.fillStyle = '#00FFA3';
        ctx.shadowColor = '#00FFA3';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      phase += 0.035;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, isListening, isSpeaking, volumeLevel, color, size]);

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
      className="relative flex items-center justify-center select-none"
      title={isListening ? 'Listening (Click to mute)' : isSpeaking ? 'Agent Speaking' : 'Click to activate voice mode'}
    >
      <canvas ref={canvasRef} width={size} height={size} className="block" />
    </div>
  );
};
