import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  console.log('[API AUTH LOGIN] Incoming login request');
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      console.warn('[API AUTH LOGIN] Missing email or password');
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[API AUTH LOGIN] Attempting login for email:', email);
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      console.warn('[API AUTH LOGIN] Invalid credentials for email:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('[API AUTH LOGIN] Login successful. Generating token.');
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as string,
    } as Parameters<typeof jwt.sign>[2]);

    console.log('[API AUTH LOGIN] Token generated successfully');
    return NextResponse.json({ success: true, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API AUTH LOGIN] Error during login:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
