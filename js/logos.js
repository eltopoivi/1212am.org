/* ============================================
   12⋮12am™ — SVG Logo Components
   Updated to match provided reference images
   ============================================ */

const Logos = {

  // Instagram icon SVG path
  igIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,

  // Render rooom SVG logo - Apple style
  renderRooom(size = 200) {
    return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="100" cy="100" r="98" fill="#fdf1f1"/>
      <circle cx="100" cy="100" r="92" fill="#1818e8"/>
      <path d="M100 65 C85 65 60 75 58 115 C56 160 85 180 100 180 C115 180 144 160 142 115 C140 75 115 65 100 65Z" fill="#d82020"/>
      <path d="M90 65 Q100 75 110 65 Q100 60 90 65Z" fill="#1818e8"/>
      <path d="M100 68 Q97 50 90 42" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="115" cy="48" rx="16" ry="10" fill="#00a820" transform="rotate(-20 115 48)"/>
      <circle cx="89" cy="40" r="3" fill="#FFD600"/>
      <text x="100" y="128" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="34" fill="#FFD600">rooom</text>
      <text x="156" y="112" font-family="Arial, sans-serif" font-size="10" fill="#FFD600" font-weight="700">TM</text>
      <defs><path id="arcText" d="M40 155 Q100 205 160 155"/></defs>
      <text font-family="Georgia, serif" font-size="16" fill="#FFD600" font-style="italic">
        <textPath href="#arcText" startOffset="50%" text-anchor="middle">Always your rooom</textPath>
      </text>
    </svg>`;
  },

  // Render dragon12 SVG logo — Symmetric Rorschach pattern (Solid White)
  renderDragon(size = 180) {
    return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="100" cy="100" r="95" fill="black" stroke="white" stroke-width="4"/>
      <g fill="white">
        <path d="M100 20 Q90 20 85 30 L75 35 Q65 30 55 35 Q40 45 45 60 L35 65 Q25 80 30 95 L20 100 Q25 115 35 125 L45 130 Q50 150 70 165 L85 175 Q95 185 100 185 
                 L100 165 Q90 155 85 140 L80 120 Q75 100 85 85 L90 60 Q95 40 100 35 Z" />
        <path d="M100 20 Q110 20 115 30 L125 35 Q135 30 145 35 Q160 45 155 60 L165 65 Q175 80 170 95 L180 100 Q175 115 165 125 L155 130 Q150 150 130 165 L115 175 Q105 185 100 185 
                 L100 165 Q110 155 115 140 L120 120 Q125 100 115 85 L110 60 Q105 40 100 35 Z" />
        <path d="M100 50 Q90 80 85 110 Q90 140 100 160 Q110 140 115 110 Q110 80 100 50" fill="black"/>
      </g>
    </svg>`;
  }
};
