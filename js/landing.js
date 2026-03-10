/* ============================================
   12⋮12am™ — CINEMATIC LANDING ENGINE
   Scroll storytelling + Canvas panel animations
   ============================================ */

(function () {
  'use strict';

  const homeEl = document.getElementById('pg-home');
  if (!homeEl) return;

  /* ═══════════════════════════════════════════
     1. CINEMATIC SCROLL — REVEAL LINES
     ═══════════════════════════════════════════ */

  const cinLines = document.querySelectorAll('.cin__line');
  if (cinLines.length && 'IntersectionObserver' in window) {
    const cinObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          cinObs.unobserve(entry.target);
        }
      });
    }, { root: homeEl, threshold: 0.3, rootMargin: '0px 0px -60px 0px' });
    cinLines.forEach(el => cinObs.observe(el));
  }

  /* ═══════════════════════════════════════════
     2. NOISE CANVAS (background for curse section)
     ═══════════════════════════════════════════ */

  const noiseCv = document.getElementById('noise-canvas');
  if (noiseCv) {
    const nCtx = noiseCv.getContext('2d');
    let noiseRAF;

    function resizeNoise() {
      noiseCv.width = noiseCv.offsetWidth / 3;
      noiseCv.height = noiseCv.offsetHeight / 3;
    }
    resizeNoise();
    window.addEventListener('resize', resizeNoise);

    function drawNoise() {
      const w = noiseCv.width, h = noiseCv.height;
      const img = nCtx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 30;
      }
      nCtx.putImageData(img, 0, 0);
      noiseRAF = requestAnimationFrame(drawNoise);
    }

    // Only run noise when curse section is visible
    const curseEl = document.getElementById('cin-curse');
    if (curseEl) {
      const noiseObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { drawNoise(); }
          else { cancelAnimationFrame(noiseRAF); }
        });
      }, { root: homeEl, threshold: 0 });
      noiseObs.observe(curseEl);
    }
  }

  /* ═══════════════════════════════════════════
     3. ECOSYSTEM PANEL ANIMATIONS
     ═══════════════════════════════════════════ */

  // Utility: get DPR-safe canvas context
  function setupCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: rect.height };
  }

  // Track hover state
  const panelStates = {};

  document.querySelectorAll('.eco-panel').forEach(panel => {
    const id = panel.dataset.panel;
    panelStates[id] = { hover: false, progress: 0 };

    panel.addEventListener('mouseenter', () => { panelStates[id].hover = true; });
    panel.addEventListener('mouseleave', () => { panelStates[id].hover = false; });

    // Mobile tap toggle
    panel.addEventListener('touchstart', (e) => {
      // Don't prevent default — allow click navigation
      panelStates[id].hover = !panelStates[id].hover;
      panel.classList.toggle('is-tapped', panelStates[id].hover);
    }, { passive: true });
  });

  /* ── SURVIVORS: Parchment scroll with medieval drawings ── */
  function initSurvivors() {
    const cv = document.getElementById('cv-survivors');
    if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);
    let scrollY = 0;

    const lines = [
      { y: 0.15, text: '⚔ The Last Survivors ⚔' },
      { y: 0.28, text: 'Those who see the pattern' },
      { y: 0.38, text: '† remain standing †' },
      { y: 0.52, text: '⚔  ╬  ⚔  ╬  ⚔' },
      { y: 0.63, text: 'Research. Observe. Survive.' },
      { y: 0.76, text: '☩ The Lab is open ☩' },
      { y: 0.88, text: '·  ·  ·  ·  ·  ·  ·' },
    ];

    function draw() {
      const s = panelStates.survivors;
      s.progress += ((s.hover ? 1 : 0) - s.progress) * 0.06;
      const p = s.progress;

      ctx.clearRect(0, 0, w, h);

      // Parchment background
      const parchH = h * 0.9 * p;
      if (parchH > 2) {
        // Aged parchment gradient
        const grad = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
        grad.addColorStop(0, 'rgba(45, 38, 25, 0.9)');
        grad.addColorStop(0.5, 'rgba(60, 52, 35, 0.95)');
        grad.addColorStop(1, 'rgba(45, 38, 25, 0.9)');
        ctx.fillStyle = grad;

        const px = w * 0.12, pw = w * 0.76;
        ctx.fillRect(px, h * 0.05, pw, parchH);

        // Parchment edges
        ctx.strokeStyle = 'rgba(80, 68, 42, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2, h * 0.05 + 2, pw - 4, parchH - 4);

        // Scroll roll at top
        ctx.fillStyle = 'rgba(55, 46, 30, 1)';
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.05, pw / 2 + 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Text on parchment
        ctx.textAlign = 'center';
        lines.forEach(line => {
          const ly = h * line.y;
          if (ly < h * 0.05 + parchH - 10) {
            const fadeIn = Math.min(1, (h * 0.05 + parchH - ly) / 40);
            ctx.globalAlpha = fadeIn * p;
            ctx.font = line.text.includes('⚔') || line.text.includes('╬')
              ? '14px "Share Tech Mono", monospace'
              : '12px "Exo 2", sans-serif';
            ctx.fillStyle = '#c4a862';
            ctx.fillText(line.text, w / 2, ly);
          }
        });
        ctx.globalAlpha = 1;

        // Medieval figure drawings (simple stick figures with swords)
        if (p > 0.4) {
          const figAlpha = Math.min(1, (p - 0.4) / 0.3);
          ctx.globalAlpha = figAlpha * 0.5;
          ctx.strokeStyle = '#8a7545';
          ctx.lineWidth = 1.5;

          // Left fighter
          drawFighter(ctx, w * 0.28, h * 0.48, 1);
          // Right fighter
          drawFighter(ctx, w * 0.72, h * 0.48, -1);

          ctx.globalAlpha = 1;
        }
      }

      requestAnimationFrame(draw);
    }

    function drawFighter(ctx, x, y, dir) {
      ctx.beginPath();
      // Head
      ctx.arc(x, y - 18, 5, 0, Math.PI * 2);
      ctx.stroke();
      // Body
      ctx.moveTo(x, y - 13); ctx.lineTo(x, y + 5);
      // Legs
      ctx.moveTo(x, y + 5); ctx.lineTo(x - 6 * dir, y + 18);
      ctx.moveTo(x, y + 5); ctx.lineTo(x + 4 * dir, y + 17);
      // Arms + sword
      ctx.moveTo(x, y - 8); ctx.lineTo(x + 12 * dir, y - 15);
      ctx.lineTo(x + 20 * dir, y - 22); // sword blade
      ctx.stroke();
    }

    draw();
  }

  /* ── STORE: Shop interior with hanging clothes ── */
  function initStore() {
    const cv = document.getElementById('cv-store');
    if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);

    const items = [];
    // Pants (right side)
    for (let i = 0; i < 4; i++) {
      items.push({ type: 'pants', x: w * 0.65 + i * 28, baseY: h * 0.12, swing: Math.random() * 0.5 });
    }
    // Shirts (left side)
    for (let i = 0; i < 4; i++) {
      items.push({ type: 'shirt', x: w * 0.12 + i * 30, baseY: h * 0.12, swing: Math.random() * 0.5 });
    }
    // Middle accessories
    const accessories = [
      { emoji: '🧢', x: w * 0.35, y: h * 0.55 },
      { emoji: '🎒', x: w * 0.5, y: h * 0.58 },
      { emoji: '🧦', x: w * 0.65, y: h * 0.55 },
      { emoji: '📦', x: w * 0.5, y: h * 0.75 },
    ];

    let t = 0;

    function draw() {
      const s = panelStates.store;
      s.progress += ((s.hover ? 1 : 0) - s.progress) * 0.05;
      const p = s.progress;
      t += 0.02;

      ctx.clearRect(0, 0, w, h);
      if (p < 0.01) { requestAnimationFrame(draw); return; }

      ctx.globalAlpha = p;

      // Clothing rack lines
      ctx.strokeStyle = 'rgba(100, 90, 70, 0.5)';
      ctx.lineWidth = 2;
      // Left rack
      ctx.beginPath();
      ctx.moveTo(w * 0.08, h * 0.1); ctx.lineTo(w * 0.42, h * 0.1);
      ctx.stroke();
      // Right rack
      ctx.beginPath();
      ctx.moveTo(w * 0.58, h * 0.1); ctx.lineTo(w * 0.92, h * 0.1);
      ctx.stroke();

      // Draw items
      items.forEach(item => {
        const swing = Math.sin(t + item.swing * 6) * 3 * p;

        if (item.type === 'shirt') {
          drawShirt(ctx, item.x + swing, item.baseY, p);
        } else {
          drawPants(ctx, item.x + swing, item.baseY, p);
        }
      });

      // Counter / shelf
      ctx.fillStyle = 'rgba(40, 35, 25, 0.6)';
      ctx.fillRect(w * 0.25, h * 0.48, w * 0.5, 3);

      // Accessories
      ctx.font = `${Math.floor(18 * p)}px sans-serif`;
      ctx.textAlign = 'center';
      accessories.forEach((acc, i) => {
        const delay = i * 0.15;
        const ap = Math.max(0, Math.min(1, (p - delay) / 0.5));
        if (ap > 0) {
          ctx.globalAlpha = ap;
          ctx.fillText(acc.emoji, acc.x, acc.y);
        }
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    function drawShirt(ctx, x, y, p) {
      ctx.strokeStyle = `rgba(180, 170, 150, ${0.6 * p})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Hanger
      ctx.moveTo(x, y); ctx.lineTo(x, y + 5);
      // Shoulders
      ctx.moveTo(x - 12, y + 8); ctx.lineTo(x + 12, y + 8);
      // Body
      ctx.moveTo(x - 12, y + 8); ctx.lineTo(x - 10, y + 30);
      ctx.lineTo(x + 10, y + 30); ctx.lineTo(x + 12, y + 8);
      // Sleeves
      ctx.moveTo(x - 12, y + 8); ctx.lineTo(x - 18, y + 18);
      ctx.moveTo(x + 12, y + 8); ctx.lineTo(x + 18, y + 18);
      ctx.stroke();
    }

    function drawPants(ctx, x, y, p) {
      ctx.strokeStyle = `rgba(150, 140, 120, ${0.6 * p})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Hanger
      ctx.moveTo(x, y); ctx.lineTo(x, y + 5);
      // Waist
      ctx.moveTo(x - 10, y + 5); ctx.lineTo(x + 10, y + 5);
      // Legs
      ctx.moveTo(x - 10, y + 5); ctx.lineTo(x - 8, y + 35);
      ctx.moveTo(x + 10, y + 5); ctx.lineTo(x + 8, y + 35);
      ctx.moveTo(x - 1, y + 5); ctx.lineTo(x - 1, y + 18);
      ctx.moveTo(x + 1, y + 5); ctx.lineTo(x + 1, y + 18);
      ctx.stroke();
    }

    draw();
  }

  /* ── 36912 AI: Matrix rain with 3-6-9-12 numbers ── */
  function initAI() {
    const cv = document.getElementById('cv-ai');
    if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);

    const chars = '3691236912369121221123691212';
    const colW = 18;
    const cols = Math.floor(w / colW);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -30);
    const speeds = new Array(cols).fill(0).map(() => 0.3 + Math.random() * 0.7);

    function draw() {
      const s = panelStates.ai;
      s.progress += ((s.hover ? 1 : 0) - s.progress) * 0.06;
      const p = s.progress;

      // Fade trail
      ctx.fillStyle = `rgba(0, 0, 0, ${0.08 + 0.05 * p})`;
      ctx.fillRect(0, 0, w, h);

      if (p < 0.01) { requestAnimationFrame(draw); return; }

      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';

      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * colW + colW / 2;
        const y = drops[i] * colW;

        // Lead character — bright yellow
        ctx.fillStyle = `rgba(255, 214, 0, ${0.95 * p})`;
        ctx.fillText(char, x, y);

        // Trail chars — dimmer
        for (let t = 1; t < 4; t++) {
          ctx.fillStyle = `rgba(255, 214, 0, ${(0.3 - t * 0.08) * p})`;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - t * colW);
        }

        drops[i] += speeds[i] * p;
        if (y > h + 50) {
          drops[i] = Math.random() * -10;
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ── ROOOM: Disco ball + balloons ── */
  function initRooom() {
    const cv = document.getElementById('cv-rooom');
    if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);

    // Balloons
    const balloons = [];
    const colors = ['#ff6b8a', '#6bcfff', '#ffe66b', '#b76bff', '#6bffb8', '#ff9f6b'];
    for (let i = 0; i < 10; i++) {
      balloons.push({
        x: Math.random() * w,
        y: h + 20 + Math.random() * 100,
        r: 12 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.4 + Math.random() * 0.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02
      });
    }

    // Disco ball reflections
    const reflections = [];
    for (let i = 0; i < 15; i++) {
      reflections.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 2 + Math.random() * 4,
        speed: 0.5 + Math.random() * 1.5,
        angle: Math.random() * Math.PI * 2,
        dist: 30 + Math.random() * 80
      });
    }

    let t = 0;

    function draw() {
      const s = panelStates.rooom;
      s.progress += ((s.hover ? 1 : 0) - s.progress) * 0.05;
      const p = s.progress;
      t += 0.02;

      ctx.clearRect(0, 0, w, h);
      if (p < 0.01) { requestAnimationFrame(draw); return; }

      ctx.globalAlpha = p;

      // Disco ball
      const ballX = w / 2, ballY = h * 0.15;
      const ballR = 16;

      // String
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ballX, 0); ctx.lineTo(ballX, ballY - ballR);
      ctx.stroke();

      // Ball body
      const ballGrad = ctx.createRadialGradient(ballX - 4, ballY - 4, 2, ballX, ballY, ballR);
      ballGrad.addColorStop(0, 'rgba(220, 220, 230, 0.9)');
      ballGrad.addColorStop(0.5, 'rgba(160, 160, 175, 0.7)');
      ballGrad.addColorStop(1, 'rgba(100, 100, 115, 0.5)');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR * p, 0, Math.PI * 2);
      ctx.fill();

      // Mirror facets
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let a = 0; a < Math.PI * 2; a += 0.6) {
        for (let r = 4; r < ballR; r += 5) {
          const fx = ballX + Math.cos(a + t * 0.5) * r * p;
          const fy = ballY + Math.sin(a + t * 0.5) * r * p;
          ctx.fillRect(fx - 1.5, fy - 1.5, 3, 3);
        }
      }

      // Light reflections floating around
      reflections.forEach(ref => {
        ref.angle += ref.speed * 0.01;
        const rx = w / 2 + Math.cos(ref.angle) * ref.dist;
        const ry = h * 0.3 + Math.sin(ref.angle * 1.3) * ref.dist * 0.7;

        ctx.globalAlpha = (0.15 + Math.sin(t * 2 + ref.angle) * 0.1) * p;
        ctx.fillStyle = '#fff';
        ctx.fillRect(rx - ref.size / 2, ry - ref.size / 2, ref.size, ref.size);
      });

      ctx.globalAlpha = p;

      // Balloons rising
      balloons.forEach(b => {
        b.wobble += b.wobbleSpeed;
        if (p > 0.1) {
          b.y -= b.speed * p;
          if (b.y < -30) b.y = h + 20;
        }
        const bx = b.x + Math.sin(b.wobble) * 8;

        ctx.globalAlpha = Math.min(p, 0.7);
        // Balloon body
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(bx, b.y, b.r * 0.8, b.r, 0, 0, Math.PI * 2);
        ctx.fill();

        // String
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(bx, b.y + b.r);
        ctx.quadraticCurveTo(bx + 3, b.y + b.r + 12, bx - 2, b.y + b.r + 22);
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ── WORMHOLE: Spiral vortex ── */
  function initWormhole() {
    const cv = document.getElementById('cv-wormhole');
    if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);
    const cx = w / 2, cy = h / 2;

    const particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 20 + Math.random() * Math.max(w, h) * 0.55,
        speed: 0.01 + Math.random() * 0.03,
        size: 1 + Math.random() * 2.5,
        pull: 0.2 + Math.random() * 0.5
      });
    }

    let t = 0;

    function draw() {
      const s = panelStates.wormhole;
      s.progress += ((s.hover ? 1 : 0) - s.progress) * 0.05;
      const p = s.progress;
      t += 0.01;

      // Trail fade
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + 0.05 * p})`;
      ctx.fillRect(0, 0, w, h);

      if (p < 0.01) { requestAnimationFrame(draw); return; }

      // Spiral rings
      for (let r = 0; r < 6; r++) {
        const radius = (30 + r * 25) * p;
        ctx.strokeStyle = `rgba(255, 214, 0, ${(0.06 - r * 0.008) * p})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Particles spiraling inward
      particles.forEach(pt => {
        pt.angle += pt.speed * (1 + p * 2);
        pt.dist -= pt.pull * p * 0.5;

        if (pt.dist < 3) {
          pt.dist = 20 + Math.random() * Math.max(w, h) * 0.55;
          pt.angle = Math.random() * Math.PI * 2;
        }

        const px = cx + Math.cos(pt.angle) * pt.dist;
        const py = cy + Math.sin(pt.angle) * pt.dist;

        const alpha = Math.min(1, pt.dist / 50) * 0.7 * p;
        ctx.fillStyle = `rgba(255, 214, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pt.size * p, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * p);
      glow.addColorStop(0, `rgba(255, 214, 0, ${0.15 * p})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ── DRAGON12: Chinese dragon flight ── */
  function initDragon() {
    const cv = document.getElementById('cv-dragon');
    if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);

    let t = 0;
    const segments = 24;

    function draw() {
      const s = panelStates.dragon;
      s.progress += ((s.hover ? 1 : 0) - s.progress) * 0.05;
      const p = s.progress;
      t += 0.025 * (0.3 + p * 0.7);

      ctx.clearRect(0, 0, w, h);
      if (p < 0.01) { requestAnimationFrame(draw); return; }

      ctx.globalAlpha = p;

      // Dragon path — sinuous S-curve moving across
      const headX = w * 0.15 + (t * 40) % (w * 1.2) - w * 0.1;
      const headY = h * 0.45 + Math.sin(t * 2) * h * 0.15;

      // Body segments
      const points = [];
      for (let i = 0; i < segments; i++) {
        const seg = i / segments;
        const delay = i * 0.15;
        const sx = headX - i * 12;
        const sy = headY + Math.sin(t * 2.5 - delay) * (20 + i * 1.5);
        points.push({ x: sx, y: sy });
      }

      // Draw body (thick to thin)
      for (let i = points.length - 1; i > 0; i--) {
        const thickness = (1 - i / segments) * 10 + 2;
        const green = Math.floor(140 + (1 - i / segments) * 80);
        ctx.strokeStyle = `rgba(${Math.floor(green * 0.3)}, ${green}, ${Math.floor(green * 0.3)}, ${0.7 * p})`;
        ctx.lineWidth = thickness * p;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i - 1].x, points[i - 1].y);
        ctx.stroke();
      }

      // Scales pattern along body
      ctx.fillStyle = `rgba(100, 200, 80, ${0.15 * p})`;
      for (let i = 1; i < points.length - 1; i += 2) {
        const sc = (1 - i / segments) * 5 + 1;
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, sc, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head
      if (points.length > 0) {
        const hp = points[0];
        ctx.fillStyle = `rgba(50, 180, 50, ${0.9 * p})`;
        ctx.beginPath();
        ctx.ellipse(hp.x + 6, hp.y, 9 * p, 7 * p, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = `rgba(255, 214, 0, ${p})`;
        ctx.beginPath();
        ctx.arc(hp.x + 10, hp.y - 3, 2 * p, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = `rgba(200, 200, 200, ${0.4 * p})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(hp.x + 14, hp.y - 2);
        ctx.quadraticCurveTo(hp.x + 25, hp.y - 12 + Math.sin(t * 3) * 4, hp.x + 30, hp.y - 8);
        ctx.moveTo(hp.x + 14, hp.y + 2);
        ctx.quadraticCurveTo(hp.x + 25, hp.y + 8 + Math.sin(t * 3 + 1) * 4, hp.x + 30, hp.y + 4);
        ctx.stroke();
      }

      // Tail decorations
      const tail = points[points.length - 1];
      if (tail) {
        ctx.strokeStyle = `rgba(50, 160, 50, ${0.4 * p})`;
        ctx.lineWidth = 1;
        for (let f = 0; f < 3; f++) {
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          ctx.quadraticCurveTo(
            tail.x - 10 - f * 5, tail.y + Math.sin(t * 2 + f) * 10,
            tail.x - 18 - f * 8, tail.y + Math.cos(t * 2 + f) * 8
          );
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ═══ INITIALIZE ALL ═══ */
  // Wait a tick for layout to settle
  requestAnimationFrame(() => {
    initSurvivors();
    initStore();
    initAI();
    initRooom();
    initWormhole();
    initDragon();
  });

  /* ═══ HANDLE RESIZE ═══ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-init canvases on resize
      initSurvivors();
      initStore();
      initAI();
      initRooom();
      initWormhole();
      initDragon();
    }, 300);
  });

})();
