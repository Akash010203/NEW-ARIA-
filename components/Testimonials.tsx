'use client';
import { motion } from 'framer-motion';

const T = [
  { name:'Rohan Verma', role:'B.Tech CSE, 3rd Year', av:'RV', text:'I nearly got detained in Chemistry. Aria would have literally saved my semester. The WhatsApp alert is the killer feature.' },
  { name:'Priya Srivastava', role:'B.Tech IT, 2nd Year', av:'PS', text:'The AI Tutor mode is insane. I paste a YouTube link, it removes all ads and gives me detailed notes. I studied 3 chapters in one sitting.' },
  { name:'Arjun Pandey', role:'B.Tech ECE, 3rd Year', av:'AP', text:'My friend got a WhatsApp alert before skipping Maths — turned around and went to class. That is the whole value prop. Genius.' },
  { name:'Shreya Mishra', role:'MCA, 1st Year', av:'SM', text:'I shared my semester notes on the community tab and got 200+ downloads in a week. This is exactly what college students need.' },
  { name:'Vikram Tiwari', role:'B.Tech ME, Final Year', av:'VT', text:'No Disturb mode is scary good. Camera watches you, blocks Instagram, closes YouTube. I actually finished my assignment for once.' },
  { name:'Anjali Shukla', role:'B.Tech CSE, 4th Year', av:'AS', text:'The floating AI remembers my entire roadmap. I do not have to explain context every time. It is like having a personal tutor 24/7.' },
  { name:'Harsh Gupta', role:'B.Tech IT, 3rd Year', av:'HG', text:'Finally an app that solves the 75% problem. "You can skip 3 more lectures" is so calming. No more Excel attendance calculators.' },
  { name:'Nidhi Rao', role:'B.Tech CSE, 2nd Year', av:'NR', text:'Built for Indian college students by someone who actually went through it. Every feature solves a real pain point, nothing is filler.' },
];

const DOUBLED = [...T, ...T];

function Card({ t }: { t: typeof T[0] }) {
  return (
    <div className="glass-card" style={{ flexShrink:0, width:'300px', padding:'24px', cursor:'default' }}>
      <div style={{ fontSize:'32px', color:'#C1121F', fontFamily:'var(--font-syne)', lineHeight:1, marginBottom:'12px' }}>&ldquo;</div>
      <p style={{ fontFamily:'var(--font-dm)', fontSize:'14px', lineHeight:1.7, color:'var(--text2)', marginBottom:'20px' }}>{t.text}</p>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg, #C1121F, #7A0C14)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-syne)', fontWeight:700, fontSize:'12px', color:'#fff', flexShrink:0 }}>{t.av}</div>
        <div>
          <p style={{ fontFamily:'var(--font-syne)', fontWeight:600, fontSize:'13px', color:'#F0F0F0', lineHeight:1.2 }}>{t.name}</p>
          <p style={{ fontFamily:'var(--font-jetbrains)', fontSize:'10px', color:'var(--text3)' }}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" style={{ padding:'100px 0', overflow:'hidden', background:'var(--bg)', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ textAlign:'center', padding:'0 24px', marginBottom:'56px' }}>
        <motion.span className="section-label" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ display:'inline-flex', marginBottom:'16px' }}>Student Voices</motion.span>
        <motion.h2 initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.1 }}
          style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'clamp(2rem,4vw,3.5rem)', lineHeight:1.05, color:'#F0F0F0' }}>
          Exactly what students<br /><span className="gradient-text">have been asking for.</span>
        </motion.h2>
      </div>

      {/* Row 1 */}
      <div style={{ position:'relative', marginBottom:'16px' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'100px', background:'linear-gradient(to right, #040404, transparent)', zIndex:10, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'100px', background:'linear-gradient(to left, #040404, transparent)', zIndex:10, pointerEvents:'none' }} />
        <div style={{ overflow:'hidden' }}>
          <div className="marquee-track">{DOUBLED.map((t,i) => <Card key={`a${i}`} t={t} />)}</div>
        </div>
      </div>

      {/* Row 2 reversed */}
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'100px', background:'linear-gradient(to right, #040404, transparent)', zIndex:10, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'100px', background:'linear-gradient(to left, #040404, transparent)', zIndex:10, pointerEvents:'none' }} />
        <div style={{ overflow:'hidden' }}>
          <div className="marquee-track" style={{ animationDuration:'50s', animationDirection:'reverse' }}>
            {[...DOUBLED].reverse().map((t,i) => <Card key={`b${i}`} t={t} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
