import { useEffect, useRef } from 'react';
import { useVolumeAnalysis } from "../hooks/useVolumeAnalysis";

interface PictureInPictureVisualizerProps {
  analyser: AnalyserNode;
  isVisible: boolean;
}

export default function PictureInPictureVisualizer({ analyser, isVisible }: PictureInPictureVisualizerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
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

      // 共通の音量解析ロジックを使用
      const volumeLevel = analyzeVolume(dataArray, bufferLength);

      // Clear canvas with background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Enhanced frequency visualization
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

      // Draw level meter using the common volume level
      const meterWidth = 30;
      const meterHeight = canvas.height * 0.8;
      const meterX = canvas.width - meterWidth - 10;
      const meterY = (canvas.height - meterHeight) / 2;

      // Meter background
      ctx.fillStyle = '#333';
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

      // Active meter level with gradient
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

      // Draw level percentage
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

    const stream = canvas.captureStream(30);
    video.srcObject = stream;
    video.play().catch(console.error);
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture().catch(console.error);
      }
    };
  }, [analyser, analyzeVolume]);

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Failed to toggle Picture-in-Picture mode:', error);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={togglePiP}
        className="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 4a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm0 2h14v8H3V6zm2 6a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1z" />
        </svg>
        Toggle Picture-in-Picture
      </button>
      <div className="pip-container" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
        />
        <video
          ref={videoRef}
          width={320}
          height={240}
          autoPlay
          muted
          playsInline
        />
      </div>
    </div>
  );
}