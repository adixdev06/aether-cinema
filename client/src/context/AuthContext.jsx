import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      // Default to guest
      setUser({
        id: localStorage.getItem('aether_guest_id') || 'guest_default',
        username: 'Cinematic Explorer',
        isGuest: true
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('aether_token', res.data.token);
      setUser(res.data.user);
      setAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    if (res.data.success) {
      localStorage.setItem('aether_token', res.data.token);
      setUser(res.data.user);
      setAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const loginWithGoogle = async (googlePayload = {}) => {
    const defaultPayload = {
      email: googlePayload.email || 'cinematic.critic@gmail.com',
      name: googlePayload.name || 'Aditya Singh',
      avatar: googlePayload.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      googleId: googlePayload.googleId || `google_${Date.now()}`
    };

    const res = await api.post('/auth/google', defaultPayload);
    if (res.data.success) {
      localStorage.setItem('aether_token', res.data.token);
      setUser(res.data.user);
      setAuthModalOpen(false);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    localStorage.removeItem('aether_token');
    setUser({
      id: localStorage.getItem('aether_guest_id') || 'guest_default',
      username: 'Cinematic Explorer',
      isGuest: true
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authModalOpen,
      setAuthModalOpen,
      login,
      register,
      loginWithGoogle,
      logout,
      fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
