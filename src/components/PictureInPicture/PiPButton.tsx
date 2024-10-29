import React from 'react';

interface PiPButtonProps {
  isPiPActive: boolean;
  onClick: () => void;
}

export const PiPButton: React.FC<PiPButtonProps> = ({ isPiPActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M3 4a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm0 2h14v8H3V6zm2 6a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1z" />
      </svg>
      {isPiPActive ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
    </button>
  );
};