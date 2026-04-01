import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Toast from './components/Toast';
import ContentDetailModal from './components/ContentDetailModal';

function AuthGate() {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return <Register onSwitchToLogin={() => setShowRegister(false)} />;
  }
  return <Login onSwitchToRegister={() => setShowRegister(true)} />;
}

function AppInner() {
  const { isAuthenticated, onboardingDone, authLoading } = useUser();
  const [toasts, setToasts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const showToast = useCallback((message, icon = '✨') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const openModal = useCallback((item) => setSelectedItem(item), []);
  const closeModal = useCallback(() => setSelectedItem(null), []);

  // While restoring session from localStorage
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ fontSize: '2.5rem' }}>✦</div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800,
          background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>NexRec</div>
        <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
      </div>
    );
  }

  // Not logged in → show Login/Register
  if (!isAuthenticated) {
    return <AuthGate />;
  }

  // Logged in but not onboarded
  if (!onboardingDone) {
    return <Onboarding />;
  }

  // Fully authenticated + onboarded
  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home showToast={showToast} onCardClick={openModal} />} />
          <Route path="/explore" element={<Explore showToast={showToast} onCardClick={openModal} />} />
          <Route path="/search" element={<Search showToast={showToast} onCardClick={openModal} />} />
          <Route path="/profile" element={<Profile onCardClick={openModal} showToast={showToast} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toast toasts={toasts} />

      {selectedItem && (
        <ContentDetailModal
          item={selectedItem}
          onClose={closeModal}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppInner />
      </UserProvider>
    </BrowserRouter>
  );
}
