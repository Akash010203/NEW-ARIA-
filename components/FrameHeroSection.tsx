'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NextImage from 'next/image';

const FRAME_COUNT = 240;
// Slower scroll: 240 frames over 240*12px = 2880px of scroll
const SCROLL_MULTIPLIER = 12;
const SECTION_HEIGHT = FRAME_COUNT * SCROLL_MULTIPLIER;
const CANVAS_BG = '#040404';

const frameSrc = (n: number) =>
  `/frames/frame_${String(n).padStart(4,'0')}.png`;

const TEXT_LAYERS = [
  { from:0.00, to:0.18, side:'hero',     label:'', headline:'', body:'' },
  { from:0.22, to:0.40, side:'left',     label:'Attendance Bachao',  headline:'Never get\ndetained again.',       body:'Aria tracks every class. Tells you exactly how many you can skip across every subject — before you make a costly mistake.' },
  { from:0.44, to:0.62, side:'right',    label:'AI Tutor Mode',       headline:'Study without\ndistractions.',     body:'Paste any YouTube link. No ads, no sidebar. An AI tutor has watched the full video and answers anything instantly.' },
  { from:0.66, to:0.84, side:'center',   label:'Focus Mode',          headline:'25 minutes.\nFull focus.',         body:'Blocks social media. Webcam monitors presence. Pomodoro auto-manages study and break cycles like a strict teacher.' },
  { from:0.88, to:1.00, side:'left',     label:'Community',           headline:'Your college,\nconnected.',         body:'Share notes, PDFs, lectures. AI scans every upload. Search like YouTube. Private groups. Direct messaging.' },
];

function lerp(a:number,b:number,t:number){return a+(b-a)*Math.min(Math.max(t,0),1);}
function getOpacity(p:number,from:number,to:number){
  const f=0.035;
  if(p<from||p>to) return 0;
  if(p<from+f) return (p-from)/f;
  if(p>to-f) return (to-p)/f;
  return 1;
}
function getY(p:number,from:number,to:number){
  const f=0.035;
  if(p<from) return 32;
  if(p<from+f) return lerp(32,0,(p-from)/f);
  if(p>to-f) return lerp(0,-20,(p-(to-f))/f);
  return 0;
}

export default function FrameHeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const framesRef  = useRef<(HTMLImageElement|null)[]>([]);
  const [loadPct,  setLoadPct]  = useState(0);
  const [ready,    setReady]    = useState(false);
  const [progress, setProgress] = useState(0);
  const frameIdxRef = useRef(0);
  const rafRef = useRef<number>();
  const [isMobile, setIsMobile] = useState(false);
  const [scrollMultiplier, setScrollMultiplier] = useState(12);

  // ── Responsive Detect ───────────────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setScrollMultiplier(mobile ? 6 : 12);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Preload ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    framesRef.current = new Array(FRAME_COUNT).fill(null);

    const width = window.innerWidth;
    // On mobile, load every 4th frame. On tablet, load every 2nd frame. On desktop, load all.
    const step = width <= 768 ? 4 : (width <= 1024 ? 2 : 1);
    
    // Calculate total frames we actually plan to load
    let totalToLoad = 1;
    for (let i = 2; i <= FRAME_COUNT; i++) {
      if (i === FRAME_COUNT || (i - 1) % step === 0) {
        totalToLoad++;
      }
    }

    // 1. Load the first frame immediately so the site is interactive instantly
    const firstImg = new Image();
    firstImg.onload = () => {
      framesRef.current[0] = firstImg;
      setReady(true);
      loaded++;
      setLoadPct(Math.round((loaded / totalToLoad) * 100));
      // Load rest of the frames
      loadRemaining();
    };
    firstImg.onerror = () => {
      setReady(true);
      loaded++;
      setLoadPct(Math.round((loaded / totalToLoad) * 100));
      loadRemaining();
    };
    firstImg.src = frameSrc(1); // Set src AFTER onload/onerror registration!

    const loadRemaining = () => {
      // Load frames 2 to 240
      for (let i = 2; i <= FRAME_COUNT; i++) {
        // Skip frames based on step to save mobile memory/bandwidth
        if (i !== FRAME_COUNT && (i - 1) % step !== 0) {
          continue;
        }

        const img = new Image();
        const idx = i - 1;
        img.onload = () => {
          framesRef.current[idx] = img;
          loaded++;
          setLoadPct(Math.round((loaded / totalToLoad) * 100));
        };
        img.onerror = () => {
          loaded++;
          setLoadPct(Math.round((loaded / totalToLoad) * 100));
        };
        img.src = frameSrc(i); // Set src AFTER onload/onerror registration!
      }
    };
  }, []);

  // ── Resize canvas ────────────────────────────────────────────────────────
  const resize = () => {
    const c = canvasRef.current; if(!c) return;
    c.width=window.innerWidth; c.height=window.innerHeight;
    drawFrame(frameIdxRef.current);
  };
  useEffect(() => {
    if(!ready) return;
    resize();
    window.addEventListener('resize', resize, {passive:true});
    return ()=>window.removeEventListener('resize', resize);
  }, [ready]);

  // ── Draw ─────────────────────────────────────────────────────────────────
  const drawFrame = (idx: number) => {
    const c=canvasRef.current; if(!c) return;
    
    // Find closest loaded frame to avoid black flickers/blanks
    let img = null;
    for (let offset = 0; offset < FRAME_COUNT; offset++) {
      const left = idx - offset;
      const right = idx + offset;
      if (left >= 0 && framesRef.current[left] && framesRef.current[left]?.complete && (framesRef.current[left]?.naturalWidth || 0) > 0) {
        img = framesRef.current[left];
        break;
      }
      if (right < FRAME_COUNT && framesRef.current[right] && framesRef.current[right]?.complete && (framesRef.current[right]?.naturalWidth || 0) > 0) {
        img = framesRef.current[right];
        break;
      }
    }

    if (!img) return;
    const ctx=c.getContext('2d'); if(!ctx) return;
    ctx.clearRect(0,0,c.width,c.height);
    const scale=Math.max(c.width/img.naturalWidth, c.height/img.naturalHeight);
    const w=img.naturalWidth*scale, h=img.naturalHeight*scale;
    ctx.drawImage(img,(c.width-w)/2,(c.height-h)/2,w,h);
  };

  // ── Scroll ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if(!ready) return;
    drawFrame(0);
    const onScroll = () => {
      const sec=sectionRef.current; if(!sec) return;
      const rect=sec.getBoundingClientRect();
      const totalH=sec.offsetHeight-window.innerHeight;
      const p=Math.max(0,Math.min(1,-rect.top/totalH));
      setProgress(p);
      const fi=Math.round(p*(FRAME_COUNT-1));
      if(fi!==frameIdxRef.current){
        frameIdxRef.current=fi;
        if(rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current=requestAnimationFrame(()=>drawFrame(fi));
      }
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    return ()=>window.removeEventListener('scroll', onScroll);
  }, [ready]);

  const heroOpacity = Math.max(0, 1 - progress * 8); // hero fades out fast on scroll start
  const heroY = progress * -60;

  return (
    <section
      ref={sectionRef}
      id="showcase"
      style={{ height:`${FRAME_COUNT * scrollMultiplier}px`, position:'relative', background:CANVAS_BG }}
    >
      {/* Loading bar — shown before frames ready */}
      {!ready && (
        <div style={{position:'sticky',top:0,height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:CANVAS_BG,zIndex:30}}>
          <div style={{marginBottom:'24px'}}>
            <NextImage src="/arialogo.png" alt="Aria" width={64} height={64}
              style={{objectFit:'contain', mixBlendMode:'screen'}} />
          </div>
          <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.15em',color:'rgba(255,77,90,0.7)',textTransform:'uppercase',marginBottom:'16px'}}>
            Loading experience…
          </span>
          <div style={{width:'200px',height:'1px',background:'rgba(255,255,255,0.06)'}}>
            <div style={{height:'100%',width:`${loadPct}%`,background:'linear-gradient(90deg,#7A0C14,#C1121F,#FF4D5A)',transition:'width .08s linear'}}/>
          </div>
          <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'12px',color:'#C1121F',marginTop:'10px'}}>{loadPct}%</span>
        </div>
      )}

      {ready && (
        <div style={{position:'sticky',top:0,height:'100vh',overflow:'hidden',background:CANVAS_BG}}>

          {/* ── Canvas (always behind everything) ─────────────── */}
          <canvas ref={canvasRef} role="img" aria-label="Aria product"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block',background:CANVAS_BG}} />

          {/* Edge blends */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:'100px',background:'linear-gradient(to bottom,#040404,transparent)',pointerEvents:'none',zIndex:5}}/>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'100px',background:'linear-gradient(to top,#040404,transparent)',pointerEvents:'none',zIndex:5}}/>

          {/* ── HERO overlay — visible at progress 0, fades out ─ */}
          <div style={{position:'absolute',inset:0,zIndex:20,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'0 24px',opacity:heroOpacity,transform:`translateY(${heroY}px)`,pointerEvents:heroOpacity<0.05?'none':'auto',transition:'none'}}>

            {/* Logo — mix-blend-mode:screen removes the black box */}
            <div style={{marginBottom:'20px',filter:'drop-shadow(0 0 40px rgba(193,18,31,0.6))'}}>
              <NextImage src="/arialogo.png" alt="Aria Logo" width={110} height={110}
                style={{objectFit:'contain', mixBlendMode:'screen'}} />
            </div>

            <div style={{marginBottom:'24px'}}>
              <span style={{
                display:'inline-flex',alignItems:'center',gap:'8px',
                fontFamily:'var(--font-jetbrains)',fontSize:'11px',fontWeight:500,
                letterSpacing:'.15em',textTransform:'uppercase',color:'#FF4D5A',
                background:'rgba(193,18,31,0.10)',border:'1px solid rgba(193,18,31,0.2)',
                borderRadius:'100px',padding:'6px 14px',
              }}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',flexShrink:0,animation:'pulseRed 2s ease-in-out infinite'}}/>
                Now live — for college students
              </span>
            </div>

            <h1 style={{
              fontFamily:'var(--font-syne)',fontWeight:800,
              fontSize:'clamp(2.8rem,7vw,6.5rem)',lineHeight:1.02,
              color:'#F0F0F0',marginBottom:'20px',
              textShadow:'0 2px 60px rgba(0,0,0,0.9)',
            }}>
              Your College.<br/>
              <span style={{background:'linear-gradient(135deg,#fff 0%,#FF4D5A 50%,#C1121F 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                Powered by AI.
              </span>
            </h1>

            <p style={{maxWidth:'520px',fontSize:'18px',lineHeight:1.75,color:'rgba(200,200,210,0.7)',marginBottom:'36px',fontFamily:'var(--font-dm)',textShadow:'0 1px 20px rgba(0,0,0,0.8)'}}>
              Attendance tracking, distraction-free learning, community & floating AI —
              all running locally on your device.
            </p>

            <div style={{display:'flex',gap:'16px',flexWrap:'wrap',justifyContent:'center'}}>
              <a href="#early-access" style={{textDecoration:'none'}}>
                <button className="btn-primary" style={{fontSize:'16px',padding:'16px 36px'}}>Get Early Access →</button>
              </a>
              <button className="btn-ghost" style={{fontSize:'16px',padding:'16px 36px'}}
                onClick={()=>window.scrollBy({top:window.innerHeight*2,behavior:'smooth'})}>
                See How It Works ↓
              </button>
            </div>

            {/* Scroll hint */}
            <div style={{position:'absolute',bottom:'32px',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',opacity:0.5}}>
              <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'9px',letterSpacing:'0.3em',textTransform:'uppercase',color:'rgba(140,140,160,0.6)'}}>scroll to explore</span>
              <div style={{width:'1px',height:'40px',overflow:'hidden',background:'rgba(255,255,255,0.06)'}}>
                <motion.div style={{height:'100%',background:'linear-gradient(to bottom,#C1121F,transparent)'}}
                  animate={{y:['-100%','200%']}} transition={{duration:1.2,repeat:Infinity,ease:'linear'}}/>
              </div>
            </div>
          </div>

          {/* ── Parallax text layers ──────────────────────────── */}
          {TEXT_LAYERS.slice(1).map((layer, i) => {
            const op = getOpacity(progress, layer.from, layer.to);
            const y  = getY(progress, layer.from, layer.to);
            const pos: React.CSSProperties = isMobile
              ? { left: '5%', right: '5%', bottom: '15%', transform: `translateY(${y}px)` }
              : layer.side==='left'   ? {left:'5%',  top:'50%', transform:`translateY(calc(-50% + ${y}px))`} :
                layer.side==='right'  ? {right:'5%', top:'25%', transform:`translateY(calc(-50% + ${y}px))`} :
                                        {left:'50%', bottom:'10%',transform:`translateX(-50%) translateY(${y}px)`};
            return (
              <div key={i} style={{position:'absolute',zIndex:15,maxWidth:isMobile ? 'none' : '400px',pointerEvents:'none',opacity:op,willChange:'opacity,transform',...pos}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:'8px',fontFamily:'var(--font-jetbrains)',fontSize:'10px',fontWeight:500,letterSpacing:'.15em',textTransform:'uppercase',color:'#FF4D5A',background:'rgba(193,18,31,0.10)',border:'1px solid rgba(193,18,31,0.2)',borderRadius:'100px',padding:'5px 12px',marginBottom:'14px'}}>
                  {layer.label}
                </div>
                <h2 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'clamp(1.8rem,3.5vw,3rem)',lineHeight:1.05,color:'#F0F0F0',textShadow:'0 2px 40px rgba(0,0,0,0.95)',marginBottom:'14px',whiteSpace:'pre-line'}}>
                  {layer.headline}
                </h2>
                <p style={{fontFamily:'var(--font-dm)',fontSize:'14px',lineHeight:1.7,color:'rgba(200,200,210,0.75)',textShadow:'0 1px 20px rgba(0,0,0,0.9)',background:'rgba(4,4,4,0.6)',backdropFilter:'blur(12px)',padding:'12px 16px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.06)'}}>
                  {layer.body}
                </p>
              </div>
            );
          })}

          {/* Progress dots */}
          <div style={{position:'absolute',right:'28px',top:'50%',transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:'8px',zIndex:20}}>
            {TEXT_LAYERS.map((l,i)=>{
              const active = progress>=l.from && progress<=l.to;
              return <div key={i} style={{width:'4px',height:active?'20px':'4px',borderRadius:'2px',background:active?'#C1121F':'rgba(255,255,255,0.12)',transition:'all .3s',boxShadow:active?'0 0 10px rgba(193,18,31,0.6)':'none'}}/>;
            })}
          </div>

          {/* Frame counter */}
          <div style={{position:'absolute',bottom:'36px',right:'36px',fontFamily:'var(--font-jetbrains)',fontSize:'10px',letterSpacing:'0.12em',color:'rgba(140,140,160,0.3)',zIndex:20}}>
            {String(frameIdxRef.current+1).padStart(3,'0')}/{FRAME_COUNT}
          </div>
        </div>
      )}
    </section>
  );
}
