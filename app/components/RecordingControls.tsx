import React, { useState, useEffect } from "react";

interface RecordingControlsProps {
  isListening: boolean;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  playRecording: () => void;
  hasRecording: boolean;
  recordingDuration: number;
  setRecordingDuration: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isListening,
  isRecording,
  startRecording,
  stopRecording,
  playRecording,
  hasRecording,
  recordingDuration,
  setRecordingDuration,
  isPlaying,
}) => {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRecording && recordingDuration !== 0) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, setRecordingDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
          disabled={!isListening || isPlaying}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button
          onClick={playRecording}
          className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white"
          disabled={!hasRecording || isRecording}
        >
          {isPlaying ? "Playing..." : "Play Recording"}
        </button>
      </div>
      {isRecording && (
        <div className="text-center">
          <span className="text-lg font-semibold text-red-500">Recording: {formatTime(recordingDuration)}</span>
        </div>
      )}
      {!isListening && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Start listening to enable recording
        </p>
      )}
      {hasRecording && !isRecording && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Recording available for playback (Duration: {formatTime(recordingDuration)})
        </p>
      )}
    </div>
  );
};

export default RecordingControls;