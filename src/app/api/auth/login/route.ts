import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { username, type, passwordData } = await req.json();

        // 1. Get Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Invalid username' }, { status: 401 });
        }

        if (profile.is_locked) {
            return NextResponse.json({ error: 'Account locked. Reset via Forgot Password.' }, { status: 423 });
        }

        let isCorrect = false;

        // 2. Fetch and Compare Password
        if (type === 'graphical') {
            const { data: pass, error: passError } = await supabase
                .from('graphical_passwords')
                .select('*')
                .eq('user_id', profile.id)
                .single();

            if (!passError && pass) {
                isCorrect = pass.image_path === passwordData.imageId &&
                    JSON.stringify(pass.puzzle_pieces) === JSON.stringify(passwordData.puzzles);
            }
        } else if (type === 'audio') {
            const { data: pass, error: passError } = await supabase
                .from('audio_passwords')
                .select('*')
                .eq('user_id', profile.id)
                .single();

            if (!passError && pass) {
                const savedPattern = pass.tap_timestamps;
                const inputPattern = passwordData.pattern;

                if (savedPattern.length === inputPattern.length) {
                    isCorrect = savedPattern.every((val: any, idx: number) => {
                        return Math.abs(parseFloat(val) - parseFloat(inputPattern[idx])) < 0.5;
                    });
                }
            }
        }

        if (isCorrect) {
            // Log Success
            await supabase.from('login_logs').insert({
                user_id: profile.id,
                username: profile.username,
                status: 'SUCCESS',
                auth_type: type.toUpperCase()
            });

            // Success: Reset failed attempts
            await supabase.from('profiles').update({ failed_attempts: 0 }).eq('id', profile.id);
            return NextResponse.json({ success: true });
        } else {
            // Record failure
            const currentAttempts = (profile.failed_attempts || 0) + 1;
            const updates: any = { failed_attempts: currentAttempts };
            let status = 'FAILURE';
            
            if (currentAttempts >= 2) {
                updates.is_locked = true;
                status = 'LOCKED';
            }

            // Log Failure/Lock
            await supabase.from('login_logs').insert({
                user_id: profile.id,
                username: profile.username,
                status: status,
                auth_type: type.toUpperCase()
            });

            await supabase.from('profiles').update(updates).eq('id', profile.id);
            
            const remaining = 2 - currentAttempts;
            if (remaining <= 0) {
                return NextResponse.json({ 
                    error: 'Account locked due to too many failed attempts.',
                    remaining: 0,
                    locked: true
                }, { status: 401 });
            }

            return NextResponse.json({ 
                error: `Invalid password. ${remaining} attempt(s) remaining.`,
                remaining 
            }, { status: 401 });
        }
    } catch (error) {
        console.error('Supabase login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
