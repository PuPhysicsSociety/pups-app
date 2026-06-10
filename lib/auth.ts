import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AdminPayload {
  email: string;
}

export function verifyAuth(
  req: NextRequest
): { admin: AdminPayload } | NextResponse {
  const header = req.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 401 }
    );
  }

  const token = header.split(' ')[1];

  try {
    const admin = jwt.verify(token, process.env.JWT_SECRET!) as AdminPayload;
    return { admin };
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
