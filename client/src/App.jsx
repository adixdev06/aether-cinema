import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CommandSearch from './components/common/CommandSearch';
import Toast from './components/common/Toast';
import SurpriseMeModal from './components/discovery/SurpriseMeModal';
import AuthPage from './pages/AuthPage';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import DetailPage from './pages/DetailPage';
import CinemaLoungePage from './pages/CinemaLoungePage';
import WatchPage from './pages/WatchPage';
import UniversePage from './pages/UniversePage';
import MoodPage from './pages/MoodPage';
import LibraryPage from './pages/LibraryPage';
import MovieDnaPage from './pages/MovieDnaPage';
import FriendsPage from './pages/FriendsPage';
import NotFoundPage from './pages/NotFoundPage';

import { AudioProvider } from './context/AudioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';

function AppContent() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const { authModalOpen, setAuthModalOpen } = useAuth();

  // Keyboard shortcut '/' listener to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !searchOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const isUniverse = location.pathname === '/universe';

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-noir-950 text-slate-100 selection:bg-gold-500/30 selection:text-gold-300">
      {/* Film Grain Subtle Ambient Layer */}
      <div className="film-grain" />

      {/* Navbar */}
      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Routed Content */}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenSurprise={() => setSurpriseOpen(true)}
                surpriseOpen={surpriseOpen}
                onCloseSurprise={() => setSurpriseOpen(false)}
              />
            }
          />
          <Route path="/stream" element={<CinemaLoungePage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/moods" element={<MoodPage />} />
          <Route path="/universe" element={<UniversePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/movie-dna" element={<MovieDnaPage />} />
          <Route path="/media/:type/:id" element={<DetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Footer */}
      {!isUniverse && <Footer />}

      {/* Global Modals & Notifications */}
      <CommandSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <SurpriseMeModal
        isOpen={surpriseOpen}
        onClose={() => setSurpriseOpen(false)}
      />

      {authModalOpen && (
        <AuthPage
          isModal={true}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AudioProvider>
        <AuthProvider>
          <LibraryProvider>
            <AppContent />
          </LibraryProvider>
        </AuthProvider>
      </AudioProvider>
    </Router>
  );
}
