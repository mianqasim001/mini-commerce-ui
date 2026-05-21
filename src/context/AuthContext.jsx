import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('art_effect_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authService.login(email, password);
    // Expects: { token, user: { id, name, email } }
    localStorage.setItem('art_effect_token', data.token);
    localStorage.setItem('art_effect_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await authService.register({ name, email, password });
    localStorage.setItem('art_effect_token', data.token);
    localStorage.setItem('art_effect_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (formData) => {
    const { data } = await authService.update(formData);
    localStorage.setItem('art_effect_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('art_effect_token');
    localStorage.removeItem('art_effect_user');
    setUser(null);
  };

  // --- INACTIVITY TIMER IMPLEMENTATION ---
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // Only set the timer if someone is logged in
      if (user) {
        // 15 minutes = 15 * 60 * 1000 ms
        inactivityTimer = setTimeout(() => {
          console.warn("User logged out due to inactivity");
          logout();
          navigate('/login');
        }, 15 * 60 * 1000);
      }
    };

    // Events that count as "activity"
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    // Attach event listeners
    const attachListeners = () => {
      events.forEach((e) => window.addEventListener(e, resetTimer));
    };

    // Detach event listeners
    const detachListeners = () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };

    if (user) {
      attachListeners();
      resetTimer(); // Start initial timer
    } else {
      detachListeners();
      clearTimeout(inactivityTimer);
    }

    return () => {
      detachListeners();
      clearTimeout(inactivityTimer);
    };
  }, [user, navigate]);
  // --- END INACTIVITY TIMER ---

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
