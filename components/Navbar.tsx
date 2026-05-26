'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const LINKS = [
  { label:'Attendance', href:'/attendance' },
  { label:'AI Tutor',   href:'/tutor'      },
  { label:'Community',  href:'/community'  },
  { label:'Dashboard',  href:'/dashboard'  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Magnetic CTA
  useEffect(() => {
    const el = btnRef.current; if(!el) return;
    const move  = (e:MouseEvent) => {
      const r = el.getBoundingClientRect();
      el.style.transform  = `translate(${(e.clientX-(r.left+r.width/2))*.28}px,${(e.clientY-(r.top+r.height/2))*.28}px)`;
      el.style.transition = 'transform .1s linear';
    };
    const leave = () => { el.style.transform='translate(0,0)'; el.style.transition='transform .5s cubic-bezier(.23,1,.32,1)'; };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, []);

  return (
    <motion.nav
      className={`navbar ${scrolled?'scrolled':''}`}
      initial={{ y:-80, opacity:0 }}
      animate={{ y:0, opacity:1 }}
      transition={{ duration:.7, delay:.3, ease:[.16,1,.3,1] }}
    >
      {/* Logo */}
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
        <div style={{ position:'relative', width:'32px', height:'32px',
          filter:'drop-shadow(0 0 10px rgba(193,18,31,0.7))' }}>
          <Image src="/arialogo.png" alt="Aria Logo" fill
            style={{ objectFit:'contain', mixBlendMode:'screen' }} />
        </div>
        <span style={{ fontFamily:'var(--font-syne)', fontWeight:800, fontSize:'20px',
          letterSpacing:'0.1em', color:'#F0F0F0' }}>ARIA</span>
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex" style={{ display:'flex', alignItems:'center', gap:'28px', listStyle:'none' }}>
        {LINKS.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="nav-link" style={{ textDecoration:'none' }}>{l.label}</Link>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="hidden md:flex" style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <Link href="/test" style={{ textDecoration:'none' }}>
          <button style={{ padding:'8px 14px', borderRadius:'8px', background:'transparent',
            border:'1px solid rgba(255,255,255,0.08)', color:'rgba(140,140,160,0.5)',
            fontFamily:'var(--font-jetbrains)', fontSize:'11px', cursor:'pointer',
            letterSpacing:'0.08em', transition:'all .2s' }}
            onMouseEnter={e=>{(e.target as HTMLButtonElement).style.borderColor='rgba(193,18,31,0.35)';(e.target as HTMLButtonElement).style.color='rgba(255,77,90,0.7)';}}
            onMouseLeave={e=>{(e.target as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.08)';(e.target as HTMLButtonElement).style.color='rgba(140,140,160,0.5)';}}>
            System Test
          </button>
        </Link>
        <div ref={btnRef}>
          <Link href="#early-access" style={{ textDecoration:'none' }}>
            <button className="btn-primary" style={{ padding:'10px 22px', fontSize:'14px' }}>
              Get Early Access
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)}
        className="flex md:hidden"
        style={{ background:'none', border:'none', cursor:'pointer', flexDirection:'column', gap:'5px', padding:'8px' }}>
        <span style={{ display:'block', width:'22px', height:'2px', background:'#F0F0F0', borderRadius:'1px',
          transition:'all .3s', transform:open?'rotate(45deg) translateY(7px)':'' }}/>
        <span style={{ display:'block', width:'16px', height:'2px', background:'#F0F0F0', borderRadius:'1px',
          transition:'all .3s', opacity:open?0:1 }}/>
        <span style={{ display:'block', width:'22px', height:'2px', background:'#F0F0F0', borderRadius:'1px',
          transition:'all .3s', transform:open?'rotate(-45deg) translateY(-7px)':'' }}/>
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            className="absolute top-full left-0 right-0 flex flex-col gap-4 px-8 py-6 md:hidden"
            style={{ background:'rgba(4,4,4,0.98)', borderBottom:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(20px)' }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className="nav-link text-base"
                onClick={() => setOpen(false)} style={{ textDecoration:'none' }}>{l.label}</Link>
            ))}
            <Link href="/test" style={{ textDecoration:'none' }}>
              <span className="nav-link text-base" style={{ color:'rgba(193,18,31,0.6)' }}>System Test</span>
            </Link>
            <Link href="#early-access" style={{ textDecoration:'none' }}>
              <button className="btn-primary w-full mt-1">Get Early Access</button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
