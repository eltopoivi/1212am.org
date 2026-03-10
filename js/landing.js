/* ============================================
   12⋮12am™ — CINEMATIC LANDING ENGINE v2
   MAX ANIMATION — 6 unique canvas experiences
   ============================================ */

(function () {
  'use strict';
  const homeEl = document.getElementById('pg-home');
  if (!homeEl) return;

  /* ═══ CINEMATIC SCROLL REVEALS ═══ */
  const cinLines = document.querySelectorAll('.cin__line');
  if (cinLines.length && 'IntersectionObserver' in window) {
    const cinObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); cinObs.unobserve(e.target); } });
    }, { root: homeEl, threshold: 0.3, rootMargin: '0px 0px -60px 0px' });
    cinLines.forEach(el => cinObs.observe(el));
  }

  /* ═══ NOISE CANVAS ═══ */
  const noiseCv = document.getElementById('noise-canvas');
  if (noiseCv) {
    const nCtx = noiseCv.getContext('2d');
    let noiseRAF;
    function resizeNoise() { noiseCv.width = noiseCv.offsetWidth / 3; noiseCv.height = noiseCv.offsetHeight / 3; }
    resizeNoise(); window.addEventListener('resize', resizeNoise);
    function drawNoise() {
      const w = noiseCv.width, h = noiseCv.height, img = nCtx.createImageData(w, h), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i+1] = d[i+2] = v; d[i+3] = 30; }
      nCtx.putImageData(img, 0, 0); noiseRAF = requestAnimationFrame(drawNoise);
    }
    const curseEl = document.getElementById('cin-curse');
    if (curseEl) {
      const nObs = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) drawNoise(); else cancelAnimationFrame(noiseRAF); }); }, { root: homeEl, threshold: 0 });
      nObs.observe(curseEl);
    }
  }

  /* ═══ PANEL ENGINE ═══ */
  function setupCanvas(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: r.width, h: r.height };
  }

  // Hover state: once activated, stays until animation completes
  const PS = {}; // panel states

  document.querySelectorAll('.eco-panel').forEach(panel => {
    const id = panel.dataset.panel;
    PS[id] = { triggered: false, progress: 0, done: false };

    function trigger() {
      if (!PS[id].triggered) {
        PS[id].triggered = true;
        panel.classList.add('is-active');
      }
    }
    panel.addEventListener('mouseenter', trigger);
    panel.addEventListener('touchstart', trigger, { passive: true });
  });

  /* ════════════════════════════════════════════
     SURVIVORS — Parchment unroll + animated fight
     ════════════════════════════════════════════ */
  function initSurvivors() {
    const cv = document.getElementById('cv-survivors'); if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);
    let t = 0;

    // Fighter state
    const fighters = [
      { x: w*0.3, y: h*0.55, arm: 0, leg: 0, dir: 1, hp: 1 },
      { x: w*0.7, y: h*0.55, arm: 0, leg: 0, dir: -1, hp: 1 }
    ];

    // Scrolled text lines
    const texts = [
      '⚔  THE LAST SURVIVORS  ⚔',
      '',
      'Those who observe the pattern',
      'remain standing.',
      '',
      '† The research continues †',
    ];

    function draw() {
      const s = PS.survivors;
      if (s.triggered && s.progress < 1) s.progress = Math.min(1, s.progress + 0.006);
      const p = s.progress;
      t += 0.03;

      ctx.clearRect(0, 0, w, h);
      if (p < 0.001) { requestAnimationFrame(draw); return; }

      // ── PARCHMENT ──
      const pX = w * 0.08, pW = w * 0.84;
      const rollY = h * 0.04;
      const parchH = (h * 0.92) * Math.min(p * 1.5, 1); // unrolls first 66% of animation

      // Parchment body
      const pGrad = ctx.createLinearGradient(pX, 0, pX + pW, 0);
      pGrad.addColorStop(0, 'rgba(62, 52, 32, 0.95)');
      pGrad.addColorStop(0.3, 'rgba(78, 66, 42, 0.97)');
      pGrad.addColorStop(0.7, 'rgba(75, 63, 40, 0.97)');
      pGrad.addColorStop(1, 'rgba(58, 48, 30, 0.95)');
      ctx.fillStyle = pGrad;
      ctx.fillRect(pX, rollY, pW, parchH);

      // Parchment texture (grain dots)
      ctx.fillStyle = 'rgba(90, 75, 50, 0.15)';
      for (let i = 0; i < 120; i++) {
        const gx = pX + Math.random() * pW;
        const gy = rollY + Math.random() * parchH;
        ctx.fillRect(gx, gy, 1, 1);
      }

      // Parchment edges
      ctx.strokeStyle = 'rgba(100, 82, 50, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pX + 3, rollY + 3, pW - 6, parchH - 6);

      // Scroll roll cylinder at top
      const rollGrad = ctx.createLinearGradient(0, rollY - 8, 0, rollY + 8);
      rollGrad.addColorStop(0, 'rgba(90, 75, 50, 1)');
      rollGrad.addColorStop(0.5, 'rgba(120, 100, 65, 1)');
      rollGrad.addColorStop(1, 'rgba(80, 65, 42, 1)');
      ctx.fillStyle = rollGrad;
      ctx.beginPath();
      ctx.ellipse(w / 2, rollY, pW / 2 + 6, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Roll at bottom (unrolling edge)
      if (parchH > 20) {
        const botY = rollY + parchH;
        const bGrad = ctx.createLinearGradient(0, botY - 8, 0, botY + 8);
        bGrad.addColorStop(0, 'rgba(80, 65, 42, 1)');
        bGrad.addColorStop(0.5, 'rgba(110, 92, 60, 1)');
        bGrad.addColorStop(1, 'rgba(70, 58, 38, 1)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.ellipse(w / 2, botY, pW / 2 + 4, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── TEXT ──
      ctx.textAlign = 'center';
      const lineH = 18;
      const startY = rollY + 35;
      texts.forEach((line, i) => {
        const ly = startY + i * lineH;
        if (ly < rollY + parchH - 20 && ly > rollY + 10) {
          const fade = Math.min(1, (rollY + parchH - ly) / 40);
          ctx.globalAlpha = fade * p;
          if (line.includes('⚔')) {
            ctx.font = 'bold 13px "Share Tech Mono", monospace';
            ctx.fillStyle = '#c4a050';
          } else if (line.includes('†')) {
            ctx.font = 'italic 11px "Exo 2", sans-serif';
            ctx.fillStyle = '#a08840';
          } else {
            ctx.font = '11px "Exo 2", sans-serif';
            ctx.fillStyle = '#b09555';
          }
          ctx.fillText(line, w / 2, ly);
        }
      });
      ctx.globalAlpha = 1;

      // ── ANIMATED FIGHTERS ──
      const fightP = Math.max(0, (p - 0.35) / 0.65); // start after parchment partially unrolled
      if (fightP > 0) {
        const fAlpha = Math.min(fightP * 1.5, 0.7);
        ctx.globalAlpha = fAlpha;
        ctx.strokeStyle = '#8a7040';
        ctx.lineWidth = 2;

        // Animate fighters
        const f1 = fighters[0], f2 = fighters[1];
        const swing = Math.sin(t * 3) * 0.8;
        const lunge = Math.sin(t * 2) * 8;

        drawWarrior(ctx, f1.x + lunge, f1.y, 1, swing, t, w, h);
        drawWarrior(ctx, f2.x - lunge, f2.y, -1, -swing + 0.5, t + 1, w, h);

        // Sword clash sparks
        if (Math.abs(swing) > 0.6) {
          ctx.fillStyle = '#FFD600';
          const sparkX = w / 2, sparkY = h * 0.42;
          for (let s = 0; s < 4; s++) {
            const sx = sparkX + (Math.random() - 0.5) * 20;
            const sy = sparkY + (Math.random() - 0.5) * 15;
            ctx.beginPath();
            ctx.arc(sx, sy, 1 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Extra background warriors (smaller, further back)
        ctx.globalAlpha = fAlpha * 0.3;
        ctx.lineWidth = 1;
        drawWarrior(ctx, w*0.15, h*0.68, 1, Math.sin(t*2.5), t+2, w, h, 0.6);
        drawWarrior(ctx, w*0.85, h*0.68, -1, Math.sin(t*2.5+1), t+3, w, h, 0.6);
        drawWarrior(ctx, w*0.22, h*0.75, 1, Math.sin(t*2), t+4, w, h, 0.5);
        drawWarrior(ctx, w*0.78, h*0.75, -1, Math.sin(t*2+2), t+5, w, h, 0.5);

        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(draw);
    }

    function drawWarrior(ctx, x, y, dir, armAngle, time, w, h, scale) {
      const s = scale || 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);

      // Legs (walking animation)
      const legSwing = Math.sin(time * 4) * 12;
      ctx.beginPath();
      ctx.moveTo(0, 10); ctx.lineTo(-legSwing * dir, 35);
      ctx.moveTo(0, 10); ctx.lineTo(legSwing * dir, 35);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(0, -15); ctx.lineTo(0, 10);
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(0, -22, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Shield arm
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-14 * dir, 0);
      ctx.lineTo(-16 * dir, -8);
      ctx.lineTo(-10 * dir, -14);
      ctx.closePath();
      ctx.stroke();

      // Sword arm (animated swing)
      const swordAngle = armAngle + Math.PI * 0.3 * dir;
      const elbowX = 12 * dir;
      const elbowY = -10;
      const swordTipX = elbowX + Math.cos(swordAngle) * 30 * dir;
      const swordTipY = elbowY + Math.sin(swordAngle) * 30;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(swordTipX, swordTipY);
      ctx.stroke();

      // Sword crossguard
      const midX = (elbowX + swordTipX) * 0.4;
      const midY = (elbowY + swordTipY) * 0.4;
      ctx.beginPath();
      ctx.moveTo(midX - 4, midY - 3);
      ctx.lineTo(midX + 4, midY + 3);
      ctx.stroke();

      ctx.restore();
    }

    draw();
  }

  /* ════════════════════════════════════════════
     ROOOM — Giant disco ball + big colorful balloons
     ════════════════════════════════════════════ */
  function initRooom() {
    const cv = document.getElementById('cv-rooom'); if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);

    const balloons = [];
    const bColors = ['#ff4d6d','#4dc9f6','#f7e733','#c77dff','#51cf66','#ff8c42','#f06595','#63e6be'];
    for (let i = 0; i < 16; i++) {
      balloons.push({
        x: w * 0.1 + Math.random() * w * 0.8,
        y: h + 30 + Math.random() * h * 0.5,
        r: 18 + Math.random() * 22,
        color: bColors[Math.floor(Math.random() * bColors.length)],
        speed: 1.2 + Math.random() * 2,
        wobble: Math.random() * Math.PI * 2,
        wobbleAmp: 6 + Math.random() * 10,
        wobbleSpd: 0.015 + Math.random() * 0.02
      });
    }

    // Disco reflections
    const refs = [];
    for (let i = 0; i < 40; i++) {
      refs.push({
        angle: Math.random() * Math.PI * 2,
        dist: 40 + Math.random() * Math.max(w, h) * 0.5,
        size: 3 + Math.random() * 8,
        speed: 0.3 + Math.random() * 0.8,
        color: bColors[Math.floor(Math.random() * bColors.length)]
      });
    }

    let t = 0;
    const ballCX = w / 2, ballCY = h * 0.22, ballR = Math.min(w, h) * 0.16;

    function draw() {
      const s = PS.rooom;
      if (s.triggered && s.progress < 1) s.progress = Math.min(1, s.progress + 0.008);
      const p = s.progress;
      t += 0.015;

      ctx.clearRect(0, 0, w, h);
      if (p < 0.001) { requestAnimationFrame(draw); return; }

      // ── LIGHT BEAMS from disco ball ──
      ctx.globalAlpha = p * 0.06;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + t * 0.3;
        ctx.fillStyle = refs[i % refs.length].color;
        ctx.beginPath();
        ctx.moveTo(ballCX, ballCY);
        ctx.lineTo(ballCX + Math.cos(a) * w, ballCY + Math.sin(a) * h);
        ctx.lineTo(ballCX + Math.cos(a + 0.08) * w, ballCY + Math.sin(a + 0.08) * h);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── REFLECTIONS on walls / floor ──
      refs.forEach(r => {
        r.angle += r.speed * 0.008;
        const rx = ballCX + Math.cos(r.angle) * r.dist;
        const ry = ballCY + Math.abs(Math.sin(r.angle * 0.7)) * r.dist;
        const flicker = 0.3 + Math.sin(t * 3 + r.angle * 2) * 0.2;
        ctx.globalAlpha = flicker * p;
        ctx.fillStyle = r.color;
        ctx.fillRect(rx - r.size/2, ry - r.size/2, r.size, r.size);
      });
      ctx.globalAlpha = 1;

      // ── STRING ──
      ctx.strokeStyle = `rgba(150,150,150,${0.4*p})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ballCX, 0); ctx.lineTo(ballCX, ballCY - ballR * p); ctx.stroke();

      // ── DISCO BALL — large, reflective ──
      const bR = ballR * p;
      if (bR > 2) {
        // Main sphere gradient
        const bGrad = ctx.createRadialGradient(ballCX - bR*0.3, ballCY - bR*0.3, bR*0.1, ballCX, ballCY, bR);
        bGrad.addColorStop(0, `rgba(240,240,250,${0.95*p})`);
        bGrad.addColorStop(0.4, `rgba(180,180,200,${0.8*p})`);
        bGrad.addColorStop(0.8, `rgba(110,110,130,${0.7*p})`);
        bGrad.addColorStop(1, `rgba(60,60,75,${0.6*p})`);
        ctx.fillStyle = bGrad;
        ctx.beginPath(); ctx.arc(ballCX, ballCY, bR, 0, Math.PI * 2); ctx.fill();

        // Mirror facets grid — rotating
        const facetRows = 8, facetCols = 12;
        for (let row = 0; row < facetRows; row++) {
          const phi = (row / facetRows) * Math.PI;
          const rr = Math.sin(phi) * bR;
          const yy = ballCY - Math.cos(phi) * bR;
          for (let col = 0; col < facetCols; col++) {
            const theta = (col / facetCols) * Math.PI * 2 + t * 0.5;
            const xx = ballCX + Math.cos(theta) * rr;
            // Only draw front-facing facets
            if (Math.cos(theta) > -0.2 || Math.sin(phi) > 0.5) {
              const brightness = (Math.cos(theta) + 1) * 0.5 * (Math.sin(phi));
              const flick = 0.3 + Math.sin(theta * 3 + t * 4 + row) * 0.3;
              ctx.fillStyle = `rgba(255,255,255,${(brightness * 0.4 + flick * 0.2) * p})`;
              const fSize = bR * 0.09;
              ctx.fillRect(xx - fSize, yy - fSize * 0.7, fSize * 2, fSize * 1.4);
            }
          }
        }

        // Specular highlight
        const specGrad = ctx.createRadialGradient(ballCX - bR*0.25, ballCY - bR*0.3, 0, ballCX - bR*0.25, ballCY - bR*0.3, bR*0.5);
        specGrad.addColorStop(0, `rgba(255,255,255,${0.5*p})`);
        specGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = specGrad;
        ctx.beginPath(); ctx.arc(ballCX, ballCY, bR, 0, Math.PI * 2); ctx.fill();
      }

      // ── BALLOONS — big, fast ──
      balloons.forEach(b => {
        b.wobble += b.wobbleSpd;
        if (p > 0.05) {
          b.y -= b.speed * p;
          if (b.y < -b.r * 2 - 30) { b.y = h + 30 + Math.random() * 40; b.x = w * 0.1 + Math.random() * w * 0.8; }
        }
        const bx = b.x + Math.sin(b.wobble) * b.wobbleAmp;
        const by = b.y;
        const br = b.r * Math.min(p * 2, 1);

        if (by < h + br) {
          // Balloon body
          const bGr = ctx.createRadialGradient(bx - br*0.3, by - br*0.3, br*0.1, bx, by, br);
          bGr.addColorStop(0, b.color + 'ee');
          bGr.addColorStop(0.7, b.color + 'cc');
          bGr.addColorStop(1, b.color + '66');
          ctx.fillStyle = bGr;
          ctx.globalAlpha = Math.min(p * 1.5, 0.85);
          ctx.beginPath();
          ctx.ellipse(bx, by, br * 0.85, br, 0, 0, Math.PI * 2);
          ctx.fill();

          // Highlight
          ctx.fillStyle = `rgba(255,255,255,${0.35 * p})`;
          ctx.beginPath();
          ctx.ellipse(bx - br*0.25, by - br*0.35, br*0.2, br*0.3, -0.3, 0, Math.PI * 2);
          ctx.fill();

          // Knot + string
          ctx.globalAlpha = 0.5 * p;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.moveTo(bx - 3, by + br); ctx.lineTo(bx + 3, by + br); ctx.lineTo(bx, by + br + 6); ctx.fill();

          ctx.strokeStyle = `rgba(180,180,180,${0.35*p})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(bx, by + br + 6);
          ctx.quadraticCurveTo(bx + Math.sin(b.wobble) * 6, by + br + 25, bx - 3, by + br + 45);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ════════════════════════════════════════════
     WORMHOLE — Dense slow spiral vortex, deep space
     ════════════════════════════════════════════ */
  function initWormhole() {
    const cv = document.getElementById('cv-wormhole'); if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);
    const cx = w/2, cy = h/2;

    // Dense particle field
    const particles = [];
    for (let i = 0; i < 300; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 5 + Math.random() * Math.max(w, h) * 0.6,
        speed: 0.003 + Math.random() * 0.008,
        size: 0.5 + Math.random() * 2,
        pull: 0.05 + Math.random() * 0.15,
        origDist: 0
      });
      particles[i].origDist = particles[i].dist;
    }

    // Background stars
    const stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({ x: Math.random()*w, y: Math.random()*h, s: 0.5+Math.random()*1.5, b: Math.random() });
    }

    let t = 0;

    function draw() {
      const s = PS.wormhole;
      if (s.triggered && s.progress < 1) s.progress = Math.min(1, s.progress + 0.005);
      const p = s.progress;
      t += 0.005;

      // Deep fade trail
      ctx.fillStyle = `rgba(0,0,3,${0.06 + 0.03 * p})`;
      ctx.fillRect(0, 0, w, h);

      if (p < 0.001) { requestAnimationFrame(draw); return; }

      // Background stars
      ctx.globalAlpha = p * 0.4;
      stars.forEach(st => {
        st.b += 0.005;
        ctx.fillStyle = `rgba(200,200,255,${(0.3 + Math.sin(st.b)*0.3)})`;
        ctx.fillRect(st.x, st.y, st.s, st.s);
      });

      // Spiral rings (many, dense)
      for (let r = 0; r < 14; r++) {
        const radius = (8 + r * (Math.min(w,h)*0.04)) * p;
        const alpha = (0.08 - r * 0.004) * p;
        if (alpha > 0) {
          ctx.strokeStyle = `rgba(255, 214, 0, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // Spiral arms
      ctx.globalAlpha = p * 0.15;
      for (let arm = 0; arm < 4; arm++) {
        ctx.strokeStyle = `rgba(255, 214, 0, 0.5)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 80; i++) {
          const a = (arm / 4) * Math.PI * 2 + t + i * 0.08;
          const r = i * (Math.min(w,h)*0.004) * p;
          const sx = cx + Math.cos(a) * r;
          const sy = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Particles spiraling inward — slow, dense
      particles.forEach(pt => {
        pt.angle += pt.speed * (1 + p);
        pt.dist -= pt.pull * p * 0.3;
        if (pt.dist < 2) { pt.dist = pt.origDist; pt.angle = Math.random() * Math.PI * 2; }

        const px = cx + Math.cos(pt.angle) * pt.dist;
        const py = cy + Math.sin(pt.angle) * pt.dist;
        const alpha = Math.min(1, pt.dist / 30) * 0.6 * p;
        const hue = (pt.dist / Math.max(w,h)) * 40 + 40; // warm yellow to golden
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pt.size * p, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50 * p);
      glow.addColorStop(0, `rgba(255,214,0,${0.2*p})`);
      glow.addColorStop(0.5, `rgba(255,214,0,${0.05*p})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ════════════════════════════════════════════
     DRAGON12 — Thick Chinese dragon flying across fast like an arrow
     Only partial body visible, fills the frame
     ════════════════════════════════════════════ */
  function initDragon() {
    const cv = document.getElementById('cv-dragon'); if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);
    let t = 0;
    let dragonX = -w * 0.5;
    const SEGS = 60;
    const segSpacing = 8;
    const bodyWidth = Math.min(w, h) * 0.14;

    function draw() {
      const s = PS.dragon;
      if (s.triggered && s.progress < 1) s.progress = Math.min(1, s.progress + 0.008);
      const p = s.progress;
      t += 0.04;

      ctx.clearRect(0, 0, w, h);
      if (p < 0.001) { requestAnimationFrame(draw); return; }

      // Dragon moves RIGHT across frame like an arrow — speed controlled
      dragonX += 2.5 * p;
      if (dragonX > w + w * 0.6) dragonX = -w * 0.5;

      const headX = dragonX;
      const headY = h * 0.48;

      // Build body segments
      const pts = [];
      for (let i = 0; i < SEGS; i++) {
        const sx = headX - i * segSpacing;
        const wave = Math.sin(t * 3 - i * 0.2) * (15 + i * 0.8);
        const sy = headY + wave;
        const thickness = bodyWidth * (1 - (i / SEGS) * 0.7) * Math.min(p * 2, 1);
        pts.push({ x: sx, y: sy, th: thickness });
      }

      // ── BODY ── thick, scaled, green
      for (let i = pts.length - 1; i > 0; i--) {
        const seg = pts[i], next = pts[i-1];
        const ratio = 1 - i / SEGS;
        const g1 = Math.floor(80 + ratio * 120);
        const g2 = Math.floor(160 + ratio * 80);

        // Body fill (thick tube)
        const grad = ctx.createLinearGradient(seg.x, seg.y - seg.th, seg.x, seg.y + seg.th);
        grad.addColorStop(0, `rgba(${g1*0.3|0}, ${g1}, ${g1*0.2|0}, ${0.6*p})`);
        grad.addColorStop(0.5, `rgba(${g2*0.3|0}, ${g2}, ${g2*0.2|0}, ${0.85*p})`);
        grad.addColorStop(1, `rgba(${g1*0.3|0}, ${g1}, ${g1*0.15|0}, ${0.5*p})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y - seg.th/2);
        ctx.lineTo(next.x, next.y - next.th/2);
        ctx.lineTo(next.x, next.y + next.th/2);
        ctx.lineTo(seg.x, seg.y + seg.th/2);
        ctx.fill();

        // Scales (diamond pattern on body)
        if (i % 3 === 0 && seg.th > 4) {
          ctx.fillStyle = `rgba(255, 230, 100, ${0.12 * p})`;
          const scS = seg.th * 0.4;
          ctx.beginPath();
          ctx.moveTo(seg.x, seg.y - scS);
          ctx.lineTo(seg.x + scS*0.6, seg.y);
          ctx.lineTo(seg.x, seg.y + scS);
          ctx.lineTo(seg.x - scS*0.6, seg.y);
          ctx.closePath();
          ctx.fill();
        }
      }

      // ── BELLY RIDGE ──
      ctx.strokeStyle = `rgba(200, 180, 60, ${0.2 * p})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const by = pt.y + pt.th * 0.3;
        if (i === 0) ctx.moveTo(pt.x, by); else ctx.lineTo(pt.x, by);
      });
      ctx.stroke();

      // ── SPINES along top ──
      ctx.strokeStyle = `rgba(100, 200, 50, ${0.35 * p})`;
      ctx.lineWidth = 1.5;
      for (let i = 2; i < pts.length - 2; i += 3) {
        const pt = pts[i];
        const spineH = pt.th * 0.5;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y - pt.th/2);
        ctx.lineTo(pt.x - 3, pt.y - pt.th/2 - spineH);
        ctx.stroke();
      }

      // ── HEAD ── (large, prominent)
      if (pts.length > 1) {
        const hp = pts[0], hp2 = pts[1];
        const hW = bodyWidth * 0.7 * Math.min(p*2,1);
        const hH = bodyWidth * 0.5 * Math.min(p*2,1);

        // Head shape
        const hGrad = ctx.createRadialGradient(hp.x + hW*0.3, hp.y, hW*0.2, hp.x, hp.y, hW);
        hGrad.addColorStop(0, `rgba(60, 200, 60, ${0.9*p})`);
        hGrad.addColorStop(1, `rgba(30, 120, 30, ${0.7*p})`);
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.ellipse(hp.x + hW * 0.4, hp.y, hW, hH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.strokeStyle = `rgba(180, 160, 60, ${0.6*p})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(hp.x + hW*0.1, hp.y - hH*0.7);
        ctx.quadraticCurveTo(hp.x - hW*0.3, hp.y - hH*2, hp.x - hW*0.5, hp.y - hH*1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hp.x + hW*0.3, hp.y - hH*0.6);
        ctx.quadraticCurveTo(hp.x, hp.y - hH*1.8, hp.x - hW*0.2, hp.y - hH*1.3);
        ctx.stroke();

        // Eyes — fierce, golden
        ctx.fillStyle = `rgba(255, 214, 0, ${p})`;
        ctx.shadowColor = 'rgba(255, 214, 0, 0.6)';
        ctx.shadowBlur = 8 * p;
        ctx.beginPath();
        ctx.ellipse(hp.x + hW*0.6, hp.y - hH*0.25, 5*p, 3.5*p, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = `rgba(0, 0, 0, ${0.9*p})`;
        ctx.beginPath();
        ctx.ellipse(hp.x + hW*0.62, hp.y - hH*0.25, 2*p, 3*p, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Nostrils — smoke
        for (let s = 0; s < 3; s++) {
          const smX = hp.x + hW * 1.2 + s * 8 + Math.sin(t * 2 + s) * 4;
          const smY = hp.y - 2 + Math.sin(t * 3 + s * 2) * 3 - s * 5;
          ctx.globalAlpha = (0.15 - s * 0.04) * p;
          ctx.fillStyle = '#888';
          ctx.beginPath();
          ctx.arc(smX, smY, 3 + s * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Whiskers
        ctx.strokeStyle = `rgba(220, 200, 100, ${0.5*p})`;
        ctx.lineWidth = 1.5;
        for (let wh = 0; wh < 2; wh++) {
          const wy = hp.y + (wh === 0 ? -hH*0.15 : hH*0.15);
          ctx.beginPath();
          ctx.moveTo(hp.x + hW * 1.1, wy);
          ctx.bezierCurveTo(
            hp.x + hW*1.5, wy - 15 + Math.sin(t*2+wh)*8,
            hp.x + hW*2, wy + 5 + Math.sin(t*2.5+wh)*10,
            hp.x + hW*2.5, wy - 5 + Math.sin(t*3+wh)*12
          );
          ctx.stroke();
        }
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ════════════════════════════════════════════
     STORE — Side-view corridor, racks on walls, items center
     ════════════════════════════════════════════ */
  function initStore() {
    const cv = document.getElementById('cv-store'); if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);
    let t = 0;

    // Rack items
    const leftRack = [], rightRack = [];
    for (let i = 0; i < 5; i++) {
      leftRack.push({ y: h*0.15 + i * (h*0.13), swing: Math.random() * Math.PI, type: 'shirt', color: ['#ddd','#aab','#c9b','#bca','#edc'][i] });
      rightRack.push({ y: h*0.15 + i * (h*0.13), swing: Math.random() * Math.PI, type: 'pants', color: ['#778','#665','#887','#998','#776'][i] });
    }

    // Center display items
    const centerItems = [
      { emoji: '🧢', x: 0.35, y: 0.42, delay: 0 },
      { emoji: '👜', x: 0.55, y: 0.40, delay: 0.1 },
      { emoji: '🧦', x: 0.45, y: 0.55, delay: 0.15 },
      { emoji: '📦', x: 0.38, y: 0.68, delay: 0.2 },
      { emoji: '🎽', x: 0.58, y: 0.65, delay: 0.25 },
      { emoji: '🕶️', x: 0.48, y: 0.78, delay: 0.3 },
    ];

    function draw() {
      const s = PS.store;
      if (s.triggered && s.progress < 1) s.progress = Math.min(1, s.progress + 0.007);
      const p = s.progress;
      t += 0.015;

      ctx.clearRect(0, 0, w, h);
      if (p < 0.001) { requestAnimationFrame(draw); return; }

      // ── CORRIDOR PERSPECTIVE ──
      // Floor
      const floorGrad = ctx.createLinearGradient(0, h * 0.85, 0, h);
      floorGrad.addColorStop(0, `rgba(25, 22, 18, ${0.8*p})`);
      floorGrad.addColorStop(1, `rgba(15, 13, 10, ${0.9*p})`);
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.85, w, h * 0.15);

      // Floor line
      ctx.strokeStyle = `rgba(60, 50, 35, ${0.4*p})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h*0.85); ctx.lineTo(w, h*0.85); ctx.stroke();

      // ── LEFT WALL RACK ──
      const rackX_L = w * 0.08;
      ctx.strokeStyle = `rgba(80, 70, 50, ${0.5*p})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rackX_L, h*0.08); ctx.lineTo(rackX_L, h*0.82); ctx.stroke();
      // Horizontal rack bar
      ctx.beginPath(); ctx.moveTo(rackX_L - 5, h*0.1); ctx.lineTo(rackX_L + 35, h*0.1); ctx.stroke();

      leftRack.forEach((item, i) => {
        const swing = Math.sin(t + item.swing) * 2 * p;
        const ix = rackX_L + 15 + swing;
        const iy = item.y;
        const fadeIn = Math.min(1, (p - i * 0.08) * 4);
        if (fadeIn > 0) {
          ctx.globalAlpha = fadeIn;
          drawHanger(ctx, ix, iy - 8, item.color, 'shirt', p);
        }
      });
      ctx.globalAlpha = 1;

      // ── RIGHT WALL RACK ──
      const rackX_R = w * 0.92;
      ctx.strokeStyle = `rgba(80, 70, 50, ${0.5*p})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rackX_R, h*0.08); ctx.lineTo(rackX_R, h*0.82); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rackX_R + 5, h*0.1); ctx.lineTo(rackX_R - 35, h*0.1); ctx.stroke();

      rightRack.forEach((item, i) => {
        const swing = Math.sin(t + item.swing) * 2 * p;
        const ix = rackX_R - 15 + swing;
        const iy = item.y;
        const fadeIn = Math.min(1, (p - i * 0.08) * 4);
        if (fadeIn > 0) {
          ctx.globalAlpha = fadeIn;
          drawHanger(ctx, ix, iy - 8, item.color, 'pants', p);
        }
      });
      ctx.globalAlpha = 1;

      // ── CENTER DISPLAY TABLE ──
      ctx.fillStyle = `rgba(35, 30, 22, ${0.7*p})`;
      ctx.fillRect(w*0.28, h*0.36, w*0.4, 3);

      // Center items
      centerItems.forEach(item => {
        const ip = Math.max(0, Math.min(1, (p - item.delay) / 0.4));
        if (ip > 0) {
          ctx.globalAlpha = ip;
          const bobY = Math.sin(t * 1.5 + item.delay * 10) * 3;
          ctx.font = `${Math.floor(22 * ip)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(item.emoji, w * item.x, h * item.y + bobY);
        }
      });

      // Ceiling light (warm spot)
      const cGlow = ctx.createRadialGradient(w/2, 0, 0, w/2, 0, h*0.5);
      cGlow.addColorStop(0, `rgba(255, 220, 150, ${0.04*p})`);
      cGlow.addColorStop(1, 'transparent');
      ctx.globalAlpha = p;
      ctx.fillStyle = cGlow;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      requestAnimationFrame(draw);
    }

    function drawHanger(ctx, x, y, color, type, p) {
      // Hook
      ctx.strokeStyle = `rgba(150, 130, 100, ${0.6*p})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y - 3, 4, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x, y + 6); ctx.stroke();

      // Hanger triangle
      ctx.beginPath();
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x - 16, y + 14);
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x + 16, y + 14);
      ctx.stroke();

      if (type === 'shirt') {
        ctx.fillStyle = color;
        ctx.globalAlpha *= 0.7;
        ctx.beginPath();
        ctx.moveTo(x - 16, y + 14);
        ctx.lineTo(x + 16, y + 14);
        ctx.lineTo(x + 14, y + 45);
        ctx.lineTo(x - 14, y + 45);
        ctx.closePath();
        ctx.fill();
        // Sleeves
        ctx.beginPath();
        ctx.moveTo(x - 16, y + 14); ctx.lineTo(x - 24, y + 28);
        ctx.lineTo(x - 18, y + 28); ctx.lineTo(x - 13, y + 18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 14); ctx.lineTo(x + 24, y + 28);
        ctx.lineTo(x + 18, y + 28); ctx.lineTo(x + 13, y + 18);
        ctx.fill();
      } else {
        ctx.fillStyle = color;
        ctx.globalAlpha *= 0.7;
        // Pants on hanger
        ctx.beginPath();
        ctx.moveTo(x - 14, y + 14);
        ctx.lineTo(x + 14, y + 14);
        ctx.lineTo(x + 12, y + 22);
        ctx.lineTo(x + 10, y + 50);
        ctx.lineTo(x + 2, y + 50);
        ctx.lineTo(x, y + 28);
        ctx.lineTo(x - 2, y + 50);
        ctx.lineTo(x - 10, y + 50);
        ctx.lineTo(x - 12, y + 22);
        ctx.closePath();
        ctx.fill();
      }
    }

    draw();
  }

  /* ════════════════════════════════════════════
     36912 AI — Slow matrix rain, readable numbers
     ════════════════════════════════════════════ */
  function initAI() {
    const cv = document.getElementById('cv-ai'); if (!cv) return;
    const { ctx, w, h } = setupCanvas(cv);

    const chars = '369121236912123691212369';
    const colW = 22;
    const cols = Math.floor(w / colW);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -20);
    const speeds = new Array(cols).fill(0).map(() => 0.15 + Math.random() * 0.25); // SLOW

    function draw() {
      const s = PS.ai;
      if (s.triggered && s.progress < 1) s.progress = Math.min(1, s.progress + 0.008);
      const p = s.progress;

      // Slow fade trail
      ctx.fillStyle = `rgba(0,0,0,${0.04 + 0.02 * p})`;
      ctx.fillRect(0, 0, w, h);

      if (p < 0.001) { requestAnimationFrame(draw); return; }

      ctx.font = '15px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';

      for (let i = 0; i < cols; i++) {
        const x = i * colW + colW / 2;
        const y = drops[i] * 20;

        // Lead character — bright yellow, glowing
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.shadowColor = 'rgba(255, 214, 0, 0.6)';
        ctx.shadowBlur = 10 * p;
        ctx.fillStyle = `rgba(255, 214, 0, ${0.95 * p})`;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        // Trail — 8 characters, fading
        for (let tr = 1; tr < 8; tr++) {
          const alpha = (0.5 - tr * 0.06) * p;
          if (alpha > 0) {
            ctx.fillStyle = `rgba(255, 214, 0, ${alpha})`;
            const tc = chars[(Math.floor(y / 20) + tr + i) % chars.length];
            ctx.fillText(tc, x, y - tr * 20);
          }
        }

        drops[i] += speeds[i] * p;
        if (y > h + 100) drops[i] = Math.random() * -15;
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ═══ INIT ALL ═══ */
  requestAnimationFrame(() => {
    initSurvivors();
    initRooom();
    initWormhole();
    initDragon();
    initStore();
    initAI();
  });

  /* ═══ RESIZE ═══ */
  let rT;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => { initSurvivors(); initRooom(); initWormhole(); initDragon(); initStore(); initAI(); }, 300);
  });

})();
