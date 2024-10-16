import React, { useEffect, useState } from "react";

interface AudioQualityFeedbackProps {
  analyser: AnalyserNode;
}

const AudioQualityFeedback: React.FC<AudioQualityFeedbackProps> = ({ analyser }) => {
  const [volume, setVolume] = useState<number>(0);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);

  useEffect(() => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateMetrics = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate volume (average of all frequency bins)
      const avgVolume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setVolume(avgVolume);

      // Calculate noise level (average of high-frequency bins)
      const highFreqStart = Math.floor(bufferLength * 0.75);
      const highFreqAvg = dataArray.slice(highFreqStart).reduce((sum, value) => sum + value, 0) / (bufferLength - highFreqStart);
      setNoiseLevel(highFreqAvg);

      requestAnimationFrame(updateMetrics);
    };

    updateMetrics();
  }, [analyser]);

  const getVolumeLabel = (vol: number) => {
    if (vol < 50) return "Low";
    if (vol < 150) return "Good";
    return "High";
  };

  const getNoiseLevelLabel = (noise: number) => {
    if (noise < 20) return "Low";
    if (noise < 50) return "Moderate";
    return "High";
  };

  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Audio Quality Feedback</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Volume:</span>
          <span className={`font-semibold ${volume < 50 ? 'text-yellow-500' : volume < 150 ? 'text-green-500' : 'text-red-500'}`}>
            {getVolumeLabel(volume)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(volume / 255) * 100}%` }}></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-600 dark:text-gray-300">Background Noise:</span>
          <span className={`font-semibold ${noiseLevel < 20 ? 'text-green-500' : noiseLevel < 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {getNoiseLevelLabel(noiseLevel)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(noiseLevel / 255) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default AudioQualityFeedback;