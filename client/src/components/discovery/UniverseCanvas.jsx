import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, RotateCcw, Filter, Star, Sparkles, ArrowRight,
  Play, Film, Compass, Info, X, HelpCircle, Layers, ShieldCheck, Zap
} from 'lucide-react';
import api from '../../api/client';
import { useAudio } from '../../context/AudioContext';
import { handleImageError } from '../../utils/imageFallback';
import CinemaPlayerModal from '../player/CinemaPlayerModal';
import { DEFAULT_UNIVERSE_DATA } from '../../data/universeDefaultData';

const GENRE_COLORS = {
  'Sci-Fi': '#818CF8',
  'Action': '#F59E0B',
  'Drama': '#38BDF8',
  'Crime': '#F43F5E',
  'Horror': '#E11D48',
  'Animation': '#EC4899',
  'Adventure': '#10B981',
  'Comedy': '#FBBF24',
  'Mystery': '#C084FC',
  'History': '#FB923C',
  'default': '#F59E0B'
};

const CONSTELLATIONS = [
  { id: 'All', name: '🌌 All Galaxies (50+ Stars)' },
  { id: 'Sci-Fi', name: '🌀 Mind-Bending & Sci-Fi' },
  { id: 'Horror', name: '👁️ Gothic & Cosmic Horror' },
  { id: 'Action', name: '💥 High-Octane Action' },
  { id: 'Crime', name: '🕵️ Film Noir & Mystery' },
  { id: 'Animation', name: '🎨 4K Animation & Art' },
  { id: 'Drama', name: '🎭 Cinematic Drama' }
];

function initializeNodePositions(nodes, width, height) {
  const w = width || 1200;
  const h = height || 800;
  const total = (nodes && nodes.length) || 1;
  return nodes.map((node, i) => {
    const angle = (i / total) * Math.PI * 2;
    const ring = i % 4;
    const radius = 200 + ring * 110 + (Math.sin(i * 1.5) * 40);
    const x = w / 2 + Math.cos(angle) * radius;
    const y = h / 2 + Math.sin(angle) * radius;
    return {
      ...node,
      x: isFinite(x) ? x : w / 2,
      y: isFinite(y) ? y : h / 2,
      vx: (Math.sin(i) * 0.2),
      vy: (Math.cos(i) * 0.2),
      nodeRadius: Math.max(26, Math.round((node.rating || 8) * 3.3)),
      color: GENRE_COLORS[node.primaryGenre] || GENRE_COLORS.default
    };
  });
}

export default function UniverseCanvas() {
  const canvasRef = useRef(null);
  
  // Initialize immediately with default data so canvas is NEVER blank on initial frame
  const [graphData, setGraphData] = useState(() => {
    const initW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const initH = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      nodes: initializeNodePositions(DEFAULT_UNIVERSE_DATA.nodes, initW, initH),
      links: DEFAULT_UNIVERSE_DATA.links
    };
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filterGenre, setFilterGenre] = useState('All');
  const [guideOpen, setGuideOpen] = useState(false);
  const [cinemaModalMedia, setCinemaModalMedia] = useState(null);

  const { playClick, playChime } = useAudio();
  const navigate = useNavigate();

  // Image caching map for canvas poster rendering
  const imageCache = useRef(new Map());
  // Starfield for deep cosmos background effect
  const starsRef = useRef([]);

  // Canvas transform state (pan & zoom)
  const transform = useRef({ x: 0, y: 0, scale: 0.95 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const draggedNode = useRef(null);
  const animationFrameId = useRef(null);

  // Initialize stars once
  useEffect(() => {
    const starCount = 140;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 4000,
        y: (Math.random() - 0.5) * 4000,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }
    starsRef.current = stars;
  }, []);

  // Preload images into cache (without crossOrigin to avoid CORS canvas breaks)
  useEffect(() => {
    if (!graphData.nodes) return;
    graphData.nodes.forEach(node => {
      if (node.poster && !imageCache.current.has(node.poster)) {
        const img = new Image();
        img.src = node.poster;
        img.onerror = () => { img.hasError = true; };
        imageCache.current.set(node.poster, img);
      }
    });
  }, [graphData.nodes]);

  // Fetch graph data from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchGraph() {
      try {
        const res = await api.get('/discovery/universe-graph');
        if (res.data.success && isMounted) {
          const { nodes, links } = res.data.graph;
          const width = window.innerWidth || 1200;
          const height = window.innerHeight || 800;
          setGraphData({
            nodes: initializeNodePositions(nodes, width, height),
            links: links || []
          });
        }
      } catch (e) {
        console.warn('Backend sync note (using bundled constellation data):', e.message);
      }
    }
    fetchGraph();
    return () => { isMounted = false; };
  }, []);

  // Physics simulation and poster rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth || 1200;
      canvas.height = rect.height || window.innerHeight || 800;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let frameTime = 0;

    const simulationStep = () => {
      frameTime += 0.016;
      const nodes = graphData.nodes;
      const links = graphData.links;
      const width = canvas.width || 1200;
      const height = canvas.height || 800;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Center gravitational pull with NaN protection
      nodes.forEach(node => {
        if (!isFinite(node.x) || !isFinite(node.y)) {
          node.x = centerX + (Math.random() - 0.5) * 200;
          node.y = centerY + (Math.random() - 0.5) * 200;
          node.vx = 0;
          node.vy = 0;
        }
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * 0.00012;
        node.vy += dy * 0.00012;
      });

      // 2. Node-to-node repulsion with strict NaN & division-by-zero protection
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.max(0.1, Math.hypot(dx, dy));
          const minDist = (a.nodeRadius || 26) + (b.nodeRadius || 26) + 60;
          if (dist < minDist) {
            const force = ((minDist - dist) / dist) * 0.035;
            if (isFinite(force)) {
              const fx = dx * force;
              const fy = dy * force;
              if (isFinite(fx) && isFinite(fy)) {
                a.vx -= fx;
                a.vy -= fy;
                b.vx += fx;
                b.vy += fy;
              }
            }
          }
        }
      }

      // 3. Link spring tension with strict NaN protection
      links.forEach(link => {
        const sourceNode = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source);
        const targetNode = typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.max(0.1, Math.hypot(dx, dy));
          const targetDist = 220 / Math.max(1, (link.strength || 1));
          const force = (dist - targetDist) * 0.0006;
          if (isFinite(force)) {
            const fx = dx * force;
            const fy = dy * force;
            if (isFinite(fx) && isFinite(fy)) {
              sourceNode.vx += fx;
              sourceNode.vy += fy;
              targetNode.vx -= fx;
              targetNode.vy -= fy;
            }
          }
        }
      });

      // 4. Velocity damping, limits, and position updates
      nodes.forEach(node => {
        if (node === draggedNode.current) return;
        node.vx = (node.vx || 0) * 0.94;
        node.vy = (node.vy || 0) * 0.94;

        // Cap velocity to prevent runaway physics
        const maxV = 6;
        node.vx = Math.max(-maxV, Math.min(maxV, node.vx));
        node.vy = Math.max(-maxV, Math.min(maxV, node.vy));

        node.x += node.vx;
        node.y += node.vy;

        // Soft boundary reflection
        if (node.x < 60) { node.x = 60; node.vx *= -0.5; }
        if (node.x > width - 60) { node.x = width - 60; node.vx *= -0.5; }
        if (node.y < 60) { node.y = 60; node.vy *= -0.5; }
        if (node.y > height - 60) { node.y = height - 60; node.vy *= -0.5; }
      });

      // Render step
      ctx.clearRect(0, 0, width, height);

      // Deep space galactic backdrop
      const gradBg = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, Math.max(width, height) * 0.85);
      gradBg.addColorStop(0, '#0d1120');
      gradBg.addColorStop(0.5, '#07080f');
      gradBg.addColorStop(1, '#020205');
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      // Apply center-anchored pan & zoom
      ctx.translate(centerX + transform.current.x, centerY + transform.current.y);
      ctx.scale(transform.current.scale, transform.current.scale);
      ctx.translate(-centerX, -centerY);

      // Draw Twinkling Background Stars
      if (starsRef.current.length > 0) {
        starsRef.current.forEach(star => {
          const curAlpha = Math.max(0.15, Math.min(1, star.alpha + Math.sin(frameTime * 2 + star.phase) * 0.3));
          ctx.fillStyle = `rgba(255, 255, 255, ${curAlpha})`;
          ctx.beginPath();
          ctx.arc(star.x + centerX, star.y + centerY, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw Connection Orbital Links
      links.forEach(link => {
        const sourceNode = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source);
        const targetNode = typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          const isSourceMatch = filterGenre === 'All' || sourceNode.primaryGenre === filterGenre;
          const isTargetMatch = filterGenre === 'All' || targetNode.primaryGenre === filterGenre;
          const isConnectedToSelected = selectedNode && (sourceNode.id === selectedNode.id || targetNode.id === selectedNode.id);
          const isConnectedToHovered = hoveredNode && (sourceNode.id === hoveredNode.id || targetNode.id === hoveredNode.id);

          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          if (isConnectedToSelected || isConnectedToHovered) {
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 3;
            ctx.setLineDash([4, 4]);
          } else if (isSourceMatch && isTargetMatch) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.lineWidth = Math.min(2.5, Math.max(0.8, (link.strength || 1) * 0.6));
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Movie Poster Nodes
      nodes.forEach(node => {
        const isMatch = filterGenre === 'All' || node.primaryGenre === filterGenre;
        const isSelected = selectedNode && selectedNode.id === node.id;
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        const radius = isSelected ? (node.nodeRadius || 26) * 1.25 : (node.nodeRadius || 26);

        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.closePath();

        // Glowing outer halo
        if (isSelected || isHovered) {
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = isSelected ? 30 : 20;
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3.5;
        } else if (isMatch) {
          ctx.shadowColor = node.color || '#F59E0B';
          ctx.shadowBlur = 12;
          ctx.strokeStyle = node.color || 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
        } else {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
        }

        // Draw clipped image inside the node circle safely
        ctx.save();
        ctx.clip();

        let drawn = false;
        const img = node.poster ? imageCache.current.get(node.poster) : null;
        if (img && img.complete && img.naturalWidth > 0 && !img.hasError) {
          try {
            ctx.drawImage(img, node.x - radius, node.y - radius, radius * 2, radius * 2);
            drawn = true;
          } catch (e) {
            drawn = false;
          }
        }

        if (!drawn) {
          const bgGrad = ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, radius);
          bgGrad.addColorStop(0, node.color || '#F59E0B');
          bgGrad.addColorStop(1, '#11131f');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(node.x - radius, node.y - radius, radius * 2, radius * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(radius * 0.5)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((node.name || 'Æ').substring(0, 1), node.x, node.y);
        }
        ctx.restore();

        // Stroke gold border ring over the poster
        ctx.stroke();

        // Title text label underneath
        if (isMatch || isSelected || isHovered) {
          ctx.font = isSelected ? 'bold 13px Syne, sans-serif' : '11px Plus Jakarta Sans, sans-serif';
          ctx.fillStyle = isSelected ? '#F59E0B' : (isHovered ? '#FFFFFF' : 'rgba(226, 232, 240, 0.9)');
          ctx.textAlign = 'center';
          ctx.fillText(node.name || '', node.x, node.y + radius + 15);
        }

        ctx.restore();
      });

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(simulationStep);
    };

    animationFrameId.current = requestAnimationFrame(simulationStep);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [graphData, filterGenre, selectedNode, hoveredNode]);

  // Screen to Canvas coordinate translation taking center-anchored transform into account
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const width = canvas.width || 1200;
    const height = canvas.height || 800;
    const centerX = width / 2;
    const centerY = height / 2;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scale = transform.current.scale;
    const panX = transform.current.x;
    const panY = transform.current.y;

    const canvasX = centerX + (mouseX - centerX - panX) / scale;
    const canvasY = centerY + (mouseY - centerY - panY) / scale;

    return { x: canvasX, y: canvasY };
  };

  const findNodeAt = (x, y) => {
    for (const node of graphData.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const r = node.nodeRadius || 26;
      if (Math.hypot(dx, dy) <= r + 8) {
        return node;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoords(e);
    const node = findNodeAt(coords.x, coords.y);
    if (node) {
      draggedNode.current = node;
      setSelectedNode(node);
      playClick();
    } else {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - transform.current.x, y: e.clientY - transform.current.y };
    }
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    if (draggedNode.current) {
      draggedNode.current.x = coords.x;
      draggedNode.current.y = coords.y;
      draggedNode.current.vx = 0;
      draggedNode.current.vy = 0;
    } else if (isDragging.current) {
      transform.current.x = e.clientX - dragStart.current.x;
      transform.current.y = e.clientY - dragStart.current.y;
    } else {
      const node = findNodeAt(coords.x, coords.y);
      setHoveredNode(node);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    draggedNode.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.max(0.4, Math.min(2.5, transform.current.scale * zoomFactor));
    transform.current.scale = newScale;
  };

  const handleZoom = (factor) => {
    playClick();
    transform.current.scale = Math.max(0.4, Math.min(2.5, transform.current.scale * factor));
  };

  const handleReset = () => {
    playClick();
    transform.current.scale = 0.95;
    transform.current.x = 0;
    transform.current.y = 0;
  };

  // Extract direct neighbor links for the selected node
  const getNodeConnections = (nodeId) => {
    if (!nodeId || !graphData.links) return [];
    const connections = [];
    graphData.links.forEach(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : String(l.source);
      const targetId = typeof l.target === 'object' ? l.target.id : String(l.target);
      const currId = String(nodeId);

      if (sourceId === currId) {
        const neighbor = graphData.nodes.find(n => String(n.id) === targetId);
        if (neighbor) connections.push({ movie: neighbor, reason: l.reason });
      } else if (targetId === currId) {
        const neighbor = graphData.nodes.find(n => String(n.id) === sourceId);
        if (neighbor) connections.push({ movie: neighbor, reason: l.reason });
      }
    });
    return connections;
  };

  const selectedConnections = selectedNode ? getNodeConnections(selectedNode.id) : [];

  return (
    <div className="relative w-full h-screen bg-noir-950 overflow-hidden select-none">
      {/* Background Starfield Ambient Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-noir-850 via-noir-950 to-noir-950 opacity-90 pointer-events-none" />

      {/* Main Graph Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
      />

      {/* Top Floating HUD Controls */}
      <div className="absolute top-20 left-6 right-6 z-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pointer-events-none">
        {/* Title & Guide Button */}
        <div className="pointer-events-auto space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-bold">
              Celestial Constellation Explorer
            </span>
            <button
              onClick={() => {
                playClick();
                setGuideOpen(true);
              }}
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 border border-gold-500/40 text-[10px] font-bold font-mono transition-all shadow-md"
            >
              <HelpCircle className="w-3 h-3" />
              <span>What is this?</span>
            </button>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight drop-shadow-md">
            The Movie Universe
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            Discover how 50+ masterworks connect through Shared Creators, Acting Ensembles, and Narrative DNA. Click any star to travel the wormhole.
          </p>
        </div>

        {/* Constellation Filters Strip */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-noir-900/90 rounded-full border border-white/15 glass-panel-elevated overflow-x-auto max-w-full shadow-2xl backdrop-blur-xl">
          {CONSTELLATIONS.map(c => {
            const active = filterGenre === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  playClick();
                  setFilterGenre(c.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all ${
                  active
                    ? 'bg-gold-500 text-noir-950 shadow-lg shadow-gold-500/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Left Zoom Controls */}
      <div className="absolute bottom-8 left-6 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-noir-900/90 border border-white/15 glass-panel-elevated shadow-xl">
        <button
          onClick={() => handleZoom(1.2)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset Center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Node Inspector Drawer / Card */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-8 right-6 z-30 w-84 sm:w-96 rounded-3xl bg-noir-900/95 border border-gold-500/30 glass-panel-elevated p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedNode.poster}
                  alt={selectedNode.name}
                  onError={(e) => handleImageError(e, selectedNode.name, selectedNode.primaryGenre)}
                  className="w-14 h-20 rounded-2xl object-cover border-2 border-gold-500/50 shadow-xl"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                    {selectedNode.primaryGenre}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white line-clamp-1">
                    {selectedNode.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 font-mono">
                    <span className="flex items-center gap-1 text-gold-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-gold-400" />
                      {selectedNode.rating ? selectedNode.rating.toFixed(1) : '8.0'}
                    </span>
                    <span>•</span>
                    <span>{selectedNode.director || 'Curated'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
                title="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Orbital Connections List */}
            <div className="bg-noir-850 p-3.5 rounded-2xl border border-white/5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  Direct Cosmic Links ({selectedConnections.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Tap star to travel</span>
              </div>

              {selectedConnections.length === 0 ? (
                <p className="text-[11px] text-slate-400">Gravitationally self-contained masterpiece.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedConnections.map((conn, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        playClick();
                        setSelectedNode(conn.movie);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-gold-500/10 border border-transparent hover:border-gold-500/30 transition-all flex items-center justify-between group"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-white group-hover:text-gold-400 block truncate">
                          {conn.movie.name}
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {conn.reason}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-gold-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Stream & Full Blueprint */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  playClick();
                  setCinemaModalMedia({
                    id: selectedNode.id,
                    title: selectedNode.name,
                    poster_path: selectedNode.poster,
                    backdrop_path: selectedNode.backdrop || selectedNode.poster,
                    genres: [selectedNode.primaryGenre],
                    director: selectedNode.director,
                    vote_average: selectedNode.rating
                  });
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Stream / Preview</span>
              </button>

              <button
                onClick={() => {
                  playChime();
                  navigate(`/media/${selectedNode.media_type || 'movie'}/${selectedNode.id}`);
                }}
                className="p-3 rounded-2xl bg-noir-800 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
                title="Full Film Details"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Universe Educational Guide Modal */}
      <AnimatePresence>
        {guideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-noir-950/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="w-full max-w-2xl bg-noir-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 glass-panel-elevated shadow-2xl relative space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-white">
                      The Concept of the Movie Universe
                    </h3>
                    <p className="text-xs text-gold-400 font-mono">
                      How cinephiles explore the interconnected cosmos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGuideOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-noir-950/80 border border-white/10 space-y-2">
                  <span className="font-bold text-white text-sm flex items-center gap-2 text-gold-300">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    Why does the Universe exist?
                  </span>
                  <p>
                    Great films are rarely created in isolation. Directors, cinematographers, actors, and storytelling motifs form a continuous web of inspiration. The <strong>Movie Universe</strong> maps these connections as an interactive galaxy where every film is a living node.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                      1
                    </div>
                    <h4 className="font-bold text-white">Wormhole Travel</h4>
                    <p className="text-[11px] text-slate-400">
                      Click any movie node to inspect its gravitational links: shared directors (e.g. Nolan), identical cast, and thematic parallels.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold">
                      2
                    </div>
                    <h4 className="font-bold text-white">Constellations</h4>
                    <p className="text-[11px] text-slate-400">
                      Use the top filter bar to isolate thematic galaxies like <em>Mind-Bending Realities</em>, <em>Gothic Horror</em>, or <em>Neon Cyberpunk</em>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      3
                    </div>
                    <h4 className="font-bold text-white">Instant Streaming</h4>
                    <p className="text-[11px] text-slate-400">
                      Click <strong>Stream / Preview</strong> inside any node's inspector card to watch the movie or trailer in our in-browser player!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setGuideOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider"
                >
                  Start Exploring Galaxy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-Universe Cinema Player Lightbox Modal */}
      <CinemaPlayerModal
        isOpen={Boolean(cinemaModalMedia)}
        onClose={() => setCinemaModalMedia(null)}
        media={cinemaModalMedia}
      />
    </div>
  );
}
