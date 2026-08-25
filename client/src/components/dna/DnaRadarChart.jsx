import React from 'react';

export default function DnaRadarChart({ dimensions = [] }) {
  if (!dimensions || dimensions.length === 0) return null;

  const size = 300;
  const center = size / 2;
  const radius = size * 0.38;
  const total = dimensions.length;

  // Calculate polygon coordinates
  const getCoordinates = (value, index) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const polygonPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.value, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Concentric background grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Webs */}
        {gridLevels.map((level, lvlIdx) => {
          const points = dimensions
            .map((_, i) => {
              const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
              const r = radius * level;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');

          return (
            <polygon
              key={lvlIdx}
              points={points}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray={lvlIdx === gridLevels.length - 1 ? 'none' : '3,3'}
            />
          );
        })}

        {/* Axis Spoke Lines */}
        {dimensions.map((_, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Data Polygon with Glowing Gradient */}
        <polygon
          points={polygonPoints}
          fill="rgba(245, 158, 11, 0.25)"
          stroke="#F59E0B"
          strokeWidth="2.5"
          className="filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
        />

        {/* Vertex Points & Labels */}
        {dimensions.map((d, i) => {
          const { x, y } = getCoordinates(d.value, i);
          const labelAngle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const labelRadius = radius + 24;
          const lx = center + labelRadius * Math.cos(labelAngle);
          const ly = center + labelRadius * Math.sin(labelAngle);

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#F59E0B"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-display font-semibold fill-slate-300 tracking-wider"
              >
                {d.label.split(' ')[0]} ({d.value}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
