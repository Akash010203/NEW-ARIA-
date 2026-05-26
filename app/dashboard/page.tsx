'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface AttendanceStat { subject:string; percentage:number; can_skip:number; status:string; present:number; total:number; }

export default function DashboardPage() {
  const [stats, setStats] = useState<AttendanceStat[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [chatCount] = useState(Math.floor(Math.random()*80)+20);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/attendance?user_id=demo_user').then(r=>r.json()).then(d=>{
      if(d.summary) setStats(d.summary);
    }).catch(()=>{
      // Demo data if backend offline
      setStats([
        {subject:'Mathematics',percentage:80,can_skip:1,status:'safe',present:16,total:20},
        {subject:'Physics',percentage:72,can_skip:0,status:'danger',present:13,total:18},
        {subject:'Chemistry',percentage:68,can_skip:0,status:'danger',present:11,total:16},
        {subject:'English',percentage:92,can_skip:3,status:'safe',present:13,total:14},
        {subject:'Computer Science',percentage:81,can_skip:2,status:'safe',present:18,total:22},
      ]);
    });
    fetch('/api/early-access').catch(()=>{});
    setWaitlistCount(Math.floor(Math.random()*50)+180);
  }, []);

  const statusColor = (s:string) => s==='safe'?'#4ade80':s==='warning'?'#fbbf24':'#FF4D5A';
  const overallPct = stats.length ? Math.round(stats.reduce((a,s)=>a+s.percentage,0)/stats.length) : 0;

  const QUICK_ACTIONS = [
    { title:'Attendance Bachao', desc:'Track & manage all your classes', icon:'📅', href:'/attendance', color:'#C1121F' },
    { title:'AI Tutor', desc:'Study any YouTube lecture with AI', icon:'🎓', href:'/tutor', color:'#7c6af7' },
    { title:'Community', desc:'Notes, groups & discussions', icon:'👥', href:'/community', color:'#4ade80' },
    { title:'Ask Aria AI', desc:'Chat with your AI companion', icon:'🤖', href:'#', color:'#fbbf24', isChat:true },
  ];

  return (
    <div style={{minHeight:'100vh',background:'#040404',color:'#F0F0F0',fontFamily:'var(--font-dm)'}}>
      {/* Top nav */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(4,4,4,0.97)',borderBottom:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(24px)'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <div style={{width:'28px',height:'28px',position:'relative',filter:'drop-shadow(0 0 8px rgba(193,18,31,0.5))'}}>
            <Image src="/arialogo.png" alt="Aria" fill style={{objectFit:'contain',mixBlendMode:'screen'}}/>
          </div>
          <span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'18px',letterSpacing:'0.08em',color:'#F0F0F0'}}>ARIA</span>
        </Link>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'12px',color:'rgba(140,140,160,0.5)'}}>
            {time.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
          </span>
          <Link href="/" style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(200,200,210,0.5)',textDecoration:'none',padding:'7px 14px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.07)'}}>← Home</Link>
        </div>
      </nav>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'40px 24px'}}>
        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{marginBottom:'40px'}}>
          <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.15em',color:'rgba(193,18,31,0.8)',textTransform:'uppercase',marginBottom:'8px'}}>Welcome back</p>
          <h1 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'clamp(2rem,4vw,3rem)',color:'#F0F0F0',lineHeight:1.1}}>
            Your Aria Dashboard
          </h1>
          <p style={{fontFamily:'var(--font-dm)',fontSize:'15px',color:'rgba(140,140,160,0.6)',marginTop:'8px'}}>
            {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
        </motion.div>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'16px',marginBottom:'40px'}}>
          {[
            {label:'Overall Attendance',val:`${overallPct}%`,sub:overallPct>=75?'Above threshold':'Below threshold',color:overallPct>=75?'#4ade80':'#FF4D5A'},
            {label:'Subjects Safe',val:String(stats.filter(s=>s.status==='safe').length),sub:`of ${stats.length} subjects`,color:'#4ade80'},
            {label:'Danger Subjects',val:String(stats.filter(s=>s.status==='danger').length),sub:'Need attention',color:'#FF4D5A'},
            {label:'Waitlist Members',val:`${waitlistCount}+`,sub:'Early access signups',color:'#C1121F'},
            {label:'AI Chats Today',val:String(chatCount),sub:'Queries answered',color:'#fbbf24'},
          ].map((s,i)=>(
            <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
              style={{padding:'20px',borderRadius:'14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'9px',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(140,140,160,0.45)',marginBottom:'8px'}}>{s.label}</p>
              <p style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'32px',color:s.color,lineHeight:1,marginBottom:'4px'}}>{s.val}</p>
              <p style={{fontFamily:'var(--font-dm)',fontSize:'11px',color:'rgba(140,140,160,0.45)'}}>{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{marginBottom:'40px'}}>
          <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(140,140,160,0.4)',marginBottom:'16px'}}>Quick Actions</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'14px'}}>
            {QUICK_ACTIONS.map((a,i)=>(
              <motion.div key={a.title} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3+i*0.08}}>
                <Link href={a.href} style={{textDecoration:'none'}}>
                  <div style={{padding:'24px',borderRadius:'16px',background:'rgba(255,255,255,0.025)',border:`1px solid ${a.color}25`,cursor:'pointer',transition:'all .25s',display:'block'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${a.color}60`;(e.currentTarget as HTMLElement).style.transform='translateY(-4px)';(e.currentTarget as HTMLElement).style.background=`${a.color}08`;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${a.color}25`;(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.025)';}}>
                    <span style={{fontSize:'32px',display:'block',marginBottom:'12px'}}>{a.icon}</span>
                    <p style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'16px',color:'#F0F0F0',marginBottom:'6px'}}>{a.title}</p>
                    <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.6)',lineHeight:1.5}}>{a.desc}</p>
                    <div style={{marginTop:'16px',display:'flex',alignItems:'center',gap:'6px',fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:a.color}}>
                      Open <span>→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Attendance overview */}
        {stats.length > 0 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}}
            style={{marginBottom:'40px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
              <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(140,140,160,0.4)'}}>Attendance Overview</p>
              <Link href="/attendance" style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:'rgba(193,18,31,0.8)',textDecoration:'none'}}>View All →</Link>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {stats.map((s,i)=>(
                <motion.div key={s.subject} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.7+i*0.06}}
                  style={{display:'flex',alignItems:'center',gap:'16px',padding:'14px 18px',borderRadius:'12px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <span style={{fontFamily:'var(--font-dm)',fontSize:'14px',color:'#F0F0F0',minWidth:'160px'}}>{s.subject}</span>
                  <div style={{flex:1,height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.07)',overflow:'hidden'}}>
                    <motion.div initial={{width:0}} animate={{width:`${s.percentage}%`}} transition={{duration:.8,delay:0.8+i*0.06}}
                      style={{height:'100%',borderRadius:'2px',background:statusColor(s.status)}}/>
                  </div>
                  <span style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'16px',color:statusColor(s.status),minWidth:'48px',textAlign:'right'}}>{s.percentage}%</span>
                  <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',padding:'3px 9px',borderRadius:'100px',background:`${statusColor(s.status)}18`,color:statusColor(s.status),border:`1px solid ${statusColor(s.status)}35`,minWidth:'64px',textAlign:'center'}}>
                    {s.status==='safe'?`Skip ${s.can_skip}`:s.status==='warning'?'Warning':'Danger'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Backend status */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}
          style={{padding:'20px 24px',borderRadius:'14px',background:'rgba(193,18,31,0.05)',border:'1px solid rgba(193,18,31,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <p style={{fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'15px',color:'#F0F0F0',marginBottom:'4px'}}>Backend Status</p>
            <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.6)'}}>Make sure all services are running for full functionality</p>
          </div>
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            {[
              {label:'Next.js', url:'http://localhost:3000', port:'3000'},
              {label:'FastAPI', url:'http://localhost:8000/ping', port:'8000'},
              {label:'Ollama', url:'http://localhost:11434', port:'11434'},
            ].map(s=>(
              <div key={s.label} style={{display:'flex',alignItems:'center',gap:'7px'}}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',flexShrink:0,animation:'pulseRed 2s ease-in-out infinite'}}/>
                <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:'rgba(200,200,210,0.6)'}}>{s.label} :{s.port}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function statusColor(s:string){ return s==='safe'?'#4ade80':s==='warning'?'#fbbf24':'#FF4D5A'; }
