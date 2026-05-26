'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const STEPS = [
  { n:'01', title:'Set Up Your Timetable', desc:'Enter your subjects and weekly schedule once — or photograph your printed timetable and let AI parse it automatically. 2 minutes. Works for any university.', detail:'Photo your timetable → AI reads it instantly' },
  { n:'02', title:'Mark Attendance Daily', desc:'One tap per class. Aria calculates your exact standing per subject, per day, per month — and warns you in real-time before you cross a danger threshold.', detail:'Green = safe · Yellow = careful · Red = danger' },
  { n:'03', title:'Let Aria Handle the Rest', desc:'WhatsApp alerts. Attendance projections until exams. AI tutor. Community. Floating AI. Everything connected, everything working together.', detail:'One app · Four tools · Zero manual math' },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:'-80px' });
  return (
    <section id="how-it-works" style={{ padding:'120px 24px', background:'#080808', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'80px' }}>
          <motion.span className="section-label" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ display:'inline-flex', marginBottom:'20px' }}>
            How It Works
          </motion.span>
          <motion.h2 initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.1 }}
            style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'clamp(2.2rem,5vw,3.8rem)', lineHeight:1.05, color:'#F0F0F0' }}>
            <span className="gradient-text">Three steps</span> to never<br />get detained again.
          </motion.h2>
        </div>

        <div ref={ref} style={{ position:'relative' }}>
          {/* Connector line (desktop) */}
          <div className="hidden md:block" style={{ position:'absolute', top:'32px', left:'17%', right:'17%', height:'2px', zIndex:0 }}>
            <div style={{ width:'100%', height:'100%', background:'rgba(255,255,255,0.05)', borderRadius:'1px' }} />
            <motion.div
              style={{ position:'absolute', top:0, left:0, height:'100%', background:'linear-gradient(90deg, #7A0C14, #C1121F, #FF4D5A)', borderRadius:'1px' }}
              initial={{ width:'0%' }} animate={inView ? { width:'100%' } : { width:'0%' }}
              transition={{ duration:1.4, delay:0.5, ease:'easeInOut' }}
            />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'32px', position:'relative', zIndex:1 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity:0, y:50 }}
                animate={inView ? { opacity:1, y:0 } : {}}
                transition={{ duration:0.65, delay:0.3+i*0.2, ease:[0.16,1,0.3,1] }}
                style={{ display:'flex', flexDirection:'column', gap:'20px' }}
              >
                <div style={{
                  width:'64px', height:'64px', borderRadius:'50%', border:`2px solid ${i===0 ? '#C1121F' : 'rgba(255,255,255,0.1)'}`,
                  background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: i===0 ? '0 0 30px rgba(193,18,31,0.25)' : 'none',
                }}>
                  <span style={{ fontFamily:'var(--font-jetbrains)', fontWeight:600, fontSize:'18px', color: i===0 ? '#C1121F' : 'rgba(200,200,210,0.5)' }}>{s.n}</span>
                </div>
                <div className="glass-card" style={{ flex:1, padding:'24px', borderColor: i===0 ? 'rgba(193,18,31,0.3)' : undefined }}>
                  <h3 style={{ fontFamily:'var(--font-syne)', fontWeight:700, fontSize:'18px', color:'#F0F0F0', marginBottom:'10px' }}>{s.title}</h3>
                  <p style={{ fontFamily:'var(--font-dm)', fontSize:'14px', lineHeight:1.7, color:'var(--text2)', marginBottom:'16px' }}>{s.desc}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', borderRadius:'8px', background:'rgba(193,18,31,0.06)', border:'1px solid rgba(193,18,31,0.12)' }}>
                    <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#C1121F', flexShrink:0 }} />
                    <span style={{ fontFamily:'var(--font-jetbrains)', fontSize:'11px', color:'#FF4D5A' }}>{s.detail}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
