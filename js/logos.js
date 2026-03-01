/* ============================================
   12⋮12am™ — SVG Logo Components
   Inline SVGs for rooom and dragon12 logos
   ============================================ */

const Logos = {

  // Instagram icon SVG path
  igIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,

  // Render rooom SVG logo
  renderRooom(size = 200) {
    return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="100" cy="100" r="98" fill="#c8c0b0"/>
      <circle cx="100" cy="100" r="90" fill="#1818e8"/>
      <path d="M100 58 C65 58, 40 84, 42 114 C44 144, 66 168, 100 172 C134 168, 156 144, 158 114 C160 84, 135 58, 100 58Z" fill="#d82020"/>
      <path d="M90 60 Q100 70, 110 60 Q100 55, 90 60Z" fill="#1818e8"/>
      <path d="M100 60 Q96 44, 89 36" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="113" cy="42" rx="14" ry="8.5" fill="#00a820" transform="rotate(-18 113 42)"/>
      <circle cx="88" cy="35" r="2.5" fill="#FFD600"/>
      <text x="100" y="124" text-anchor="middle" font-family="'Arial Black','Helvetica Neue',sans-serif" font-weight="900" font-size="33" fill="#FFD600" letter-spacing="1">rooom</text>
      <text x="154" y="108" font-family="Arial,sans-serif" font-size="9" fill="#FFD600" font-weight="700">™</text>
      <defs><path id="arcBottom" d="M32 150 Q100 198, 168 150"/></defs>
      <text font-family="Georgia,'Times New Roman',serif" font-size="13.5" fill="#c8a020" font-style="italic" letter-spacing=".5">
        <textPath href="#arcBottom" startOffset="50%" text-anchor="middle">Always your rooom</textPath>
      </text>
    </svg>`;
  },

  // Render dragon12 SVG logo — symmetric Rorschach pattern
  renderDragon(size = 180) {
    return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="100" cy="100" r="94" fill="none" stroke="#fff" stroke-width="3.5"/>
      <g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <!-- Left side -->
        <path d="M100 16 C92 28,75 26,60 30 C45 34,32 44,34 58"/>
        <path d="M34 58 C30 72,32 86,28 98"/>
        <path d="M28 98 C24 112,30 126,28 140"/>
        <path d="M28 140 C26 152,34 162,48 170 C64 178,82 176,100 184"/>
        <path d="M100 16 C95 32,85 40,78 52"/>
        <path d="M78 52 C72 62,68 74,65 84"/>
        <path d="M65 84 C62 96,60 108,62 120"/>
        <path d="M62 120 C64 134,70 148,78 158"/>
        <path d="M78 158 C86 168,92 176,100 184"/>
        <path d="M34 58 C40 50,50 42,60 40"/>
        <path d="M60 40 C50 46,44 58,40 70"/>
        <path d="M40 70 C36 82,38 94,36 106"/>
        <path d="M36 106 C34 118,38 132,42 144"/>
        <path d="M42 144 C46 156,56 166,68 172"/>
        <path d="M68 172 C80 178,90 180,100 184"/>
        <path d="M100 38 C96 52,94 68,92 82"/>
        <path d="M92 82 C90 98,88 112,90 128"/>
        <path d="M90 128 C92 144,95 160,100 184"/>
        <!-- Right side (mirror) -->
        <path d="M100 16 C108 28,125 26,140 30 C155 34,168 44,166 58"/>
        <path d="M166 58 C170 72,168 86,172 98"/>
        <path d="M172 98 C176 112,170 126,172 140"/>
        <path d="M172 140 C174 152,166 162,152 170 C136 178,118 176,100 184"/>
        <path d="M100 16 C105 32,115 40,122 52"/>
        <path d="M122 52 C128 62,132 74,135 84"/>
        <path d="M135 84 C138 96,140 108,138 120"/>
        <path d="M138 120 C136 134,130 148,122 158"/>
        <path d="M122 158 C114 168,108 176,100 184"/>
        <path d="M166 58 C160 50,150 42,140 40"/>
        <path d="M140 40 C150 46,156 58,160 70"/>
        <path d="M160 70 C164 82,162 94,164 106"/>
        <path d="M164 106 C166 118,162 132,158 144"/>
        <path d="M158 144 C154 156,144 166,132 172"/>
        <path d="M132 172 C120 178,110 180,100 184"/>
        <path d="M100 38 C104 52,106 68,108 82"/>
        <path d="M108 82 C110 98,112 112,110 128"/>
        <path d="M110 128 C108 144,105 160,100 184"/>
      </g>
    </svg>`;
  }
};
