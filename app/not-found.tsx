'use client';
import Link from 'next/link';
import Image from 'next/image';
export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',background:'#040404',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-dm)',textAlign:'center',padding:'24px'}}>
      <div style={{width:'80px',height:'80px',position:'relative',marginBottom:'24px',filter:'drop-shadow(0 0 30px rgba(193,18,31,0.5))'}}>
        <Image src="/arialogo.png" alt="Aria" fill style={{objectFit:'contain',mixBlendMode:'screen'}}/>
      </div>
      <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.2em',color:'rgba(193,18,31,0.7)',textTransform:'uppercase',marginBottom:'16px'}}>404 — Page Not Found</p>
      <h1 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'clamp(2rem,5vw,4rem)',color:'#F0F0F0',marginBottom:'16px',lineHeight:1.1}}>
        This page<br/>doesn&apos;t exist.
      </h1>
      <p style={{color:'rgba(140,140,160,0.5)',fontSize:'16px',maxWidth:'360px',lineHeight:1.7,marginBottom:'36px'}}>
        Looks like you wandered off. Let Aria bring you back.
      </p>
      <Link href="/" style={{textDecoration:'none'}}>
        <button style={{padding:'14px 32px',borderRadius:'12px',background:'linear-gradient(145deg,#C1121F,#7A0C14)',border:'none',color:'#fff',fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'15px',cursor:'pointer',boxShadow:'0 8px 32px rgba(193,18,31,0.35)'}}>
          Back to Home →
        </button>
      </Link>
    </div>
  );
}
