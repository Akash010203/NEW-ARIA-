import { NextRequest, NextResponse } from 'next/server';
const B = process.env.BACKEND_URL || 'http://localhost:8000';
export async function GET() {
  try { const r = await fetch(`${B}/posts`); return NextResponse.json(await r.json()); }
  catch { return NextResponse.json({ posts: [], total: 0, error: 'Backend offline' }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await fetch(`${B}/posts`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    return NextResponse.json(await r.json(), { status: r.ok ? 201 : r.status });
  } catch { return NextResponse.json({ error:'Backend offline' }, { status:503 }); }
}
