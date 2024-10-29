import React, { useEffect, useState, useRef } from "react";
import { useVolumeAnalysis } from "../hooks/useVolumeAnalysis";

interface AudioQualityFeedbackProps {
  analyser: AnalyserNode;
}

const AudioQualityFeedback: React.FC<AudioQualityFeedbackProps> = ({ analyser }) => {
  const [volume, setVolume] = useState<number>(0);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const { analyzeVolume } = useVolumeAnalysis();
  
  // 音量レベルの履歴を保持
  const volumeHistoryRef = useRef<number[]>([]);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateMetrics = (timestamp: number) => {
      analyser.getByteFrequencyData(dataArray);
      
      // 現在の音量レベルを計算
      const currentLevel = analyzeVolume(dataArray, bufferLength);
      
      // 履歴に追加 (最大30サンプルを保持)
      volumeHistoryRef.current.push(currentLevel);
      if (volumeHistoryRef.current.length > 30) {
        volumeHistoryRef.current.shift();
      }
      
      // 時間差分を計算
      const deltaTime = timestamp - lastUpdateRef.current;
      lastUpdateRef.current = timestamp;
      
      // 履歴から重み付き平均を計算
      const weightedAverage = volumeHistoryRef.current.reduce((acc, val, idx) => {
        const weight = Math.exp(idx / volumeHistoryRef.current.length) / Math.E;
        return acc + val * weight;
      }, 0) / volumeHistoryRef.current.reduce((acc, _, idx) => {
        return acc + Math.exp(idx / volumeHistoryRef.current.length) / Math.E;
      }, 0);
      
      // 現在値と平均値を組み合わせて最終的な音量を決定
      const targetVolume = Math.max(currentLevel, weightedAverage);
      
      // 音量の変化率を計算
      setVolume(prev => {
        const diff = targetVolume - prev;
        
        // 上昇時は素早く、下降時は緩やかに
        const rate = diff > 0 ? 0.3 : 0.05;
        return prev + diff * Math.min(1, deltaTime / 16.67) * rate;
      });

      // ノイズレベルの計算 (高周波成分の分析)
      const highFreqStart = Math.floor(bufferLength * 0.7);
      const highFreqValues = Array.from(dataArray.slice(highFreqStart));
      const avgNoise = Math.sqrt(
        highFreqValues.reduce((sum, value) => sum + (value * value), 0) / highFreqValues.length
      );
      
      // ノイズレベルも同様にスムージング
      setNoiseLevel(prev => {
        const normalizedNoise = Math.pow(avgNoise / 255, 0.7) * 100;
        const diff = normalizedNoise - prev;
        return prev + diff * Math.min(1, deltaTime / 16.67) * 0.1;
      });

      requestAnimationFrame(updateMetrics);
    };

    requestAnimationFrame(updateMetrics);
  }, [analyser, analyzeVolume]);

  const getVolumeLabel = (vol: number) => {
    if (vol < 15) return "Low";
    if (vol < 70) return "Good";
    return "High";
  };

  const getNoiseLevelLabel = (noise: number) => {
    if (noise < 20) return "Low";
    if (noise < 50) return "Moderate";
    return "High";
  };

  const getVolumeColor = (vol: number) => {
    if (vol < 15) return 'text-yellow-500';
    if (vol < 70) return 'text-green-500';
    return 'text-red-500';
  };

  const getNoiseColor = (noise: number) => {
    if (noise < 20) return 'text-green-500';
    if (noise < 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Audio Quality Feedback</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Volume:</span>
          <span className={`font-semibold ${getVolumeColor(volume)}`}>
            {getVolumeLabel(volume)} ({Math.round(volume)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
          <div 
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ 
              width: `${volume}%`,
              transition: 'width 50ms ease-out'
            }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-600 dark:text-gray-300">Background Noise:</span>
          <span className={`font-semibold ${getNoiseColor(noiseLevel)}`}>
            {getNoiseLevelLabel(noiseLevel)} ({Math.round(noiseLevel)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
          <div 
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ 
              width: `${noiseLevel}%`,
              transition: 'width 50ms ease-out'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AudioQualityFeedback;