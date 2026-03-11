import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RecordingPage from './pages/RecordingPage';
import PromptsPage from './pages/PromptsPage';
import Layout from './components/Layout';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handler = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleLogin = (t) => {
    localStorage.setItem('token', t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/recording/:id" element={<RecordingPage />} />
          <Route path="/prompts" element={<PromptsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
