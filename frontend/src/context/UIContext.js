import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
  return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [homeSearchTerm, setHomeSearchTerm] = useState('');
  const [homeSelectedCategory, setHomeSelectedCategory] = useState('All');
  const [homeSearchTrigger, setHomeSearchTrigger] = useState(0);

  const triggerHomeSearch = () => {
    setHomeSearchTrigger((prev) => prev + 1);
  };

  const value = {
    isDropdownOpen,
    setIsDropdownOpen,
    homeSearchTerm,
    setHomeSearchTerm,
    homeSelectedCategory,
    setHomeSelectedCategory,
    homeSearchTrigger,
    triggerHomeSearch,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}; 
