import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  const result: Record<string, string> = { frontend: 'ok' };

  // Check FastAPI backend
  try {
    const r = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(3000) });
    const d = await r.json();
    result.api    = 'ok';
    result.ollama = d.ollama || 'unknown';
  } catch {
    result.api    = 'offline';
    result.ollama = 'unknown';
  }

  // Direct Ollama check from server side
  try {
    const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
    if (r.ok) result.ollama = 'ok';
  } catch {
    if (result.ollama === 'unknown') result.ollama = 'offline';
  }

  return NextResponse.json(result);
}
