'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

/**
 * Floating AI — Connection chain:
 *
 * User types message
 *   → FloatingAI.tsx  (React component)
 *   → POST /api/chat  (Next.js API route)
 *   → POST http://localhost:8000/chat  (FastAPI backend)
 *   → requests.post("http://localhost:11434/api/generate",
 *                   json={"model":"llama3.2","prompt":..., "stream":False})
 *   → res.json()["response"]  (Ollama reply)
 *   → back to the chat bubble
 */

interface Message {
  role: 'user' | 'ai';
  text: string;
  ts: string;
}

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const QUICK_QUESTIONS = [
  'How many classes can I skip?',
  'Explain recursion simply',
  'How does Aria track attendance?',
  'Give me a study tip',
];

export default function FloatingAI() {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput]     = useState('');
  const [ariaOnline, setAriaOnline] = useState<boolean | null>(null);
  const [msgs, setMsgs]       = useState<Message[]>([{
    role: 'ai',
    text: "Hi! I'm Aria 👋 — your AI college companion. Ask me anything about attendance, studying, or your college life.",
    ts: now(),
  }]);

  // Session ID stays consistent across the conversation
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36)
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Check backend status once when chat opens
  useEffect(() => {
    if (!open || ariaOnline !== null) return;
    fetch('/api/health')
      .then(r => r.json())
      .then(() => setAriaOnline(true))
      .catch(() => setAriaOnline(false));
  }, [open, ariaOnline]);

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text, ts: now() }]);
    setLoading(true);

    try {
      /**
       * This POST hits /api/chat (Next.js route) which forwards to:
       *   FastAPI POST /chat  →  _ask_ollama()  →
       *   requests.post("http://localhost:11434/api/generate",
       *                 json={"model":"llama3.2","prompt":fullPrompt,"stream":False})
       *   return res.json()["response"].strip()
       */
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          context: 'general',
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || 'No response received.';

      setMsgs(prev => [...prev, { role: 'ai', text: reply, ts: now() }]);

      setAriaOnline(true);
    } catch {
      setMsgs(prev => [...prev, {
        role: 'ai',
        text: 'Unable to connect. Please check your connection and try again.',
        ts: now(),
      }]);
      setAriaOnline(false);
    }

    setLoading(false);
  };

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9000,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(145deg, #C1121F, #7A0C14)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(193,18,31,0.45), 0 0 0 1px rgba(255,77,90,0.2)',
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              style={{ color: '#fff', fontSize: '22px', lineHeight: 1 }}>
              ✕
            </motion.span>
          ) : (
            <motion.div key="logo"
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              style={{ width: '34px', height: '34px', position: 'relative' }}>
              <Image src="/arialogo.png" alt="Aria" fill
                style={{ objectFit: 'contain', mixBlendMode: 'screen' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring when closed */}
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #C1121F' }}
          />
        )}
      </motion.button>

      {/* ── Chat window ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', bottom: '108px', right: '32px', zIndex: 8999,
              width: '360px', height: '540px', borderRadius: '20px',
              background: 'rgba(8,8,8,0.98)',
              border: '1px solid rgba(193,18,31,0.25)',
              backdropFilter: 'blur(24px)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(193,18,31,0.06)', flexShrink: 0,
            }}>
              <div style={{ width: '36px', height: '36px', position: 'relative',
                filter: 'drop-shadow(0 0 8px rgba(193,18,31,0.5))' }}>
                <Image src="/arialogo.png" alt="Aria" fill
                  style={{ objectFit: 'contain', mixBlendMode: 'screen' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '15px',
                  color: '#F0F0F0', lineHeight: 1, marginBottom: '3px' }}>Aria AI</p>
                {/* Live status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                    background: ariaOnline === null ? '#fbbf24' : ariaOnline ? '#4ade80' : '#FF4D5A',
                    animation: 'pulseRed 2s ease-in-out infinite',
                  }} />
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px',
                    color: ariaOnline === null ? '#fbbf24' : ariaOnline ? '#4ade80' : 'rgba(140,140,160,0.6)' }}>
                    {ariaOnline === null ? 'Connecting…' : ariaOnline ? 'Online · ready' : 'Your AI companion'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {msgs.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '86%', padding: '10px 14px',
                    borderRadius: m.role === 'user'
                      ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, #C1121F, #7A0C14)'
                      : 'rgba(255,255,255,0.05)',
                    border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-dm)', fontSize: '13px',
                      lineHeight: 1.6, color: '#F0F0F0', margin: 0,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {m.text}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-jetbrains)', fontSize: '9px',
                    color: 'rgba(140,140,160,0.35)', marginTop: '4px', padding: '0 4px',
                  }}>
                    {m.ts}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', gap: '5px', alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C1121F' }}
                      />
                    ))}
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px',
                      color: 'rgba(140,140,160,0.4)', marginLeft: '6px' }}>
                      Aria is thinking…
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick question chips — only shown at start */}
            {msgs.length <= 1 && (
              <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_QUESTIONS.map(q => (
                  <button key={q}
                    onClick={() => send(q)}
                    style={{
                      fontFamily: 'var(--font-dm)', fontSize: '11px',
                      color: 'rgba(200,200,210,0.55)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '100px', padding: '5px 10px',
                      cursor: 'pointer', transition: 'all .2s',
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLButtonElement).style.borderColor = 'rgba(193,18,31,0.4)';
                      (e.target as HTMLButtonElement).style.color = '#FF4D5A';
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.target as HTMLButtonElement).style.color = 'rgba(200,200,210,0.55)';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div style={{
              padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', flexShrink: 0,
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask Aria anything…"
                style={{
                  flex: 1, padding: '10px 13px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F0F0F0', fontFamily: 'var(--font-dm)',
                  fontSize: '13px', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(193,18,31,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: input.trim()
                    ? 'linear-gradient(135deg, #C1121F, #7A0C14)'
                    : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"
                  stroke={input.trim() ? '#fff' : 'rgba(140,140,160,0.3)'}
                  strokeWidth="2">
                  <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
