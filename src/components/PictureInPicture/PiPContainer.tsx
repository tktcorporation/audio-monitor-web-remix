import { useEffect, useRef, useState } from 'react';
import { VisualizerCanvas } from './VisualizerCanvas';
import { PiPButton } from './PiPButton';
import { usePiPContext } from './PiPContext';

interface PiPContainerProps {
  analyser: AnalyserNode;
}

export const PiPContainer: React.FC<PiPContainerProps> = ({ analyser }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const { setPiPElement } = usePiPContext();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePiPChange = () => {
      setIsPiPActive(document.pictureInPictureElement === video);
      setPiPElement(document.pictureInPictureElement as HTMLVideoElement);
    };

    video.addEventListener('enterpictureinpicture', handlePiPChange);
    video.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      video.removeEventListener('enterpictureinpicture', handlePiPChange);
      video.removeEventListener('leavepictureinpicture', handlePiPChange);
      if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture().catch(console.error);
      }
    };
  }, [setPiPElement]);

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
      <PiPButton isPiPActive={isPiPActive} onClick={togglePiP} />
      <div className="pip-container" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <VisualizerCanvas
          analyser={analyser}
          videoRef={videoRef}
          isPiPActive={isPiPActive}
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
};