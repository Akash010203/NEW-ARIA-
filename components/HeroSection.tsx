'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import Image from 'next/image';

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const { pos, col } = useMemo(() => {
    const count = 2000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color('#C1121F');
    const c2 = new THREE.Color('#7A0C14');
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 3;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      const c = Math.random() > 0.3 ? c1 : c2;
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    return { pos, col };
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.035;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.08;
  });
  return (
    <Points ref={ref} positions={pos} colors={col}>
      <PointMaterial vertexColors size={0.018} sizeAttenuation depthWrite={false} transparent opacity={0.8} />
    </Points>
  );
}

const wordVariants = {
  hidden: { opacity:0, y:50, filter:'blur(8px)' },
  visible: { opacity:1, y:0, filter:'blur(0px)', transition:{ duration:0.6, ease:[0.16,1,0.3,1] as const } },
};

const STATS = [
  { val:'75%', lbl:"Attendance auto-tracked" },
  { val:'4', lbl:"AI-powered features" },
  { val:'0', lbl:"Data sent to cloud" },
];

export default function HeroSection() {
  return (
    <section id="hero" style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden', background:'radial-gradient(circle at top, #1a0507 0%, #0a0a0a 45%, #040404 100%)' }}>
      {/* Particles */}
      <div style={{ position:'absolute', inset:0, zIndex:0 }}>
        <Canvas camera={{ position:[0,0,6], fov:65 }} gl={{ antialias:true, alpha:true }} style={{ background:'transparent' }}>
          <ambientLight intensity={0.3} color="#C1121F" />
          <pointLight position={[3,3,3]} intensity={1.5} color="#C1121F" />
          <Suspense fallback={null}><Particles /></Suspense>
        </Canvas>
      </div>
      {/* Vignette */}
      <div style={{ position:'absolute', inset:0, zIndex:1, background:'radial-gradient(ellipse at center, transparent 35%, #040404 88%)', pointerEvents:'none' }} />

      {/* Content */}
      <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'120px 24px 80px', maxWidth:'1000px', margin:'0 auto' }}>
        {/* Badge */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} style={{ marginBottom:'32px' }}>
          <span className="section-label">
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--green)', animation:'pulseRed 2s ease-in-out infinite', flexShrink:0 }} />
            Now live for college students
          </span>
        </motion.div>

        {/* Logo in hero */}
        <motion.div
          initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }}
          transition={{ delay:0.1, duration:0.7, ease:[0.16,1,0.3,1] }}
          style={{ position:'relative', width:'100px', height:'100px', marginBottom:'24px', filter:'drop-shadow(0 0 40px rgba(193,18,31,0.5))' }}
        >
          <Image src="/arialogo.png" alt="Aria" fill style={{ objectFit:'contain' }} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden" animate="visible"
          variants={{ visible:{ transition:{ staggerChildren:0.07, delayChildren:0.4 } } }}
          style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'clamp(2.8rem,7vw,6.5rem)', lineHeight:1.02, marginBottom:'24px', display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'0 16px' }}
        >
          {['Your', 'College.'].map((w,i) => (
            <motion.span key={i} variants={wordVariants} style={{ display:'inline-block', color:'#F0F0F0' }}>{w}</motion.span>
          ))}
          <br style={{ width:'100%' }} />
          {['Powered', 'by', 'AI.'].map((w,i) => (
            <motion.span key={i} variants={wordVariants} style={{ display:'inline-block' }} className={i===2 ? 'gradient-text' : ''}>
              <span style={i===2 ? {} : { color:'#F0F0F0' }}>{w}</span>
            </motion.span>
          ))}
        </motion.h1>

        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.9 }}
          style={{ maxWidth:'560px', fontSize:'19px', lineHeight:1.75, color:'var(--text2)', marginBottom:'40px', fontFamily:'var(--font-dm)' }}
        >
          Aria tracks your attendance so you never get detained, turns any YouTube lecture into a
          distraction-free AI classroom, and connects your college community — all with local AI.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.1 }}
          style={{ display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center', marginBottom:'64px' }}
        >
          <a href="#early-access" style={{ textDecoration:'none' }}>
            <button className="btn-primary" style={{ fontSize:'16px', padding:'16px 36px' }}>Get Early Access →</button>
          </a>
          <a href="#showcase" style={{ textDecoration:'none' }}>
            <button className="btn-ghost" style={{ fontSize:'16px', padding:'16px 36px' }}>See How It Works ↓</button>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.4 }}
          style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'32px', borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:'32px', width:'100%', maxWidth:'520px' }}
        >
          {STATS.map(s => (
            <div key={s.val} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              <span style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'32px', color:'#C1121F' }}>{s.val}</span>
              <span style={{ fontFamily:'var(--font-dm)', fontSize:'12px', color:'var(--text3)', textAlign:'center', lineHeight:1.3 }}>{s.lbl}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2 }}
        style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}
      >
        <span style={{ fontFamily:'var(--font-jetbrains)', fontSize:'9px', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text3)' }}>scroll</span>
        <div style={{ width:'1px', height:'48px', overflow:'hidden', background:'rgba(255,255,255,0.07)' }}>
          <motion.div style={{ height:'100%', background:'linear-gradient(to bottom, #C1121F, transparent)' }}
            animate={{ y:['-100%','200%'] }} transition={{ duration:1.3, repeat:Infinity, ease:'linear' }} />
        </div>
      </motion.div>
    </section>
  );
}
