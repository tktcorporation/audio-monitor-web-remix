import { useEffect, useRef } from 'react';

interface PictureInPictureVisualizerProps {
  analyser: AnalyserNode;
  isVisible: boolean;
}

export default function PictureInPictureVisualizer({ analyser, isVisible }: PictureInPictureVisualizerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!ctx) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate average audio level
      const averageLevel = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedLevel = averageLevel / 255;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw audio level indicator
      const indicatorHeight = canvas.height * 0.8;
      const indicatorWidth = 40;
      const x = (canvas.width - indicatorWidth) / 2;
      const y = (canvas.height - indicatorHeight) / 2;

      // Background bar
      ctx.fillStyle = '#333333';
      ctx.fillRect(x, y, indicatorWidth, indicatorHeight);

      // Active level bar
      const activeHeight = indicatorHeight * normalizedLevel;
      const activeY = y + (indicatorHeight - activeHeight);
      
      // Gradient for level indicator
      const gradient = ctx.createLinearGradient(x, y + indicatorHeight, x, y);
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(0.6, '#ffff00');
      gradient.addColorStop(1, '#ff0000');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, activeY, indicatorWidth, activeHeight);

      // Draw percentage text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${Math.round(normalizedLevel * 100)}%`, canvas.width / 2, y + indicatorHeight + 10);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const stream = canvas.captureStream();
    video.srcObject = stream;
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser]);

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
      <div className="hidden">
        <canvas
          ref={canvasRef}
          width={200}
          height={300}
          className="bg-black"
        />
        <video
          ref={videoRef}
          width={200}
          height={300}
          autoPlay
          muted
        />
      </div>
    </div>
  );
}