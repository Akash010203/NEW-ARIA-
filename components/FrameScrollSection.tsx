'use client';
import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 240;
const FRAME_BG = '#040404';
const frameSrc = (n: number) => `/frames/frame_${String(n).padStart(4,'0')}.png`;

// Text overlays triggered at scroll progress ranges
const TEXT_LAYERS = [
  {
    from: 0.02, to: 0.22,
    side: 'left' as const,
    label: 'Attendance Bachao',
    headline: 'Never get\ndetained again.',
    body: 'Enter your timetable once. Aria tells you exactly how many lectures you can skip across every subject — before you make a costly mistake.',
  },
  {
    from: 0.26, to: 0.46,
    side: 'right' as const,
    label: 'AI Tutor Mode',
    headline: 'Study without\ndistractions.',
    body: 'Paste any YouTube link. Aria strips ads and sidebar, plays it clean, and gives you a live AI tutor on the side that knows the video inside-out.',
  },
  {
    from: 0.50, to: 0.70,
    side: 'center' as const,
    label: 'Focus Mode',
    headline: '25 minutes.\nFull focus.',
    body: 'Aria acts like a strict teacher — blocks non-study sites, watches you via webcam, and unlocks everything during break time. Automatically.',
  },
  {
    from: 0.74, to: 0.95,
    side: 'left' as const,
    label: 'Community',
    headline: 'Your college,\nconnected.',
    body: 'Share notes, PDFs, and video lectures. AI scans every upload. Search like YouTube, build private study groups, message anyone.',
  },
];

function getOpacity(progress: number, from: number, to: number): number {
  const fadeLen = 0.04;
  if (progress < from) return 0;
  if (progress > to) return 0;
  if (progress < from + fadeLen) return (progress - from) / fadeLen;
  if (progress > to - fadeLen) return (to - progress) / fadeLen;
  return 1;
}

function getY(progress: number, from: number, to: number): number {
  const fadeLen = 0.04;
  if (progress < from) return 30;
  if (progress < from + fadeLen) return 30 - (30 * (progress - from) / fadeLen);
  if (progress > to - fadeLen) return -20 * ((progress - (to - fadeLen)) / fadeLen);
  return 0;
}

export default function FrameScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [loadPct, setLoadPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>();

  // Preload frames
  useEffect(() => {
    let loaded = 0;
    framesRef.current = new Array(FRAME_COUNT).fill(null);
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      const idx = i - 1;
      img.onload = () => {
        framesRef.current[idx] = img;
        loaded++;
        setLoadPct(Math.round((loaded / FRAME_COUNT) * 100));
        if (loaded === FRAME_COUNT) setReady(true);
      };
      img.onerror = () => {
        loaded++;
        setLoadPct(Math.round((loaded / FRAME_COUNT) * 100));
        if (loaded === FRAME_COUNT) setReady(true);
      };
    }
  }, []);

  // Draw frame
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = framesRef.current[Math.max(0, Math.min(idx, FRAME_COUNT - 1))];
    if (!img || !img.complete) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // object-fit: cover
    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const ox = (canvas.width - w) / 2;
    const oy = (canvas.height - h) / 2;
    ctx.drawImage(img, ox, oy, w, h);
  };

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameRef.current);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    return () => window.removeEventListener('resize', resize);
  });

  // Scroll tracking + GSAP
  useEffect(() => {
    if (!ready) return;
    const section = sectionRef.current;
    if (!section) return;

    // Draw first frame immediately
    drawFrame(0);

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const totalH = section.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalH));
      setScrollProgress(progress);
      const frameIdx = Math.round(progress * (FRAME_COUNT - 1));
      if (frameIdx !== currentFrameRef.current) {
        currentFrameRef.current = frameIdx;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawFrame(frameIdx));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="frame-section"
      style={{ height: `${FRAME_COUNT * 5}px`, position: 'relative', background: FRAME_BG }}
    >
      {/* Loading overlay */}
      {!ready && (
        <div style={{ position:'sticky', top:0, height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:FRAME_BG, zIndex:20 }}>
          <span className="section-label" style={{ marginBottom:'24px' }}>Loading frames…</span>
          <div style={{ width:'240px', height:'1px', background:'rgba(255,255,255,0.07)' }}>
            <div style={{ height:'100%', width:`${loadPct}%`, background:'linear-gradient(90deg, #7A0C14, #C1121F, #FF4D5A)', transition:'width .1s linear' }} />
          </div>
          <span style={{ fontFamily:'var(--font-jetbrains)', fontSize:'12px', color:'#C1121F', marginTop:'12px' }}>{loadPct}%</span>
        </div>
      )}

      {/* Pinned canvas */}
      {ready && (
        <div style={{ position:'sticky', top:0, height:'100vh', overflow:'hidden', background:FRAME_BG }}>
          <canvas
            ref={canvasRef}
            aria-label="Aria product visualization"
            role="img"
            style={{ display:'block', width:'100%', height:'100%', background:FRAME_BG }}
          />

          {/* Top gradient blend */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'120px', background:'linear-gradient(to bottom, #040404, transparent)', pointerEvents:'none', zIndex:5 }} />
          {/* Bottom gradient blend */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'120px', background:'linear-gradient(to top, #040404, transparent)', pointerEvents:'none', zIndex:5 }} />

          {/* Text overlays */}
          {TEXT_LAYERS.map((layer, i) => {
            const opacity = getOpacity(scrollProgress, layer.from, layer.to);
            const y = getY(scrollProgress, layer.from, layer.to);
            const pos: React.CSSProperties = layer.side === 'left'
              ? { left:'6%', top:'50%', transform:`translateY(calc(-50% + ${y}px))` }
              : layer.side === 'right'
              ? { right:'6%', top:'30%', transform:`translateY(calc(-50% + ${y}px))` }
              : { left:'50%', bottom:'12%', transform:`translateX(-50%) translateY(${y}px)` };

            return (
              <div
                key={i}
                style={{
                  position:'absolute', zIndex:10, maxWidth:'420px', pointerEvents:'none',
                  opacity, willChange:'opacity, transform',
                  ...pos,
                }}
              >
                <div className="section-label" style={{ marginBottom:'16px', display:'inline-flex' }}>{layer.label}</div>
                <h2 style={{
                  fontFamily:'var(--font-syne)', fontWeight:800,
                  fontSize:'clamp(2rem,4vw,3.5rem)', lineHeight:1.05, color:'#F0F0F0',
                  textShadow:'0 2px 40px rgba(0,0,0,0.9)', marginBottom:'16px',
                  whiteSpace:'pre-line',
                }}>
                  {layer.headline}
                </h2>
                <p style={{
                  fontFamily:'var(--font-dm)', fontSize:'15px', lineHeight:1.7,
                  color:'rgba(200,200,210,0.75)',
                  textShadow:'0 1px 20px rgba(0,0,0,0.8)',
                  background:'rgba(4,4,4,0.5)', backdropFilter:'blur(8px)',
                  padding:'12px 16px', borderRadius:'10px',
                  border:'1px solid rgba(255,255,255,0.06)',
                }}>
                  {layer.body}
                </p>
              </div>
            );
          })}

          {/* Progress dots */}
          <div style={{ position:'absolute', right:'32px', top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:'8px', zIndex:10 }}>
            {TEXT_LAYERS.map((l, i) => {
              const active = scrollProgress >= l.from && scrollProgress <= l.to;
              return (
                <div key={i} style={{
                  width:'6px', height: active ? '24px' : '6px',
                  borderRadius:'3px',
                  background: active ? '#C1121F' : 'rgba(255,255,255,0.15)',
                  transition:'all .3s ease',
                  boxShadow: active ? '0 0 12px rgba(193,18,31,0.6)' : 'none',
                }} />
              );
            })}
          </div>

          {/* Frame counter */}
          <div style={{
            position:'absolute', bottom:'40px', left:'50%', transform:'translateX(-50%)',
            fontFamily:'var(--font-jetbrains)', fontSize:'11px', letterSpacing:'0.15em',
            color:'rgba(140,140,160,0.4)', zIndex:10, pointerEvents:'none',
          }}>
            {String(currentFrameRef.current + 1).padStart(3,'0')} / {FRAME_COUNT}
          </div>
        </div>
      )}
    </section>
  );
}
