import { useState, useRef } from 'react';

interface UseRecordingProps {
  streamRef: React.RefObject<MediaStream | null>;
  isListening: boolean;
}

export function useRecording({ streamRef, isListening }: UseRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(chunks => [...chunks, event.data]);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingDuration(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = async (selectedOutputDevice: string) => {
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    try {
      if (audio.setSinkId) {
        await audio.setSinkId(selectedOutputDevice);
      }
      await audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } catch (err) {
      setError("Error playing recording: " + (err as Error).message);
      setIsPlaying(false);
    }
  };

  return {
    isRecording,
    isPlaying,
    recordedChunks,
    recordingDuration,
    setRecordingDuration,
    error,
    startRecording,
    stopRecording,
    playRecording
  };
}