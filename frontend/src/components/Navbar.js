import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartIcon as HeartOutlineIcon, ArrowRightOnRectangleIcon, ChevronDownIcon, EllipsisHorizontalIcon, HomeIcon as HomeOutlineIcon, InformationCircleIcon as InfoOutlineIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, HomeIcon as HomeSolidIcon, InformationCircleIcon as InfoSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useUI } from '../context/UIContext';

const CATEGORIES = ['All', 'Nature', 'Abstract', 'Animals', 'Architecture', 'Technology', 'Space', 'Landscape'];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNavSearch, setShowNavSearch] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const categoryMenuRef = useRef(null);
  const mobileCategoryMenuRef = useRef(null);
  const mobileMoreMenuRef = useRef(null);
  const {
    homeSearchTerm,
    setHomeSearchTerm,
    homeSelectedCategory,
    setHomeSelectedCategory,
    triggerHomeSearch,
  } = useUI();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHomePage = location.pathname === '/home';
  const hideMobileCapsule = location.pathname === '/login' || location.pathname === '/register';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setShowNavSearch(isHomePage && window.scrollY > 220);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (mobileCategoryMenuRef.current && !mobileCategoryMenuRef.current.contains(event.target)) {
        setIsMobileCategoryOpen(false);
      }
      if (mobileMoreMenuRef.current && !mobileMoreMenuRef.current.contains(event.target)) {
        setIsMobileMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!showNavSearch) {
      setIsCategoryOpen(false);
      setIsMobileCategoryOpen(false);
    }
  }, [showNavSearch]);

  useEffect(() => {
    setIsMobileMoreOpen(false);
  }, [location.pathname]);

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (!isHomePage) {
      navigate('/home');
    }
    triggerHomeSearch();
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

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-20 border-b border-white/20 bg-black/50 shadow-lg shadow-black/40 backdrop-blur-xl"
        initial="hidden"
        animate="visible"
        variants={navAnimation}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="bg-gradient-to-r from-cyan-600 to-sky-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-primary-300 dark:to-primary-500">Snapix</h1>
            </Link>
          </div>

          {showNavSearch ? (
            <form onSubmit={handleNavSearchSubmit} className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
              <div className="relative min-w-0 w-full max-w-[480px]">
                <input
                  type="text"
                  value={homeSearchTerm}
                  onChange={(e) => setHomeSearchTerm(e.target.value)}
                  placeholder="Search wallpapers..."
                  className="h-10 w-full rounded-full border border-white/20 bg-white/10 pl-4 pr-24 text-sm text-slate-100 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary-600 text-white transition-colors duration-200 hover:bg-primary-700"
                  aria-label="Search"
                  title="Search"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="relative w-44" ref={categoryMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen((prev) => !prev)}
                  className="flex h-10 w-full items-center justify-between rounded-full border border-white/20 bg-white/10 px-4 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <span>{homeSelectedCategory === 'All' ? 'Categories' : homeSelectedCategory}</span>
                  <ChevronDownIcon className="h-4 w-4 text-slate-300" />
                </button>
                {isCategoryOpen && (
                  <div className="absolute left-0 right-0 top-12 z-40 rounded-2xl border border-white/20 bg-black/70 p-1 shadow-lg shadow-black/40 backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setHomeSelectedCategory('All');
                        setIsCategoryOpen(false);
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 ${
                        homeSelectedCategory === 'All' ? 'bg-primary-600 text-white' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      Categroies
                    </button>
                    {CATEGORIES.filter((category) => category !== 'All').map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setHomeSelectedCategory(category);
                          setIsCategoryOpen(false);
                        }}
                        className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 ${
                          homeSelectedCategory === category ? 'bg-primary-600 text-white' : 'text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="flex-1" />
          )}

          {showNavSearch && (
            <form onSubmit={handleNavSearchSubmit} className="flex w-[68vw] max-w-[240px] min-w-0 items-center md:hidden">
              <div className="relative min-w-0 w-full">
                <input
                  type="text"
                  value={homeSearchTerm}
                  onChange={(e) => setHomeSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="h-10 w-full rounded-full border border-white/20 bg-white/10 pl-3 pr-20 text-sm text-slate-100 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary-600 text-white transition-colors duration-200 hover:bg-primary-700"
                  aria-label="Search"
                  title="Search"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          <div className={`ml-auto flex items-center space-x-4 ${showNavSearch ? 'hidden md:flex' : ''}`}>
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <motion.div variants={itemAnimation}>
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    isActive
                      ? "rounded-xl bg-primary-700 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 dark:bg-primary-800"
                      : "rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                  }
                >
                  Home
                </NavLink>
              </motion.div>
              <motion.div variants={itemAnimation}>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive
                      ? "rounded-xl bg-primary-700 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 dark:bg-primary-800"
                      : "rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                  }
                >
                  About
                </NavLink>
              </motion.div>
              {isAdmin && (
                <>
                  <motion.div variants={itemAnimation}>
                    <NavLink
                      to="/upload"
                      className={({ isActive }) =>
                        isActive
                          ? "rounded-xl bg-primary-900/30 px-3 py-2 text-sm font-medium text-primary-200 transition-colors duration-200"
                          : "rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
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
                          ? "rounded-xl bg-primary-900/30 px-3 py-2 text-sm font-medium text-primary-200 transition-colors duration-200"
                          : "rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                      }
                    >
                      Dashboard
                    </NavLink>
                  </motion.div>
                </>
              )}
              <motion.div variants={itemAnimation}>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive
                      ? "inline-flex items-center justify-center rounded-xl p-2 text-red-400 transition-colors duration-200"
                      : "inline-flex items-center justify-center rounded-xl p-2 text-slate-300 transition-colors duration-200 hover:text-red-400"
                  }
                  aria-label="Wishlist"
                  title="Wishlist"
                >
                  {({ isActive }) =>
                    isActive ? <HeartSolidIcon className="h-5 w-5" /> : <HeartOutlineIcon className="h-5 w-5" />
                  }
                </NavLink>
              </motion.div>
            </div>

            {user ? (
              <motion.button
                onClick={handleLogout}
                className="hidden items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 text-slate-300 transition-colors duration-200 hover:bg-red-600 hover:text-white sm:inline-flex"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={itemAnimation}
                aria-label="Log out"
                title="Log out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </motion.button>
            ) : (
              <div className="flex space-x-4">
                <motion.div variants={itemAnimation}>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive
                        ? "rounded-xl bg-primary-900/30 px-3 py-2 text-sm font-medium text-primary-200 transition-colors duration-200"
                        : "rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
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
                        ? "rounded-xl bg-primary-700 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 dark:bg-primary-800"
                        : "rounded-xl bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-primary-900/25 transition-colors duration-200 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
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

      {showNavSearch && (
        <div className="fixed bottom-24 right-4 z-40 sm:hidden" ref={mobileCategoryMenuRef}>
          <button
            type="button"
            onClick={() => setIsMobileCategoryOpen((prev) => !prev)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-slate-100 shadow-lg shadow-black/40 backdrop-blur-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Filter categories"
            title="Filter categories"
          >
            <FunnelIcon className="h-5 w-5" />
          </button>

          {isMobileCategoryOpen && (
            <div className="absolute bottom-14 right-0 w-44 rounded-2xl border border-white/20 bg-black/70 p-1 shadow-lg shadow-black/40 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  setHomeSelectedCategory('All');
                  setIsMobileCategoryOpen(false);
                }}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 ${
                  homeSelectedCategory === 'All' ? 'bg-primary-600 text-white' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                Categroies
              </button>
              {CATEGORIES.filter((category) => category !== 'All').map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setHomeSelectedCategory(category);
                    setIsMobileCategoryOpen(false);
                  }}
                  className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 ${
                    homeSelectedCategory === category ? 'bg-primary-600 text-white' : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!hideMobileCapsule && (
      <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 sm:hidden">
        <div className="flex w-80 items-center justify-between rounded-full border border-white/20 bg-black/70 p-1.5 shadow-lg shadow-black/40 backdrop-blur-xl">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive
                ? "inline-flex h-11 w-[4.25rem] items-center justify-center rounded-full text-primary-400"
                : "inline-flex h-11 w-[4.25rem] items-center justify-center rounded-full text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            }
            aria-label="Home"
            title="Home"
          >
            {({ isActive }) =>
              isActive ? <HomeSolidIcon className="h-5 w-5" /> : <HomeOutlineIcon className="h-5 w-5" />
            }
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "inline-flex h-11 w-[4.25rem] items-center justify-center rounded-full text-red-400"
                : "inline-flex h-11 w-[4.25rem] items-center justify-center rounded-full text-slate-300 transition-colors duration-200 hover:text-red-400"
            }
            aria-label="Wishlist"
            title="Wishlist"
          >
            {({ isActive }) =>
              isActive ? <HeartSolidIcon className="h-5 w-5" /> : <HeartOutlineIcon className="h-5 w-5" />
            }
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "inline-flex h-11 w-[4.25rem] items-center justify-center rounded-full text-primary-400"
                : "inline-flex h-11 w-[4.25rem] items-center justify-center rounded-full text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            }
            aria-label="About"
            title="About"
          >
            {({ isActive }) =>
              isActive ? <InfoSolidIcon className="h-5 w-5" /> : <InfoOutlineIcon className="h-5 w-5" />
            }
          </NavLink>

          {user && isAdmin && (
            <div className="relative" ref={mobileMoreMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileMoreOpen((prev) => !prev)}
                className="inline-flex h-11 w-[4.25rem] items-center justify-center rounded-full text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                aria-label="More actions"
                title="More actions"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>

              {isMobileMoreOpen && (
                <div className="absolute bottom-14 right-0 w-40 rounded-2xl border border-white/20 bg-black/70 p-1 shadow-lg shadow-black/40 backdrop-blur-xl">
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMoreOpen(false);
                          navigate('/upload');
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors duration-150 hover:bg-white/10"
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMoreOpen(false);
                          navigate('/dashboard');
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors duration-150 hover:bg-white/10"
                      >
                        Dashboard
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      handleLogout();
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-300 transition-colors duration-150 hover:bg-red-600/30 hover:text-red-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {user && !isAdmin && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-11 w-[4.25rem] items-center justify-center rounded-full text-slate-300 transition-colors duration-200 hover:bg-red-600 hover:text-white"
              aria-label="Log out"
              title="Log out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      )}
    </>
  );
};

export default Navbar; 
