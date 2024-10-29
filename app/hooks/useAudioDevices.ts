import { useState, useEffect } from 'react';

export function useAudioDevices() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>("");
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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

  return {
    inputDevices,
    outputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    setSelectedInputDevice,
    setSelectedOutputDevice,
    error
  };
}