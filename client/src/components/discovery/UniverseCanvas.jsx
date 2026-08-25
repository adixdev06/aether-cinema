import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, RotateCcw, Filter, Star, Sparkles, ArrowRight,
  Play, Film, Compass, Info, X
} from 'lucide-react';
import api from '../../api/client';
import { useAudio } from '../../context/AudioContext';
import TrailerModal from '../common/TrailerModal';

const GENRE_COLORS = {
  'Sci-Fi': '#818CF8',
  'Action': '#F59E0B',
  'Drama': '#38BDF8',
  'Crime': '#94A3B8',
  'Horror': '#E11D48',
  'Animation': '#EC4899',
  'Adventure': '#10B981',
  'Comedy': '#FBBF24',
  'Mystery': '#C084FC',
  'History': '#F97316',
  'default': '#D97706'
};

export default function UniverseCanvas() {
  const canvasRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filterGenre, setFilterGenre] = useState('All');
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { playClick, playChime } = useAudio();
  const navigate = useNavigate();

  // Canvas transform state (pan & zoom)
  const transform = useRef({ x: 0, y: 0, scale: 0.95 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const draggedNode = useRef(null);
  const animationFrameId = useRef(null);

  // Fetch graph data from backend
  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await api.get('/discovery/universe-graph');
        if (res.data.success) {
          const { nodes, links } = res.data.graph;
          // Initial physics layout
          const width = window.innerWidth;
          const height = window.innerHeight;
          const initializedNodes = nodes.map((node, i) => {
            const angle = (i / nodes.length) * Math.PI * 2;
            const radius = 220 + (i % 3) * 120 + Math.random() * 80;
            return {
              ...node,
              x: width / 2 + Math.cos(angle) * radius,
              y: height / 2 + Math.sin(angle) * radius,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              radius: Math.max(14, (node.rating || 8) * 2.2),
              color: GENRE_COLORS[node.primaryGenre] || GENRE_COLORS.default
            };
          });

          setGraphData({ nodes: initializedNodes, links });
          transform.current.x = 0;
          transform.current.y = 0;
        }
      } catch (e) {
        console.error('Graph fetch error', e);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, []);

  // Physics simulation loop
  useEffect(() => {
    if (!graphData.nodes.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const simulationStep = () => {
      const nodes = graphData.nodes;
      const links = graphData.links;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Center gravitational pull
      const centerX = width / 2;
      const centerY = height / 2;
      nodes.forEach(node => {
        if (node === draggedNode.current) return;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * 0.0003;
        node.vy += dy * 0.0003;
      });

      // 2. Node repulsion (Coulomb force)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 320) {
            const force = (320 - dist) / dist * 0.08;
            if (a !== draggedNode.current) {
              a.vx -= dx * force * 0.01;
              a.vy -= dy * force * 0.01;
            }
            if (b !== draggedNode.current) {
              b.vx += dx * force * 0.01;
              b.vy += dy * force * 0.01;
            }
          }
        }
      }

      // 3. Link spring attraction (Hooke's Law)
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 180 / (link.strength || 1);
          const force = (dist - idealDist) * 0.002;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (sourceNode !== draggedNode.current) {
            sourceNode.vx += fx;
            sourceNode.vy += fy;
          }
          if (targetNode !== draggedNode.current) {
            targetNode.vx -= fx;
            targetNode.vy -= fy;
          }
        }
      });

      // 4. Dampen velocity and update position
      nodes.forEach(node => {
        if (node === draggedNode.current) return;
        node.vx *= 0.92;
        node.vy *= 0.92;
        node.x += node.vx;
        node.y += node.vy;
      });

      // --- RENDER ---
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(transform.current.x, transform.current.y);
      ctx.scale(transform.current.scale, transform.current.scale);

      // Draw Links
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (sourceNode && targetNode) {
          const isHighlighted = hoveredNode && (hoveredNode.id === sourceNode.id || hoveredNode.id === targetNode.id);
          const isSelected = selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);

          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          if (isSelected || isHighlighted) {
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = Math.min(3.5, (link.strength || 1) * 1.5);
            ctx.globalAlpha = 0.85;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
            ctx.lineWidth = Math.min(2, link.strength * 0.7);
            ctx.globalAlpha = 0.35;
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      // Draw Nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        const isSelected = selectedNode && selectedNode.id === node.id;
        const matchesFilter = filterGenre === 'All' || (node.genres && node.genres.includes(filterGenre));

        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (isSelected ? 1.3 : isHovered ? 1.2 : 1), 0, Math.PI * 2);

        // Ambient glow halo
        if (isSelected || isHovered) {
          ctx.shadowColor = node.color || '#F59E0B';
          ctx.shadowBlur = 30;
        } else {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = matchesFilter ? (node.color || '#818CF8') : '#2A2A3C';
        ctx.globalAlpha = matchesFilter ? 1 : 0.25;
        ctx.fill();

        // Node Ring
        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Text Label
        if (matchesFilter) {
          ctx.font = `${isSelected ? 'bold 13px' : '500 11px'} "Plus Jakarta Sans", sans-serif`;
          ctx.fillStyle = isSelected ? '#FCD34D' : '#E2E8F0';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, node.x, node.y + node.radius + 16);

          // Rating badge
          ctx.font = '9px monospace';
          ctx.fillStyle = '#94A3B8';
          ctx.fillText(`★ ${node.rating.toFixed(1)}`, node.x, node.y + node.radius + 28);
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
  }, [graphData, hoveredNode, selectedNode, filterGenre]);

  // Mouse & Touch interaction helpers
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    return {
      x: (mouseX - transform.current.x) / transform.current.scale,
      y: (mouseY - transform.current.y) / transform.current.scale
    };
  };

  const findNodeAt = (x, y) => {
    for (const node of graphData.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 6) {
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
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
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

  const genres = ['All', 'Sci-Fi', 'Drama', 'Action', 'Crime', 'Horror', 'Animation'];

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
      <div className="absolute top-20 left-6 right-6 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-[11px] uppercase tracking-[0.3em] text-gold-400 font-bold">
              Interactive Cosmos
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Movie Universe
          </h1>
          <p className="text-xs text-slate-400 max-w-sm">
            Drag nodes, click to inspect links, and discover narrative gravity wells.
          </p>
        </div>

        {/* Genre Filters Strip */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-noir-900/80 rounded-full border border-white/10 glass-panel-elevated overflow-x-auto max-w-full">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => {
                playClick();
                setFilterGenre(g);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-all ${
                filterGenre === g
                  ? 'bg-gold-500 text-noir-950 shadow-md shadow-gold-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Left Zoom Controls */}
      <div className="absolute bottom-8 left-6 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-noir-900/80 border border-white/10 glass-panel-elevated">
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
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Node Inspector Drawer / Card */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="absolute bottom-8 right-6 z-30 w-80 sm:w-96 rounded-3xl bg-noir-900/95 border border-white/15 glass-panel-elevated p-5 shadow-2xl space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedNode.poster}
                  alt={selectedNode.name}
                  className="w-12 h-16 rounded-xl object-cover border border-white/10 shadow-md"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                    {selectedNode.primaryGenre}
                  </span>
                  <h3 className="font-display font-bold text-base text-white line-clamp-1">
                    {selectedNode.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-gold-400 font-semibold">
                      <Star className="w-3 h-3 fill-gold-400" />
                      {selectedNode.rating.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{selectedNode.director || 'Curated'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connection Insights */}
            <div className="bg-noir-850 p-3 rounded-2xl border border-white/5 space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400" />
                Orbital Connections
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gravitationally linked by director vision, recurring ensemble cast, and existential storytelling themes.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  playChime();
                  navigate(`/media/${selectedNode.media_type || 'movie'}/${selectedNode.id}`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-noir-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Full Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
