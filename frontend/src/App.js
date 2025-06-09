import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider, useUI } from './context/UIContext';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Public Route component - redirects to home if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" />;
  }

  return children;
};

// Main App Layout with conditional navbar
const AppLayout = () => {
  const { user } = useAuth();
  const { isDropdownOpen, setIsDropdownOpen } = useUI();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Blur overlay */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity duration-200 z-10 ${
          isDropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDropdownOpen(false)}
      />
      <Navbar />
      <main className="relative pt-16">
        <AnimatedRoutes />
      </main>
    </div>
  );
};

// AnimatedRoutes component with AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Root route - shows landing page with animation, then redirects to home */}
        <Route path="/" element={
          <PageTransition>
            <LandingPage />
          </PageTransition>
        } />
        
        {/* Home route - public, no login required */}
        <Route path="/home" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        
        {/* About route - public */}
        <Route path="/about" element={
          <PageTransition>
            <About />
          </PageTransition>
        } />
        
        {/* Auth routes - only accessible when not logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <PageTransition>
                <Login />
              </PageTransition>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <PageTransition>
                <Register />
              </PageTransition>
            </PublicRoute>
          }
        />

        {/* Protected routes - require login */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Profile />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition>
                <Upload />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Forgot Password and Reset Password routes */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            </PublicRoute>
          }
        />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <UIProvider>
            <AppLayout />
          </UIProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App; 