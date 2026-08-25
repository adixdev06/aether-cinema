import React, { createContext, useContext, useState } from 'react';
import { soundFx } from '../assets/audio';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('aether_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      soundFx.enabled = next;
      localStorage.setItem('aether_sound', String(next));
      if (next) soundFx.playChime();
      return next;
    });
  };

  const playClick = () => soundEnabled && soundFx.playClick();
  const playChime = () => soundEnabled && soundFx.playChime();
  const playBoom = () => soundEnabled && soundFx.playCinematicBoom();
  const playTick = () => soundEnabled && soundFx.playTick();

  return (
    <AudioContext.Provider value={{ soundEnabled, toggleSound, playClick, playChime, playBoom, playTick }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
