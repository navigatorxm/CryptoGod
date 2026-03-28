import { NextRequest, NextResponse } from 'next/server';

const XCLAW_BASE_URL = process.env.XCLAW_BASE_URL;

export async function POST(req: NextRequest) {
  if (!XCLAW_BASE_URL) {
    return NextResponse.json(
      { error: 'X-Claw service not configured. Set XCLAW_BASE_URL in environment.' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${XCLAW_BASE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { error: `X-Claw returned ${upstream.status}: ${text.slice(0, 200)}` },
        { status: upstream.status }
      );
    }

    // Stream the response back
    const contentType = upstream.headers.get('content-type') ?? 'application/json';
    const responseBody = upstream.body;

    if (!responseBody) {
      const json = await upstream.json();
      return NextResponse.json(json);
    }

    return new Response(responseBody, {
      status: upstream.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `X-Claw unreachable: ${message}` }, { status: 502 });
  }
}
