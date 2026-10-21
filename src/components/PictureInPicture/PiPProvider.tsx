import { useState, type ReactNode } from 'react';
import { PiPContext } from './PiPContext';

export const PiPProvider = ({ children }: { children: ReactNode }) => {
  const [pipElement, setPiPElement] = useState<HTMLVideoElement | null>(null);

  return (
    <PiPContext.Provider value={{ pipElement, setPiPElement }}>
      {children}
    </PiPContext.Provider>
  );
};
