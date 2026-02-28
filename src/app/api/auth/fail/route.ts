import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
    const { username } = await req.json();
    const db = await getDb();

    await db.run('INSERT INTO login_attempts (username, attempts, last_attempt) VALUES (?, 1, ?) ON CONFLICT(username) DO UPDATE SET attempts = attempts + 1, last_attempt = ?', [username, Date.now(), Date.now()]);

    return NextResponse.json({ success: true });
}
