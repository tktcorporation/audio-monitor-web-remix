import { createContext, useContext } from 'react';

export interface PiPContextType {
  pipElement: HTMLVideoElement | null;
  setPiPElement: (element: HTMLVideoElement | null) => void;
}

export const PiPContext = createContext<PiPContextType | undefined>(undefined);

export const usePiPContext = () => {
  const context = useContext(PiPContext);
  if (context === undefined) {
    throw new Error('usePiPContext must be used within a PiPProvider');
  }
  return context;
};
