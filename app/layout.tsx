import type { Metadata } from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({ subsets:['latin'], weight:['400','500','600','700','800'], variable:'--font-syne', display:'swap' });
const dmSans = DM_Sans({ subsets:['latin'], weight:['300','400','500','600'], variable:'--font-dm-sans', display:'swap' });
const jetbrains = JetBrains_Mono({ subsets:['latin'], weight:['300','400','500','600'], variable:'--font-jetbrains', display:'swap' });

export const metadata: Metadata = {
  title: 'Aria — AI for College Students',
  description: 'Track attendance, learn smarter, connect with your college community. Built for Indian college students.',
  keywords: ['Aria', 'AI tutor', 'attendance tracker', 'college AI', 'RGPV', 'LNCT'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <head><meta name="theme-color" content="#040404" /></head>
      <body>
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
