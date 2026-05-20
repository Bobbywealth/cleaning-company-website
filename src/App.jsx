import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from '@/components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import QuotePage from './pages/QuotePage';
import ThankYouPage from './pages/ThankYouPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import OnlineBooking from './components/OnlineBooking';

function App() {
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('360cleaning_theme');
    return stored || (systemPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    localStorage.setItem('360cleaning_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quote" element={<QuotePage />} />
            <Route path="/book" element={<OnlineBooking />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
