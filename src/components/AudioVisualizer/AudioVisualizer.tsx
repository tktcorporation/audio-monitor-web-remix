import { useEffect, useRef } from 'react';
import { useVolumeAnalysis } from '../../hooks/useVolumeAnalysis';

interface VisualizerProps {
  analyser: AnalyserNode;
}

export const AudioVisualizer = ({ analyser }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const { analyzeVolume } = useVolumeAnalysis();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Calculate volume level for color intensity
      const volumeLevel = analyzeVolume(dataArray, bufferLength);

      ctx.fillStyle = 'rgb(20, 20, 20)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const normalizedHeight = Math.pow(value / 255, 0.8);
        const barHeight = normalizedHeight * canvas.height;

        // Dynamic color based on frequency and volume
        const hue = (i / bufferLength) * 360;
        const saturation = 80 + (volumeLevel / 100) * 20;
        const lightness = 40 + (value / 255) * 20;
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      // Draw volume meter
      const meterWidth = 30;
      const meterHeight = canvas.height * 0.8;
      const meterX = canvas.width - meterWidth - 10;
      const meterY = (canvas.height - meterHeight) / 2;

      // Meter background
      ctx.fillStyle = '#333';
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

      // Volume level with gradient
      const gradient = ctx.createLinearGradient(meterX, meterY + meterHeight, meterX, meterY);
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
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, analyzeVolume]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-40 bg-gray-800 rounded-lg"
      width={800}
      height={200}
    />
  );
};