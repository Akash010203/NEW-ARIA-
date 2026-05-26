'use client';
import Image from 'next/image';

const LINKS = {
  Product: [['Attendance Bachao','#features'],['AI Tutor','#features'],['No Disturb','#features'],['Community','#features'],['Floating AI','#features']],
  Company: [['About','#'],['Blog','#'],['Careers','#'],['Press','#']],
  Legal: [['Privacy Policy','#'],['Terms of Service','#'],['Cookie Policy','#']],
};

export default function Footer() {
  return (
    <footer style={{ background:'var(--bg)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'72px 48px 32px' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr', gap:'48px', marginBottom:'64px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <div style={{ position:'relative', width:'28px', height:'28px', filter:'drop-shadow(0 0 8px rgba(193,18,31,0.5))' }}>
                <Image src="/arialogo.png" alt="Aria" fill style={{ objectFit:'contain' }} />
              </div>
              <span style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'18px', letterSpacing:'0.08em', color:'#F0F0F0' }}>ARIA</span>
            </div>
            <p style={{ fontFamily:'var(--font-dm)', fontSize:'13px', color:'var(--text3)', lineHeight:1.7, maxWidth:'200px', marginBottom:'20px' }}>
              AI-powered tools built specifically for Indian college students.
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', animation:'pulseRed 2s ease-in-out infinite' }} />
              <span style={{ fontFamily:'var(--font-jetbrains)', fontSize:'10px', color:'var(--text3)' }}>Systems operational</span>
            </div>
          </div>

          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p style={{ fontFamily:'var(--font-jetbrains)', fontSize:'10px', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text3)', marginBottom:'20px' }}>{section}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {links.map(([label, href]) => (
                  <a key={label} href={href} style={{ fontFamily:'var(--font-dm)', fontSize:'13px', color:'var(--text3)', textDecoration:'none', transition:'color .2s' }}
                    onMouseEnter={e=>(e.currentTarget.style.color='#F0F0F0')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text3)')}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ width:'100%', height:'1px', background:'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)', marginBottom:'24px' }} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
          <p style={{ fontFamily:'var(--font-jetbrains)', fontSize:'11px', color:'var(--text3)' }}>© {new Date().getFullYear()} Aria. Built with ❤️ in Bhopal, India.</p>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', fontFamily:'var(--font-jetbrains)', fontSize:'11px', color:'var(--text3)' }}>
            Made for college students across India
            <span style={{ padding:'2px 8px', borderRadius:'4px', background:'rgba(193,18,31,0.1)', color:'#FF4D5A', border:'1px solid rgba(193,18,31,0.2)', fontSize:'10px' }}>v0.1 BETA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
