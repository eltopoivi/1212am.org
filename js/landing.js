/* ============================================
   12⋮12am™ — CINEMATIC ENGINE v5
   GSAP ScrollTrigger + Rooom Balloons (Three.js)
   ============================================ */
(function(){
'use strict';

const homeEl = document.getElementById('pg-home');
if(!homeEl) return;

/* ═══ GSAP SCROLL TRIGGER ═══ */
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.scrollerProxy(homeEl, {
  scrollTop(v){ if(arguments.length) homeEl.scrollTop=v; return homeEl.scrollTop; },
  getBoundingClientRect(){ return {top:0,left:0,width:window.innerWidth,height:window.innerHeight}; }
});
homeEl.addEventListener('scroll', ()=>ScrollTrigger.update());
ScrollTrigger.defaults({scroller:homeEl});

/* ── Cinematic text reveals ── */
document.querySelectorAll('.cin__line').forEach(line=>{
  gsap.fromTo(line,
    {opacity:0, y:40, filter:'blur(8px)'},
    {opacity:1, y:0, filter:'blur(0px)', duration:1.2, ease:'power3.out',
     scrollTrigger:{trigger:line, start:'top 85%', toggleActions:'play none none none'}}
  );
});

/* ── Noise canvas intensity scrub ── */
const noiseCv = document.getElementById('noise-canvas');
if(noiseCv){
  const nCtx = noiseCv.getContext('2d');
  function rN(){ noiseCv.width=noiseCv.offsetWidth/3; noiseCv.height=noiseCv.offsetHeight/3; }
  rN(); window.addEventListener('resize', rN);
  let nI = {v:0.07};
  gsap.to(nI, {v:0.25, scrollTrigger:{trigger:'#cin-curse',start:'top top',end:'bottom top',scrub:true},
    onUpdate:()=>{ noiseCv.style.opacity=nI.v; }});
  (function dN(){
    const w=noiseCv.width, h=noiseCv.height, img=nCtx.createImageData(w,h), d=img.data;
    for(let i=0;i<d.length;i+=4){ const v=Math.random()*255; d[i]=d[i+1]=d[i+2]=v; d[i+3]=40; }
    nCtx.putImageData(img,0,0); requestAnimationFrame(dN);
  })();
}

/* ── L1 breathing rings ── */
gsap.to('.l1-ring--1',{scale:1.1,opacity:0.8,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut'});
gsap.to('.l1-ring--2',{scale:1.08,opacity:0.9,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut',delay:0.8});
gsap.to('.l1-ring--3',{scale:1.06,opacity:1,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut',delay:1.6});
gsap.to('.l1-core',{scale:1.8,duration:2,repeat:-1,yoyo:true,ease:'sine.inOut'});

/* ── CTA reveal ── */
gsap.fromTo('#section-cta .cta-block',{opacity:0,y:40},{opacity:1,y:0,duration:1,ease:'power2.out',
  scrollTrigger:{trigger:'#section-cta',start:'top 80%'}});

/* ═══════════════════════════════════════════
   INFO REVEAL — Character sweep + split animations
   ═══════════════════════════════════════════ */

// Split headline into individual character spans
const headline = document.getElementById('headline-sweep');
if (headline) {
  const text = headline.textContent;
  headline.innerHTML = '';
  const chars = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      const sp = document.createElement('span');
      sp.className = 'char-space';
      sp.innerHTML = '&nbsp;';
      headline.appendChild(sp);
    } else {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i];
      headline.appendChild(span);
      chars.push(span);
    }
  }

  // GSAP ScrollTrigger: sweep light across characters as you scroll
  ScrollTrigger.create({
    trigger: '#info-reveal',
    start: 'top 75%',
    end: 'top 20%',
    scrub: 0.8,
    onUpdate: (self) => {
      const progress = self.progress;
      const litCount = Math.floor(progress * chars.length);
      chars.forEach((ch, i) => {
        if (i < litCount) {
          ch.classList.add('is-lit');
        } else {
          ch.classList.remove('is-lit');
        }
      });
    }
  });
}

// Split section reveals — staggered
document.querySelectorAll('.info-split').forEach((split, i) => {
  gsap.fromTo(split,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 1, ease: 'power2.out',
      scrollTrigger: {
        trigger: split,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
  // Animate the divider dot
  const dot = split.querySelector('.info-split__dot');
  if (dot) {
    gsap.fromTo(dot,
      { scale: 0, opacity: 0 },
      {
        scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)',
        scrollTrigger: { trigger: split, start: 'top 75%', toggleActions: 'play none none none' }
      }
    );
  }
  // Animate the line growing
  const line = split.querySelector('.info-split__line');
  if (line) {
    gsap.fromTo(line,
      { scaleY: 0 },
      {
        scaleY: 1, duration: 0.8, ease: 'power2.out', transformOrigin: 'top center',
        scrollTrigger: { trigger: split, start: 'top 78%', toggleActions: 'play none none none' }
      }
    );
  }
});


/* ═══════════════════════════════════════════
   ROOOM PAGE — Floating balloons background
   Three.js scene, runs when rooom page is active
   ═══════════════════════════════════════════ */

function initRooomBalloons(){
  const container = document.getElementById('rooom-balloons-scene');
  if(!container) return;

  const w = container.offsetWidth || window.innerWidth;
  const h = container.offsetHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Soft ambient light
  scene.add(new THREE.AmbientLight(0x444444, 1));
  // Warm top light
  const topL = new THREE.DirectionalLight(0xffeedd, 0.6);
  topL.position.set(0, 5, 3);
  scene.add(topL);

  // Balloon colors — cheerful, flat
  const colors = [0xff4d6d, 0x4dc9f6, 0xf7e733, 0xc77dff, 0x51cf66, 0xff8c42,
                   0xf06595, 0x63e6be, 0xff6b6b, 0x74c0fc, 0xffd43b, 0xe599f7];

  const balloons = [];
  for(let i=0; i<30; i++){
    const radius = 0.2 + Math.random()*0.35;
    const geo = new THREE.SphereGeometry(radius, 16, 16);
    const mat = new THREE.MeshLambertMaterial({
      color: colors[Math.floor(Math.random()*colors.length)],
      transparent: true,
      opacity: 0.75
    });
    const mesh = new THREE.Mesh(geo, mat);

    const startX = (Math.random()-0.5)*12;
    const startZ = (Math.random()-0.5)*6;
    mesh.position.set(startX, -6 - Math.random()*8, startZ);

    scene.add(mesh);

    // String (thin line below balloon)
    const strGeo = new THREE.CylinderGeometry(0.005, 0.005, radius*4, 3);
    const strMat = new THREE.MeshBasicMaterial({color:0x666666, transparent:true, opacity:0.3});
    const str = new THREE.Mesh(strGeo, strMat);
    str.position.y = -radius - radius*2;
    mesh.add(str);

    balloons.push({
      mesh,
      speed: 0.008 + Math.random()*0.018,
      wobbleX: Math.random()*Math.PI*2,
      wobbleZ: Math.random()*Math.PI*2,
      wobbleSpeedX: 0.005 + Math.random()*0.01,
      wobbleSpeedZ: 0.004 + Math.random()*0.008,
      wobbleAmpX: 0.002 + Math.random()*0.004,
      startX
    });
  }

  let running = false;

  function animate(){
    requestAnimationFrame(animate);

    // Only render when rooom page is visible
    const rooomPage = document.getElementById('pg-rooom');
    if(!rooomPage || !rooomPage.classList.contains('active')){
      running = false;
      return;
    }
    running = true;

    balloons.forEach(b => {
      b.mesh.position.y += b.speed;
      b.wobbleX += b.wobbleSpeedX;
      b.wobbleZ += b.wobbleSpeedZ;
      b.mesh.position.x += Math.sin(b.wobbleX) * b.wobbleAmpX;
      b.mesh.position.z += Math.sin(b.wobbleZ) * b.wobbleAmpX * 0.5;
      b.mesh.rotation.z = Math.sin(b.wobbleX) * 0.05;

      // Reset when above camera
      if(b.mesh.position.y > 7){
        b.mesh.position.y = -6 - Math.random()*3;
        b.mesh.position.x = b.startX + (Math.random()-0.5)*3;
      }
    });

    renderer.render(scene, camera);
  }

  animate();

  // Handle resize
  window.addEventListener('resize', ()=>{
    const nw = container.offsetWidth || window.innerWidth;
    const nh = container.offsetHeight || window.innerHeight;
    camera.aspect = nw/nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
}

// Init balloons on DOMContentLoaded (Three.js is already loaded)
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initRooomBalloons);
} else {
  initRooomBalloons();
}

})();
