import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Volume1,
  Maximize, Minimize, Settings, Sparkles, Film, ShieldCheck,
  Tv, Monitor, RefreshCw, Share2, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';

const AMBIENT_PRESETS = [
  { id: 'gold', name: 'Golden Amber', glow: 'rgba(217, 119, 6, 0.35)', border: 'rgba(245, 158, 11, 0.3)' },
  { id: 'cyan', name: 'Cyberpunk Neon', glow: 'rgba(6, 182, 212, 0.35)', border: 'rgba(56, 189, 248, 0.3)' },
  { id: 'crimson', name: 'Noir Crimson', glow: 'rgba(225, 29, 72, 0.35)', border: 'rgba(244, 63, 94, 0.3)' },
  { id: 'emerald', name: 'Matrix Emerald', glow: 'rgba(16, 185, 129, 0.35)', border: 'rgba(52, 211, 153, 0.3)' },
  { id: 'theater', name: 'Onyx Theater', glow: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.1)' }
];

export default function CinemaPlayer({
  title = "Cinematic Stream",
  sources = [],
  poster = "",
  license = "Public Domain / Creative Commons",
  quality = "1080p Full HD",
  isFreeStream = true,
  onClose = null,
  isTheaterDefault = false
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const { playClick } = useAudio();

  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(isTheaterDefault);
  const [showControls, setShowControls] = useState(true);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [ambientPreset, setAmbientPreset] = useState(AMBIENT_PRESETS[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentSource = sources[selectedSourceIndex] || {
    label: "Direct Stream",
    type: "mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    quality: "1080p Full HD"
  };

  const isHtml5Video = currentSource.type === 'mp4' || currentSource.type === 'webm' || (currentSource.url && currentSource.url.endsWith('.mp4'));

  // Video time & buffer handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const duration = videoRef.current.duration || 1;
        setBuffered((bufferedEnd / duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!isHtml5Video) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !isHtml5Video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds) => {
    if (!videoRef.current || !isHtml5Video) return;
    const newTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setSettingsOpen(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(10);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const nextVol = Math.min(volume + 0.1, 1);
        setVolume(nextVol);
        if (videoRef.current) videoRef.current.volume = nextVol;
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const nextVol = Math.max(volume - 0.1, 0);
        setVolume(nextVol);
        if (videoRef.current) videoRef.current.volume = nextVol;
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTheater(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, duration]);

  // Controls auto-hide timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!settingsOpen) setShowControls(false);
      }, 3500);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !settingsOpen && setShowControls(false)}
      className={`relative w-full rounded-3xl overflow-hidden bg-noir-950 select-none transition-all duration-500 ${
        isTheater ? 'max-w-none shadow-2xl ring-1 ring-gold-500/30' : 'max-w-6xl mx-auto shadow-2xl'
      }`}
      style={{
        boxShadow: ambientGlow
          ? `0 0 60px ${ambientPreset.glow}, 0 20px 40px -15px rgba(0,0,0,0.9)`
          : '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
      }}
    >
      {/* Ambient Lighting Dynamic Backlight Glow Canvas */}
      {ambientGlow && (
        <div
          className="absolute -inset-4 pointer-events-none opacity-40 blur-3xl transition-all duration-700 -z-10"
          style={{ background: `radial-gradient(circle at center, ${ambientPreset.glow} 0%, transparent 70%)` }}
        />
      )}

      {/* Main Video Viewport (16:9 Cinema Aspect Ratio) */}
      <div className="relative aspect-video w-full bg-noir-950 flex items-center justify-center overflow-hidden">
        {isHtml5Video ? (
          <video
            ref={videoRef}
            src={currentSource.url}
            poster={poster}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />
        ) : (
          <iframe
            src={currentSource.url}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
          />
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-noir-950/60 backdrop-blur-sm pointer-events-none z-20">
            <div className="w-12 h-12 rounded-full border-2 border-gold-500/20 border-t-gold-400 animate-spin mb-3" />
            <span className="font-display font-bold text-xs uppercase tracking-widest text-gold-400">
              Buffering Master Stream...
            </span>
          </div>
        )}

        {/* Big Center Play/Pause Indicator on Toggle */}
        <AnimatePresence>
          {!isPlaying && isHtml5Video && !isLoading && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={togglePlay}
              className="absolute z-20 w-20 h-20 rounded-full bg-gold-500/90 hover:bg-gold-400 text-noir-950 flex items-center justify-center shadow-2xl shadow-gold-500/40 transition-transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <Play className="w-9 h-9 fill-current ml-1" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Top Overlay Bar: Title, License & Quick Actions */}
        <div
          className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-noir-950/95 via-noir-950/60 to-transparent transition-opacity duration-300 z-30 flex items-center justify-between pointer-events-auto ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
              <Film className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide drop-shadow-md">
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  {license}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  • {currentSource.quality || quality}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Source Switcher Pill */}
            {sources.length > 1 && (
              <div className="relative">
                <select
                  value={selectedSourceIndex}
                  onChange={(e) => {
                    playClick();
                    setSelectedSourceIndex(Number(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="bg-noir-900/90 text-slate-200 border border-white/10 rounded-xl text-xs py-1.5 px-3 pr-7 focus:outline-none focus:border-gold-500 cursor-pointer font-medium appearance-none backdrop-blur-md"
                >
                  {sources.map((src, i) => (
                    <option key={i} value={i} className="bg-noir-900 text-slate-200">
                      {src.label} ({src.type.toUpperCase()})
                    </option>
                  ))}
                </select>
                <Layers className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Ambient Lighting Preset Switcher Button */}
            <button
              onClick={() => {
                playClick();
                setAmbientGlow(!ambientGlow);
              }}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                ambientGlow
                  ? 'bg-gold-500/20 text-gold-300 border-gold-500/40 shadow-md'
                  : 'bg-noir-900/80 text-slate-400 hover:text-white border-white/10'
              }`}
              title="Toggle Cinema Ambient Lighting"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-semibold">Glow</span>
            </button>
          </div>
        </div>

        {/* Bottom Custom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-noir-950/98 via-noir-950/80 to-transparent transition-opacity duration-300 z-30 space-y-3 pointer-events-auto ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Interactive Scrubbing Timeline Bar */}
          {isHtml5Video && (
            <div
              onClick={handleSeek}
              className="group/timeline relative h-2 hover:h-3 w-full bg-white/10 rounded-full cursor-pointer transition-all flex items-center"
            >
              {/* Buffered Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-white/25 rounded-full pointer-events-none"
                style={{ width: `${buffered}%` }}
              />

              {/* Played Progress Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full pointer-events-none shadow-lg shadow-gold-500/50"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />

              {/* Scrubber Knob */}
              <div
                className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md transform -translate-x-1/2 scale-0 group-hover/timeline:scale-100 transition-transform pointer-events-none border border-noir-900"
                style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
          )}

          {/* Primary Controls Row */}
          <div className="flex items-center justify-between text-white text-xs">
            {/* Left Controls: Play, Skips, Time, Volume */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isHtml5Video && (
                <>
                  {/* Play / Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-white/10 hover:bg-gold-500 hover:text-noir-950 transition-colors text-white"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  {/* 10s Rewind */}
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors"
                    title="Rewind 10s (←)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* 10s Forward */}
                  <button
                    onClick={() => handleSkip(10)}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors"
                    title="Forward 10s (→)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Timestamp Display */}
                  <div className="font-mono text-xs text-slate-300 tracking-wider">
                    <span className="text-white font-medium">{formatTime(currentTime)}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </>
              )}

              {/* Volume Controller */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-slate-300 hover:text-white transition-colors"
                  title={isMuted ? "Unmute (M)" : "Mute (M)"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gold-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-gold-400 hover:accent-gold-300"
                />
              </div>
            </div>

            {/* Right Controls: Ambient Color, Speed, Theater, Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Playback Speed Tag */}
              {isHtml5Video && (
                <div className="relative">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono font-semibold transition-colors"
                    title="Playback Speed"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Speed Popup Menu */}
                  {settingsOpen && (
                    <div className="absolute right-0 bottom-full mb-2 p-2 bg-noir-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl space-y-1 w-36 z-40">
                      <span className="block px-2 py-1 text-[10px] uppercase font-bold text-slate-400">
                        Playback Speed
                      </span>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`w-full text-left px-2.5 py-1 text-xs rounded-lg transition-colors flex items-center justify-between ${
                            playbackSpeed === s
                              ? 'bg-gold-500/20 text-gold-400 font-bold'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{s === 1 ? 'Normal (1x)' : `${s}x`}</span>
                          {playbackSpeed === s && <span>✓</span>}
                        </button>
                      ))}

                      {/* Ambient Theme Selector */}
                      <div className="pt-2 border-t border-white/10 mt-2">
                        <span className="block px-2 py-1 text-[10px] uppercase font-bold text-slate-400">
                          Ambient Palette
                        </span>
                        <div className="grid grid-cols-5 gap-1 p-1">
                          {AMBIENT_PRESETS.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setAmbientPreset(p);
                                setAmbientGlow(true);
                              }}
                              className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${
                                ambientPreset.id === p.id ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                              }`}
                              style={{ background: p.border }}
                              title={p.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Theater Mode Toggle */}
              <button
                onClick={() => {
                  playClick();
                  setIsTheater(!isTheater);
                }}
                className={`p-2 rounded-lg transition-colors hidden sm:inline-block ${
                  isTheater ? 'text-gold-400 bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title="Theater Mode (T)"
              >
                <Monitor className="w-4 h-4" />
              </button>

              {/* Picture in Picture */}
              {isHtml5Video && (
                <button
                  onClick={togglePiP}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors hidden sm:inline-block"
                  title="Picture in Picture"
                >
                  <Tv className="w-4 h-4" />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
