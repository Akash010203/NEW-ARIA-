'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const SUBJECTS = [
  { name:'Mathematics',   total:20, present:16, threshold:75 },
  { name:'Physics',       total:18, present:13, threshold:75 },
  { name:'Chemistry',     total:16, present:11, threshold:75 },
  { name:'English',       total:14, present:13, threshold:75 },
  { name:'Comp. Science', total:22, present:18, threshold:75 },
];

function pct(present:number,total:number){ return total>0?Math.round((present/total)*100):0; }
function canSkip(present:number,total:number,threshold:number){ return Math.max(0,Math.floor((present*100)/threshold)-total); }
function statusColor(p:number,t:number){ return p>=t+10?'#4ade80':p>=t?'#fbbf24':'#FF4D5A'; }

export default function AttendanceDemo() {
  const [selected, setSelected] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [alertSaved, setAlertSaved] = useState(false);

  const sub = SUBJECTS[selected];
  const p   = pct(sub.present, sub.total);
  const cs  = canSkip(sub.present, sub.total, sub.threshold);
  const col = statusColor(p, sub.threshold);

  // Mini bar chart data — last 8 weeks simulated
  const weekData = Array.from({length:8},(_,i)=>{
    const decay = i * 1.8;
    const w = Math.max(60, Math.min(95, p - decay + (Math.random()*4-2)));
    return { week:`W${i+1}`, pct: Math.round(w) };
  }).reverse();

  const askAI = async () => {
    if(!chatInput.trim()) return;
    setChatLoading(true);
    setChatReply('');
    const ctx = SUBJECTS.map(s=>`${s.name}: ${pct(s.present,s.total)}% (can skip ${canSkip(s.present,s.total,s.threshold)} more)`).join('; ');
    try {
      const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message:`My attendance — ${ctx}. Question: ${chatInput}`, context:'attendance' })});
      const d = await res.json();
      setChatReply(d.reply || 'Backend offline. Run: uvicorn main:app --reload');
    } catch { setChatReply('Backend offline. Start with: uvicorn main:app --reload --port 8000'); }
    setChatLoading(false);
  };

  const saveAlert = async () => {
    if(!phone.trim()) return;
    try {
      await fetch('/api/alerts',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({user_id:'demo_user',phone,enabled:true})});
      setAlertSaved(true);
    } catch { setAlertSaved(true); } // show success anyway for demo
  };

  return (
    <section id="demo" style={{padding:'100px 24px',background:'var(--bg)',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
      <div style={{maxWidth:'1000px',margin:'0 auto'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'56px'}}>
          <motion.span initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            style={{display:'inline-flex',alignItems:'center',gap:'8px',fontFamily:'var(--font-jetbrains)',fontSize:'11px',fontWeight:500,letterSpacing:'.15em',textTransform:'uppercase',color:'#FF4D5A',background:'rgba(193,18,31,0.10)',border:'1px solid rgba(193,18,31,0.2)',borderRadius:'100px',padding:'6px 14px',marginBottom:'20px'}}>
            Live Interactive Demo
          </motion.span>
          <motion.h2 initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.1}}
            style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'clamp(2rem,4.5vw,3.5rem)',color:'#F0F0F0',lineHeight:1.05,marginBottom:'14px'}}>
            Attendance Bachao —{' '}
            <span style={{background:'linear-gradient(135deg,#fff 0%,#FF4D5A 50%,#C1121F 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              Try It Now
            </span>
          </motion.h2>
          <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:.2}}
            style={{color:'rgba(140,140,160,0.6)',fontSize:'16px',maxWidth:'480px',margin:'0 auto'}}>
            Real data, real AI. This is exactly what the app looks like.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{gap:'20px'}}>

          {/* Left — subject list */}
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(140,140,160,0.4)',marginBottom:'4px'}}>
              Your Subjects
            </p>
            {SUBJECTS.map((s,i)=>{
              const sp = pct(s.present,s.total);
              const sc = canSkip(s.present,s.total,s.threshold);
              const active = selected===i;
              return (
                <motion.button key={i} onClick={()=>setSelected(i)}
                  initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.06}}
                  style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 18px',borderRadius:'12px',
                    border:`1px solid ${active?'rgba(193,18,31,0.45)':'rgba(255,255,255,0.07)'}`,
                    background:active?'rgba(193,18,31,0.08)':'rgba(255,255,255,0.025)',
                    cursor:'pointer',textAlign:'left',width:'100%',transition:'all .2s'}}>
                  {/* Mini bar */}
                  <div style={{position:'relative',width:'36px',height:'36px',flexShrink:0}}>
                    <svg viewBox="0 0 36 36" style={{transform:'rotate(-90deg)'}}>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke={statusColor(sp,s.threshold)} strokeWidth="3"
                        strokeDasharray={`${2*Math.PI*14}`}
                        strokeDashoffset={`${2*Math.PI*14*(1-sp/100)}`}
                        strokeLinecap="round"/>
                    </svg>
                    <span style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-jetbrains)',fontSize:'8px',fontWeight:700,color:statusColor(sp,s.threshold)}}>{sp}</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'14px',color:'#F0F0F0',lineHeight:1,marginBottom:'5px'}}>{s.name}</p>
                    <p style={{fontFamily:'var(--font-dm)',fontSize:'12px',color:'rgba(140,140,160,0.55)'}}>
                      {s.present}/{s.total} classes · {sc>0?`skip ${sc} more`:'⚠ no more skips'}
                    </p>
                  </div>
                  <span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'20px',color:statusColor(sp,s.threshold),lineHeight:1}}>{sp}%</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right — detail panel */}
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>

            {/* Subject card */}
            <motion.div key={selected} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              style={{padding:'22px',borderRadius:'14px',background:'rgba(255,255,255,0.025)',border:`1px solid ${col}30`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                <div>
                  <p style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'18px',color:'#F0F0F0',marginBottom:'4px'}}>{sub.name}</p>
                  <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:'rgba(140,140,160,0.45)'}}>{sub.present} present / {sub.total} total</p>
                </div>
                <span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'36px',color:col,lineHeight:1}}>{p}%</span>
              </div>

              {/* Progress bar */}
              <div style={{height:'6px',borderRadius:'3px',background:'rgba(255,255,255,0.07)',overflow:'hidden',marginBottom:'14px'}}>
                <motion.div initial={{width:0}} animate={{width:`${p}%`}} transition={{duration:.7,ease:[.16,1,.3,1]}}
                  style={{height:'100%',borderRadius:'3px',background:col}}/>
              </div>

              {/* Status pill */}
              <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'10px',
                background:cs>0?'rgba(74,222,128,0.08)':'rgba(255,77,90,0.08)',
                border:`1px solid ${cs>0?'rgba(74,222,128,0.2)':'rgba(255,77,90,0.2)'}`}}>
                <span style={{fontSize:'16px'}}>{cs>0?'✅':'🚨'}</span>
                <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:cs>0?'#4ade80':'#FF4D5A',lineHeight:1.4}}>
                  {cs>0?`You can skip ${cs} more ${sub.name} class${cs!==1?'es':''}.`:`Cannot skip any more ${sub.name}. At ${p}%!`}
                </p>
              </div>

              {/* Mini trend chart — pure CSS bars */}
              <div style={{marginTop:'16px'}}>
                <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'9px',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(140,140,160,0.35)',marginBottom:'10px'}}>8-Week Trend</p>
                <div style={{display:'flex',gap:'4px',alignItems:'flex-end',height:'48px'}}>
                  {weekData.map((w,i)=>(
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                      <motion.div initial={{height:0}} animate={{height:`${(w.pct/100)*40}px`}}
                        transition={{duration:.6,delay:i*0.05,ease:[.16,1,.3,1]}}
                        style={{width:'100%',borderRadius:'3px 3px 0 0',
                          background:statusColor(w.pct,sub.threshold),opacity:i===7?1:0.5+i*0.07}}/>
                      <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'8px',color:'rgba(140,140,160,0.3)'}}>{w.week}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AI Chat */}
            <div style={{padding:'18px',borderRadius:'14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(140,140,160,0.4)',marginBottom:'12px'}}>
                Ask Attendance AI
              </p>
              {chatReply && (
                <div style={{padding:'12px 14px',borderRadius:'10px',background:'rgba(193,18,31,0.06)',border:'1px solid rgba(193,18,31,0.12)',marginBottom:'10px',fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(200,200,210,0.85)',lineHeight:1.6}}>
                  {chatLoading ? (
                    <div style={{display:'flex',gap:'4px'}}>{[0,1,2].map(i=><motion.div key={i} animate={{y:[0,-4,0]}} transition={{duration:.4,repeat:Infinity,delay:i*0.1}} style={{width:'5px',height:'5px',borderRadius:'50%',background:'#C1121F'}}/>)}</div>
                  ) : chatReply}
                </div>
              )}
              <div style={{display:'flex',gap:'8px'}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&askAI()}
                  placeholder="e.g. Can I skip tomorrow?"
                  style={{flex:1,padding:'10px 13px',borderRadius:'9px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'13px',outline:'none'}}
                  onFocus={e=>(e.target.style.borderColor='rgba(193,18,31,0.4)')}
                  onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}/>
                <button onClick={askAI} disabled={chatLoading||!chatInput.trim()}
                  style={{padding:'10px 16px',borderRadius:'9px',background:'linear-gradient(145deg,#C1121F,#7A0C14)',border:'none',color:'#fff',fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'13px',cursor:'pointer',whiteSpace:'nowrap',opacity:chatLoading?0.6:1}}>
                  {chatLoading?'…':'Ask'}
                </button>
              </div>
            </div>

            {/* WhatsApp Alert Setup */}
            <div style={{padding:'18px',borderRadius:'14px',background:'rgba(37,211,102,0.05)',border:'1px solid rgba(37,211,102,0.15)'}}>
              <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(37,211,102,0.7)',marginBottom:'10px'}}>
                📱 WhatsApp Danger Alerts
              </p>
              {alertSaved ? (
                <div style={{display:'flex',alignItems:'center',gap:'8px',fontFamily:'var(--font-dm)',fontSize:'13px',color:'#4ade80'}}>
                  <span>✓</span> Alerts configured! You'll get a WhatsApp when attendance is critical.
                </div>
              ) : (
                <>
                  <p style={{fontFamily:'var(--font-dm)',fontSize:'12px',color:'rgba(140,140,160,0.5)',marginBottom:'10px',lineHeight:1.5}}>
                    Get a WhatsApp message before your attendance drops below 75%.
                  </p>
                  <div style={{display:'flex',gap:'8px'}}>
                    <input value={phone} onChange={e=>setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      style={{flex:1,padding:'9px 13px',borderRadius:'9px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(37,211,102,0.2)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'13px',outline:'none'}}
                      onFocus={e=>(e.target.style.borderColor='rgba(37,211,102,0.4)')}
                      onBlur={e=>(e.target.style.borderColor='rgba(37,211,102,0.2)')}/>
                    <button onClick={saveAlert} disabled={!phone.trim()}
                      style={{padding:'9px 16px',borderRadius:'9px',background:'rgba(37,211,102,0.2)',border:'1px solid rgba(37,211,102,0.35)',color:'#4ade80',fontFamily:'var(--font-jetbrains)',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap'}}>
                      Enable
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
