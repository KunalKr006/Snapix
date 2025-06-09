import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserCircleIcon, ChevronDownIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isDropdownOpen, setIsDropdownOpen } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const navAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      className="bg-white dark:bg-dark-card shadow-lg fixed top-0 left-0 right-0 z-20"
      initial="hidden"
      animate="visible"
      variants={navAnimation}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Snapix</h1>
            </Link>
          </div>

          <div className="flex flex-grow justify-center items-center">
            <div className="hidden sm:flex sm:space-x-8">
              {user && (
                <>
                  {user.role === 'admin' && (
                    <>
                      <motion.div variants={itemAnimation}>
                        <NavLink
                          to="/upload"
                          className={({ isActive }) =>
                            isActive
                              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
                              : "text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary border-b-2 border-transparent hover:border-gray-300 dark:hover:border-dark-border px-3 py-2 text-sm font-medium transition-colors duration-200"
                          }
                        >
                          Upload
                        </NavLink>
                      </motion.div>
                      <motion.div variants={itemAnimation}>
                        <NavLink
                          to="/dashboard"
                          className={({ isActive }) =>
                            isActive
                              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
                              : "text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary border-b-2 border-transparent hover:border-gray-300 dark:hover:border-dark-border px-3 py-2 text-sm font-medium transition-colors duration-200"
                          }
                        >
                          Dashboard
                        </NavLink>
                      </motion.div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              variants={itemAnimation}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.button>

            {user ? (
              <Menu as="div" className="relative" open={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
                <Menu.Button 
                  className="flex items-center text-sm rounded-full focus:outline-none transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(prev => !prev)}
                >
                  <motion.div
                    className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <UserCircleIcon className="h-6 w-6" />
                  </motion.div>
                  <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-500 dark:text-dark-text-secondary" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="fixed top-16 right-0 left-0 w-screen sm:w-48 rounded-none shadow-none bg-white dark:bg-dark-card focus:outline-none p-2 z-[1000]">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <NavLink
                            to="/home"
                            onClick={() => setIsDropdownOpen(false)}
                            className={({ isActive: navActive }) =>
                              navActive
                                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400 font-medium block px-3 py-2 text-sm transition-colors duration-200"
                                : "text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary border-b-2 border-transparent hover:border-gray-300 dark:hover:border-dark-border block px-3 py-2 text-sm transition-colors duration-200"
                            }
                          >
                            Home
                          </NavLink>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <NavLink
                            to="/about"
                            onClick={() => setIsDropdownOpen(false)}
                            className={({ isActive: navActive }) =>
                              navActive
                                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400 font-medium block px-3 py-2 text-sm transition-colors duration-200"
                                : "text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary border-b-2 border-transparent hover:border-gray-300 dark:hover:border-dark-border block px-3 py-2 text-sm transition-colors duration-200"
                            }
                          >
                            About
                          </NavLink>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <NavLink
                            to="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className={({ isActive: navActive }) =>
                              navActive
                                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400 font-medium block px-3 py-2 text-sm transition-colors duration-200"
                                : "text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary border-b-2 border-transparent hover:border-gray-300 dark:hover:border-dark-border block px-3 py-2 text-sm transition-colors duration-200"
                            }
                          >
                            Your Profile
                          </NavLink>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active
                                ? "text-primary-600 dark:text-primary-400 font-medium"
                                : "text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                            } block w-full text-left px-3 py-2 text-sm transition-colors duration-200`}
                          >
                            Log out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex space-x-4">
                <motion.div variants={itemAnimation}>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive
                        ? "text-primary-600 dark:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        : "text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    }
                  >
                    Login
                  </NavLink>
                </motion.div>
                <motion.div 
                  variants={itemAnimation}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-primary-700 text-white dark:bg-primary-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        : "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    }
                  >
                    Register
                  </NavLink>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 