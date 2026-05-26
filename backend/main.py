"""
Aria — FastAPI Backend v0.3  (Hackathon Complete)
Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import requests, os, uuid, json
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Aria API", version="0.3.2",
    description="AI-powered college companion — Attendance, Tutor, Community, Floating AI")

app.add_middleware(CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS","*").split(","),
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# ── In-memory stores (swap Supabase in prod) ──────────────────────────────────
_waitlist:   List[dict] = []
_attendance: dict = {}   # {user_id: {subject: {date: status}}}
_timetables: dict = {}   # {user_id: timetable_obj}
_chats:      dict = {}   # {session_id: [messages]}
_uploads:    List[dict] = []
_posts:      List[dict] = []
_alerts:     dict = {}   # {user_id: {phone, enabled}}

# ── Models ────────────────────────────────────────────────────────────────────
class WaitlistEntry(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context: Optional[str] = "general"

class TimetableEntry(BaseModel):
    subject: str; day: str; slot: str = ""; type: str = "lecture"

class TimetableRequest(BaseModel):
    user_id: str; entries: List[TimetableEntry]; threshold: float = 75.0

class AttendanceRecord(BaseModel):
    user_id: str; subject: str; date: str; status: str

class SkipQuery(BaseModel):
    user_id: str; subject: str

class AlertConfig(BaseModel):
    user_id: str; phone: str; enabled: bool = True

class PostCreate(BaseModel):
    user_id: str; username: str; college: str; text: str; type: str = "post"

class UploadCreate(BaseModel):
    user_id: str; username: str; title: str
    subject: str; file_type: str; description: str = ""

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/ping")
def ping():
    return {"status": "Aria backend online!", "version": "0.3.2",
            "timestamp": datetime.utcnow().isoformat()}


@app.get("/test-ollama")
def test_ollama():
    """
    Tests Ollama connection with the exact pattern you specified:
        import requests
        res = requests.post("http://localhost:11434/api/generate",
                            json={"model":"llama3.2","prompt":"your prompt","stream":False})
        print(res.json()["response"])
    Visit http://localhost:8000/test-ollama to confirm Floating AI will work.
    """
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    try:
        res = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model,
                "prompt": "Reply with exactly: Aria AI is connected and working perfectly!",
                "stream": False
            },
            timeout=30
        )
        reply = res.json()["response"].strip()
        return {
            "status": "connected",
            "model": model,
            "ollama_url": "http://localhost:11434/api/generate",
            "response": reply,
            "message": "Ollama working — Floating AI chat is fully connected."
        }
    except requests.exceptions.ConnectionError:
        return {"status": "offline", "error": "Cannot connect to Ollama",
                "fix": "Run in terminal: ollama serve"}
    except Exception as e:
        return {"status": "error", "error": str(e),
                "fix": "Run: ollama serve && ollama pull llama3.2"}

@app.get("/health")
def health():
    ollama_ok = False
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=3)
        ollama_ok = r.status_code == 200
    except: pass
    return {"api": "ok", "ollama": "ok" if ollama_ok else "offline",
            "stores": {"waitlist": len(_waitlist), "posts": len(_posts), "uploads": len(_uploads)}}

# ── Waitlist ──────────────────────────────────────────────────────────────────
@app.post("/waitlist", status_code=201)
def join_waitlist(entry: WaitlistEntry):
    if not entry.email and not entry.phone:
        raise HTTPException(400, "Provide email or phone")
    for e in _waitlist:
        if (entry.email and e.get("email") == entry.email) or \
           (entry.phone and e.get("phone") == entry.phone):
            return {"message": "Already on waitlist!", "position": _waitlist.index(e)+1}
    record = {"id": str(uuid.uuid4()), "email": entry.email, "phone": entry.phone,
              "college": entry.college, "branch": entry.branch,
              "joined_at": datetime.utcnow().isoformat()}
    _waitlist.append(record)
    return {"message": "You're on the Aria waitlist! 🎉", "position": len(_waitlist)}

@app.get("/waitlist/count")
def waitlist_count():
    return {"count": len(_waitlist)}

@app.get("/waitlist/all")
def waitlist_all():
    return {"entries": _waitlist, "total": len(_waitlist)}

# ── AI Chat ───────────────────────────────────────────────────────────────────
SYSTEM_PROMPTS = {
    "general": (
        "You are Aria — an AI assistant for Indian college students. "
        "Help with studies, attendance, college life, coding, and general questions. "
        "Be concise, helpful, and friendly. You remember this conversation. "
        "Keep responses under 200 words unless asked to elaborate."
    ),
    "attendance": (
        "You are Aria's Attendance Assistant. Help students understand attendance status, "
        "calculate skippable classes, and plan their schedule. Be precise with numbers. "
        "When given data like '16/20 classes (80%), can skip 1 more', use it to answer specifically."
    ),
    "tutor": (
        "You are Aria's AI Tutor — strict but kind. Help students understand lecture content, "
        "prepare notes, and answer subject questions. For code, provide working examples. "
        "If given a YouTube video context, answer as if you've watched it. Be thorough but concise."
    ),
    "moderation": (
        "You are a content moderator for a college community app. "
        "Reply ONLY with YES if content is abusive/offensive/inappropriate, or NO if it's fine. "
        "One word reply only."
    ),
}

@app.post("/chat")
def chat(req: ChatRequest):
    sid = req.session_id or str(uuid.uuid4())
    if sid not in _chats: _chats[sid] = []
    history = _chats[sid]
    system = SYSTEM_PROMPTS.get(req.context or "general", SYSTEM_PROMPTS["general"])
    USE_GROQ = os.getenv("USE_GROQ", "false").lower() == "true"
    reply = _ask_groq(req.message, history, system) if USE_GROQ else _ask_ollama(req.message, history, system)
    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": reply})
    if len(history) > 40: _chats[sid] = history[-40:]
    return {"reply": reply, "session_id": sid}

@app.delete("/chat/{session_id}")
def clear_chat(session_id: str):
    _chats.pop(session_id, None)
    return {"message": "Chat cleared"}

def _ask_ollama(prompt: str, history: list, system: str) -> str:
    """
    Tries Ollama first (for local dev). If unavailable, auto-falls back to Groq (for cloud/Render).
    """
    model = os.getenv("OLLAMA_MODEL", "llama3.2")

    # Build full prompt with system context + conversation history
    full_prompt = f"{system}\n\n"
    for m in history[-10:]:
        role = "User" if m["role"] == "user" else "Aria"
        full_prompt += f"{role}: {m['content']}\n"
    full_prompt += f"User: {prompt}\nAria:"

    try:
        res = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": model, "prompt": full_prompt, "stream": False},
            timeout=8  # Short timeout — if Ollama not running, fall through quickly
        )
        return res.json()["response"].strip()

    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
        # Ollama not available (cloud deployment) — fall back to Groq
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            return _ask_groq(prompt, history, system)
        return (
            "🤖 Aria AI is running in demo mode. "
            "To enable full AI chat, set GROQ_API_KEY in your environment variables."
        )
    except KeyError:
        return f"Ollama returned unexpected response: {res.text[:200]}"
    except Exception as e:
        return f"AI error: {str(e)[:120]}"

def _ask_groq(prompt: str, history: list, system: str) -> str:
    try:
        # Prevent httpx proxy environment parsing bug on Render
        for key in ["http_proxy", "https_proxy", "all_proxy", "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY"]:
            os.environ.pop(key, None)
            
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        msgs = [{"role": "system", "content": system}]
        for m in history[-10:]: msgs.append({"role": m["role"], "content": m["content"]})
        msgs.append({"role": "user", "content": prompt})
        model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        if model == "llama3-8b-8192":
            model = "llama-3.1-8b-instant"
        r = client.chat.completions.create(messages=msgs,
            model=model, max_tokens=800, temperature=0.7)
        return r.choices[0].message.content.strip()
    except Exception as e:
        return f"Groq error: {str(e)[:150]}"

# ── Content Moderation ────────────────────────────────────────────────────────
@app.post("/moderate")
def moderate(body: dict):
    text = body.get("text", "")
    reply = _ask_ollama(f'Is this text abusive or inappropriate for a college app? Reply only YES or NO: "{text[:300]}"',
                        [], SYSTEM_PROMPTS["moderation"])
    return {"safe": "YES" not in reply.upper()[:5], "text": text[:50]}

# ── Timetable ─────────────────────────────────────────────────────────────────
@app.post("/timetable")
def set_timetable(req: TimetableRequest):
    _timetables[req.user_id] = {
        "entries": [e.dict() for e in req.entries],
        "threshold": req.threshold,
        "subjects": list({e.subject for e in req.entries}),
        "updated_at": datetime.utcnow().isoformat()
    }
    return {"message": "Timetable saved!", "subjects": list({e.subject for e in req.entries})}

@app.get("/timetable/{user_id}")
def get_timetable(user_id: str):
    if user_id not in _timetables:
        raise HTTPException(404, "No timetable found")
    return _timetables[user_id]

# ── Attendance ────────────────────────────────────────────────────────────────
@app.post("/attendance/mark")
def mark_attendance(r: AttendanceRecord, bg: BackgroundTasks):
    _attendance.setdefault(r.user_id, {}).setdefault(r.subject, {})[r.date] = r.status
    # Trigger WhatsApp alert check in background
    if r.status == "A":
        bg.add_task(_check_alert, r.user_id, r.subject)
    return {"message": "Marked", "subject": r.subject, "date": r.date, "status": r.status}

@app.post("/attendance/bulk-mark")
def bulk_mark(records: List[AttendanceRecord]):
    for r in records:
        _attendance.setdefault(r.user_id, {}).setdefault(r.subject, {})[r.date] = r.status
    return {"message": f"Marked {len(records)} records"}

@app.get("/attendance/{user_id}")
def get_attendance(user_id: str, subject: Optional[str] = None):
    if user_id not in _attendance: return {"attendance": {}}
    att = _attendance[user_id]
    return {"attendance": {subject: att.get(subject, {})} if subject else att}

@app.post("/attendance/can-skip")
def can_skip(q: SkipQuery):
    threshold = _timetables.get(q.user_id, {}).get("threshold", 75.0)
    records = _attendance.get(q.user_id, {}).get(q.subject, {})
    if not records: return {"can_skip": 0, "message": "No data", "status": "unknown"}
    total = len(records)
    present = sum(1 for s in records.values() if s in ("P", "late"))
    pct = round((present / total) * 100, 2)
    can = max(0, int((present * 100) / threshold) - total)
    status = "safe" if pct >= threshold + 10 else ("warning" if pct >= threshold else "danger")
    return {"subject": q.subject, "present": present, "total": total,
            "current_percentage": pct, "threshold": threshold, "can_skip": can, "status": status,
            "message": (f"✅ You can skip {can} more {q.subject} class(es)." if can > 0
                       else f"🚨 Cannot skip any more {q.subject}. You're at {pct}%.")}

@app.get("/attendance/{user_id}/summary")
def attendance_summary(user_id: str):
    if user_id not in _attendance: return {"summary": [], "overall_status": "no_data"}
    threshold = _timetables.get(user_id, {}).get("threshold", 75.0)
    summary = []
    for subject, records in _attendance[user_id].items():
        total = len(records)
        if not total: continue
        present = sum(1 for s in records.values() if s in ("P", "late"))
        pct = round((present / total) * 100, 2)
        can = max(0, int((present * 100) / threshold) - total)
        status = "safe" if pct >= threshold+10 else ("warning" if pct >= threshold else "danger")
        summary.append({"subject": subject, "present": present, "total": total,
                        "percentage": pct, "can_skip": can, "status": status})
    overall = ("danger" if any(s["status"]=="danger" for s in summary)
               else "warning" if any(s["status"]=="warning" for s in summary) else "safe")
    return {"summary": summary, "overall_status": overall, "threshold": threshold}

# ── WhatsApp Alerts ───────────────────────────────────────────────────────────
@app.post("/alerts/configure")
def configure_alerts(cfg: AlertConfig):
    _alerts[cfg.user_id] = {"phone": cfg.phone, "enabled": cfg.enabled}
    return {"message": "Alert configured", "phone": cfg.phone}

@app.get("/alerts/{user_id}")
def get_alerts(user_id: str):
    return _alerts.get(user_id, {"enabled": False})

def _check_alert(user_id: str, subject: str):
    """Background task: send WhatsApp if attendance is critical"""
    if user_id not in _alerts or not _alerts[user_id].get("enabled"): return
    records = _attendance.get(user_id, {}).get(subject, {})
    if not records: return
    total = len(records)
    present = sum(1 for s in records.values() if s in ("P", "late"))
    threshold = _timetables.get(user_id, {}).get("threshold", 75.0)
    pct = (present / total) * 100
    can = max(0, int((present * 100) / threshold) - total)
    phone = _alerts[user_id]["phone"]
    if can == 0:
        msg = (f"🚨 *Aria Alert*\n\nYou cannot skip any more *{subject}* classes!\n"
               f"Current: {pct:.1f}% | Required: {threshold}%\n\nAttend your next class!")
    elif can <= 2:
        msg = (f"⚠️ *Aria Warning*\n\nYou can only skip *{can} more* {subject} class(es).\n"
               f"Current: {pct:.1f}% | Required: {threshold}%\nBe careful!")
    else:
        return  # No alert needed
    _send_whatsapp(phone, msg)

def _send_whatsapp(phone: str, message: str):
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_num = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
    if not sid or not token:
        print(f"[WhatsApp] Would send to {phone}: {message[:60]}...")
        return
    try:
        from twilio.rest import Client
        Client(sid, token).messages.create(
            from_=from_num, to=f"whatsapp:{phone}", body=message)
        print(f"[WhatsApp] Sent to {phone}")
    except Exception as e:
        print(f"[WhatsApp] Failed: {e}")

# ── Community Posts ───────────────────────────────────────────────────────────
@app.post("/posts", status_code=201)
def create_post(p: PostCreate):
    # Quick moderation
    mod = _ask_ollama(f'Abusive content? YES/NO only: "{p.text[:200]}"', [], SYSTEM_PROMPTS["moderation"])
    if "YES" in mod.upper()[:5]:
        raise HTTPException(400, "Content flagged by Aria AI moderation")
    post = {"id": str(uuid.uuid4()), "user_id": p.user_id, "username": p.username,
            "college": p.college, "text": p.text, "type": p.type,
            "likes": 0, "liked_by": [], "created_at": datetime.utcnow().isoformat()}
    _posts.insert(0, post)
    return post

@app.get("/posts")
def get_posts(limit: int = 20, offset: int = 0):
    return {"posts": _posts[offset:offset+limit], "total": len(_posts)}

@app.post("/posts/{post_id}/like")
def like_post(post_id: str, user_id: str):
    for p in _posts:
        if p["id"] == post_id:
            if user_id in p["liked_by"]:
                p["liked_by"].remove(user_id); p["likes"] -= 1
                return {"liked": False, "likes": p["likes"]}
            p["liked_by"].append(user_id); p["likes"] += 1
            return {"liked": True, "likes": p["likes"]}
    raise HTTPException(404, "Post not found")

# ── Uploads ───────────────────────────────────────────────────────────────────
@app.post("/uploads", status_code=201)
def create_upload(u: UploadCreate):
    upload = {"id": str(uuid.uuid4()), "user_id": u.user_id, "username": u.username,
              "title": u.title, "subject": u.subject, "file_type": u.file_type,
              "description": u.description, "downloads": 0,
              "created_at": datetime.utcnow().isoformat()}
    _uploads.insert(0, upload)
    return upload

@app.get("/uploads")
def get_uploads(q: Optional[str] = None, subject: Optional[str] = None, limit: int = 20):
    results = _uploads
    if q: results = [u for u in results if q.lower() in u["title"].lower() or q.lower() in u["subject"].lower()]
    if subject: results = [u for u in results if u["subject"].lower() == subject.lower()]
    return {"uploads": results[:limit], "total": len(results)}

@app.post("/uploads/{upload_id}/download")
def record_download(upload_id: str):
    for u in _uploads:
        if u["id"] == upload_id:
            u["downloads"] += 1
            return {"downloads": u["downloads"]}
    raise HTTPException(404, "Upload not found")

# ── AI Helpers ────────────────────────────────────────────────────────────────
@app.post("/ai/generate-notes")
def generate_notes(body: dict):
    """Generate study notes from a YouTube video ID or topic"""
    video_id = body.get("video_id", "")
    topic = body.get("topic", "")
    prompt = (f"Generate comprehensive study notes for the YouTube video https://youtu.be/{video_id}. "
              if video_id else f"Generate comprehensive study notes about: {topic}. ")
    prompt += "Format with # headings, bullet points, key terms in **bold**, and a summary at the end."
    reply = _ask_ollama(prompt, [], SYSTEM_PROMPTS["tutor"])
    return {"notes": reply}

@app.post("/ai/explain")
def explain_topic(body: dict):
    topic = body.get("topic", "")
    level = body.get("level", "undergraduate")
    reply = _ask_ollama(
        f"Explain '{topic}' for a {level} student in India. Be clear, use examples, keep it concise.",
        [], SYSTEM_PROMPTS["tutor"])
    return {"explanation": reply}

@app.post("/ai/attendance-advice")
def attendance_advice(user_id: str):
    """Get AI advice on attendance situation"""
    if user_id not in _attendance:
        return {"advice": "No attendance data found. Start marking your classes in the Attendance section!"}
    threshold = _timetables.get(user_id, {}).get("threshold", 75.0)
    summary = []
    for subject, records in _attendance[user_id].items():
        if not records: continue
        total = len(records)
        present = sum(1 for s in records.values() if s in ("P","late"))
        pct = round((present/total)*100, 1)
        can = max(0, int((present*100)/threshold)-total)
        summary.append(f"{subject}: {pct}% ({present}/{total}), can skip {can} more")
    if not summary:
        return {"advice": "No attendance records yet. Start marking your daily attendance!"}
    ctx = "; ".join(summary)
    reply = _ask_ollama(
        f"My attendance: {ctx}. Threshold: {threshold}%. Give me specific, practical advice on managing my attendance.",
        [], SYSTEM_PROMPTS["attendance"])
    return {"advice": reply, "summary": summary}
