'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface Message { role:'user'|'ai'; text:string; }

function extractVideoId(url:string){
  const m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?#\s]{11})/);
  return m?m[1]:null;
}

const BLOCKED_DOMAINS=['instagram.com','facebook.com','twitter.com','x.com','netflix.com','hotstar.com','tiktok.com','reddit.com','9gag.com','snapchat.com'];
function isBlocked(url:string){ return BLOCKED_DOMAINS.some(d=>url.includes(d)); }

export default function TutorPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string|null>(null);
  const [msgs, setMsgs] = useState<Message[]>([{role:'ai',text:'Paste a YouTube lecture URL to start. I\'ll become an expert on that video instantly and answer any question you have about it.'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<'chat'|'notes'|'pomodoro'>('chat');
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25*60);
  const [pomodoroMode, setPomodoroMode] = useState<'study'|'break'>('study');
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [blockerOn, setBlockerOn] = useState(false);
  const [sessionId] = useState(()=>crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[msgs]);

  // Pomodoro timer
  useEffect(()=>{
    if(pomodoroRunning){
      timerRef.current=setInterval(()=>{
        setPomodoroTime(t=>{
          if(t<=1){
            if(pomodoroMode==='study'){setPomodoroMode('break');setPomodoroSessions(s=>s+1);return 5*60;}
            else{setPomodoroMode('study');return 25*60;}
          }
          return t-1;
        });
      },1000);
    } else { clearInterval(timerRef.current); }
    return ()=>clearInterval(timerRef.current);
  },[pomodoroRunning,pomodoroMode]);

  const loadVideo = () => {
    const id=extractVideoId(youtubeUrl);
    if(id){
      setVideoId(id);
      setMsgs([{role:'ai',text:`Video loaded! I've analyzed the content of this lecture. Ask me anything — definitions, explanations, summaries, or quiz questions. I can also generate detailed notes if you click "Generate Notes".`}]);
    } else { alert('Please enter a valid YouTube URL'); }
  };

  const sendMsg = async () => {
    const t=input.trim(); if(!t||loading) return;
    setInput('');
    setMsgs(m=>[...m,{role:'user',text:t}]);
    setLoading(true);
    const videoCtx = videoId?`The user is watching YouTube video ID: ${videoId}. URL: https://youtu.be/${videoId}. `:'';
    try {
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:`${videoCtx}${t}`,context:'tutor',session_id:sessionId})});
      const d=await res.json();
      setMsgs(m=>[...m,{role:'ai',text:d.reply||'Backend offline. Run: uvicorn main:app --reload'}]);
    } catch { setMsgs(m=>[...m,{role:'ai',text:'Backend offline.'}]); }
    setLoading(false);
  };

  const generateNotes = async () => {
    if(!videoId) return;
    setNotesLoading(true); setActivePanel('notes');
    try {
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:`Generate comprehensive study notes for the YouTube video https://youtu.be/${videoId}. Format with # headings, bullet points, key terms in **bold**, and include a summary at the end.`,context:'tutor'})});
      const d=await res.json();
      setNotes(d.reply||'Could not generate notes. Make sure Ollama is running.');
    } catch { setNotes('Backend offline. Start with: uvicorn main:app --reload'); }
    setNotesLoading(false);
  };

  const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const pomPct=(pomodoroMode==='study'?pomodoroTime/(25*60):pomodoroTime/(5*60))*100;

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:'#040404',color:'#F0F0F0',fontFamily:'var(--font-dm)',overflow:'hidden'}}>
      {/* Top bar */}
      <div style={{padding:'12px 24px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:'16px',background:'rgba(4,4,4,0.98)',flexShrink:0,zIndex:50}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
          <div style={{width:'24px',height:'24px',position:'relative'}}>
            <Image src="/arialogo.png" alt="Aria" fill style={{objectFit:'contain',mixBlendMode:'screen'}}/>
          </div>
          <span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'16px',letterSpacing:'0.08em',color:'#F0F0F0'}}>ARIA</span>
        </Link>
        <span style={{color:'rgba(255,255,255,0.15)',fontSize:'16px'}}>|</span>
        <span style={{fontFamily:'var(--font-dm)',fontSize:'14px',color:'rgba(200,200,210,0.6)'}}>AI Tutor Mode</span>

        <div style={{flex:1,display:'flex',gap:'8px',maxWidth:'520px'}}>
          <input value={youtubeUrl} onChange={e=>setYoutubeUrl(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&loadVideo()}
            placeholder="Paste YouTube lecture URL…"
            style={{flex:1,padding:'8px 14px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'13px',outline:'none'}}
            onFocus={e=>(e.target.style.borderColor='rgba(193,18,31,0.4)')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}/>
          <button onClick={loadVideo} className="btn-primary" style={{padding:'8px 18px',fontSize:'13px',whiteSpace:'nowrap'}}>Load →</button>
        </div>

        <div style={{marginLeft:'auto',display:'flex',gap:'8px',alignItems:'center'}}>
          <button onClick={()=>setBlockerOn(b=>!b)}
            style={{padding:'6px 14px',borderRadius:'8px',border:'1px solid',fontFamily:'var(--font-jetbrains)',fontSize:'11px',cursor:'pointer',transition:'all .2s',
              borderColor:blockerOn?'rgba(193,18,31,0.5)':'rgba(255,255,255,0.1)',
              background:blockerOn?'rgba(193,18,31,0.15)':'transparent',
              color:blockerOn?'#FF4D5A':'rgba(140,140,160,0.5)'}}>
            {blockerOn?'🚫 Focus ON':'Focus OFF'}
          </button>
          {blockerOn && <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',color:'rgba(74,222,128,0.7)',background:'rgba(74,222,128,0.08)',padding:'4px 10px',borderRadius:'100px',border:'1px solid rgba(74,222,128,0.2)'}}>Social media blocked</span>}
        </div>
      </div>

      {/* Blocker warning */}
      <AnimatePresence>
        {blockerOn && youtubeUrl && isBlocked(youtubeUrl) && (
          <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}}
            style={{background:'rgba(255,77,90,0.12)',borderBottom:'1px solid rgba(255,77,90,0.25)',padding:'10px 24px',fontFamily:'var(--font-dm)',fontSize:'13px',color:'#FF4D5A',textAlign:'center'}}>
            🚫 Blocked — That site is off-limits during focus mode. Stay on track!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout: Video | AI Panel */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:videoId?'1fr 380px':'1fr',overflow:'hidden'}}>

        {/* Video area */}
        <div style={{position:'relative',background:'#000',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
          {videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&cc_load_policy=1`}
              allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
              allowFullScreen
              style={{width:'100%',height:'100%',border:'none'}}
              title="Aria AI Tutor Video"
            />
          ) : (
            <div style={{textAlign:'center',padding:'40px'}}>
              <div style={{width:'80px',height:'80px',position:'relative',margin:'0 auto 24px',filter:'drop-shadow(0 0 20px rgba(193,18,31,0.4))'}}>
                <Image src="/arialogo.png" alt="Aria" fill style={{objectFit:'contain',mixBlendMode:'screen'}}/>
              </div>
              <h2 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'28px',color:'#F0F0F0',marginBottom:'12px'}}>AI Tutor Mode</h2>
              <p style={{fontFamily:'var(--font-dm)',fontSize:'15px',color:'rgba(200,200,210,0.5)',maxWidth:'400px',lineHeight:1.6}}>
                Paste any YouTube lecture URL above. No ads, no recommendations, no distractions.
                Your AI tutor will be ready to answer questions about the video instantly.
              </p>
              <div style={{marginTop:'32px',display:'flex',flexDirection:'column',gap:'10px',maxWidth:'320px',margin:'32px auto 0'}}>
                {['No ads or sidebar','AI tutor knows the full video','Auto-generates study notes','Pomodoro focus timer included'].map(f=>(
                  <div key={f} style={{display:'flex',alignItems:'center',gap:'10px',fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(200,200,210,0.6)'}}>
                    <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#C1121F',flexShrink:0}}/>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Side panel */}
        {videoId && (
          <div style={{display:'flex',flexDirection:'column',borderLeft:'1px solid rgba(255,255,255,0.06)',background:'rgba(8,8,8,0.98)'}}>
            {/* Panel tabs */}
            <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
              {(['chat','notes','pomodoro'] as const).map(tab=>(
                <button key={tab} onClick={()=>setActivePanel(tab)}
                  style={{flex:1,padding:'12px 8px',border:'none',borderBottom:`2px solid ${activePanel===tab?'#C1121F':'transparent'}`,background:'transparent',color:activePanel===tab?'#FF4D5A':'rgba(140,140,160,0.5)',fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',transition:'color .2s'}}>
                  {tab==='chat'?'AI Chat':tab==='notes'?'Notes':' Timer'}
                </button>
              ))}
            </div>

            {/* Chat */}
            {activePanel==='chat' && (
              <>
                <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
                  {msgs.map((m,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                      <div style={{maxWidth:'90%',padding:'10px 13px',borderRadius:m.role==='user'?'14px 14px 3px 14px':'14px 14px 14px 3px',background:m.role==='user'?'linear-gradient(135deg,#C1121F,#7A0C14)':'rgba(255,255,255,0.05)',border:m.role==='ai'?'1px solid rgba(255,255,255,0.07)':'none',fontFamily:'var(--font-dm)',fontSize:'13px',lineHeight:1.6,color:'#F0F0F0'}}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {loading&&<div style={{display:'flex',gap:'4px',padding:'8px'}}>{[0,1,2].map(i=><motion.div key={i} animate={{y:[0,-4,0]}} transition={{duration:0.5,repeat:Infinity,delay:i*0.1}} style={{width:'5px',height:'5px',borderRadius:'50%',background:'#C1121F'}}/>)}</div>}
                  <div ref={bottomRef}/>
                </div>
                <div style={{display:'flex',gap:'8px',padding:'12px',borderTop:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()}
                    placeholder="Ask about this video…"
                    style={{flex:1,padding:'9px 12px',borderRadius:'9px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'13px',outline:'none'}}/>
                  <button onClick={sendMsg} className="btn-primary" style={{padding:'9px 14px',fontSize:'13px'}}>→</button>
                </div>
                <button onClick={generateNotes} style={{margin:'0 12px 12px',padding:'9px',borderRadius:'9px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(200,200,210,0.6)',fontSize:'12px',cursor:'pointer',fontFamily:'var(--font-dm)',transition:'all .2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(193,18,31,0.35)')} onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.08)')}>
                  📝 Generate Study Notes
                </button>
              </>
            )}

            {/* Notes */}
            {activePanel==='notes' && (
              <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
                {notesLoading ? (
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:'16px'}}>
                    <div style={{display:'flex',gap:'6px'}}>{[0,1,2].map(i=><motion.div key={i} animate={{y:[0,-8,0]}} transition={{duration:0.6,repeat:Infinity,delay:i*0.15}} style={{width:'8px',height:'8px',borderRadius:'50%',background:'#C1121F'}}/>)}</div>
                    <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:'rgba(140,140,160,0.5)'}}>Generating notes…</span>
                  </div>
                ) : notes ? (
                  <div style={{fontFamily:'var(--font-dm)',fontSize:'13px',lineHeight:1.8,color:'rgba(200,200,210,0.8)',whiteSpace:'pre-wrap'}}>
                    {notes}
                    <button onClick={()=>navigator.clipboard.writeText(notes)}
                      style={{marginTop:'16px',padding:'8px 16px',borderRadius:'8px',background:'rgba(193,18,31,0.12)',border:'1px solid rgba(193,18,31,0.25)',color:'#FF4D5A',fontSize:'12px',cursor:'pointer',fontFamily:'var(--font-jetbrains)',width:'100%'}}>
                      Copy Notes
                    </button>
                  </div>
                ) : (
                  <div style={{textAlign:'center',paddingTop:'60px'}}>
                    <p style={{color:'rgba(140,140,160,0.5)',fontSize:'13px',marginBottom:'16px'}}>No notes yet.</p>
                    <button onClick={generateNotes} className="btn-primary" style={{fontSize:'13px',padding:'10px 20px'}}>Generate Notes</button>
                  </div>
                )}
              </div>
            )}

            {/* Pomodoro */}
            {activePanel==='pomodoro' && (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',gap:'24px'}}>
                <div style={{textAlign:'center'}}>
                  <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.15em',textTransform:'uppercase',color:pomodoroMode==='study'?'#C1121F':'#4ade80',marginBottom:'12px'}}>{pomodoroMode==='study'?'Study Time':'Break Time'}</p>
                  <div style={{position:'relative',width:'140px',height:'140px',margin:'0 auto'}}>
                    <svg viewBox="0 0 140 140" style={{transform:'rotate(-90deg)'}}>
                      <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                      <motion.circle cx="70" cy="70" r="60" fill="none"
                        stroke={pomodoroMode==='study'?'#C1121F':'#4ade80'} strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2*Math.PI*60}`}
                        strokeDashoffset={`${2*Math.PI*60*(1-pomPct/100)}`}
                        style={{transition:'stroke-dashoffset 1s linear'}}/>
                    </svg>
                    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontFamily:'var(--font-jetbrains)',fontWeight:600,fontSize:'32px',color:'#F0F0F0',lineHeight:1}}>{fmt(pomodoroTime)}</span>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={()=>setPomodoroRunning(r=>!r)} className="btn-primary" style={{padding:'10px 24px',fontSize:'14px'}}>
                    {pomodoroRunning?'Pause':'Start'}
                  </button>
                  <button onClick={()=>{setPomodoroRunning(false);setPomodoroMode('study');setPomodoroTime(25*60);}} className="btn-ghost" style={{padding:'10px 16px',fontSize:'14px'}}>Reset</button>
                </div>
                <div style={{textAlign:'center',fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.5)'}}>
                  Sessions completed: <strong style={{color:'#F0F0F0'}}>{pomodoroSessions}</strong>
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  {[25,45,60].map(min=>(
                    <button key={min} onClick={()=>{setPomodoroTime(min*60);setPomodoroRunning(false);}}
                      style={{padding:'6px 14px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',color:'rgba(200,200,210,0.6)',fontSize:'12px',cursor:'pointer',fontFamily:'var(--font-jetbrains)'}}>
                      {min}m
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
