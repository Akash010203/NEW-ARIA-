import { NextRequest, NextResponse } from 'next/server';
const B = process.env.BACKEND_URL || 'http://localhost:8000';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await fetch(`${B}/attendance/mark`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    return NextResponse.json(await r.json());
  } catch { return NextResponse.json({ error:'Backend offline' }, { status:503 }); }
}
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id') || 'demo_user';
  try {
    const r = await fetch(`${B}/attendance/${userId}/summary`);
    return NextResponse.json(await r.json());
  } catch { return NextResponse.json({ summary:[], overall_status:'no_data' }); }
}
