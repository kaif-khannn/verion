import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AuthPage from './pages/AuthPage'

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setView('app');
    } else {
      setView(window.location.pathname === '/user/register' ? 'landing' : 'landing');
    }

    const handlePopState = () => {
      if (localStorage.getItem('token')) {
        setView('app');
      } else {
        setView(window.location.pathname === '/auth' ? 'auth' : 'landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (view === 'landing') {
    return <LandingPage onGetStarted={(mode) => {
      window.history.pushState({}, '', '/auth');
      setAuthMode(mode);
      setView('auth');
    }} />
  }

  if (view === 'auth') {
    return <AuthPage 
      initialIsLogin={authMode === 'login'}
      onSuccess={(token) => {
        localStorage.setItem('token', token);
        window.history.pushState({}, '', '/');
        setView('app');
      }}
      onBack={() => {
        window.history.pushState({}, '', '/');
        setView('landing');
      }}
    />
  }

  return <Dashboard onLogout={() => {
    localStorage.removeItem('token');
    window.history.pushState({}, '', '/');
    setView('landing');
  }} />
}
