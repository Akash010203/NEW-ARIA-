'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Subject { name:string; total:number; present:number; threshold:number; }
interface DayRecord { [subject:string]: 'P'|'A'|'holiday'|''; }
interface Timetable { [day:string]: string[]; } // day -> [subjects]

const DAYS_OF_WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const USER_ID = 'demo_user';

function pct(s:Subject){ return s.total>0?Math.round((s.present/s.total)*100):0; }
function statusColor(p:number,t:number){ return p>=t+10?'#4ade80':p>=t?'#fbbf24':'#FF4D5A'; }
function statusLabel(p:number,t:number){ return p>=t+10?'Safe':p>=t?'Warning':'Danger'; }
function canSkip(s:Subject){
  const maxFuture=Math.floor((s.present*100)/s.threshold);
  return Math.max(0,maxFuture-s.total);
}

export default function AttendancePage() {
  const [subjects, setSubjects] = useState<Subject[]>([
    {name:'Mathematics',total:20,present:16,threshold:75},
    {name:'Physics',total:18,present:13,threshold:75},
    {name:'Chemistry',total:16,present:11,threshold:75},
    {name:'English',total:14,present:13,threshold:75},
    {name:'Computer Science',total:22,present:18,threshold:75},
  ]);
  const [timetable, setTimetable] = useState<Timetable>({
    Monday:['Mathematics','Physics'],Tuesday:['Chemistry','Computer Science'],
    Wednesday:['English','Mathematics'],Thursday:['Physics','Chemistry'],
    Friday:['Computer Science','English'],Saturday:[],
  });
  const [todayDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'dashboard'|'calendar'|'timetable'|'chat'>('dashboard');
  const [chatMsgs, setChatMsgs] = useState([{role:'ai',text:'Hi! Ask me anything about your attendance — "Can I skip Physics tomorrow?" or "What\'s my worst subject?"'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [markDate] = useState(todayDate.toISOString().split('T')[0]);
  const [newSubject, setNewSubject] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(todayDate.getMonth());
  const [calendarYear] = useState(todayDate.getFullYear());
  // Simple calendar records: date -> { subject -> status }
  const [calRecords, setCalRecords] = useState<{[date:string]: DayRecord}>({});

  const today = DAYS_OF_WEEK[todayDate.getDay()-1] || 'Saturday';
  const todaySubjects = timetable[today] || [];

  const markAttendance = (subjectName:string, status:'P'|'A') => {
    setSubjects(prev=>prev.map(s=>{
      if(s.name!==subjectName) return s;
      return {...s, total:s.total+1, present:status==='P'?s.present+1:s.present};
    }));
    setCalRecords(prev=>({...prev, [markDate]:{...(prev[markDate]||{}), [subjectName]:status}}));
    // Also send to backend
    fetch('/api/attendance',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({user_id:USER_ID,subject:subjectName,date:markDate,status})}).catch(()=>{});
  };

  const askChat = async () => {
    const t=chatInput.trim(); if(!t||chatLoading) return;
    setChatInput('');
    setChatMsgs(m=>[...m,{role:'user',text:t}]);
    setChatLoading(true);
    const ctx=subjects.map(s=>`${s.name}: ${pct(s)}% (${s.present}/${s.total}, can skip ${canSkip(s)} more)`).join('; ');
    try {
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:`My attendance: ${ctx}. Question: ${t}`,context:'attendance'})});
      const d=await res.json();
      setChatMsgs(m=>[...m,{role:'ai',text:d.reply||'Backend offline.'}]);
    } catch { setChatMsgs(m=>[...m,{role:'ai',text:'Backend offline. Run: uvicorn main:app --reload'}]); }
    setChatLoading(false);
  };

  // Calendar grid
  const daysInMonth = new Date(calendarYear,calendarMonth+1,0).getDate();
  const firstDay = new Date(calendarYear,calendarMonth,1).getDay();
  const calDays = Array.from({length:42},(_,i)=>{
    const d=i-firstDay+1;
    return d>=1&&d<=daysInMonth?d:null;
  });

  const overall = subjects.reduce((a,s)=>a+pct(s),0)/subjects.length;

  return (
    <div style={{minHeight:'100vh',background:'#040404',color:'#F0F0F0',fontFamily:'var(--font-dm)'}}>
      {/* Navbar */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(4,4,4,0.95)',borderBottom:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(24px)'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <div style={{width:'28px',height:'28px',position:'relative',filter:'drop-shadow(0 0 6px rgba(193,18,31,0.5))'}}>
            <Image src="/arialogo.png" alt="Aria" fill style={{objectFit:'contain',mixBlendMode:'screen'}}/>
          </div>
          <span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'18px',letterSpacing:'0.08em'}}>ARIA</span>
        </Link>
        <div style={{display:'flex',gap:'8px'}}>
          {(['dashboard','calendar','timetable','chat'] as const).map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)}
              style={{padding:'7px 16px',borderRadius:'8px',border:'1px solid',fontFamily:'var(--font-dm)',fontSize:'13px',cursor:'pointer',transition:'all .2s',
                borderColor:activeTab===tab?'rgba(193,18,31,0.5)':'rgba(255,255,255,0.08)',
                background:activeTab===tab?'rgba(193,18,31,0.12)':'transparent',
                color:activeTab===tab?'#FF4D5A':'rgba(200,200,210,0.6)',
                textTransform:'capitalize'}}>
              {tab}
            </button>
          ))}
        </div>
        <Link href="/" style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(200,200,210,0.5)',textDecoration:'none'}}>← Home</Link>
      </nav>

      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'40px 24px'}}>

        {/* ── DASHBOARD TAB ─────────────────────────────────── */}
        {activeTab==='dashboard' && (
          <div>
            {/* Overall stat */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',marginBottom:'32px'}}>
              {[
                {label:'Overall Attendance',val:`${Math.round(overall)}%`,color:statusColor(overall,75)},
                {label:'Subjects Tracked',val:String(subjects.length),color:'#F0F0F0'},
                {label:'Subjects Safe',val:String(subjects.filter(s=>pct(s)>=75).length),color:'#4ade80'},
                {label:'Subjects Danger',val:String(subjects.filter(s=>pct(s)<75).length),color:'#FF4D5A'},
              ].map(stat=>(
                <div key={stat.label} style={{padding:'20px 24px',borderRadius:'14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
                  <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(140,140,160,0.5)',marginBottom:'8px'}}>{stat.label}</p>
                  <p style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'32px',color:stat.color,lineHeight:1}}>{stat.val}</p>
                </div>
              ))}
            </div>

            {/* Today's classes */}
            {todaySubjects.length>0 && (
              <div style={{marginBottom:'32px',padding:'24px',borderRadius:'16px',background:'rgba(193,18,31,0.06)',border:'1px solid rgba(193,18,31,0.2)'}}>
                <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.15em',textTransform:'uppercase',color:'#FF4D5A',marginBottom:'16px'}}>Today — {today}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
                  {todaySubjects.map(sub=>{
                    const rec=calRecords[markDate]?.[sub];
                    return (
                      <div key={sub} style={{padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',gap:'12px'}}>
                        <span style={{fontFamily:'var(--font-dm)',fontSize:'14px',color:'#F0F0F0'}}>{sub}</span>
                        {rec ? (
                          <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'12px',fontWeight:600,color:rec==='P'?'#4ade80':'#FF4D5A'}}>{rec==='P'?'✓ Present':'✗ Absent'}</span>
                        ) : (
                          <div style={{display:'flex',gap:'6px'}}>
                            <button onClick={()=>markAttendance(sub,'P')} style={{padding:'5px 12px',borderRadius:'7px',background:'rgba(74,222,128,0.15)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80',fontSize:'12px',cursor:'pointer',fontFamily:'var(--font-jetbrains)'}}>Present</button>
                            <button onClick={()=>markAttendance(sub,'A')} style={{padding:'5px 12px',borderRadius:'7px',background:'rgba(255,77,90,0.12)',border:'1px solid rgba(255,77,90,0.25)',color:'#FF4D5A',fontSize:'12px',cursor:'pointer',fontFamily:'var(--font-jetbrains)'}}>Absent</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subject cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px',marginBottom:'24px'}}>
              {subjects.map((s,i)=>{
                const p=pct(s); const sc=canSkip(s); const col=statusColor(p,s.threshold);
                return (
                  <motion.div key={s.name} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                    style={{padding:'24px',borderRadius:'16px',background:'rgba(255,255,255,0.025)',border:'1px solid',borderColor:p<s.threshold?'rgba(255,77,90,0.25)':p<s.threshold+10?'rgba(251,191,36,0.2)':'rgba(255,255,255,0.07)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
                      <div>
                        <p style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'16px',color:'#F0F0F0',marginBottom:'4px'}}>{s.name}</p>
                        <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:'rgba(140,140,160,0.5)'}}>{s.present}/{s.total} classes</p>
                      </div>
                      <span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'28px',color:col,lineHeight:1}}>{p}%</span>
                    </div>
                    <div style={{height:'4px',borderRadius:'2px',background:'rgba(255,255,255,0.07)',overflow:'hidden',marginBottom:'12px'}}>
                      <motion.div initial={{width:0}} animate={{width:`${p}%`}} transition={{duration:.8,delay:i*0.06+0.3}}
                        style={{height:'100%',borderRadius:'2px',background:col}}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:`${col}18`,color:col,border:`1px solid ${col}40`}}>
                        {statusLabel(p,s.threshold)}
                      </span>
                      <span style={{fontFamily:'var(--font-dm)',fontSize:'12px',color:'rgba(140,140,160,0.6)'}}>
                        {sc>0?`Can skip ${sc} more`:'⚠ No more skips'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Add subject */}
              {showAddSubject ? (
                <div style={{padding:'24px',borderRadius:'16px',border:'1px dashed rgba(193,18,31,0.3)',display:'flex',flexDirection:'column',gap:'12px'}}>
                  <input value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="Subject name"
                    onKeyDown={e=>{if(e.key==='Enter'&&newSubject.trim()){setSubjects(p=>[...p,{name:newSubject.trim(),total:0,present:0,threshold:75}]);setNewSubject('');setShowAddSubject(false);}}}
                    style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(193,18,31,0.3)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'14px',outline:'none'}}
                    autoFocus/>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={()=>{if(newSubject.trim()){setSubjects(p=>[...p,{name:newSubject.trim(),total:0,present:0,threshold:75}]);setNewSubject('');setShowAddSubject(false);}}}
                      className="btn-primary" style={{flex:1,padding:'9px',fontSize:'13px'}}>Add</button>
                    <button onClick={()=>setShowAddSubject(false)} className="btn-ghost" style={{flex:1,padding:'9px',fontSize:'13px'}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>setShowAddSubject(true)}
                  style={{padding:'24px',borderRadius:'16px',border:'1px dashed rgba(255,255,255,0.1)',background:'transparent',color:'rgba(200,200,210,0.4)',cursor:'pointer',fontFamily:'var(--font-dm)',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(193,18,31,0.3)';e.currentTarget.style.color='#FF4D5A';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(200,200,210,0.4)';}}>
                  + Add Subject
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── CALENDAR TAB ──────────────────────────────────── */}
        {activeTab==='calendar' && (
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'28px'}}>
              <button onClick={()=>setCalendarMonth(m=>m>0?m-1:11)} style={{padding:'8px 16px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',cursor:'pointer',fontSize:'16px'}}>←</button>
              <h2 style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'22px',color:'#F0F0F0'}}>{MONTHS[calendarMonth]} {calendarYear}</h2>
              <button onClick={()=>setCalendarMonth(m=>m<11?m+1:0)} style={{padding:'8px 16px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',cursor:'pointer',fontSize:'16px'}}>→</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px',marginBottom:'8px'}}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} style={{textAlign:'center',fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:'rgba(140,140,160,0.4)',padding:'6px 0'}}>{d}</div>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px'}}>
              {calDays.map((d,i)=>{
                if(!d) return <div key={i}/>;
                const dateStr=`${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const rec=calRecords[dateStr];
                const hasPresent=rec&&Object.values(rec).some(v=>v==='P');
                const hasAbsent=rec&&Object.values(rec).some(v=>v==='A');
                const isToday=dateStr===markDate;
                return (
                  <div key={i} style={{aspectRatio:'1',borderRadius:'8px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontSize:'13px',fontFamily:'var(--font-jetbrains)',cursor:'pointer',
                    background:isToday?'rgba(193,18,31,0.25)':rec?'rgba(255,255,255,0.04)':'transparent',
                    border:`1px solid ${isToday?'rgba(193,18,31,0.5)':'rgba(255,255,255,0.06)'}`,
                    color:isToday?'#FF4D5A':'rgba(200,200,210,0.7)'}}>
                    {d}
                    {rec && (
                      <div style={{display:'flex',gap:'2px',marginTop:'3px'}}>
                        {hasPresent&&<span style={{width:'4px',height:'4px',borderRadius:'50%',background:'#4ade80'}}/>}
                        {hasAbsent&&<span style={{width:'4px',height:'4px',borderRadius:'50%',background:'#FF4D5A'}}/>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{display:'flex',gap:'16px',marginTop:'16px',justifyContent:'center'}}>
              {[{c:'#4ade80',l:'Present'},{c:'#FF4D5A',l:'Absent'},{c:'rgba(193,18,31,0.5)',l:'Today'}].map(item=>(
                <div key={item.l} style={{display:'flex',alignItems:'center',gap:'6px',fontFamily:'var(--font-dm)',fontSize:'12px',color:'rgba(140,140,160,0.6)'}}>
                  <span style={{width:'8px',height:'8px',borderRadius:'50%',background:item.c}}/>{item.l}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIMETABLE TAB ─────────────────────────────────── */}
        {activeTab==='timetable' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'16px'}}>
              {DAYS_OF_WEEK.map(day=>(
                <div key={day} style={{padding:'20px',borderRadius:'14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <p style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'14px',color:day===today?'#C1121F':'#F0F0F0',marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px'}}>
                    {day} {day===today&&<span style={{fontSize:'10px',background:'rgba(193,18,31,0.15)',color:'#FF4D5A',padding:'2px 8px',borderRadius:'100px',fontFamily:'var(--font-jetbrains)'}}>Today</span>}
                  </p>
                  {timetable[day]?.length ? timetable[day].map(sub=>(
                    <div key={sub} style={{padding:'8px 12px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',marginBottom:'6px',fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(200,200,210,0.8)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      {sub}
                      <button onClick={()=>setTimetable(t=>({...t,[day]:t[day].filter(s=>s!==sub)}))}
                        style={{background:'none',border:'none',color:'rgba(255,77,90,0.4)',cursor:'pointer',fontSize:'14px',lineHeight:1}}>×</button>
                    </div>
                  )) : <p style={{fontFamily:'var(--font-dm)',fontSize:'12px',color:'rgba(140,140,160,0.3)'}}>No classes</p>}
                  <select onChange={e=>{const v=e.target.value;if(v){setTimetable(t=>({...t,[day]:[...(t[day]||[]),v]}));e.target.value='';}}}
                    style={{marginTop:'8px',width:'100%',padding:'7px 10px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(140,140,160,0.6)',fontSize:'12px',cursor:'pointer'}}>
                    <option value="">+ Add subject</option>
                    {subjects.filter(s=>!(timetable[day]||[]).includes(s.name)).map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHAT TAB ──────────────────────────────────────── */}
        {activeTab==='chat' && (
          <div style={{maxWidth:'700px',margin:'0 auto'}}>
            <div style={{padding:'24px',borderRadius:'16px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',marginBottom:'16px',height:'420px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px'}}>
              {chatMsgs.map((m,i)=>(
                <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                  <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?'linear-gradient(135deg,#C1121F,#7A0C14)':'rgba(255,255,255,0.05)',border:m.role==='ai'?'1px solid rgba(255,255,255,0.07)':'none',fontFamily:'var(--font-dm)',fontSize:'14px',lineHeight:1.6,color:'#F0F0F0'}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading&&<div style={{display:'flex',gap:'5px',padding:'12px'}}>{[0,1,2].map(i=><motion.div key={i} animate={{y:[0,-5,0]}} transition={{duration:0.5,repeat:Infinity,delay:i*0.1}} style={{width:'6px',height:'6px',borderRadius:'50%',background:'#C1121F'}}/>)}</div>}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askChat()}
                placeholder="Ask about your attendance…"
                style={{flex:1,padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'14px',outline:'none'}}
                onFocus={e=>(e.target.style.borderColor='rgba(193,18,31,0.4)')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}/>
              <button onClick={askChat} className="btn-primary" style={{padding:'12px 24px',fontSize:'14px'}}>Ask</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
