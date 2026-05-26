'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const LoadingScreen      = dynamic(() => import('@/components/LoadingScreen'),       { ssr:false });
const SmoothScroll       = dynamic(() => import('@/components/SmoothScrollProvider'),{ ssr:false });
const Navbar             = dynamic(() => import('@/components/Navbar'),              { ssr:false });
const FrameHeroSection   = dynamic(() => import('@/components/FrameHeroSection'),    { ssr:false });
const FeaturesGrid       = dynamic(() => import('@/components/FeaturesGrid'),        { ssr:false });
const AttendanceDemo     = dynamic(() => import('@/components/AttendanceDemo'),      { ssr:false });
const HowItWorks         = dynamic(() => import('@/components/HowItWorks'),          { ssr:false });
const Testimonials       = dynamic(() => import('@/components/Testimonials'),        { ssr:false });
const FinalCTA           = dynamic(() => import('@/components/FinalCTA'),            { ssr:false });
const Footer             = dynamic(() => import('@/components/Footer'),              { ssr:false });
const FloatingAI         = dynamic(() => import('@/components/FloatingAI'),          { ssr:false });

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <LoadingScreen onComplete={() => setLoaded(true)} />
      <div style={{ opacity:loaded?1:0, transition:'opacity 0.5s ease', pointerEvents:loaded?'auto':'none' }}>
        <SmoothScroll>
          <Navbar />
          <main>
            {/* Canvas IS the hero — appears from first scroll pixel */}
            <FrameHeroSection />
            <FeaturesGrid />
            <AttendanceDemo />
            <HowItWorks />
            <Testimonials />
            <FinalCTA />
          </main>
          <Footer />
          <FloatingAI />
        </SmoothScroll>
      </div>
    </>
  );
}
