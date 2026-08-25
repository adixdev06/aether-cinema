import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Compass, Film, Sparkles, Bookmark, User, Volume2, VolumeX, Menu, X, Dna } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';

export default function Navbar({ onOpenSearch, onOpenAuth }) {
  const location = useLocation();
  const { user } = useAuth();
  const { soundEnabled, toggleSound, playClick } = useAudio();
  const { watchedList, watchlist } = useLibrary();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Moods', path: '/moods' },
    { name: 'Universe', path: '/universe' },
    { name: 'My Library', path: '/library', badge: (watchedList.length + watchlist.length) || null },
    { name: 'Movie DNA', path: '/movie-dna' }
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-noir-950/85 backdrop-blur-xl border-b border-white/5 py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-noir-950/90 via-noir-950/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={playClick}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 p-0.5 shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all duration-300">
              <div className="w-full h-full bg-noir-950 rounded-[7px] flex items-center justify-center">
                <span className="font-serif font-black text-sm text-gold-400">Æ</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-[0.2em] text-white group-hover:text-gold-400 transition-colors">
                AETHER
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 -mt-1 font-medium">
                Cinema Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-noir-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={playClick}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-medium tracking-wider transition-all duration-200 ${
                    active
                      ? 'text-white bg-white/10 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                  {link.badge !== null && link.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded-full font-semibold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => {
                playClick();
                onOpenSearch();
              }}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-noir-900/70 hover:bg-noir-800 text-slate-300 hover:text-white border border-white/5 transition-all text-xs group"
              title="Search movies, TV, actors, directors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-400 transition-colors" />
              <span className="hidden sm:inline text-slate-300">Discover...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/5 text-slate-400 rounded border border-white/10 font-mono">
                /
              </kbd>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-full bg-noir-900/60 hover:bg-noir-800 text-slate-400 hover:text-gold-400 border border-white/5 transition-all"
              title={soundEnabled ? 'Mute cinematic audio feedback' : 'Enable audio feedback'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-gold-400" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Profile / Auth */}
            <button
              onClick={() => {
                playClick();
                onOpenAuth();
              }}
              className="flex items-center gap-2 p-1 pl-2 sm:pr-3 rounded-full bg-noir-900/80 hover:bg-noir-800 border border-white/5 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-gold-400" />
                )}
              </div>
              <span className="hidden sm:inline font-medium text-slate-200">
                {user?.isGuest ? 'Guest' : (user?.username || 'Profile')}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-noir-900/70 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-noir-950/95 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between border-b border-white/10">
          <div className="space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  playClick();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between py-3 border-b border-white/5 text-lg font-display ${
                  location.pathname === link.path ? 'text-gold-400 font-bold' : 'text-slate-300'
                }`}
              >
                <span>{link.name}</span>
                {link.badge !== null && (
                  <span className="px-2 py-0.5 text-xs bg-gold-500/20 text-gold-400 rounded-full font-sans">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>AETHER CINEMATHEQUE</span>
            <button onClick={toggleSound} className="flex items-center gap-2 text-gold-400">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Audio Active' : 'Muted'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
