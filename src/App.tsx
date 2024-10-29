import { useState } from 'react';
import { ClientOnly } from './components/ClientOnly';
import AudioVisualizer from './components/AudioVisualizer';
import AudioControls from './components/AudioControls';
import AudioQualityFeedback from './components/AudioQualityFeedback';
import RecordingControls from './components/RecordingControls';
import PictureInPictureVisualizer from './components/PictureInPictureVisualizer';
import { useDocumentVisibility } from './hooks/useDocumentVisibility';
import { useAudioDevices } from './hooks/useAudioDevices';
import { useAudioContext } from './hooks/useAudioContext';
import { useRecording } from './hooks/useRecording';

export default function App() {
  const isVisible = useDocumentVisibility();
  const {
    inputDevices,
    outputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    setSelectedInputDevice,
    setSelectedOutputDevice,
    error: deviceError
  } = useAudioDevices();

  const {
    isOutputEnabled,
    analyser,
    error: audioError,
    toggleOutput,
    audioOutputRef,
    streamRef
  } = useAudioContext({
    selectedInputDevice,
    selectedOutputDevice
  });

  const {
    isRecording,
    isPlaying,
    recordedChunks,
    recordingDuration,
    setRecordingDuration,
    error: recordingError,
    startRecording,
    stopRecording,
    playRecording
  } = useRecording({
    streamRef,
    isListening: true
  });

  const handlePlayRecording = () => {
    if (isOutputEnabled) {
      toggleOutput();
    }
    playRecording(selectedOutputDevice);
  };

  const error = deviceError || audioError || recordingError;

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
          <>
            <AudioControls
              inputDevices={inputDevices}
              outputDevices={outputDevices}
              selectedInputDevice={selectedInputDevice}
              selectedOutputDevice={selectedOutputDevice}
              setSelectedInputDevice={setSelectedInputDevice}
              setSelectedOutputDevice={setSelectedOutputDevice}
              isOutputEnabled={isOutputEnabled}
              toggleOutput={toggleOutput}
            />
            {analyser && (
              <>
                <AudioVisualizer analyser={analyser} />
                <AudioQualityFeedback analyser={analyser} />
                <PictureInPictureVisualizer
                  analyser={analyser}
                  isVisible={isVisible}
                />
              </>
            )}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Recording Controls</h2>
              <RecordingControls
                isListening={true}
                isRecording={isRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
                playRecording={handlePlayRecording}
                hasRecording={recordedChunks.length > 0}
                recordingDuration={recordingDuration}
                setRecordingDuration={setRecordingDuration}
                isPlaying={isPlaying}
              />
            </div>
          </>
        </ClientOnly>
      </div>
      <audio ref={audioOutputRef} hidden />
    </div>
  );
}