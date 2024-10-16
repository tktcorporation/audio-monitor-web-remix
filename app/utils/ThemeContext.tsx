import React, { createContext, useContext, useState } from "react";

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; theme: string; setTheme: (theme: string) => void }> = ({ children, theme: initialTheme, setTheme: initialSetTheme }) => {
  const [theme, setTheme] = useState(initialTheme);

  const contextSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    initialSetTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: contextSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};