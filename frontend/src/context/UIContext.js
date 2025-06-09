import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
  return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const value = {
    isDropdownOpen,
    setIsDropdownOpen,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}; 