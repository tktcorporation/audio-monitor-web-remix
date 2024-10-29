import React, { useEffect, useRef } from 'react';
import { useVolumeAnalysis } from '../../hooks/useVolumeAnalysis';

interface VisualizerCanvasProps {
  analyser: AnalyserNode;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPiPActive: boolean;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  analyser,
  videoRef,
  isPiPActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const { analyzeVolume } = useVolumeAnalysis();

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !analyser) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    canvas.width = 320;
    canvas.height = 240;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!ctx) return;

      analyser.getByteFrequencyData(dataArray);
      const volumeLevel = analyzeVolume(dataArray, bufferLength);

      // Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Frequency visualization
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const normalizedHeight = Math.pow(value / 255, 0.8);
        const barHeight = normalizedHeight * canvas.height;

        const hue = (i / bufferLength) * 360;
        const saturation = 80 + (value / 255) * 20;
        const lightness = 40 + (value / 255) * 20;
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      // Volume meter
      const meterWidth = 30;
      const meterHeight = canvas.height * 0.8;
      const meterX = canvas.width - meterWidth - 10;
      const meterY = (canvas.height - meterHeight) / 2;

      // Meter background
      ctx.fillStyle = '#333';
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

      // Volume level with gradient
      const gradient = ctx.createLinearGradient(
        meterX, 
        meterY + meterHeight, 
        meterX, 
        meterY
      );
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(0.6, '#ffff00');
      gradient.addColorStop(1, '#ff0000');

      const activeMeterHeight = meterHeight * (volumeLevel / 100);
      ctx.fillStyle = gradient;
      ctx.fillRect(
        meterX,
        meterY + meterHeight - activeMeterHeight,
        meterWidth,
        activeMeterHeight
      );

      // Volume percentage text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${Math.round(volumeLevel)}%`,
        meterX + meterWidth / 2,
        canvas.height - 10
      );

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Set up video stream from canvas
    const stream = canvas.captureStream(30);
    video.srcObject = stream;
    video.play().catch(console.error);
    
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, analyzeVolume, isPiPActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[320px] h-auto bg-black rounded-lg"
    />
  );
};