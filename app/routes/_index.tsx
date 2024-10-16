import type { MetaFunction, ActionFunction } from "@remix-run/node";
import { useState, useEffect, useRef } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { useTheme } from "~/utils/ThemeContext";
import AudioVisualizer from "~/components/AudioVisualizer";
import AudioControls from "~/components/AudioControls";
import AudioQualityFeedback from "~/components/AudioQualityFeedback";
import RecordingControls from "~/components/RecordingControls";

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
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { theme, setTheme } = useTheme();

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

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.5;
      analyserNode.connect(gainNode);

      gainNode.connect(audioContext.destination);

      setAnalyser(analyserNode);
      setIsListening(true);
      setError(null);

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
    setRecordingDuration(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (isListening) {
      stopAudioContext();
    }
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    if (audio.setSinkId) {
      audio.setSinkId(selectedOutputDevice).then(() => {
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
      }).catch(err => {
        setError("Error playing recording: " + err.message);
      });
    } else {
      audio.play().catch(err => {
        setError("Error playing recording: " + err.message);
      });
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Audio Monitor</h1>
      <button
        onClick={toggleTheme}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Toggle {theme === "light" ? "Dark" : "Light"} Mode
      </button>
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
              />
              {isListening && analyser && (
                <>
                  <AudioVisualizer analyser={analyser} />
                  <AudioQualityFeedback analyser={analyser} />
                </>
              )}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Recording Controls</h2>
                <RecordingControls
                  isListening={isListening}
                  isRecording={isRecording}
                  startRecording={startRecording}
                  stopRecording={stopRecording}
                  playRecording={playRecording}
                  hasRecording={recordedChunks.length > 0}
                  recordingDuration={recordingDuration}
                  setRecordingDuration={setRecordingDuration}
                  isPlaying={isPlaying}
                />
              </div>
            </>
          )}
        </ClientOnly>
      </div>
      <audio ref={audioOutputRef} hidden />
    </div>
  );
}