/* ============================================
   12⋮12am™ — CINEMATIC ENGINE v3
   GSAP ScrollTrigger + Three.js
   ============================================ */
(function(){
'use strict';

const homeEl = document.getElementById('pg-home');
if(!homeEl) return;

/* ═══════════════════════════════════════
   1. GSAP SCROLL TRIGGER SETUP
   ═══════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

// Use home page as scroller (it's position:fixed with overflow-y:auto)
ScrollTrigger.scrollerProxy(homeEl, {
  scrollTop(v) { if(arguments.length) homeEl.scrollTop = v; return homeEl.scrollTop; },
  getBoundingClientRect() { return { top:0, left:0, width:window.innerWidth, height:window.innerHeight }; }
});
homeEl.addEventListener('scroll', () => ScrollTrigger.update());
ScrollTrigger.defaults({ scroller: homeEl });

/* ── Cinematic text reveals ── */
document.querySelectorAll('.cin__line').forEach((line, i) => {
  gsap.fromTo(line,
    { opacity: 0, y: 40, filter: 'blur(8px)' },
    {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: line, start: 'top 85%', end: 'top 50%', toggleActions: 'play none none none' }
    }
  );
});

/* ── Noise canvas intensity on scroll ── */
const noiseCv = document.getElementById('noise-canvas');
if(noiseCv){
  const nCtx = noiseCv.getContext('2d');
  function resizeN(){ noiseCv.width = noiseCv.offsetWidth/3; noiseCv.height = noiseCv.offsetHeight/3; }
  resizeN(); window.addEventListener('resize', resizeN);
  let noiseInt = { v: 0.07 };
  // Increase noise intensity as you scroll through curse section
  gsap.to(noiseInt, {
    v: 0.25,
    scrollTrigger: { trigger:'#cin-curse', start:'top top', end:'bottom top', scrub:true },
    onUpdate:()=>{ noiseCv.style.opacity = noiseInt.v; }
  });
  (function drawN(){ const w=noiseCv.width,h=noiseCv.height,img=nCtx.createImageData(w,h),d=img.data;
    for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=40;}
    nCtx.putImageData(img,0,0);requestAnimationFrame(drawN);})();
}

/* ── L1 breathing rings — GSAP powered ── */
gsap.to('.l1-ring--1',{scale:1.1,opacity:0.8,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut'});
gsap.to('.l1-ring--2',{scale:1.08,opacity:0.9,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut',delay:0.8});
gsap.to('.l1-ring--3',{scale:1.06,opacity:1,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut',delay:1.6});
gsap.to('.l1-core',{scale:1.8,boxShadow:'0 0 40px rgba(255,214,0,0.5), 0 0 100px rgba(255,214,0,0.2)',duration:2,repeat:-1,yoyo:true,ease:'sine.inOut'});

/* ── CTA reveal ── */
gsap.fromTo('#section-cta .cta-block',{opacity:0,y:40},{opacity:1,y:0,duration:1,ease:'power2.out',
  scrollTrigger:{trigger:'#section-cta',start:'top 80%'}
});

/* ═══════════════════════════════════════
   2. THREE.JS PANEL SCENES
   ═══════════════════════════════════════ */

const PS = {};
document.querySelectorAll('.eco-panel').forEach(panel => {
  const id = panel.dataset.panel;
  PS[id] = { triggered: false };
  function trigger(){
    if(!PS[id].triggered){
      PS[id].triggered = true;
      panel.classList.add('is-active');
    }
  }
  panel.addEventListener('mouseenter', trigger);
  panel.addEventListener('touchstart', trigger, {passive:true});
});

// ── Helper: create a Three scene inside a container ──
function createScene(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return null;
  const w = el.offsetWidth || 300, h = el.offsetHeight || 300;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.appendChild(renderer.domElement);
  return { scene, camera, renderer, el, w, h };
}

/* ════════════════════════════════════════
   WORMHOLE — 3D particle vortex in deep space
   ════════════════════════════════════════ */
function initWormhole() {
  const s = createScene('scene-wormhole'); if(!s) return;
  const {scene, camera, renderer} = s;
  camera.position.z = 5;
  scene.fog = new THREE.FogExp2(0x000005, 0.06);

  // Spiral particles
  const count = 4000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const vel = new Float32Array(count); // pull speed

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.5 + Math.random() * 8;
    pos[i*3] = Math.cos(angle) * dist;
    pos[i*3+1] = Math.sin(angle) * dist;
    pos[i*3+2] = (Math.random() - 0.5) * 10;
    const bright = 0.3 + Math.random() * 0.7;
    col[i*3] = bright;
    col[i*3+1] = bright * 0.84;
    col[i*3+2] = 0;
    vel[i] = 0.002 + Math.random() * 0.006;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  // Central glow
  const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xFFD600, transparent: true, opacity: 0.15 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glow);

  // Ring outlines
  for (let r = 0; r < 6; r++) {
    const ringGeo = new THREE.RingGeometry(0.8 + r * 0.6, 0.82 + r * 0.6, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFFD600, transparent: true, opacity: 0.04, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);
  }

  (function animate(){
    requestAnimationFrame(animate);
    if(!PS.wormhole.triggered) { renderer.render(scene, camera); return; }

    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      let x = p[i*3], y = p[i*3+1], z = p[i*3+2];
      const dist = Math.sqrt(x*x + y*y);
      const angle = Math.atan2(y, x) + vel[i] * 1.5;
      const newDist = dist - vel[i] * 0.4;
      if (newDist < 0.1) {
        const a = Math.random() * Math.PI * 2;
        const d = 4 + Math.random() * 5;
        p[i*3] = Math.cos(a) * d;
        p[i*3+1] = Math.sin(a) * d;
        p[i*3+2] = (Math.random() - 0.5) * 10;
      } else {
        p[i*3] = Math.cos(angle) * newDist;
        p[i*3+1] = Math.sin(angle) * newDist;
        p[i*3+2] += (Math.random()-0.5) * 0.01;
      }
    }
    geo.attributes.position.needsUpdate = true;
    glow.scale.setScalar(1 + Math.sin(Date.now()*0.001) * 0.2);
    renderer.render(scene, camera);
  })();
}

/* ════════════════════════════════════════
   ROOOM — 3D Disco ball + floating balloons
   ════════════════════════════════════════ */
function initRooom() {
  const s = createScene('scene-rooom'); if(!s) return;
  const {scene, camera, renderer} = s;
  camera.position.set(0, 0.5, 5);
  camera.lookAt(0, 0, 0);

  // Disco ball — icosahedron with reflective facets
  const ballGeo = new THREE.IcosahedronGeometry(0.8, 2);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xccccdd, metalness: 1, roughness: 0.1, flatShading: true
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(0, 1.8, 0);
  scene.add(ball);

  // String
  const strGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.5, 4);
  const strMat = new THREE.MeshBasicMaterial({color: 0x666666});
  const str = new THREE.Mesh(strGeo, strMat);
  str.position.set(0, 3.3, 0);
  scene.add(str);

  // Lights — multiple colored point lights spinning
  const lightColors = [0xff4d6d, 0x4dc9f6, 0xf7e733, 0xc77dff, 0x51cf66, 0xff8c42];
  const spotLights = [];
  lightColors.forEach((c, i) => {
    const light = new THREE.PointLight(c, 2, 12);
    const a = (i / lightColors.length) * Math.PI * 2;
    light.position.set(Math.cos(a)*3, 1 + Math.sin(a)*1.5, Math.sin(a)*3);
    scene.add(light);
    spotLights.push({ light, angle: a, speed: 0.3 + i * 0.05 });
  });

  const ambLight = new THREE.AmbientLight(0x222222, 0.5);
  scene.add(ambLight);

  // Balloons — 3D spheres rising
  const balloons = [];
  const bColors = [0xff4d6d, 0x4dc9f6, 0xf7e733, 0xc77dff, 0x51cf66, 0xff8c42, 0xf06595, 0x63e6be];
  for (let i = 0; i < 20; i++) {
    const bGeo = new THREE.SphereGeometry(0.15 + Math.random()*0.2, 16, 16);
    const bMat = new THREE.MeshStandardMaterial({
      color: bColors[Math.floor(Math.random()*bColors.length)],
      metalness: 0.1, roughness: 0.3, transparent: true, opacity: 0.85
    });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set((Math.random()-0.5)*5, -3 - Math.random()*3, (Math.random()-0.5)*3);
    scene.add(bMesh);
    balloons.push({
      mesh: bMesh,
      speed: 0.008 + Math.random()*0.015,
      wobbleX: Math.random()*Math.PI*2,
      wobbleZ: Math.random()*Math.PI*2
    });
  }

  (function animate(){
    requestAnimationFrame(animate);
    if(!PS.rooom.triggered) { renderer.render(scene, camera); return; }
    const t = Date.now() * 0.001;

    ball.rotation.y += 0.008;
    ball.rotation.x = Math.sin(t * 0.3) * 0.1;

    spotLights.forEach(sl => {
      sl.angle += sl.speed * 0.01;
      sl.light.position.x = Math.cos(sl.angle) * 3;
      sl.light.position.z = Math.sin(sl.angle) * 3;
      sl.light.position.y = 1 + Math.sin(sl.angle * 1.5) * 1.5;
    });

    balloons.forEach(b => {
      b.mesh.position.y += b.speed;
      b.wobbleX += 0.01;
      b.wobbleZ += 0.008;
      b.mesh.position.x += Math.sin(b.wobbleX) * 0.003;
      b.mesh.position.z += Math.sin(b.wobbleZ) * 0.002;
      if (b.mesh.position.y > 4) {
        b.mesh.position.y = -3;
        b.mesh.position.x = (Math.random()-0.5)*5;
      }
    });

    renderer.render(scene, camera);
  })();
}

/* ════════════════════════════════════════
   DRAGON12 — 3D serpentine dragon body flying through
   ════════════════════════════════════════ */
function initDragon() {
  const s = createScene('scene-dragon'); if(!s) return;
  const {scene, camera, renderer} = s;
  camera.position.set(0, 0, 5);

  const ambL = new THREE.AmbientLight(0x224422, 0.6);
  scene.add(ambL);
  const dirL = new THREE.DirectionalLight(0x88ff44, 1.2);
  dirL.position.set(3, 5, 5);
  scene.add(dirL);
  const ptL = new THREE.PointLight(0xFFD600, 1.5, 10);
  ptL.position.set(2, 0, 3);
  scene.add(ptL);

  // Dragon body — chain of spheres forming a serpent
  const SEGS = 40;
  const segments = [];
  const bodyMat = new THREE.MeshStandardMaterial({color: 0x22aa22, metalness: 0.3, roughness: 0.5});
  const spineMat = new THREE.MeshStandardMaterial({color: 0x44cc22, metalness: 0.2, roughness: 0.6});

  for (let i = 0; i < SEGS; i++) {
    const rad = 0.35 * (1 - (i/SEGS)*0.65);
    const geo = new THREE.SphereGeometry(rad, 12, 10);
    const mesh = new THREE.Mesh(geo, bodyMat);
    scene.add(mesh);

    // Spine ridges on top
    if (i % 2 === 0 && i < SEGS-5) {
      const sGeo = new THREE.ConeGeometry(0.08, 0.25, 4);
      const spine = new THREE.Mesh(sGeo, spineMat);
      mesh.add(spine);
      spine.position.y = rad;
    }
    segments.push(mesh);
  }

  // Head — larger
  const headGeo = new THREE.SphereGeometry(0.45, 16, 12);
  const headMat = new THREE.MeshStandardMaterial({color: 0x33bb33, metalness: 0.3, roughness: 0.4});
  const head = new THREE.Mesh(headGeo, headMat);
  scene.add(head);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({color: 0xFFD600});
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeMat);
  eyeL.position.set(0.2, 0.15, 0.35);
  eyeR.position.set(-0.2, 0.15, 0.35);
  head.add(eyeL);
  head.add(eyeR);

  // Horns
  const hornMat = new THREE.MeshStandardMaterial({color: 0xccaa33, metalness: 0.5, roughness: 0.3});
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 6), hornMat);
  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 6), hornMat);
  hornL.position.set(0.2, 0.35, 0.1); hornL.rotation.z = -0.4;
  hornR.position.set(-0.2, 0.35, 0.1); hornR.rotation.z = 0.4;
  head.add(hornL); head.add(hornR);

  let dragonOffset = -12;

  (function animate(){
    requestAnimationFrame(animate);
    if(!PS.dragon.triggered) { renderer.render(scene, camera); return; }
    const t = Date.now() * 0.001;

    dragonOffset += 0.06;
    if (dragonOffset > 12) dragonOffset = -12;

    const headX = dragonOffset;
    const headY = Math.sin(t * 1.5) * 0.8;
    head.position.set(headX, headY, 0);
    head.rotation.z = Math.sin(t * 1.5) * 0.15;

    for (let i = 0; i < SEGS; i++) {
      const delay = i * 0.12;
      const sx = headX - (i + 1) * 0.28;
      const sy = Math.sin(t * 1.5 - delay) * (0.8 + i * 0.02);
      const sz = Math.sin(t * 1.2 - delay * 0.8) * 0.3;
      segments[i].position.set(sx, sy, sz);
    }

    ptL.position.x = headX + 1;
    ptL.position.y = headY;
    renderer.render(scene, camera);
  })();
}

/* ════════════════════════════════════════
   SURVIVORS — 3D parchment unrolling with floating swords
   ════════════════════════════════════════ */
function initSurvivors() {
  const s = createScene('scene-survivors'); if(!s) return;
  const {scene, camera, renderer} = s;
  camera.position.set(0, 0, 4);

  const ambL = new THREE.AmbientLight(0x443322, 0.8);
  scene.add(ambL);
  const dirL = new THREE.DirectionalLight(0xFFD6AA, 1);
  dirL.position.set(2, 3, 4);
  scene.add(dirL);
  const candleL = new THREE.PointLight(0xFF9933, 1.5, 8);
  candleL.position.set(0, 0, 2);
  scene.add(candleL);

  // Parchment — flat plane that unrolls via scale
  const parchGeo = new THREE.PlaneGeometry(2.5, 3.5, 1, 20);
  const parchMat = new THREE.MeshStandardMaterial({
    color: 0x8B7355, metalness: 0.05, roughness: 0.9, side: THREE.DoubleSide
  });
  const parch = new THREE.Mesh(parchGeo, parchMat);
  parch.scale.y = 0.01;
  scene.add(parch);

  // Scroll rods (top + bottom)
  const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8);
  const rodMat = new THREE.MeshStandardMaterial({color: 0x654321, metalness: 0.3, roughness: 0.6});
  const topRod = new THREE.Mesh(rodGeo, rodMat);
  topRod.rotation.z = Math.PI / 2;
  topRod.position.y = 1.75;
  scene.add(topRod);
  const botRod = new THREE.Mesh(rodGeo.clone(), rodMat);
  botRod.rotation.z = Math.PI / 2;
  botRod.position.y = -1.75;
  scene.add(botRod);

  // Floating swords
  const swords = [];
  for (let i = 0; i < 6; i++) {
    const bladeGeo = new THREE.BoxGeometry(0.03, 0.6, 0.01);
    const bladeMat = new THREE.MeshStandardMaterial({color: 0xaaaacc, metalness: 0.9, roughness: 0.1});
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    const guardGeo = new THREE.BoxGeometry(0.15, 0.03, 0.03);
    const guard = new THREE.Mesh(guardGeo, bladeMat);
    guard.position.y = -0.3;
    blade.add(guard);
    const hiltGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.15, 6);
    const hiltMat = new THREE.MeshStandardMaterial({color: 0x8B4513});
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    hilt.position.y = -0.38;
    blade.add(hilt);

    blade.position.set((Math.random()-0.5)*3.5, (Math.random()-0.5)*3, -0.5 + Math.random()*0.5);
    blade.rotation.z = Math.random() * Math.PI;
    scene.add(blade);
    swords.push({ mesh: blade, rotSpeed: 0.005 + Math.random()*0.01, floatSpeed: 0.5+Math.random(), floatOffset: Math.random()*Math.PI*2 });
  }

  let unroll = { v: 0.01 };

  (function animate(){
    requestAnimationFrame(animate);
    if(!PS.survivors.triggered) { renderer.render(scene, camera); return; }
    const t = Date.now() * 0.001;

    // Unroll parchment
    if (unroll.v < 1) unroll.v = Math.min(1, unroll.v + 0.004);
    parch.scale.y = unroll.v;
    botRod.position.y = -1.75 * unroll.v;

    // Candle flicker
    candleL.intensity = 1.2 + Math.sin(t * 8) * 0.3 + Math.sin(t * 13) * 0.15;

    // Swords float and spin
    swords.forEach(sw => {
      sw.mesh.rotation.z += sw.rotSpeed;
      sw.mesh.position.y += Math.sin(t * sw.floatSpeed + sw.floatOffset) * 0.002;
    });

    renderer.render(scene, camera);
  })();
}

/* ════════════════════════════════════════
   STORE — 3D corridor with clothing racks
   ════════════════════════════════════════ */
function initStore() {
  const s = createScene('scene-store'); if(!s) return;
  const {scene, camera, renderer} = s;
  camera.position.set(0, 0.5, 3);
  camera.lookAt(0, 0.3, -2);

  const ambL = new THREE.AmbientLight(0x332211, 0.5);
  scene.add(ambL);
  // Warm ceiling spot
  const spotL = new THREE.PointLight(0xFFDD99, 2, 10);
  spotL.position.set(0, 3, 0);
  scene.add(spotL);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(6, 8);
  const floorMat = new THREE.MeshStandardMaterial({color: 0x1a1510, roughness: 0.9});
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI/2; floor.position.y = -1;
  scene.add(floor);

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.95});
  const lWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), wallMat);
  lWall.rotation.y = Math.PI/2; lWall.position.set(-2.5, 1, -1);
  scene.add(lWall);
  const rWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), wallMat);
  rWall.rotation.y = -Math.PI/2; rWall.position.set(2.5, 1, -1);
  scene.add(rWall);

  // Clothing racks — left side
  const rackMat = new THREE.MeshStandardMaterial({color: 0x444444, metalness: 0.8, roughness: 0.3});
  const clothColors = [0xdddddd, 0xaabbcc, 0xccbbaa, 0xbbccaa, 0xeeddcc];

  function makeRack(x, z) {
    // Vertical pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2, 6), rackMat);
    pole.position.set(x, 0, z);
    scene.add(pole);
    // Horizontal bar
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), rackMat);
    bar.rotation.z = Math.PI/2;
    bar.position.set(x, 0.8, z);
    scene.add(bar);
    // Hangers with cloth
    for (let i = 0; i < 4; i++) {
      const hx = x - 0.4 + i * 0.25;
      const clothGeo = new THREE.PlaneGeometry(0.2, 0.45);
      const clothMat = new THREE.MeshStandardMaterial({
        color: clothColors[Math.floor(Math.random()*clothColors.length)],
        side: THREE.DoubleSide, roughness: 0.7, transparent: true, opacity: 0.85
      });
      const cloth = new THREE.Mesh(clothGeo, clothMat);
      cloth.position.set(hx, 0.5, z);
      cloth.rotation.y = (Math.random()-0.5)*0.3;
      scene.add(cloth);
    }
  }

  makeRack(-1.8, -1);
  makeRack(-1.8, -2.5);
  makeRack(1.8, -1);
  makeRack(1.8, -2.5);

  // Center display — small table with items
  const tableGeo = new THREE.BoxGeometry(1, 0.05, 0.5);
  const tableMat = new THREE.MeshStandardMaterial({color: 0x2a2015, roughness: 0.8});
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.set(0, -0.3, -0.5);
  scene.add(table);

  // Small boxes on table
  const boxColors = [0xFFD600, 0xdddddd, 0x888888];
  for (let i = 0; i < 5; i++) {
    const bx = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.1),
      new THREE.MeshStandardMaterial({color: boxColors[i%3], roughness: 0.5})
    );
    bx.position.set(-0.3 + i*0.15, -0.22, -0.5 + (Math.random()-0.5)*0.2);
    bx.rotation.y = Math.random();
    scene.add(bx);
  }

  (function animate(){
    requestAnimationFrame(animate);
    if(!PS.store.triggered) { renderer.render(scene, camera); return; }
    const t = Date.now() * 0.001;
    spotL.intensity = 1.8 + Math.sin(t * 2) * 0.2;
    camera.position.x = Math.sin(t * 0.3) * 0.15;
    renderer.render(scene, camera);
  })();
}

/* ════════════════════════════════════════
   36912 AI — 3D Matrix number rain
   ════════════════════════════════════════ */
function initAI() {
  const s = createScene('scene-ai'); if(!s) return;
  const {scene, camera, renderer} = s;
  camera.position.set(0, 0, 5);
  scene.fog = new THREE.FogExp2(0x000000, 0.08);

  const chars = '369121236912';
  const cols = 18, rows = 30;
  const sprites = [];

  // Create a canvas texture for each number
  function makeCharTexture(char) {
    const cv = document.createElement('canvas');
    cv.width = 64; cv.height = 64;
    const c = cv.getContext('2d');
    c.font = 'bold 48px "Share Tech Mono", monospace';
    c.fillStyle = '#FFD600';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(char, 32, 32);
    return new THREE.CanvasTexture(cv);
  }

  for (let col = 0; col < cols; col++) {
    const x = (col - cols/2) * 0.5;
    for (let row = 0; row < rows; row++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const tex = makeCharTexture(char);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.35, 0.35, 1);
      const y = 8 - row * 0.55;
      sprite.position.set(x, y, (Math.random()-0.5)*2);
      scene.add(sprite);
      sprites.push({
        sprite, col, row, mat,
        baseY: y,
        speed: 0.01 + Math.random() * 0.02,
        maxOpacity: col === Math.floor(cols/2) ? 0.9 : 0.15 + Math.random() * 0.5,
        delay: row * 0.05 + col * 0.02
      });
    }
  }

  let elapsed = 0;

  (function animate(){
    requestAnimationFrame(animate);
    if(!PS.ai.triggered) { renderer.render(scene, camera); return; }
    elapsed += 0.016;

    sprites.forEach(sp => {
      sp.sprite.position.y -= sp.speed;
      if (sp.sprite.position.y < -8) {
        sp.sprite.position.y = 8;
        const c = chars[Math.floor(Math.random()*chars.length)];
        sp.mat.map = makeCharTexture(c);
        sp.mat.map.needsUpdate = true;
      }
      // Fade in based on position (bright at top, dim at bottom)
      const normY = (sp.sprite.position.y + 8) / 16;
      sp.mat.opacity = normY * sp.maxOpacity * Math.min(elapsed / (sp.delay + 0.5), 1);
    });

    renderer.render(scene, camera);
  })();
}

/* ═══ INITIALIZE ALL SCENES ═══ */
requestAnimationFrame(() => {
  initWormhole();
  initRooom();
  initDragon();
  initSurvivors();
  initStore();
  initAI();
});

})();
