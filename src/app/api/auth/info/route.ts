import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const type = searchParams.get('type');

    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'graphical') {
        const { data: pass } = await supabase
            .from('graphical_passwords')
            .select('image_path')
            .eq('user_id', profile.id)
            .single();

        return NextResponse.json({ 
            imageId: pass?.image_path, 
            isLocked: !!profile.is_locked 
        });
    } else if (type === 'audio') {
        const { data: pass } = await supabase
            .from('audio_passwords')
            .select('audio_path')
            .eq('user_id', profile.id)
            .single();

        return NextResponse.json({ 
            audioUrl: pass?.audio_path, 
            isLocked: !!profile.is_locked 
        });
    } else if (type === 'attempts') {
        return NextResponse.json({ 
            attempts: profile.failed_attempts || 0, 
            isLocked: !!profile.is_locked 
        });
    }

    return NextResponse.json({ found: true });
}
