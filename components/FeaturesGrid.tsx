'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const FEATURES = [
  { n:'01', title:'Attendance Bachao', badge:'Smart Tracker', desc:'Enter your timetable once. Aria tracks every class and tells you exactly how many you can skip per subject before hitting 75% — or your custom threshold.',
    icon:<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#FF4D5A" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round"/></svg> },
  { n:'02', title:'AI Tutor Mode', badge:'Focus Learn', desc:'Paste any YouTube link. Clean player — no ads, no sidebar. A side-panel AI tutor has watched the entire video and answers any question instantly.',
    icon:<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#FF4D5A" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4V8z" fill="#FF4D5A"/></svg> },
  { n:'03', title:'No Disturb Mode', badge:'Deep Focus', desc:'Aria acts as a strict teacher. Blocks social media and non-study sites. Webcam monitors your presence. Pomodoro timer auto-manages study and break cycles.',
    icon:<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#FF4D5A" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg> },
  { n:'04', title:'Community Hub', badge:'Social', desc:'Share notes, PDFs, and video lectures. AI scans every upload. Search like YouTube. Build private study groups. One-on-one messaging. AI moderates abuse in real-time.',
    icon:<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#FF4D5A" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { n:'05', title:'Floating AI', badge:'Always On', desc:'A persistent AI assistant that floats over every screen. Remembers your chats, watched videos, your roadmap, and your attendance — all stored locally, never in cloud.',
    icon:<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#FF4D5A" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 14h5" strokeLinecap="round"/></svg> },
  { n:'06', title:'WhatsApp Alerts', badge:'Critical Alerts', desc:'About to skip a class that drops you below 75%? Aria sends a WhatsApp alert before you make the mistake. The feature every student wishes existed.',
    icon:<svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#FF4D5A" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.86-1.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 14.92z"/></svg> },
];

export default function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX-r.left)/r.width)*100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY-r.top)/r.height)*100}%`);
  };

  return (
    <section id="features" style={{ padding:'120px 24px', background:'var(--bg2)', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'72px' }}>
          <motion.span className="section-label" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ display:'inline-flex', marginBottom:'20px' }}>
            What Aria Does
          </motion.span>
          <motion.h2 initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.1 }}
            style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'clamp(2.2rem,5vw,4rem)', lineHeight:1.05, color:'#F0F0F0', marginBottom:'16px' }}>
            Four features.<br /><span className="gradient-text">Zero fluff.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:.2 }}
            style={{ color:'var(--text2)', fontSize:'17px', maxWidth:'500px', margin:'0 auto' }}>
            Built for Indian college students who need real solutions, not another app they&apos;ll forget in a week.
          </motion.p>
        </div>

        <div ref={ref} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'20px' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.n}
              className="feature-card"
              onMouseMove={onMouseMove}
              initial={{ opacity:0, y:50 }}
              animate={inView ? { opacity:1, y:0 } : {}}
              transition={{ duration:0.6, delay:i*0.08, ease:[0.16,1,0.3,1] }}
              style={i===0 ? { borderColor:'rgba(193,18,31,0.4)', background:'rgba(193,18,31,0.05)' } : {}}
            >
              {i===0 && <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, #C1121F, transparent)' }} />}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(193,18,31,0.1)', border:'1px solid rgba(193,18,31,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {f.icon}
                </div>
                <span style={{ fontFamily:'var(--font-jetbrains)', fontSize:'10px', letterSpacing:'0.15em', background:'rgba(193,18,31,0.1)', color:'#FF4D5A', border:'1px solid rgba(255,77,90,0.2)', borderRadius:'100px', padding:'4px 10px', textTransform:'uppercase' }}>{f.badge}</span>
              </div>
              <span style={{ fontFamily:'var(--font-jetbrains)', fontSize:'11px', color:'rgba(140,140,160,0.4)', display:'block', marginBottom:'8px' }}>{f.n}</span>
              <h3 style={{ fontFamily:'var(--font-syne)', fontWeight:700, fontSize:'18px', color:'#F0F0F0', marginBottom:'10px' }}>{f.title}</h3>
              <p style={{ fontFamily:'var(--font-dm)', fontSize:'14px', lineHeight:1.7, color:'var(--text2)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
