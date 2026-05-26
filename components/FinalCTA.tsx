'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function FinalCTA() {
  const btnRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [msg, setMsg] = useState('');

  const onMagMove = (e: React.MouseEvent) => {
    const el = btnRef.current!;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-(r.left+r.width/2))*0.3}px,${(e.clientY-(r.top+r.height/2))*0.3}px)`;
    el.style.transition = 'transform .1s linear';
  };
  const onMagLeave = () => {
    const el = btnRef.current!;
    el.style.transform = 'translate(0,0)';
    el.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';
  };

  const submit = async () => {
    if (!email && !phone) { setStatus('error'); setMsg('Enter your email or phone number.'); return; }
    if (email && !email.includes('@')) { setStatus('error'); setMsg('Enter a valid email.'); return; }
    setStatus('loading');
    try {
      const res = await fetch('/api/early-access', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: email || undefined, phone: phone || undefined }),
      });
      if (res.ok) { setStatus('success'); setMsg("You're on the list! We'll reach out soon. 🎉"); setEmail(''); setPhone(''); }
      else { setStatus('error'); setMsg('Something went wrong. Try again.'); }
    } catch { setStatus('error'); setMsg('Connection error — make sure the backend is running.'); }
  };

  return (
    <section id="early-access" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', position:'relative', overflow:'hidden', background:'radial-gradient(ellipse at center top, #1a0507 0%, #0a0a0a 50%, #040404 100%)' }}>
      {/* Grid */}
      <div className="grid-bg" style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.6 }} />
      <div style={{ position:'absolute', width:'700px', height:'700px', borderRadius:'50%', background:'radial-gradient(circle, rgba(193,18,31,0.10) 0%, transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', maxWidth:'700px', width:'100%' }}>
        <motion.span className="section-label" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ display:'inline-flex', marginBottom:'32px' }}>
          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--green)', animation:'pulseRed 2s ease-in-out infinite' }} />
          Limited Early Access — RGPV Students First
        </motion.span>

        <motion.h2 initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.1, duration:.7 }}
          style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'clamp(3rem,10vw,7.5rem)', lineHeight:0.95, letterSpacing:'-0.02em', marginBottom:'24px' }}>
          <span className="gradient-text">Stop</span><br />
          <span style={{ color:'#F0F0F0' }}>calculating</span><br />
          <span className="gradient-text">attendance.</span>
        </motion.h2>

        <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.25 }}
          style={{ color:'var(--text2)', fontSize:'18px', lineHeight:1.7, maxWidth:'500px', marginBottom:'48px' }}>
          Join the waitlist. Be first at LNCT and RGPV.
          We are onboarding Bhopal colleges first.
        </motion.p>

        {/* Form */}
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.35 }}
          style={{ display:'flex', flexDirection:'column', gap:'12px', width:'100%', maxWidth:'480px', marginBottom:'24px' }}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@college.edu"
            onKeyDown={e=>e.key==='Enter'&&submit()}
            style={{ padding:'14px 18px', borderRadius:'12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#F0F0F0', fontFamily:'var(--font-dm)', fontSize:'15px', outline:'none', transition:'border-color .2s' }}
            onFocus={e=>(e.target.style.borderColor='#C1121F')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}
          />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Or your WhatsApp number (+91...)"
            onKeyDown={e=>e.key==='Enter'&&submit()}
            style={{ padding:'14px 18px', borderRadius:'12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#F0F0F0', fontFamily:'var(--font-dm)', fontSize:'15px', outline:'none', transition:'border-color .2s' }}
            onFocus={e=>(e.target.style.borderColor='#C1121F')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}
          />
          <div ref={btnRef} onMouseMove={onMagMove} onMouseLeave={onMagLeave} style={{ display:'inline-block' }}>
            <button onClick={submit} disabled={status==='loading'} className="btn-primary" style={{ width:'100%', fontSize:'17px', padding:'18px 40px' }}>
              {status==='loading' ? 'Joining waitlist…' : 'Join Waitlist →'}
            </button>
          </div>
        </motion.div>

        {msg && (
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ fontFamily:'var(--font-jetbrains)', fontSize:'13px', color: status==='success' ? 'var(--green)' : '#FF4D5A', marginBottom:'24px' }}>
            {msg}
          </motion.p>
        )}

        {/* Social proof */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ display:'flex' }}>
            {['RV','PS','AP','SM','VT'].map((a,i) => (
              <div key={a} style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg, #C1121F, #7A0C14)', border:'2px solid #040404', marginLeft:i>0?'-8px':0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-syne)', fontWeight:700, fontSize:'10px', color:'#fff' }}>{a}</div>
            ))}
          </div>
          <p style={{ fontFamily:'var(--font-dm)', fontSize:'13px', color:'var(--text2)' }}>
            <strong style={{ color:'#F0F0F0' }}>200+ students</strong> already on the waitlist
          </p>
        </div>
      </div>
    </section>
  );
}
