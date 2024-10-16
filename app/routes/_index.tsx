import type { MetaFunction } from "@netlify/remix-runtime";
import { useState, useEffect, useRef } from "react";
import { ClientOnly } from "remix-utils/client-only";
import AudioVisualizer from "~/components/AudioVisualizer";
import AudioControls from "~/components/AudioControls";
import AudioQualityFeedback from "~/components/AudioQualityFeedback";

export const meta: MetaFunction = () => {
  return [
    { title: "Audio Monitor - Real-time Microphone Input Analyzer" },
    { name: "description", content: "Monitor and analyze your microphone input in real-time, with device selection, audio visualization, and quality feedback." },
  ];
};

export default function Index() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>("");
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioOutputRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === "audioinput");
        const audioOutputs = devices.filter(device => device.kind === "audiooutput");
        setInputDevices(audioInputs);
        setOutputDevices(audioOutputs);
        if (audioInputs.length > 0) {
          setSelectedInputDevice(audioInputs[0].deviceId);
        }
        if (audioOutputs.length > 0) {
          setSelectedOutputDevice(audioOutputs[0].deviceId);
        }
      } catch (err) {
        setError("Error accessing media devices: " + (err as Error).message);
      }
    }
    getDevices();
  }, []);

  useEffect(() => {
    if (isListening) {
      stopAudioContext();
      startAudioContext();
    }
  }, [selectedInputDevice, selectedOutputDevice]);

  const startAudioContext = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedInputDevice ? { exact: selectedInputDevice } : undefined }
      });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      source.connect(analyserNode);

      // Create a gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.5; // Set initial volume to 50%
      analyserNode.connect(gainNode);

      // Connect the gain node to the audio destination (speakers)
      gainNode.connect(audioContext.destination);

      setAnalyser(analyserNode);
      setIsListening(true);
      setError(null);

      // Set up audio output for monitoring
      if (audioOutputRef.current) {
        audioOutputRef.current.srcObject = stream;
        if (audioOutputRef.current.setSinkId) {
          await audioOutputRef.current.setSinkId(selectedOutputDevice);
        }
      }
    } catch (err) {
      setError("Error starting audio context: " + (err as Error).message);
      setIsListening(false);
    }
  };

  const stopAudioContext = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioOutputRef.current) {
      audioOutputRef.current.srcObject = null;
    }
    setIsListening(false);
    setAnalyser(null);
  };

  const toggleListening = () => {
    if (isListening) {
      stopAudioContext();
    } else {
      startAudioContext();
    }
  };

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
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    if (audio.setSinkId) {
      audio.setSinkId(selectedOutputDevice).then(() => {
        audio.play();
      }).catch(err => {
        setError("Error playing recording: " + err.message);
      });
    } else {
      audio.play().catch(err => {
        setError("Error playing recording: " + err.message);
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Audio Monitor</h1>
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <ClientOnly fallback={<div>Loading...</div>}>
          {() => (
            <>
              <AudioControls
                inputDevices={inputDevices}
                outputDevices={outputDevices}
                selectedInputDevice={selectedInputDevice}
                selectedOutputDevice={selectedOutputDevice}
                setSelectedInputDevice={setSelectedInputDevice}
                setSelectedOutputDevice={setSelectedOutputDevice}
                isListening={isListening}
                toggleListening={toggleListening}
                isRecording={isRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
                playRecording={playRecording}
                hasRecording={recordedChunks.length > 0}
              />
              {isListening && analyser && (
                <>
                  <AudioVisualizer analyser={analyser} />
                  <AudioQualityFeedback analyser={analyser} />
                </>
              )}
            </>
          )}
        </ClientOnly>
      </div>
      <audio ref={audioOutputRef} hidden />
    </div>
  );
}
