import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserCircleIcon, ChevronDownIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav 
      className="bg-white shadow-lg dark:bg-dark-card transition-colors duration-200 sticky top-0 z-50"
      initial="hidden"
      animate="visible"
      variants={navAnimation}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <motion.div 
              className="flex-shrink-0 flex items-center"
              variants={itemAnimation}
            >
              {user ? (
                <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200">
                  Snapix
                </Link>
              ) : (
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  Snapix
                </span>
              )}
            </motion.div>
            {user?.role === 'admin' && (
              <div className="hidden sm:flex sm:space-x-8 sm:ml-10">
                <motion.div variants={itemAnimation}>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? "border-primary-600 text-white dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                    }
                  >
                    Dashboard
                  </NavLink>
                </motion.div>
                <motion.div variants={itemAnimation}>
                  <NavLink
                    to="/upload"
                    className={({ isActive }) =>
                      isActive
                        ? "border-primary-600 text-white dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                    }
                  >
                    Upload
                  </NavLink>
                </motion.div>
              </div>
            )}
          </div>
          <div className="ml-6 flex items-center">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              className="mx-4 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary focus:outline-none transition-colors duration-200"
              aria-label="Toggle dark mode"
              variants={itemAnimation}
              whileHover={{ scale: 1.1, rotate: theme === 'dark' ? 15 : -15 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.button>
            
            {user ? (
              <Menu as={motion.div} className="ml-3 relative" variants={itemAnimation}>
                <div>
                  <Menu.Button className="bg-white dark:bg-dark-card rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md">
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center p-1.5">
                      <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-dark-text-secondary" />
                      <span className="ml-2 text-gray-700 dark:text-dark-text-primary">{user.username}</span>
                      <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400 dark:text-dark-text-secondary" />
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-dark-card ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-dark-border' : ''
                          } block px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary transition-colors duration-150`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/about"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-dark-border' : ''
                          } block px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary transition-colors duration-150`}
                        >
                          About
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-dark-border' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary transition-colors duration-150`}
                        >
                          Log out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex space-x-4">
                {/* About link for non-logged in users */}
                <motion.div variants={itemAnimation}>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      isActive
                        ? "text-primary-600 dark:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        : "text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    }
                  >
                    About
                  </NavLink>
                </motion.div>
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