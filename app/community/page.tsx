'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DMPanel from '@/components/DMPanel';
import Link from 'next/link';
import Image from 'next/image';

interface Post { id:string; user:string; initials:string; college:string; text:string; likes:number; time:string; liked:boolean; type:'post'|'note'|'question'; }
interface Upload { id:string; title:string; subject:string; user:string; type:'pdf'|'video'|'image'|'notes'; size:string; downloads:number; }

const SAMPLE_POSTS: Post[] = [
  {id:'1',user:'Rohan Verma',initials:'RV',college:'CSE Student',text:'Finally cracked the Linked List reversal question! The key is using 3 pointers. If anyone needs help, DM me!',likes:24,time:'2h ago',liked:false,type:'post'},
  {id:'2',user:'Priya Singh',initials:'PS',college:'IT Student',text:'Sharing my complete Engineering Maths-II notes. All 5 modules covered. Link in uploads section!',likes:87,time:'4h ago',liked:false,type:'note'},
  {id:'3',user:'Arjun Pandey',initials:'AP',college:'ECE Student',text:'Does anyone know the internal exam schedule for November? Aria says I can only skip 1 more Physics class!',likes:12,time:'6h ago',liked:false,type:'question'},
  {id:'4',user:'Shreya Mishra',initials:'SM',college:'MCA Student',text:'Pro tip: For DBMS practicals, practice these 5 queries — they appear every semester without fail.',likes:56,time:'1d ago',liked:false,type:'post'},
  {id:'5',user:'Vikram Tiwari',initials:'VT',college:'ME Student',text:'The AI Tutor mode just helped me understand the entire Thermodynamics chapter using 1 YouTube video. Mind blown.',likes:43,time:'1d ago',liked:false,type:'post'},
];

const SAMPLE_UPLOADS: Upload[] = [
  {id:'1',title:'Engineering Maths II — Complete Notes',subject:'Mathematics',user:'Priya Singh',type:'pdf',size:'4.2 MB',downloads:234},
  {id:'2',title:'DBMS Practical File',subject:'Computer Science',user:'Rohan Verma',type:'pdf',size:'2.1 MB',downloads:189},
  {id:'3',title:'Physics Lab Manual',subject:'Physics',user:'Arjun Pandey',type:'pdf',size:'8.7 MB',downloads:156},
  {id:'4',title:'C Programming Problems & Solutions',subject:'Computer Science',user:'Nidhi Rao',type:'notes',size:'1.8 MB',downloads:312},
  {id:'5',title:'Engineering Drawing Templates',subject:'Engineering Drawing',user:'Vikram Tiwari',type:'image',size:'12 MB',downloads:98},
  {id:'6',title:'Circuit Analysis Lectures',subject:'Electronics',user:'Anjali Shukla',type:'video',size:'340 MB',downloads:67},
];

const typeIcon = {pdf:'📄',video:'🎬',image:'🖼️',notes:'📝'};
const typeColor = {pdf:'rgba(255,77,90,0.2)',video:'rgba(139,92,246,0.2)',image:'rgba(251,191,36,0.2)',notes:'rgba(74,222,128,0.2)'};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [uploads, setUploads] = useState<Upload[]>(SAMPLE_UPLOADS);
  const [activeTab, setActiveTab] = useState<'feed'|'uploads'|'groups'>('feed');
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'post'|'note'|'question'>('post');
  const [searchQ, setSearchQ] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [username] = useState('You');
  const [moderating, setModerating] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File|null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadDone, setUploadDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = typeof window !== 'undefined' ? { current: null as HTMLInputElement | null } : { current: null };

  const submitPost = async () => {
    if(!newPost.trim()) return;
    if(!loggedIn){setShowLogin(true);return;}
    // AI moderation check
    setModerating(true);
    let safe=true;
    try {
      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:`Is this text abusive, offensive, or clearly inappropriate for a college community? Reply only YES or NO: "${newPost}"`,context:'general'})});
      const d=await res.json();
      safe=!d.reply?.toUpperCase().startsWith('YES');
    } catch {safe=true;}
    setModerating(false);
    if(!safe){alert('⚠️ Your post was flagged by Aria AI moderation. Please keep the community respectful.');return;}
    const post:Post={id:Date.now().toString(),user:username,initials:'YU',college:'College Student',text:newPost.trim(),likes:0,time:'Just now',liked:false,type:postType};
    setPosts(p=>[post,...p]);
    setNewPost('');
  };

  const handleUpload = async () => {
    if(!uploadFile || !uploadTitle.trim() || !uploadSubject.trim()) return;
    setUploading(true);
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 1400));
    const newUpload: Upload = {
      id: Date.now().toString(),
      title: uploadTitle.trim(),
      subject: uploadSubject.trim(),
      user: 'You',
      type: uploadFile.name.endsWith('.mp4')||uploadFile.name.endsWith('.mkv') ? 'video'
           : uploadFile.name.endsWith('.png')||uploadFile.name.endsWith('.jpg')||uploadFile.name.endsWith('.jpeg') ? 'image'
           : uploadFile.name.endsWith('.pdf') ? 'pdf' : 'notes',
      size: uploadFile.size > 1048576 ? `${(uploadFile.size/1048576).toFixed(1)} MB` : `${(uploadFile.size/1024).toFixed(0)} KB`,
      downloads: 0,
    };
    setUploads(prev => [newUpload, ...prev]);
    setUploading(false);
    setUploadDone(true);
    setTimeout(() => {
      setShowUpload(false);
      setUploadDone(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadSubject('');
    }, 1600);
  };

  const toggleLike = (id:string) => setPosts(p=>p.map(post=>post.id===id?{...post,likes:post.liked?post.likes-1:post.likes+1,liked:!post.liked}:post));

  const filteredUploads = uploads.filter(u=>searchQ===''||u.title.toLowerCase().includes(searchQ.toLowerCase())||u.subject.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div style={{minHeight:'100vh',background:'#040404',color:'#F0F0F0',fontFamily:'var(--font-dm)'}}>
      {/* Navbar */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(4,4,4,0.97)',borderBottom:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(24px)'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <div style={{width:'28px',height:'28px',position:'relative'}}>
            <Image src="/arialogo.png" alt="Aria" fill style={{objectFit:'contain',mixBlendMode:'screen'}}/>
          </div>
          <span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'18px',letterSpacing:'0.08em',color:'#F0F0F0'}}>ARIA</span>
        </Link>
        <div style={{display:'flex',gap:'8px'}}>
          {(['feed','uploads','groups'] as const).map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)}
              style={{padding:'7px 16px',borderRadius:'8px',border:'1px solid',fontFamily:'var(--font-dm)',fontSize:'13px',cursor:'pointer',transition:'all .2s',textTransform:'capitalize',
                borderColor:activeTab===tab?'rgba(193,18,31,0.5)':'rgba(255,255,255,0.08)',
                background:activeTab===tab?'rgba(193,18,31,0.12)':'transparent',
                color:activeTab===tab?'#FF4D5A':'rgba(200,200,210,0.6)'}}>
              {tab}
            </button>
          ))}
        </div>
        {loggedIn
          ? <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#C1121F,#7A0C14)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'12px',color:'#fff'}}>YU</div>
            </div>
          : <button onClick={()=>setShowLogin(true)} className="btn-primary" style={{padding:'8px 20px',fontSize:'13px'}}>Login</button>
        }
      </nav>

      <div style={{maxWidth:'900px',margin:'0 auto',padding:'40px 24px'}}>

        {/* ── FEED ─────────────────────────────────────────── */}
        {activeTab==='feed' && (
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            {/* Compose */}
            <div style={{padding:'20px',borderRadius:'16px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                {(['post','note','question'] as const).map(t=>(
                  <button key={t} onClick={()=>setPostType(t)}
                    style={{padding:'5px 14px',borderRadius:'100px',border:'1px solid',fontFamily:'var(--font-jetbrains)',fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s',
                      borderColor:postType===t?'rgba(193,18,31,0.5)':'rgba(255,255,255,0.08)',
                      background:postType===t?'rgba(193,18,31,0.12)':'transparent',
                      color:postType===t?'#FF4D5A':'rgba(140,140,160,0.5)'}}>
                    {t==='post'?'📢 Post':t==='note'?'📝 Share Note':'❓ Question'}
                  </button>
                ))}
              </div>
              <textarea value={newPost} onChange={e=>setNewPost(e.target.value)}
                placeholder={postType==='post'?'Share something with your college community…':postType==='note'?'Share a note or tip…':'Ask the community a question…'}
                rows={3}
                style={{width:'100%',padding:'12px 16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'14px',outline:'none',resize:'none',lineHeight:1.6}}
                onFocus={e=>(e.target.style.borderColor='rgba(193,18,31,0.35)')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}/>
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'10px'}}>
                <button onClick={submitPost} disabled={moderating||!newPost.trim()} className="btn-primary" style={{padding:'9px 20px',fontSize:'13px'}}>
                  {moderating?'Checking…':'Post'}
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.map((post,i)=>(
              <motion.div key={post.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                style={{padding:'20px',borderRadius:'16px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',transition:'border-color .2s'}}
                onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.12)')} onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
                <div style={{display:'flex',gap:'12px',marginBottom:'12px'}}>
                  <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,#C1121F,#7A0C14)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'12px',color:'#fff',flexShrink:0}}>{post.initials}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px'}}>
                      <span style={{fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'14px',color:'#F0F0F0'}}>{post.user}</span>
                      <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',color:'rgba(140,140,160,0.4)',background:'rgba(255,255,255,0.04)',padding:'2px 8px',borderRadius:'100px'}}>{post.college}</span>
                      <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',color:'rgba(140,140,160,0.3)'}}>{post.time}</span>
                      <span style={{marginLeft:'auto',fontSize:'14px'}}>{post.type==='note'?'📝':post.type==='question'?'❓':'📢'}</span>
                    </div>
                    <p style={{fontFamily:'var(--font-dm)',fontSize:'14px',lineHeight:1.7,color:'rgba(200,200,210,0.8)',margin:0}}>{post.text}</p>
                  </div>
                </div>
                <div style={{display:'flex',gap:'12px',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <button onClick={()=>toggleLike(post.id)}
                    style={{display:'flex',alignItems:'center',gap:'5px',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-dm)',fontSize:'13px',color:post.liked?'#C1121F':'rgba(140,140,160,0.5)',transition:'color .2s'}}>
                    {post.liked?'❤️':'🤍'} {post.likes}
                  </button>
                  <button style={{display:'flex',alignItems:'center',gap:'5px',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.5)'}}>
                    💬 Reply
                  </button>
                  <button onClick={()=>loggedIn?setShowDM(true):setShowLogin(true)} style={{display:'flex',alignItems:'center',gap:'5px',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.5)'}}>
                    ✉️ DM
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── UPLOADS ──────────────────────────────────────── */}
        {activeTab==='uploads' && (
          <div>
            <div style={{display:'flex',gap:'12px',marginBottom:'24px',flexWrap:'wrap'}}>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="🔍  Search notes, PDFs, subjects…"
                style={{flex:1,minWidth:'200px',padding:'11px 16px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'14px',outline:'none'}}
                onFocus={e=>(e.target.style.borderColor='rgba(193,18,31,0.35)')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}/>
              <button onClick={()=>loggedIn?setShowUpload(true):setShowLogin(true)} className="btn-primary" style={{padding:'11px 20px',fontSize:'14px',whiteSpace:'nowrap'}}>+ Upload</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'14px'}}>
              {filteredUploads.map((u,i)=>(
                <motion.div key={u.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                  style={{padding:'20px',borderRadius:'14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',transition:'all .25s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(193,18,31,0.3)';e.currentTarget.style.transform='translateY(-3px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='translateY(0)';}}>
                  <div style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                    <div style={{width:'42px',height:'42px',borderRadius:'10px',background:typeColor[u.type],display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>{typeIcon[u.type]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontFamily:'var(--font-syne)',fontWeight:600,fontSize:'14px',color:'#F0F0F0',marginBottom:'4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.title}</p>
                      <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',color:'rgba(193,18,31,0.7)',marginBottom:'8px'}}>{u.subject}</p>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontFamily:'var(--font-dm)',fontSize:'11px',color:'rgba(140,140,160,0.5)'}}>by {u.user}</span>
                        <div style={{display:'flex',gap:'8px'}}>
                          <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',color:'rgba(140,140,160,0.35)'}}>{u.size}</span>
                          <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',color:'rgba(74,222,128,0.6)'}}>↓{u.downloads}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── GROUPS ───────────────────────────────────────── */}
        {activeTab==='groups' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'14px'}}>
            {[
              {name:'CSE 2026 Batch',members:234,desc:'Final year CSE students — placements, projects, notes sharing',color:'#C1121F'},
              {name:'Engineering Maths Help',members:891,desc:'For anyone struggling with Engineering Maths — solved problems daily',color:'#7c6af7'},
              {name:'Exam Warriors',members:445,desc:'Study group for upcoming semester exams. Syllabus tracking and tips',color:'#fbbf24'},
              {name:'Physics Lab Partners',members:67,desc:'Find lab partners, share readings and calculations',color:'#4ade80'},
              {name:'Placement Prep 2025',members:1203,desc:'Aptitude, coding, interviews — everything placement related',color:'#FF4D5A'},
              {name:'Hostel Notice Board',members:312,desc:'Events, announcements, lost & found for hostel students',color:'#60a5fa'},
            ].map((g,i)=>(
              <motion.div key={g.name} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                style={{padding:'20px',borderRadius:'14px',background:'rgba(255,255,255,0.025)',border:`1px solid ${g.color}30`,cursor:'pointer',transition:'all .25s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=g.color+'60';e.currentTarget.style.transform='translateY(-3px)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=g.color+'30';e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{width:'40px',height:'40px',borderRadius:'10px',background:`${g.color}20`,border:`1px solid ${g.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',marginBottom:'12px'}}>👥</div>
                <p style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'15px',color:'#F0F0F0',marginBottom:'6px'}}>{g.name}</p>
                <p style={{fontFamily:'var(--font-dm)',fontSize:'12px',color:'rgba(140,140,160,0.6)',lineHeight:1.5,marginBottom:'12px'}}>{g.desc}</p>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',color:'rgba(140,140,160,0.4)'}}>{g.members} members</span>
                  <button onClick={()=>loggedIn?alert('Joined!'):setShowLogin(true)}
                    style={{padding:'5px 14px',borderRadius:'100px',border:`1px solid ${g.color}40`,background:`${g.color}15`,color:g.color,fontSize:'11px',cursor:'pointer',fontFamily:'var(--font-jetbrains)',transition:'all .2s'}}>
                    Join
                  </button>
                </div>
              </motion.div>
            ))}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}
              style={{padding:'20px',borderRadius:'14px',border:'1px dashed rgba(255,255,255,0.1)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px',cursor:'pointer',transition:'border-color .2s',minHeight:'160px'}}
              onClick={()=>loggedIn?alert('Create group coming soon!'):setShowLogin(true)}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(193,18,31,0.35)')} onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.1)')}>
              <span style={{fontSize:'28px'}}>+</span>
              <span style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.5)'}}>Create a Group</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>!uploading&&setShowUpload(false)}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{width:'400px',padding:'36px',borderRadius:'20px',background:'rgba(12,12,12,0.98)',border:'1px solid rgba(193,18,31,0.25)',boxShadow:'0 24px 80px rgba(0,0,0,0.8)'}}>
              {uploadDone ? (
                <div style={{textAlign:'center',padding:'24px 0'}}>
                  <div style={{fontSize:'48px',marginBottom:'16px'}}>✅</div>
                  <p style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:'20px',color:'#4ade80'}}>Uploaded Successfully!</p>
                  <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.6)',marginTop:'8px'}}>Your file is now live in the community.</p>
                </div>
              ) : (
                <>
                  <h2 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'20px',color:'#F0F0F0',marginBottom:'6px'}}>Upload to Community</h2>
                  <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.5)',marginBottom:'24px'}}>Share notes, PDFs, or study material</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    <div
                      onClick={()=>{const inp=document.createElement('input');inp.type='file';inp.accept='.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4,.txt';inp.onchange=(e)=>{const f=(e.target as HTMLInputElement).files?.[0];if(f)setUploadFile(f);};inp.click();}}
                      style={{padding:'20px',borderRadius:'12px',border:`2px dashed ${uploadFile?'rgba(74,222,128,0.4)':'rgba(255,255,255,0.1)'}`,background:uploadFile?'rgba(74,222,128,0.05)':'rgba(255,255,255,0.02)',cursor:'pointer',textAlign:'center',transition:'all .2s'}}>
                      <div style={{fontSize:'28px',marginBottom:'8px'}}>{uploadFile?'📎':'📁'}</div>
                      <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:uploadFile?'#4ade80':'rgba(140,140,160,0.5)'}}>
                        {uploadFile ? uploadFile.name : 'Click to choose file  (PDF, DOC, PPT, Image, Video)'}
                      </p>
                      {uploadFile && <p style={{fontFamily:'var(--font-jetbrains)',fontSize:'10px',color:'rgba(140,140,160,0.4)',marginTop:'4px'}}>{(uploadFile.size/1048576).toFixed(2)} MB</p>}
                    </div>
                    <input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="Title (e.g. Engineering Maths Notes)"
                      style={{padding:'11px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'13px',outline:'none'}}
                      onFocus={e=>(e.target.style.borderColor='rgba(193,18,31,0.35)')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}/>
                    <input value={uploadSubject} onChange={e=>setUploadSubject(e.target.value)} placeholder="Subject (e.g. Mathematics, Physics)"
                      style={{padding:'11px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'13px',outline:'none'}}
                      onFocus={e=>(e.target.style.borderColor='rgba(193,18,31,0.35)')} onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.08)')}/>
                    <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
                      <button onClick={handleUpload} disabled={uploading||!uploadFile||!uploadTitle.trim()||!uploadSubject.trim()}
                        className="btn-primary" style={{flex:1,padding:'12px',fontSize:'14px',opacity:(!uploadFile||!uploadTitle.trim()||!uploadSubject.trim())?0.4:1}}>
                        {uploading?'Uploading…':'Upload'}
                      </button>
                      <button onClick={()=>setShowUpload(false)} className="btn-ghost" style={{flex:1,padding:'12px',fontSize:'14px'}}>Cancel</button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DM Panel */}
      <AnimatePresence>
        {showDM && <DMPanel onClose={()=>setShowDM(false)} />}
      </AnimatePresence>

      {/* Login modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setShowLogin(false)}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{width:'360px',padding:'36px',borderRadius:'20px',background:'rgba(12,12,12,0.98)',border:'1px solid rgba(193,18,31,0.25)',boxShadow:'0 24px 80px rgba(0,0,0,0.8)'}}>
              <div style={{textAlign:'center',marginBottom:'28px'}}>
                <div style={{width:'56px',height:'56px',position:'relative',margin:'0 auto 16px'}}>
                  <Image src="/arialogo.png" alt="Aria" fill style={{objectFit:'contain',mixBlendMode:'screen'}}/>
                </div>
                <h2 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'22px',color:'#F0F0F0',marginBottom:'6px'}}>Join Aria Community</h2>
                <p style={{fontFamily:'var(--font-dm)',fontSize:'13px',color:'rgba(140,140,160,0.6)'}}>Login to post, upload, and join groups</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                <button onClick={()=>{setLoggedIn(true);setShowLogin(false);}} style={{padding:'12px',borderRadius:'10px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#F0F0F0',fontFamily:'var(--font-dm)',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',transition:'all .2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.09)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')}>
                  <span>🔵</span> Continue with Google
                </button>
                <button onClick={()=>{setLoggedIn(true);setShowLogin(false);}} style={{padding:'12px',borderRadius:'10px',background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.2)',color:'#25D366',fontFamily:'var(--font-dm)',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',transition:'all .2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(37,211,102,0.12)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(37,211,102,0.08)')}>
                  <span>📱</span> Continue with Phone
                </button>
              </div>
              <p style={{textAlign:'center',fontFamily:'var(--font-dm)',fontSize:'11px',color:'rgba(140,140,160,0.35)',marginTop:'16px'}}>No data sent to cloud · 100% private</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
