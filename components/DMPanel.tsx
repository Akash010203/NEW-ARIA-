'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DM { from:string; text:string; ts:string; mine:boolean; }

const CONTACTS = [
  { name:'Rohan Verma',  initials:'RV', college:'LNCT CSE', online:true  },
  { name:'Priya Singh',  initials:'PS', college:'RGPV IT',  online:false },
  { name:'Arjun Pandey', initials:'AP', college:'LNCT ECE', online:true  },
  { name:'Shreya Mishra',initials:'SM', college:'RGPV MCA', online:false },
];

export default function DMPanel({ onClose }:{ onClose:()=>void }) {
  const [active, setActive]         = useState(0);
  const [messages, setMessages]     = useState<{[k:number]:DM[]}>({
    0:[{from:'Rohan Verma',text:'Hey! Did you check the DBMS notes I uploaded?',ts:'10:30',mine:false}],
    1:[{from:'Priya Singh',text:'Can you share your Engineering Maths notes?',ts:'Yesterday',mine:false}],
    2:[],3:[],
  });
  const [input, setInput]           = useState('');
  const [aiLoading, setAiLoading]   = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages,active]);

  function now(){ return new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); }

  const send = async () => {
    const t=input.trim(); if(!t) return;
    const dm:DM={from:'You',text:t,ts:now(),mine:true};
    setMessages(prev=>({...prev,[active]:[...(prev[active]||[]),dm]}));
    setInput('');
    // Simulate reply via AI
    setAiLoading(true);
    try {
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:`You are ${CONTACTS[active].name}, a college student. Reply naturally to: "${t}"`,context:'general'})});
      const d=await r.json();
      const reply:DM={from:CONTACTS[active].name,text:d.reply||'Sure!',ts:now(),mine:false};
      setMessages(prev=>({...prev,[active]:[...(prev[active]||[]),reply]}));
    } catch {
      setMessages(prev=>({...prev,[active]:[...(prev[active]||[]),{from:CONTACTS[active].name,text:'Got it! 👍',ts:now(),mine:false}]}));
    }
    setAiLoading(false);
  };

  return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
      style={{position:'fixed',inset:0,zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)'}}>
      <div style={{width:'720px',height:'520px',borderRadius:'20px',background:'rgba(10,10,10,0.99)',border:'1px solid rgba(193,18,31,0.2)',display:'flex',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.8)'}}>

        {/* Sidebar */}
        <div style={{width:'220px',borderRight:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{padding:'16px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'14px',color:'#F0F0F0'}}>Messages</span>
            <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(140,140,160,0.5)',cursor:'pointer',fontSize:'18px',lineHeight:1}}>✕</button>
          </div>
          {CONTACTS.map((c,i)=>(
            <button key={i} onClick={()=>setActive(i)}
              style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px 14px',border:'none',borderLeft:`2px solid ${active===i?'#C1121F':'transparent'}`,background:active===i?'rgba(193,18,31,0.08)':'transparent',cursor:'pointer',textAlign:'left',transition:'all .2s'}}>
              <div style={{position:'relative',flexShrink:0}}>
                <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'linear-gradient(135deg,#C1121F,#7A0C14)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'11px',color:'#fff'}}>{c.initials}</div>
                {c.online&&<span style={{position:'absolute',bottom:0,right:0,width:'8px',height:'8px',borderRadius:'50%',background:'#4ade80',border:'1.5px solid #0a0a0a'}}/>}
              </div>
              <div>
                <p style={{fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'12px',color:'#F0F0F0',lineHeight:1,marginBottom:'3px'}}>{c.name}</p>
                <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'9px',color:'rgba(140,140,160,0.4)'}}>{c.college}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div style={{flex:1,display:'flex',flexDirection:'column'}}>
          {/* Header */}
          <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#C1121F,#7A0C14)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'11px',color:'#fff'}}>{CONTACTS[active].initials}</div>
            <div>
              <p style={{fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'14px',color:'#F0F0F0',lineHeight:1}}>{CONTACTS[active].name}</p>
              <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'9px',color:CONTACTS[active].online?'#4ade80':'rgba(140,140,160,0.4)'}}>{CONTACTS[active].online?'Online':'Offline'}</p>
            </div>
            <div style={{marginLeft:'auto',fontFamily:'var(--font-jetbrains)',fontSize:'9px',color:'rgba(140,140,160,0.3)'}}>AI-simulated replies</div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
            {(messages[active]||[]).length===0&&(
              <div style={{textAlign:'center',paddingTop:'40px',color:'rgba(140,140,160,0.35)',fontFamily:'var(--font-dm)',fontSize:'13px'}}>No messages yet. Say hello! 👋</div>
            )}
            {(messages[active]||[]).map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.mine?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'75%',padding:'9px 13px',borderRadius:m.mine?'14px 14px 3px 14px':'14px 14px 14px 3px',
                  background:m.mine?'linear-gradient(135deg,#C1121F,#7A0C14)':'rgba(255,255,255,0.06)',
                  border:m.mine?'none':'1px solid rgba(255,255,255,0.08)'}}>
                  <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'#F0F0F0',margin:0,lineHeight:1.5}}>{m.text}</p>
                  <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'9px',color:'rgba(255,255,255,0.3)',marginTop:'4px',textAlign:'right'}}>{m.ts}</p>
                </div>
              </div>
            ))}
            {aiLoading&&(
              <div style={{display:'flex',gap:'4px',padding:'8px'}}>{[0,1,2].map(i=><motion.div key={i} animate={{y:[0,-4,0]}} transition={{duration:.4,repeat:Infinity,delay:i*0.1}} style={{width:'5px',height:'5px',borderRadius:'50%',background:'rgba(193,18,31,0.6)'}}/>)}</div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:'8px'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder={`Message ${CONTACTS[active].name}…`}
              style={{flex:1,padding:'10px 13px',borderRadius:'10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'13px',outline:'none'}}
              onFocus={e=>(e.target.style.borderColor='rgba(193,18,31,0.4)')}
              onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}/>
            <button onClick={send} disabled={!input.trim()}
              style={{width:'40px',height:'40px',borderRadius:'10px',background:input.trim()?'linear-gradient(135deg,#C1121F,#7A0C14)':'rgba(255,255,255,0.05)',border:'none',cursor:input.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg viewBox="0 0 24 24" fill="none" width="15" height="15" stroke={input.trim()?'#fff':'rgba(140,140,160,0.3)'} strokeWidth="2"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
