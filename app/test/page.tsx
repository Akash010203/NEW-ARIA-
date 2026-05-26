'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ServiceStatus { name:string; url:string; status:'checking'|'ok'|'offline'; detail:string; fix:string; }

export default function TestPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name:'Next.js Frontend', url:'http://localhost:3000', status:'ok', detail:'You are here — frontend is running.', fix:'' },
    { name:'FastAPI Backend', url:'http://localhost:8000/ping', status:'checking', detail:'Checking...', fix:'cd aria/backend && uvicorn main:app --reload --port 8000' },
    { name:'Ollama AI (llama3.2)', url:'http://localhost:11434', status:'checking', detail:'Checking...', fix:'ollama serve  (then: ollama pull llama3.2)' },
    { name:'AI Chat (full chain)', url:'/api/chat', status:'checking', detail:'Checking...', fix:'Both backend AND ollama must be running' },
  ]);
  const [chatTest, setChatTest] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Test backend
    fetch('/api/health').then(r=>r.json()).then(d=>{
      setServices(prev=>prev.map(s=>{
        if(s.name==='FastAPI Backend') return {...s, status:d.api==='ok'?'ok':'offline', detail:d.api==='ok'?'Connected ✓':'Cannot reach localhost:8000'};
        if(s.name==='Ollama AI (llama3.2)') return {...s, status:d.ollama==='ok'?'ok':'offline', detail:d.ollama==='ok'?'llama3.2 loaded ✓':'Ollama not running'};
        return s;
      }));
    }).catch(()=>{
      setServices(prev=>prev.map(s=>
        (s.name==='FastAPI Backend'||s.name==='Ollama AI (llama3.2)')?{...s,status:'offline',detail:'Health check failed'}:s
      ));
    });

    // Test full AI chain
    fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:'Reply with exactly the word: CONNECTED',context:'general'})
    }).then(r=>r.json()).then(d=>{
      const ok = d.reply && !d.reply.includes('offline') && !d.reply.includes('error');
      setServices(prev=>prev.map(s=>s.name==='AI Chat (full chain)'?{...s,
        status:ok?'ok':'offline',
        detail:ok?`AI replied: "${d.reply.slice(0,60)}"`:d.reply.slice(0,80)
      }:s));
    }).catch(()=>{
      setServices(prev=>prev.map(s=>s.name==='AI Chat (full chain)'?{...s,status:'offline',detail:'Request failed'}:s));
    });
  }, []);

  const runChatTest = async () => {
    setTesting(true);
    setChatTest('');
    try {
      const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:'Say hello and confirm you are Aria AI running on llama3.2',context:'general'})});
      const d = await r.json();
      setChatTest(d.reply||d.error||'No response');
    } catch { setChatTest('Request failed — backend offline'); }
    setTesting(false);
  };

  const statusColor = (s:string) => s==='ok'?'#4ade80':s==='checking'?'#fbbf24':'#FF4D5A';
  const statusLabel = (s:string) => s==='ok'?'ONLINE':s==='checking'?'CHECKING…':'OFFLINE';

  return (
    <div style={{minHeight:'100vh',background:'#040404',color:'#F0F0F0',fontFamily:'var(--font-dm)',padding:'0'}}>
      <nav style={{padding:'16px 32px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(4,4,4,0.97)',position:'sticky',top:0,zIndex:100}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <div style={{width:'28px',height:'28px',position:'relative',filter:'drop-shadow(0 0 8px rgba(193,18,31,0.5))'}}>
            <Image src="/arialogo.png" alt="Aria" fill style={{objectFit:'contain',mixBlendMode:'screen'}}/>
          </div>
          <span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'18px',letterSpacing:'0.08em'}}>ARIA</span>
        </Link>
        <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'12px',color:'rgba(193,18,31,0.7)'}}>System Test Page</span>
        <Link href="/" style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(200,200,210,0.5)',textDecoration:'none'}}>← Home</Link>
      </nav>

      <div style={{maxWidth:'800px',margin:'0 auto',padding:'48px 24px'}}>
        <div style={{marginBottom:'40px'}}>
          <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.15em',color:'rgba(193,18,31,0.7)',textTransform:'uppercase',marginBottom:'10px'}}>Connection Diagnostics</p>
          <h1 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'clamp(2rem,4vw,3rem)',color:'#F0F0F0',marginBottom:'8px'}}>System Status</h1>
          <p style={{color:'rgba(140,140,160,0.5)',fontSize:'14px'}}>Run this page to confirm every service is connected before your demo.</p>
        </div>

        {/* Service cards */}
        <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'40px'}}>
          {services.map((s,i)=>(
            <div key={i} style={{padding:'20px 24px',borderRadius:'14px',background:'rgba(255,255,255,0.025)',
              border:`1px solid ${s.status==='ok'?'rgba(74,222,128,0.2)':s.status==='offline'?'rgba(255,77,90,0.2)':'rgba(251,191,36,0.15)'}`,
              display:'flex',alignItems:'flex-start',gap:'20px'}}>
              <div style={{flexShrink:0,marginTop:'2px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:statusColor(s.status),
                  boxShadow:`0 0 10px ${statusColor(s.status)}`,
                  animation:s.status==='checking'?'pulseRed 1s ease-in-out infinite':'none'}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'6px'}}>
                  <span style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'15px',color:'#F0F0F0'}}>{s.name}</span>
                  <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',letterSpacing:'0.1em',
                    color:statusColor(s.status),background:`${statusColor(s.status)}18`,
                    border:`1px solid ${statusColor(s.status)}35`,borderRadius:'100px',padding:'2px 9px'}}>
                    {statusLabel(s.status)}
                  </span>
                </div>
                <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(200,200,210,0.6)',marginBottom:s.status==='offline'?'8px':'0',lineHeight:1.5}}>
                  {s.detail}
                </p>
                {s.status==='offline' && s.fix && (
                  <div style={{padding:'8px 12px',borderRadius:'8px',background:'rgba(255,77,90,0.07)',border:'1px solid rgba(255,77,90,0.15)',marginTop:'8px'}}>
                    <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:'#FF4D5A',marginBottom:'3px'}}>Fix:</p>
                    <code style={{fontFamily:'var(--font-jetbrains)',fontSize:'12px',color:'rgba(200,200,210,0.8)'}}>{s.fix}</code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live AI test */}
        <div style={{padding:'28px',borderRadius:'16px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',marginBottom:'32px'}}>
          <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(140,140,160,0.4)',marginBottom:'14px'}}>Live AI Chain Test</p>
          <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(200,200,210,0.6)',marginBottom:'16px',lineHeight:1.6}}>
            This button fires the full chain:<br/>
            <code style={{fontFamily:'var(--font-jetbrains)',fontSize:'11px',color:'#FF4D5A',display:'block',marginTop:'8px',padding:'10px 14px',borderRadius:'8px',background:'rgba(255,77,90,0.06)',border:'1px solid rgba(255,77,90,0.12)',lineHeight:1.8}}>
              FloatingAI → /api/chat → FastAPI → _ask_ollama() →{'\n'}
              requests.post("http://localhost:11434/api/generate",{'\n'}
              {'  '}json={'{'}{"\"model\":\"llama3.2\",\"prompt\":...,\"stream\":False"}{'}'}) →{'\n'}
              res.json()["response"]
            </code>
          </p>
          <button onClick={runChatTest} disabled={testing}
            style={{padding:'11px 24px',borderRadius:'10px',background:testing?'rgba(255,255,255,0.05)':'linear-gradient(145deg,#C1121F,#7A0C14)',border:'none',color:testing?'rgba(200,200,210,0.4)':'#fff',fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'14px',cursor:testing?'default':'pointer',marginBottom:chatTest?'16px':'0',transition:'all .2s'}}>
            {testing?'Testing full chain…':'Test AI Connection Now'}
          </button>
          {chatTest && (
            <div style={{padding:'14px 16px',borderRadius:'10px',background:chatTest.includes('offline')||chatTest.includes('error')?'rgba(255,77,90,0.07)':'rgba(74,222,128,0.07)',border:`1px solid ${chatTest.includes('offline')||chatTest.includes('error')?'rgba(255,77,90,0.2)':'rgba(74,222,128,0.2)'}`}}>
              <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(140,140,160,0.4)',marginBottom:'6px'}}>llama3.2 replied:</p>
              <p style={{fontFamily:'var(--font-dm)',fontSize:'14px',color:'#F0F0F0',lineHeight:1.6}}>{chatTest}</p>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'10px'}}>
          {[
            {label:'Backend Docs', href:'http://localhost:8000/docs', desc:'FastAPI Swagger UI'},
            {label:'Test Ollama Direct', href:'http://localhost:8000/test-ollama', desc:'Direct Ollama ping'},
            {label:'Waitlist Count', href:'http://localhost:8000/waitlist/count', desc:'Signups so far'},
            {label:'Health JSON', href:'/api/health', desc:'Full status JSON'},
          ].map(l=>(
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={{textDecoration:'none',padding:'14px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',display:'block',transition:'all .2s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(193,18,31,0.3)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';}}>
              <p style={{fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'13px',color:'#FF4D5A',marginBottom:'4px'}}>{l.label} ↗</p>
              <p style={{fontFamily:'var(--font-dm)',fontSize:'12px',color:'rgba(140,140,160,0.5)'}}>{l.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
