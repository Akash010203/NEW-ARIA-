import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.email && !body.phone) return NextResponse.json({ error:'Email or phone required' }, { status:400 });
    const res = await fetch(`${BACKEND}/waitlist`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : res.status });
  } catch {
    return NextResponse.json({ error:'Backend offline' }, { status:503 });
  }
}
