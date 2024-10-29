import { useState, useRef, useEffect } from 'react';

interface UseAudioContextProps {
  selectedInputDevice: string;
  selectedOutputDevice: string;
}

export function useAudioContext({ selectedInputDevice, selectedOutputDevice }: UseAudioContextProps) {
  const [isOutputEnabled, setIsOutputEnabled] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioOutputRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const initializeAudioContext = async () => {
    try {
      // Clean up existing audio context if it exists
      if (audioContextRef.current?.state !== 'closed') {
        await audioContextRef.current?.close();
      }

      // Stop existing stream if it exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Create new stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedInputDevice ? { exact: selectedInputDevice } : undefined }
      });
      streamRef.current = stream;

      // Create new audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create and connect nodes
      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      source.connect(analyserNode);

      const gainNode = audioContext.createGain();
      gainNodeRef.current = gainNode;
      gainNode.gain.value = isOutputEnabled ? 0.5 : 0;
      analyserNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      setAnalyser(analyserNode);
      setError(null);

      // Set up audio output
      if (audioOutputRef.current) {
        audioOutputRef.current.srcObject = stream;
        if (audioOutputRef.current.setSinkId) {
          await audioOutputRef.current.setSinkId(selectedOutputDevice);
        }
      }
    } catch (err) {
      setError("Error initializing audio context: " + (err as Error).message);
      setAnalyser(null);
    }
  };

  const cleanupAudio = async () => {
    try {
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (audioContextRef.current?.state !== 'closed') {
        await audioContextRef.current?.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioOutputRef.current) {
        audioOutputRef.current.srcObject = null;
      }
    } catch (err) {
      console.error('Error cleaning up audio:', err);
    }
  };

  const toggleOutput = () => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isOutputEnabled ? 0 : 0.5;
      setIsOutputEnabled(!isOutputEnabled);
    }
  };

  useEffect(() => {
    initializeAudioContext();
    return () => {
      cleanupAudio();
    };
  }, [selectedInputDevice, selectedOutputDevice]);

  // Handle output device changes
  useEffect(() => {
    if (audioOutputRef.current?.setSinkId && selectedOutputDevice) {
      audioOutputRef.current.setSinkId(selectedOutputDevice).catch(err => {
        setError("Error setting output device: " + err.message);
      });
    }
  }, [selectedOutputDevice]);

  return {
    isOutputEnabled,
    analyser,
    error,
    toggleOutput,
    audioOutputRef,
    streamRef
  };
}