import { NextRequest, NextResponse } from 'next/server';

/**
 * FULL CONNECTION CHAIN:
 *
 * Browser (FloatingAI.tsx)
 *   → POST /api/chat   (this file)
 *   → POST http://localhost:8000/chat   (FastAPI)
 *   → _ask_ollama() in main.py
 *   → requests.post("http://localhost:11434/api/generate",
 *                   json={"model":"llama3.2","prompt":fullPrompt,"stream":False})
 *   → res.json()["response"]
 *   → back to browser
 */

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: body.message,
        session_id: body.session_id || undefined,
        context: body.context || 'general',
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err) {
    // Backend is not running
    return NextResponse.json({
      reply:
        'Backend offline.\n\nTo fix:\n1. Open terminal → cd aria/backend\n2. uvicorn main:app --reload --port 8000\n\nAlso make sure Ollama is running:\nollama serve',
      error: 'backend_offline',
    });
  }
}
