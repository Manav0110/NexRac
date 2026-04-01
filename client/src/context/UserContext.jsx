import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

const DEFAULT_PREFERENCES = {
  likedGenres: [],
  likedDomains: [],
  likedTags: [],
  dislikedGenres: [],
};

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

// Axios request interceptor — attach JWT token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexrec_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function UserProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nexrec_token') || null);
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [likedItems, setLikedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexrec_liked') || '[]'); } catch { return []; }
  });
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexrec_history') || '[]'); } catch { return []; }
  });
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // while restoring session

  // ── Restore session from token ─────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('nexrec_token');
      if (!savedToken) { setAuthLoading(false); return; }
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          const u = res.data.user;
          setUser(u);
          setToken(savedToken);
          setPreferences(u.preferences || DEFAULT_PREFERENCES);
          setOnboardingDone(u.onboardingDone || false);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Persist liked items & history ──────────────────────────────
  useEffect(() => {
    localStorage.setItem('nexrec_liked', JSON.stringify(likedItems));
  }, [likedItems]);

  useEffect(() => {
    localStorage.setItem('nexrec_history', JSON.stringify(history));
  }, [history]);

  // ── Auth helpers ───────────────────────────────────────────────
  function clearAuth() {
    localStorage.removeItem('nexrec_token');
    setToken(null);
    setUser(null);
    setOnboardingDone(false);
    setPreferences(DEFAULT_PREFERENCES);
  }

  const login = useCallback(async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const { token: t, user: u } = res.data;
        localStorage.setItem('nexrec_token', t);
        setToken(t);
        setUser(u);
        setPreferences(u.preferences || DEFAULT_PREFERENCES);
        setOnboardingDone(u.onboardingDone || false);
        return { success: true };
      }
      return { success: false, error: res.data.error };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed. Please try again.' };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      if (res.data.success) {
        const { token: t, user: u } = res.data;
        localStorage.setItem('nexrec_token', t);
        setToken(t);
        setUser(u);
        setPreferences(u.preferences || DEFAULT_PREFERENCES);
        setOnboardingDone(u.onboardingDone || false);
        return { success: true };
      }
      return { success: false, error: res.data.error };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setLikedItems([]);
    setHistory([]);
    localStorage.removeItem('nexrec_liked');
    localStorage.removeItem('nexrec_history');
  }, []);

  const completeOnboarding = useCallback(async (userData, prefs) => {
    const merged = { ...preferences, ...prefs };
    setPreferences(merged);
    setOnboardingDone(true);
    if (userData?.name) {
      setUser(prev => ({ ...prev, name: userData.name }));
    }
    // Save to server
    try {
      await axios.put('/api/auth/preferences', {
        preferences: merged,
        onboardingDone: true,
      });
    } catch (e) {
      console.warn('Could not save preferences to server:', e.message);
    }
  }, [preferences]);

  const toggleLike = (item) => {
    setLikedItems(prev => {
      const isLiked = prev.some(i => i.id === item.id);
      if (isLiked) return prev.filter(i => i.id !== item.id);
      // Update local preferences too
      const newGenres = (item.genre || []).filter(g => !preferences.likedGenres.includes(g));
      const newTags = (item.tags || []).filter(t => !preferences.likedTags.includes(t));
      if (newGenres.length || newTags.length) {
        setPreferences(p => ({
          ...p,
          likedGenres: [...new Set([...p.likedGenres, ...newGenres])],
          likedTags: [...new Set([...p.likedTags, ...newTags])],
          likedDomains: [...new Set([...p.likedDomains, item.domain])],
        }));
      }
      return [...prev, item];
    });
  };

  const addToHistory = (item) => {
    setHistory(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) return prev;
      return [item, ...prev].slice(0, 50);
    });
  };

  const isLiked = (itemId) => likedItems.some(i => i.id === itemId);

  const resetAll = () => {
    logout();
  };

  const isAuthenticated = !!token && !!user;

  return (
    <UserContext.Provider value={{
      // Auth
      token, user, setUser,
      isAuthenticated, authLoading,
      login, register, logout,
      // Preferences
      preferences, setPreferences,
      // Content
      likedItems, toggleLike, isLiked,
      history, addToHistory,
      // Onboarding
      onboardingDone, completeOnboarding,
      // Legacy
      resetAll,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
