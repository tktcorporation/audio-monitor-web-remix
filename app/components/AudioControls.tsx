import React from "react";

interface AudioControlsProps {
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  selectedInputDevice: string;
  selectedOutputDevice: string;
  setSelectedInputDevice: (deviceId: string) => void;
  setSelectedOutputDevice: (deviceId: string) => void;
  isListening: boolean;
  toggleListening: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  inputDevices,
  outputDevices,
  selectedInputDevice,
  selectedOutputDevice,
  setSelectedInputDevice,
  setSelectedOutputDevice,
  isListening,
  toggleListening,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="input-device" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Input Device
          </label>
          <select
            id="input-device"
            value={selectedInputDevice}
            onChange={(e) => setSelectedInputDevice(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            {inputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="output-device" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Output Device
          </label>
          <select
            id="output-device"
            value={selectedOutputDevice}
            onChange={(e) => setSelectedOutputDevice(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            {outputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={toggleListening}
          className={`px-4 py-2 rounded ${
            isListening
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white`}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>
      </div>
    </div>
  );
};

export default AudioControls;