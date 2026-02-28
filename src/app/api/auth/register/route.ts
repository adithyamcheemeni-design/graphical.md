import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { username, email, type, passwordData } = await req.json();

        if (!username || !type || !passwordData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Profile or find existing
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
                username, 
                auth_type: type.toUpperCase(),
            }, { onConflict: 'username' })
            .select()
            .single();

        if (profileError) {
            console.error('Supabase profile error:', profileError);
            return NextResponse.json({ error: `Database Error: ${profileError.message}`, details: profileError }, { status: 500 });
        }

        const userId = profile.id;

        // 2. Save Password based on type
        if (type === 'graphical') {
            const { error: passError } = await supabase
                .from('graphical_passwords')
                .upsert({
                    user_id: userId,
                    image_path: passwordData.imageId,
                    puzzle_pieces: passwordData.puzzles
                }, { onConflict: 'user_id' });

            if (passError) {
                console.error('Graphical password error:', passError);
                return NextResponse.json({ error: `Graphical Password Error: ${passError.message}` }, { status: 500 });
            }
        } else if (type === 'audio') {
            const { error: passError } = await supabase
                .from('audio_passwords')
                .upsert({
                    user_id: userId,
                    audio_path: passwordData.audioUrl || '/audio/rain.wav',
                    tap_timestamps: passwordData.pattern.map(Number)
                }, { onConflict: 'user_id' });

            if (passError) {
                console.error('Audio password error:', passError);
                return NextResponse.json({ error: `Audio Password Error: ${passError.message}` }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Supabase registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
