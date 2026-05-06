import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, usePermission } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import JobHub from './pages/JobHub';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Team from './pages/Team';
import Notes from './pages/Notes';
import Notifications from './pages/Notifications';
import AuthPage from './pages/AuthPage';
import './styles/global.css';
import './styles/components.css';

const STORAGE_KEY = 'events:v1';

// Authentication Guard Component
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  // If no token exists, redirect to the login/auth page
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  // If token exists, render the Layout + Children
  return <Layout>{children}</Layout>;
}

function AnalyticsGuard() {
  const { canViewAnalytics } = usePermission();
  if (!canViewAnalytics) return <Navigate to="/" replace />;
  return <Analytics />;
}

export default function App() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setEvents(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Route is separate from Layout */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes wrapped in RequireAuth */}
          <Route path="/"          element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/job-hub"   element={<RequireAuth><JobHub /></RequireAuth>} />
          <Route path="/team"      element={<RequireAuth><Team /></RequireAuth>} />
          <Route path="/calendar"  element={<RequireAuth><Calendar /></RequireAuth>} />
          <Route path="/analytics" element={<RequireAuth><AnalyticsGuard /></RequireAuth>} />
          <Route path="/notes"     element={<RequireAuth><Notes /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/profile"   element={<RequireAuth><Profile /></RequireAuth>} />
          
          {/* Fallback */}
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
