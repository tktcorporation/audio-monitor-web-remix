import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PiPContextType {
  pipElement: HTMLVideoElement | null;
  setPiPElement: (element: HTMLVideoElement | null) => void;
}

const PiPContext = createContext<PiPContextType | undefined>(undefined);

interface PiPProviderProps {
  children: ReactNode;
}

export const PiPProvider: React.FC<PiPProviderProps> = ({ children }) => {
  const [pipElement, setPiPElement] = useState<HTMLVideoElement | null>(null);

  return (
    <PiPContext.Provider value={{ pipElement, setPiPElement }}>
      {children}
    </PiPContext.Provider>
  );
};

export const usePiPContext = () => {
  const context = useContext(PiPContext);
  if (context === undefined) {
    throw new Error('usePiPContext must be used within a PiPProvider');
  }
  return context;
};