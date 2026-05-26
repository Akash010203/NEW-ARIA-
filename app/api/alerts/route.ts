import { NextRequest, NextResponse } from 'next/server';
const B = process.env.BACKEND_URL || 'http://localhost:8000';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const r = await fetch(`${B}/alerts/configure`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    return NextResponse.json(await r.json());
  } catch { return NextResponse.json({ error:'Backend offline. Alerts require backend running.' }, { status:503 }); }
}
