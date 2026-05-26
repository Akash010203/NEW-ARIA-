import { NextRequest, NextResponse } from 'next/server';
const B = process.env.BACKEND_URL || 'http://localhost:8000';
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const sub = req.nextUrl.searchParams.get('subject') || '';
  try {
    const url = `${B}/uploads?${q?`q=${encodeURIComponent(q)}&`:''}${sub?`subject=${encodeURIComponent(sub)}`:''}`;
    const r = await fetch(url);
    return NextResponse.json(await r.json());
  } catch { return NextResponse.json({ uploads: [], total: 0 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await fetch(`${B}/uploads`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    return NextResponse.json(await r.json(), { status: r.ok ? 201 : 400 });
  } catch { return NextResponse.json({ error:'Backend offline' }, { status:503 }); }
}
