/* ============================================
   12⋮12am™ — CINEMATIC ENGINE v4
   GSAP ScrollTrigger + Three.js — MAX
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

/* Cinematic text reveals */
document.querySelectorAll('.cin__line').forEach(line=>{
  gsap.fromTo(line,{opacity:0,y:40,filter:'blur(8px)'},{
    opacity:1,y:0,filter:'blur(0px)',duration:1.2,ease:'power3.out',
    scrollTrigger:{trigger:line,start:'top 85%',toggleActions:'play none none none'}
  });
});

/* Noise canvas intensity scrub */
const noiseCv=document.getElementById('noise-canvas');
if(noiseCv){
  const nCtx=noiseCv.getContext('2d');
  function rN(){noiseCv.width=noiseCv.offsetWidth/3;noiseCv.height=noiseCv.offsetHeight/3;}
  rN(); window.addEventListener('resize',rN);
  let nI={v:0.07};
  gsap.to(nI,{v:0.25,scrollTrigger:{trigger:'#cin-curse',start:'top top',end:'bottom top',scrub:true},onUpdate:()=>{noiseCv.style.opacity=nI.v;}});
  (function dN(){const w=noiseCv.width,h=noiseCv.height,img=nCtx.createImageData(w,h),d=img.data;
    for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=40;}
    nCtx.putImageData(img,0,0);requestAnimationFrame(dN);})();
}

/* L1 rings */
gsap.to('.l1-ring--1',{scale:1.1,opacity:0.8,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut'});
gsap.to('.l1-ring--2',{scale:1.08,opacity:0.9,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut',delay:0.8});
gsap.to('.l1-ring--3',{scale:1.06,opacity:1,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut',delay:1.6});
gsap.to('.l1-core',{scale:1.8,duration:2,repeat:-1,yoyo:true,ease:'sine.inOut'});

/* CTA */
gsap.fromTo('#section-cta .cta-block',{opacity:0,y:40},{opacity:1,y:0,duration:1,ease:'power2.out',
  scrollTrigger:{trigger:'#section-cta',start:'top 80%'}});

/* ═══ PANEL STATES ═══ */
const PS={};
document.querySelectorAll('.eco-panel').forEach(p=>{
  const id=p.dataset.panel;
  PS[id]={triggered:false};
  function go(){if(!PS[id].triggered){PS[id].triggered=true;p.classList.add('is-active');}}
  p.addEventListener('mouseenter',go);
  p.addEventListener('touchstart',go,{passive:true});
});

function mkScene(id){
  const el=document.getElementById(id);
  if(!el)return null;
  const w=el.offsetWidth||300,h=el.offsetHeight||300;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,w/h,0.1,1000);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setSize(w,h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  el.appendChild(renderer.domElement);
  return {scene,camera,renderer,w,h};
}

/* ═══════════════════════════════════════════
   SURVIVORS — Parchment with animated hieroglyphs
   Cave painting: 12 figures around fire with weapons
   ═══════════════════════════════════════════ */
function initSurvivors(){
  const s=mkScene('scene-survivors');if(!s)return;
  const{scene,camera,renderer,w,h}=s;
  camera.position.z=4;
  scene.add(new THREE.AmbientLight(0x442200,0.6));
  const candle=new THREE.PointLight(0xFF8822,2,10);
  candle.position.set(0,0,2);scene.add(candle);

  // Parchment
  const pGeo=new THREE.PlaneGeometry(3.2,4,1,30);
  const pMat=new THREE.MeshStandardMaterial({color:0x8B7355,roughness:0.95,side:THREE.DoubleSide});
  const parch=new THREE.Mesh(pGeo,pMat);parch.scale.y=0.01;scene.add(parch);

  // Rods
  const rodGeo=new THREE.CylinderGeometry(0.06,0.06,3.4,8);
  const rodMat=new THREE.MeshStandardMaterial({color:0x5C3D1E,metalness:0.2,roughness:0.7});
  const topR=new THREE.Mesh(rodGeo,rodMat);topR.rotation.z=Math.PI/2;topR.position.y=2;scene.add(topR);
  const botR=new THREE.Mesh(rodGeo.clone(),rodMat);botR.rotation.z=Math.PI/2;botR.position.y=-2;scene.add(botR);

  // Hieroglyph figures: 2D canvas texture that we update each frame
  const hCv=document.createElement('canvas');hCv.width=512;hCv.height=512;
  const hCtx=hCv.getContext('2d');
  const hTex=new THREE.CanvasTexture(hCv);
  const hMat=new THREE.MeshBasicMaterial({map:hTex,transparent:true,depthWrite:false});
  const hMesh=new THREE.Mesh(new THREE.PlaneGeometry(2.8,3.2),hMat);
  hMesh.position.z=0.01;hMesh.scale.y=0.01;scene.add(hMesh);

  function drawHieroglyphs(t){
    const c=hCtx,W=512,H=512;
    c.clearRect(0,0,W,H);

    // Fire in center
    const fx=W/2,fy=H*0.55;
    // Flames
    for(let f=0;f<8;f++){
      const fa=f/8*Math.PI*2;
      const fh=25+Math.sin(t*6+f*1.5)*15;
      const fw=6+Math.sin(t*4+f)*4;
      c.fillStyle=f%2===0?'rgba(200,120,20,0.7)':'rgba(220,180,40,0.5)';
      c.beginPath();
      c.moveTo(fx+Math.cos(fa)*12, fy);
      c.quadraticCurveTo(fx+Math.cos(fa)*fw, fy-fh, fx+Math.cos(fa+0.3)*4, fy-fh*1.2);
      c.quadraticCurveTo(fx+Math.cos(fa-0.2)*2, fy-fh*0.5, fx+Math.cos(fa)*12, fy);
      c.fill();
    }
    // Embers
    for(let e=0;e<6;e++){
      c.fillStyle='rgba(255,200,50,'+(0.3+Math.sin(t*3+e)*0.3)+')';
      c.beginPath();
      c.arc(fx+(Math.sin(t*2+e*2))*20, fy-30-Math.abs(Math.sin(t*1.5+e))*25, 2, 0, Math.PI*2);
      c.fill();
    }
    // Fire base (logs)
    c.strokeStyle='rgba(140,90,30,0.8)';c.lineWidth=3;
    c.beginPath();c.moveTo(fx-18,fy+5);c.lineTo(fx+18,fy+5);c.stroke();
    c.beginPath();c.moveTo(fx-12,fy+8);c.lineTo(fx+15,fy+2);c.stroke();

    // 12 stick figures around fire
    c.strokeStyle='rgba(180,140,70,0.85)';c.lineWidth=2;
    for(let i=0;i<12;i++){
      const a=i/12*Math.PI*2 - Math.PI/2;
      const r=80+Math.sin(i*3)*10;
      const px=fx+Math.cos(a)*r;
      const py=fy-20+Math.sin(a)*r*0.5;
      const bob=Math.sin(t*2+i*0.7)*3; // bobbing
      const armSwing=Math.sin(t*3+i*1.2)*0.4;

      // Head
      c.beginPath();c.arc(px,py-18+bob,5,0,Math.PI*2);c.stroke();
      // Body
      c.beginPath();c.moveTo(px,py-13+bob);c.lineTo(px,py+5+bob);c.stroke();
      // Legs (walking)
      const legA=Math.sin(t*3+i)*8;
      c.beginPath();c.moveTo(px,py+5+bob);c.lineTo(px-legA,py+20+bob);c.stroke();
      c.beginPath();c.moveTo(px,py+5+bob);c.lineTo(px+legA,py+20+bob);c.stroke();
      // Arms
      c.beginPath();c.moveTo(px,py-8+bob);c.lineTo(px-10+armSwing*8,py-2+bob);c.stroke();
      // Weapon in right arm
      const wx=px+10-armSwing*5,wy=py-12+bob;
      c.beginPath();c.moveTo(px,py-8+bob);c.lineTo(wx,wy);c.stroke();
      // Spear or sword tip
      if(i%3===0){
        // Spear (long)
        c.beginPath();c.moveTo(wx,wy);c.lineTo(wx+Math.cos(a)*15,wy-15);c.stroke();
        // Spear tip
        c.beginPath();
        const tx=wx+Math.cos(a)*15,ty=wy-15;
        c.moveTo(tx,ty-5);c.lineTo(tx-3,ty);c.lineTo(tx+3,ty);c.closePath();
        c.fillStyle='rgba(180,140,70,0.85)';c.fill();
      } else {
        // Sword
        c.beginPath();c.moveTo(wx,wy);c.lineTo(wx+8,wy-12+Math.sin(t*4+i)*3);c.stroke();
      }
    }
  }

  let unroll=0.01;
  (function anim(){
    requestAnimationFrame(anim);
    if(!PS.survivors.triggered){renderer.render(scene,camera);return;}
    const t=Date.now()*0.001;
    if(unroll<1)unroll=Math.min(1,unroll+0.003);
    parch.scale.y=unroll;hMesh.scale.y=unroll;botR.position.y=-2*unroll;
    candle.intensity=1.5+Math.sin(t*8)*0.4+Math.sin(t*13)*0.2;
    drawHieroglyphs(t);hTex.needsUpdate=true;
    renderer.render(scene,camera);
  })();
}

/* ═══════════════════════════════════════════
   ROOOM — Silver disco ball (visible!) + flat colorful balloons
   ═══════════════════════════════════════════ */
function initRooom(){
  const s=mkScene('scene-rooom');if(!s)return;
  const{scene,camera,renderer}=s;
  camera.position.set(0,0.3,5);camera.lookAt(0,0,0);

  scene.add(new THREE.AmbientLight(0x333333,0.8));

  // DISCO BALL — silver, visible, reflective facets
  const ballGeo=new THREE.IcosahedronGeometry(1,2);
  const ballMat=new THREE.MeshStandardMaterial({
    color:0xbbbbcc,metalness:0.95,roughness:0.05,flatShading:true
  });
  const ball=new THREE.Mesh(ballGeo,ballMat);
  ball.position.set(0,2,0);scene.add(ball);

  // Strong directional light on ball for self-reflection
  const dL=new THREE.DirectionalLight(0xffffff,1.5);
  dL.position.set(2,3,4);scene.add(dL);
  const dL2=new THREE.DirectionalLight(0xccccff,0.8);
  dL2.position.set(-3,2,-2);scene.add(dL2);

  // String
  const strGeo=new THREE.CylinderGeometry(0.01,0.01,2,4);
  const strMat=new THREE.MeshBasicMaterial({color:0x555555});
  const str=new THREE.Mesh(strGeo,strMat);str.position.set(0,4,0);scene.add(str);

  // BALLOONS — flat/matte, no strong reflections
  const balloons=[];
  const bCol=[0xff4d6d,0x4dc9f6,0xf7e733,0xc77dff,0x51cf66,0xff8c42,0xf06595,0x63e6be,0xff6b6b,0x74c0fc];
  for(let i=0;i<22;i++){
    const bGeo=new THREE.SphereGeometry(0.18+Math.random()*0.22,16,16);
    const bMat=new THREE.MeshLambertMaterial({color:bCol[i%bCol.length]});// Lambert = flat, no specular
    const bMesh=new THREE.Mesh(bGeo,bMat);
    const sx=(Math.random()-0.5)*6;
    bMesh.position.set(sx,-4-Math.random()*4,(Math.random()-0.5)*3);
    scene.add(bMesh);
    balloons.push({mesh:bMesh,speed:0.012+Math.random()*0.02,wx:Math.random()*Math.PI*2,wz:Math.random()*Math.PI*2,sx});
  }

  (function anim(){
    requestAnimationFrame(anim);
    if(!PS.rooom.triggered){renderer.render(scene,camera);return;}
    const t=Date.now()*0.001;
    ball.rotation.y+=0.01;
    ball.rotation.x=Math.sin(t*0.3)*0.05;
    balloons.forEach(b=>{
      b.mesh.position.y+=b.speed;
      b.wx+=0.008;b.wz+=0.006;
      b.mesh.position.x+=Math.sin(b.wx)*0.002;
      b.mesh.position.z+=Math.sin(b.wz)*0.001;
      if(b.mesh.position.y>5){b.mesh.position.y=-4;b.mesh.position.x=b.sx+(Math.random()-0.5)*2;}
    });
    renderer.render(scene,camera);
  })();
}

/* ═══════════════════════════════════════════
   WORMHOLE — Deep space vortex with mixed-size points
   ═══════════════════════════════════════════ */
function initWormhole(){
  const s=mkScene('scene-wormhole');if(!s)return;
  const{scene,camera,renderer}=s;
  camera.position.z=5;
  scene.fog=new THREE.FogExp2(0x000005,0.04);

  const count=5000;
  const geo=new THREE.BufferGeometry();
  const pos=new Float32Array(count*3);
  const col=new Float32Array(count*3);
  const sizes=new Float32Array(count);
  const vel=new Float32Array(count);

  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2;
    const d=0.3+Math.random()*9;
    pos[i*3]=Math.cos(a)*d;pos[i*3+1]=Math.sin(a)*d;pos[i*3+2]=(Math.random()-0.5)*12;
    const br=0.3+Math.random()*0.7;
    col[i*3]=br;col[i*3+1]=br*0.84;col[i*3+2]=0;
    sizes[i]=1+Math.random()*6; // mixed sizes!
    vel[i]=0.001+Math.random()*0.005;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));

  // Custom shader for variable point sizes
  const pMat=new THREE.ShaderMaterial({
    uniforms:{},
    vertexShader:`
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      void main(){
        vColor=color;
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_PointSize=size*(300.0/length(mv.xyz));
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader:`
      varying vec3 vColor;
      void main(){
        float d=length(gl_PointCoord-vec2(0.5));
        if(d>0.5)discard;
        float a=1.0-smoothstep(0.2,0.5,d);
        gl_FragColor=vec4(vColor,a*0.8);
      }`,
    transparent:true,vertexColors:true,blending:THREE.AdditiveBlending,depthWrite:false
  });
  geo.setAttribute('size',new THREE.BufferAttribute(sizes,1));
  const pts=new THREE.Points(geo,pMat);scene.add(pts);

  // Center glow
  const gGeo=new THREE.SphereGeometry(0.4,16,16);
  const gMat=new THREE.MeshBasicMaterial({color:0xFFD600,transparent:true,opacity:0.12});
  const glow=new THREE.Mesh(gGeo,gMat);scene.add(glow);

  // Rings
  for(let r=0;r<8;r++){
    const rGeo=new THREE.RingGeometry(0.6+r*0.7,0.62+r*0.7,80);
    const rMat=new THREE.MeshBasicMaterial({color:0xFFD600,transparent:true,opacity:0.03,side:THREE.DoubleSide});
    scene.add(new THREE.Mesh(rGeo,rMat));
  }

  (function anim(){
    requestAnimationFrame(anim);
    if(!PS.wormhole.triggered){renderer.render(scene,camera);return;}
    const p=geo.attributes.position.array;
    for(let i=0;i<count;i++){
      let x=p[i*3],y=p[i*3+1];
      const dist=Math.sqrt(x*x+y*y);
      const angle=Math.atan2(y,x)+vel[i]*1.2;
      const nd=dist-vel[i]*0.3;
      if(nd<0.15){const a=Math.random()*Math.PI*2,d=4+Math.random()*6;p[i*3]=Math.cos(a)*d;p[i*3+1]=Math.sin(a)*d;p[i*3+2]=(Math.random()-0.5)*12;}
      else{p[i*3]=Math.cos(angle)*nd;p[i*3+1]=Math.sin(angle)*nd;}
    }
    geo.attributes.position.needsUpdate=true;
    glow.scale.setScalar(1+Math.sin(Date.now()*0.001)*0.3);
    renderer.render(scene,camera);
  })();
}

/* ═══════════════════════════════════════════
   DRAGON12 — Continuous tube dragon, Chinese style
   Smooth body, flowing, one single piece
   ═══════════════════════════════════════════ */
function initDragon(){
  const s=mkScene('scene-dragon');if(!s)return;
  const{scene,camera,renderer}=s;
  camera.position.set(0,0,6);

  scene.add(new THREE.AmbientLight(0x113311,0.6));
  const dirL=new THREE.DirectionalLight(0x66ff33,1.2);dirL.position.set(3,5,5);scene.add(dirL);
  const ptL=new THREE.PointLight(0xFFD600,1.5,15);ptL.position.set(2,0,4);scene.add(ptL);

  // Build dragon as TubeGeometry following a path
  const SEGS=120;
  let dragonOffset=-15;

  // Custom curve class for the dragon path
  class DragonCurve extends THREE.Curve {
    constructor(offset,time){super();this.offset=offset;this.time=time;}
    getPoint(t){
      const x=this.offset+t*20-10;
      const y=Math.sin(this.time*1.5+t*8)*1.2;
      const z=Math.sin(this.time*1.2+t*6)*0.5;
      return new THREE.Vector3(x,y,z);
    }
  }

  let dragonMesh=null;
  const bodyMat=new THREE.MeshStandardMaterial({color:0x228B22,metalness:0.3,roughness:0.5,side:THREE.DoubleSide});

  // Scales texture overlay
  const scaleMat=new THREE.MeshStandardMaterial({color:0x33aa33,metalness:0.2,roughness:0.6});

  // Head
  const headGeo=new THREE.SphereGeometry(0.55,16,14);
  const headMat=new THREE.MeshStandardMaterial({color:0x2a9d2a,metalness:0.3,roughness:0.4});
  const head=new THREE.Mesh(headGeo,headMat);
  head.scale.set(1.3,1,1.1);scene.add(head);

  // Eyes
  const eyeM=new THREE.MeshBasicMaterial({color:0xFFD600});
  const eL=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),eyeM);
  const eR=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),eyeM);
  eL.position.set(0.35,0.2,0.4);eR.position.set(0.35,0.2,-0.4);
  head.add(eL);head.add(eR);

  // Pupils
  const pupM=new THREE.MeshBasicMaterial({color:0x000000});
  const pL=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,6),pupM);
  const pR=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,6),pupM);
  pL.position.set(0.04,0,0.03);pR.position.set(0.04,0,0.03);
  eL.add(pL);eR.add(pR);

  // Horns
  const hMat=new THREE.MeshStandardMaterial({color:0xccaa33,metalness:0.5,roughness:0.3});
  const hL=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.7,6),hMat);
  const hR=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.7,6),hMat);
  hL.position.set(-0.1,0.5,0.25);hL.rotation.z=0.5;
  hR.position.set(-0.1,0.5,-0.25);hR.rotation.z=0.5;
  head.add(hL);head.add(hR);

  // Whisker lines (simple thin cylinders)
  const wMat=new THREE.MeshBasicMaterial({color:0xcccc88});
  for(let i=0;i<2;i++){
    const wGeo=new THREE.CylinderGeometry(0.008,0.003,1.5,4);
    const w=new THREE.Mesh(wGeo,wMat);
    w.position.set(0.6,0.05,i===0?0.2:-0.2);
    w.rotation.z=-0.8+i*0.1;w.rotation.x=(i===0?0.3:-0.3);
    head.add(w);
  }

  // Spines along body
  const spines=[];
  for(let i=0;i<30;i++){
    const sGeo=new THREE.ConeGeometry(0.05,0.3,4);
    const sp=new THREE.Mesh(sGeo,new THREE.MeshStandardMaterial({color:0x44cc22}));
    scene.add(sp);spines.push(sp);
  }

  (function anim(){
    requestAnimationFrame(anim);
    if(!PS.dragon.triggered){renderer.render(scene,camera);return;}
    const t=Date.now()*0.001;

    dragonOffset+=0.04;
    if(dragonOffset>15)dragonOffset=-15;

    // Rebuild tube each frame (smooth continuous body)
    const curve=new DragonCurve(dragonOffset,t);
    const tubeGeo=new THREE.TubeGeometry(curve,SEGS,0.35,12,false);

    if(dragonMesh){scene.remove(dragonMesh);dragonMesh.geometry.dispose();}
    dragonMesh=new THREE.Mesh(tubeGeo,bodyMat);
    scene.add(dragonMesh);

    // Head follows front of curve
    const headPos=curve.getPoint(0);
    const headDir=curve.getPoint(0.02);
    head.position.copy(headPos);
    head.lookAt(headDir);

    // Spines on top of body
    spines.forEach((sp,i)=>{
      const tt=i/spines.length;
      const p=curve.getPoint(tt);
      const tangent=curve.getTangent(tt);
      sp.position.copy(p);
      sp.position.y+=0.35;
      sp.lookAt(p.clone().add(tangent));
      sp.rotateX(Math.PI/2);
    });

    ptL.position.copy(headPos);ptL.position.x+=1;
    renderer.render(scene,camera);
  })();
}

/* ═══════════════════════════════════════════
   STORE — Perspective corridor: ceiling light, racks on walls,
   folded clothes shelves, counter, hanging tees
   ═══════════════════════════════════════════ */
function initStore(){
  const s=mkScene('scene-store');if(!s)return;
  const{scene,camera,renderer}=s;
  camera.position.set(0,0.8,4);camera.lookAt(0,0.5,-3);

  // Ceiling yellow panel (like the reference image)
  const ceilGeo=new THREE.PlaneGeometry(5,8);
  const ceilMat=new THREE.MeshStandardMaterial({color:0xBBA800,emissive:0x554400,emissiveIntensity:0.3,roughness:0.9});
  const ceil=new THREE.Mesh(ceilGeo,ceilMat);
  ceil.rotation.x=Math.PI/2;ceil.position.set(0,3,-1);scene.add(ceil);

  // Ceiling light panel (bright white center)
  const lgGeo=new THREE.PlaneGeometry(2.5,4);
  const lgMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.7});
  const lg=new THREE.Mesh(lgGeo,lgMat);
  lg.rotation.x=Math.PI/2;lg.position.set(0,2.95,-1);scene.add(lg);

  // Bright spot light from ceiling
  const spotL=new THREE.PointLight(0xFFEECC,3,12);spotL.position.set(0,2.8,0);scene.add(spotL);
  scene.add(new THREE.AmbientLight(0x222211,0.5));

  // Warm downlights
  for(let i=0;i<4;i++){
    const dl=new THREE.PointLight(0xFFDD88,0.5,5);
    dl.position.set((i-1.5)*1.5,2.5,-1+i*0.5);scene.add(dl);
  }

  // Floor (grey herringbone-ish)
  const flGeo=new THREE.PlaneGeometry(5,10);
  const flMat=new THREE.MeshStandardMaterial({color:0x555555,roughness:0.85});
  const fl=new THREE.Mesh(flGeo,flMat);fl.rotation.x=-Math.PI/2;fl.position.set(0,-0.8,-1);scene.add(fl);

  // Walls — dark
  const wallM=new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.95});
  const lW=new THREE.Mesh(new THREE.PlaneGeometry(10,4),wallM);
  lW.rotation.y=Math.PI/2;lW.position.set(-2.2,1.2,-1);scene.add(lW);
  const rW=new THREE.Mesh(new THREE.PlaneGeometry(10,4),wallM);
  rW.rotation.y=-Math.PI/2;rW.position.set(2.2,1.2,-1);scene.add(rW);
  const bW=new THREE.Mesh(new THREE.PlaneGeometry(5,4),wallM);
  bW.position.set(0,1.2,-6);scene.add(bW);

  // RIGHT SIDE — Hanging tees on rack bar
  const rackM=new THREE.MeshStandardMaterial({color:0x444444,metalness:0.8,roughness:0.3});
  for(let row=0;row<2;row++){
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,4,6),rackM);
    bar.rotation.z=Math.PI/2;bar.rotation.x=Math.PI/2;
    bar.position.set(1.9,1.8-row*0.8,-2);scene.add(bar);

    const teeColors=[0xffffff,0xee3333,0x33aa33,0x3366cc,0xeeee33,0x333333,0xcc6633,0xaaaaaa];
    for(let i=0;i<7;i++){
      const tGeo=new THREE.PlaneGeometry(0.35,0.45);
      const tMat=new THREE.MeshStandardMaterial({
        color:teeColors[(i+row*3)%teeColors.length],side:THREE.DoubleSide,roughness:0.7
      });
      const tee=new THREE.Mesh(tGeo,tMat);
      tee.position.set(1.85,1.5-row*0.8,-0.5-i*0.5);
      tee.rotation.y=-0.15+(Math.random()-0.5)*0.1;
      scene.add(tee);
    }
  }

  // RIGHT SIDE — Shelves with folded clothes (colored boxes)
  const shelfM=new THREE.MeshStandardMaterial({color:0x222222,roughness:0.9});
  const foldColors=[0x2244aa,0x224488,0x336699,0xccbb88,0x888888,0x113355,0x446688,0xaa8866,0x5588cc,0x334455];
  for(let sh=0;sh<3;sh++){
    // Shelf plank
    const plank=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.03,3),shelfM);
    plank.position.set(1.8,-0.1+sh*0.45,-2);scene.add(plank);
    // Folded items
    for(let i=0;i<5;i++){
      const fGeo=new THREE.BoxGeometry(0.25,0.08,0.35);
      const fMat=new THREE.MeshStandardMaterial({color:foldColors[(sh*5+i)%foldColors.length],roughness:0.75});
      const fold=new THREE.Mesh(fGeo,fMat);
      fold.position.set(1.8,0.05+sh*0.45,-0.8-i*0.6);scene.add(fold);
    }
  }

  // LEFT SIDE — Counter/register
  const ctrGeo=new THREE.BoxGeometry(1.2,1,0.7);
  const ctrMat=new THREE.MeshStandardMaterial({color:0xBBA800,roughness:0.6,metalness:0.1});
  const ctr=new THREE.Mesh(ctrGeo,ctrMat);ctr.position.set(-1.5,0,-0.5);scene.add(ctr);
  // Counter top (white)
  const ctTop=new THREE.Mesh(new THREE.BoxGeometry(1.25,0.04,0.75),new THREE.MeshStandardMaterial({color:0xeeeeee,roughness:0.5}));
  ctTop.position.set(-1.5,0.52,-0.5);scene.add(ctTop);

  // LEFT SIDE — display cabinets
  for(let i=0;i<2;i++){
    const cab=new THREE.Mesh(new THREE.BoxGeometry(0.6,2,0.5),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.9}));
    cab.position.set(-1.8,0.2,-2-i*1.2);scene.add(cab);
  }

  (function anim(){
    requestAnimationFrame(anim);
    if(!PS.store.triggered){renderer.render(scene,camera);return;}
    const t=Date.now()*0.001;
    spotL.intensity=2.5+Math.sin(t*1.5)*0.3;
    camera.position.x=Math.sin(t*0.2)*0.12;
    camera.position.y=0.8+Math.sin(t*0.3)*0.05;
    renderer.render(scene,camera);
  })();
}

/* ═══════════════════════════════════════════
   36912 AI — 3D Phone with matrix rain inside screen
   ═══════════════════════════════════════════ */
function initAI(){
  const s=mkScene('scene-ai');if(!s)return;
  const{scene,camera,renderer}=s;
  camera.position.set(0,0,4);

  scene.add(new THREE.AmbientLight(0x111111,0.5));
  const ptL=new THREE.PointLight(0xFFD600,1.5,10);ptL.position.set(0,0,3);scene.add(ptL);

  // Phone body
  const phoneGeo=new THREE.BoxGeometry(1.4,2.6,0.12,1,1,1);
  const phoneMat=new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.7,roughness:0.2});
  const phone=new THREE.Mesh(phoneGeo,phoneMat);
  phone.rotation.x=-0.1;
  scene.add(phone);

  // Phone bezel (slightly inset screen area)
  const bezelGeo=new THREE.BoxGeometry(1.2,2.3,0.01);
  const bezelMat=new THREE.MeshBasicMaterial({color:0x000000});
  const bezel=new THREE.Mesh(bezelGeo,bezelMat);
  bezel.position.z=0.065;phone.add(bezel);

  // Screen — canvas texture with matrix rain
  const sCv=document.createElement('canvas');sCv.width=256;sCv.height=512;
  const sCtx=sCv.getContext('2d');
  const sTex=new THREE.CanvasTexture(sCv);
  sTex.minFilter=THREE.LinearFilter;
  const screenGeo=new THREE.PlaneGeometry(1.15,2.2);
  const screenMat=new THREE.MeshBasicMaterial({map:sTex});
  const screen=new THREE.Mesh(screenGeo,screenMat);
  screen.position.z=0.07;phone.add(screen);

  // Matrix rain state
  const chars='3691236912123691212';
  const colW=16,rows=Math.ceil(512/colW);
  const numCols=Math.floor(256/colW);
  const drops=new Array(numCols).fill(0).map(()=>Math.random()*-20);
  const speeds=new Array(numCols).fill(0).map(()=>0.15+Math.random()*0.25);

  // Phone screen glow
  const glowL=new THREE.PointLight(0xFFD600,0.3,4);
  glowL.position.set(0,0,1);phone.add(glowL);

  // Camera notch
  const notch=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.01,12),new THREE.MeshBasicMaterial({color:0x333333}));
  notch.rotation.x=Math.PI/2;notch.position.set(0,1.05,0.065);phone.add(notch);

  function drawMatrix(){
    const c=sCtx;
    // Fade trail
    c.fillStyle='rgba(0,0,0,0.06)';
    c.fillRect(0,0,256,512);

    c.font='14px monospace';
    c.textAlign='center';

    for(let i=0;i<numCols;i++){
      const x=i*colW+colW/2;
      const y=drops[i]*colW;
      const ch=chars[Math.floor(Math.random()*chars.length)];
      // Lead char — bright
      c.shadowColor='rgba(255,214,0,0.8)';c.shadowBlur=6;
      c.fillStyle='rgba(255,214,0,0.95)';
      c.fillText(ch,x,y);
      c.shadowBlur=0;
      // Trail
      for(let tr=1;tr<6;tr++){
        const a=0.4-tr*0.07;
        if(a>0){c.fillStyle=`rgba(255,214,0,${a})`;
          c.fillText(chars[(Math.floor(y/colW)+tr+i)%chars.length],x,y-tr*colW);}
      }
      drops[i]+=speeds[i];
      if(y>512+50)drops[i]=Math.random()*-10;
    }
  }

  (function anim(){
    requestAnimationFrame(anim);
    if(!PS.ai.triggered){renderer.render(scene,camera);return;}
    const t=Date.now()*0.001;
    phone.rotation.y=Math.sin(t*0.4)*0.15;
    phone.rotation.x=-0.1+Math.sin(t*0.3)*0.05;
    drawMatrix();sTex.needsUpdate=true;
    glowL.intensity=0.2+Math.sin(t*2)*0.1;
    renderer.render(scene,camera);
  })();
}

/* ═══ INIT ═══ */
requestAnimationFrame(()=>{initSurvivors();initRooom();initWormhole();initDragon();initStore();initAI();});

})();
