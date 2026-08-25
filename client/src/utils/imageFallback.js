// Utility for fallback posters and backdrops when external CDNs fail or block requests

export function getFallbackPoster(title = 'AETHER Cinema', genre = 'Feature Film') {
  const safeTitle = (title || 'Cinema Archive').replace(/"/g, "'").slice(0, 32);
  const safeGenre = (genre || 'Curated Story').replace(/"/g, "'").slice(0, 20);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#181824"/>
          <stop offset="50%" stop-color="#0E0E15"/>
          <stop offset="100%" stop-color="#060608"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
      <rect x="20" y="20" width="560" height="860" rx="24" fill="none" stroke="rgba(245, 158, 11, 0.25)" stroke-width="2"/>
      
      <!-- Monogram Icon -->
      <g transform="translate(300, 360)">
        <circle r="60" fill="#12121A" stroke="#F59E0B" stroke-width="3"/>
        <text y="14" font-family="'Cinzel', serif" font-size="44" font-weight="bold" fill="#F59E0B" text-anchor="middle">Æ</text>
      </g>

      <!-- Category -->
      <text x="300" y="520" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="bold" letter-spacing="4" fill="#F59E0B" text-anchor="middle" text-transform="uppercase">
        ${safeGenre}
      </text>

      <!-- Title -->
      <text x="300" y="580" font-family="'Syne', sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
        ${safeTitle}
      </text>
      
      <!-- Footer seal -->
      <text x="300" y="820" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" letter-spacing="3" fill="#64748B" text-anchor="middle">
        AETHER ARCHIVAL EDITION
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function handleImageError(e, title = 'Cinema Archive', genre = 'Feature Film') {
  e.currentTarget.onerror = null; // prevent infinite loops
  e.currentTarget.src = getFallbackPoster(title, genre);
}
