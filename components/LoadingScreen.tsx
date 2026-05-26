'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [gone, setGone] = useState(false);
  const raf = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const dur = 2400;
    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / dur) * 100);
      setProgress(Math.floor(p));
      if (p < 100) { raf.current = requestAnimationFrame(tick); }
      else { setTimeout(() => { setGone(true); setTimeout(onComplete, 600); }, 200); }
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="loading-screen"
          exit={{ y: '-100vh', opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="loading-scan" />
          {/* Corner brackets */}
          {[['top-8 left-8','border-t border-l'],['top-8 right-8','border-t border-r'],['bottom-8 left-8','border-b border-l'],['bottom-8 right-8','border-b border-r']].map(([pos, brd], i) => (
            <div key={i} className={`absolute ${pos} w-8 h-8 ${brd} border-[#C1121F] opacity-50`} />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Real Logo */}
            <div className="relative w-24 h-24" style={{ filter: 'drop-shadow(0 0 30px rgba(193,18,31,0.6))' }}>
              <Image src="/arialogo.png" alt="Aria" fill style={{ objectFit: 'contain' }} />
            </div>

            {/* Wordmark */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="flex gap-1"
            >
              {['A','R','I','A'].map((letter, i) => (
                <motion.span
                  key={i}
                  variants={{ hidden: { opacity:0, y:40 }, visible: { opacity:1, y:0, transition:{ duration:0.5 } } }}
                  style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'72px', letterSpacing:'0.2em', color:'#F0F0F0', lineHeight:1 }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            <p style={{ fontFamily:'var(--font-jetbrains)', fontSize:'11px', letterSpacing:'0.2em', color:'rgba(140,140,160,0.5)', textTransform:'uppercase' }}>
              AI for college students
            </p>

            {/* Progress bar */}
            <div style={{ width:'280px', height:'1px', background:'rgba(255,255,255,0.07)', position:'relative', overflow:'hidden' }}>
              <div style={{
                height:'100%',
                width:`${progress}%`,
                background:'linear-gradient(90deg, #7A0C14, #C1121F, #FF4D5A)',
                transition:'width 0.05s linear',
              }} />
            </div>
            <span style={{ fontFamily:'var(--font-jetbrains)', fontSize:'11px', color:'#C1121F' }}>
              {String(progress).padStart(3,'0')}%
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
