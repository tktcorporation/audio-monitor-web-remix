import { useEffect } from 'react';

interface UseStatusIndicatorProps {
  isListening: boolean;
  isVisible: boolean;
}

export function useStatusIndicator({ isListening, isVisible }: UseStatusIndicatorProps) {
  useEffect(() => {
    const originalTitle = "Audio Monitor";
    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    
    if (isListening) {
      if (!isVisible) {
        document.title = "🎤 Audio Active - Audio Monitor";
        favicon.href = "/logo-dark.png";
      } else {
        document.title = originalTitle;
        favicon.href = "/favicon.ico";
      }
    } else {
      document.title = originalTitle;
      favicon.href = "/favicon.ico";
    }

    return () => {
      document.title = originalTitle;
      favicon.href = "/favicon.ico";
    };
  }, [isListening, isVisible]);
}