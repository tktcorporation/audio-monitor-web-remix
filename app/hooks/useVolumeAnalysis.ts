import { useCallback } from 'react';

export function useVolumeAnalysis() {
  const analyzeVolume = useCallback((dataArray: Uint8Array, bufferLength: number) => {
    // 音声周波数帯域に焦点を当てる (300Hz-3400Hz)
    const speechStartBin = Math.floor(bufferLength * 0.1);
    const speechEndBin = Math.floor(bufferLength * 0.4);
    const speechValues = Array.from(dataArray.slice(speechStartBin, speechEndBin));
    
    // RMSと最大値を計算
    const rms = Math.sqrt(
      speechValues.reduce((sum, value) => sum + (value * value), 0) / speechValues.length
    );
    const peak = Math.max(...speechValues);
    
    // RMSと最大値を組み合わせて、より自然な音量レベルを得る
    const combinedLevel = (rms * 0.7 + peak * 0.3);
    
    // 対数スケールを適用 (dB的な特性)
    const dbScale = 20 * Math.log10(combinedLevel / 255 + 0.0001);
    const normalizedDb = (dbScale + 60) / 60; // -60dB to 0dB range
    
    // 最終的な音量レベルを計算 (0-100の範囲)
    const volumeLevel = Math.pow(Math.max(0, Math.min(1, normalizedDb)), 0.5) * 100;
    
    return volumeLevel;
  }, []);

  return { analyzeVolume };
}