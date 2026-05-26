'use client';
import { useEffect } from 'react';
export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: import('lenis').default | null = null;
    let raf: number;
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ duration:1.1, easing:(t:number)=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true });
      const tick = (t: number) => { lenis!.raf(t); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    });
    return () => { lenis?.destroy(); cancelAnimationFrame(raf); };
  }, []);
  return <>{children}</>;
}
