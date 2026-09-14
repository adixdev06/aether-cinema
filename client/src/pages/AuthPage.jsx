import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Lock, Mail, ArrowRight, X, Film, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';

export default function AuthPage({ isModal = false, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, register, loginWithGoogle, user } = useAuth();
  const { playClick, playChime } = useAudio();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    playClick();

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message || 'Login failed. Please verify credentials.');
        } else {
          playChime();
          if (onClose) onClose();
          else navigate('/');
        }
      } else {
        const res = await register(username, email, password);
        if (!res.success) {
          setError(res.message || 'Registration failed.');
        } else {
          playChime();
          if (onClose) onClose();
          else navigate('/');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    playClick();
    setGoogleLoading(true);
    setError(null);

    try {
      const res = await loginWithGoogle({
        email: email || 'cinephile.explorer@gmail.com',
        name: username || 'Cinephile Critic',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      });

      if (res.success) {
        playChime();
        if (onClose) onClose();
        else navigate('/');
      } else {
        setError(res.message || 'Google sign in failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestContinue = () => {
    playChime();
    if (onClose) onClose();
    else navigate('/');
  };

  const content = (
    <div className="w-full max-w-md bg-noir-900 border border-white/10 rounded-3xl p-8 glass-panel-elevated shadow-2xl relative">
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Identity Icon */}
      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 p-0.5 shadow-lg shadow-gold-500/20 mb-1">
          <div className="w-full h-full bg-noir-950 rounded-[14px] flex items-center justify-center">
            <span className="font-serif font-black text-xl text-gold-400">Æ</span>
          </div>
        </div>
        <h2 className="font-display font-black text-2xl text-white tracking-tight">
          {isLogin ? 'Welcome to AETHER' : 'Create Your Cinema Identity'}
        </h2>
        <p className="text-xs text-slate-400 max-w-xs font-light">
          Unlock your personal Movie DNA, persistent Watched vault, and social friend comparison.
        </p>
      </div>

      {/* Official Sign in with Google Button */}
      <div className="mb-6 space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-3 border border-slate-200 active:scale-[0.99]"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {/* Official Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-white/10"></div>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Or with email
          </span>
          <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-noir-950 border border-white/5 mb-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => {
            playClick();
            setIsLogin(true);
            setError(null);
          }}
          className={`py-2 rounded-xl transition-all ${
            isLogin ? 'bg-gold-500 text-noir-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            playClick();
            setIsLogin(false);
            setError(null);
          }}
          className={`py-2 rounded-xl transition-all ${
            !isLogin ? 'bg-gold-500 text-noir-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Cinephile Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. NeoNolan"
                className="w-full bg-noir-850 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cinephile@aether.film"
              className="w-full bg-noir-850 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-noir-850 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-noir-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{isLogin ? 'Enter Archive' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Guest Mode */}
      <div className="mt-6 pt-6 border-t border-white/5 text-center">
        <button
          onClick={handleGuestContinue}
          className="text-xs text-slate-400 hover:text-gold-400 transition-colors"
        >
          Continue as Guest Explorer →
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      {content}
    </div>
  );
}
