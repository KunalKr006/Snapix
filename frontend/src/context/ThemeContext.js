import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme] = useState('dark');

  const toggleTheme = () => {
    localStorage.setItem('theme', 'dark');
  };

  // Apply theme to document when theme changes
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 
