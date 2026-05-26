'use client';
import { useEffect } from 'react';
import Link from 'next/link';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{minHeight:'100vh',background:'#040404',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-dm)',textAlign:'center',padding:'24px'}}>
      <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.2em',color:'rgba(255,77,90,0.7)',textTransform:'uppercase',marginBottom:'16px'}}>Something went wrong</p>
      <h1 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'clamp(2rem,4vw,3rem)',color:'#F0F0F0',marginBottom:'16px'}}>Aria hit an error.</h1>
      <p style={{color:'rgba(140,140,160,0.5)',fontSize:'14px',fontFamily:'var(--font-jetbrains)',maxWidth:'400px',marginBottom:'32px',background:'rgba(255,77,90,0.06)',padding:'12px 16px',borderRadius:'10px',border:'1px solid rgba(255,77,90,0.15)'}}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div style={{display:'flex',gap:'12px'}}>
        <button onClick={reset} style={{padding:'12px 28px',borderRadius:'10px',background:'linear-gradient(145deg,#C1121F,#7A0C14)',border:'none',color:'#fff',fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'14px',cursor:'pointer'}}>Try Again</button>
        <Link href="/" style={{textDecoration:'none'}}><button style={{padding:'12px 28px',borderRadius:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(200,200,210,0.7)',fontFamily:'var(--font-dm)',fontSize:'14px',cursor:'pointer'}}>Go Home</button></Link>
      </div>
    </div>
  );
}
