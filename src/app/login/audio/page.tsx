'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Headphones, Volume2, ShieldAlert, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function AudioLogin() {
    const router = useRouter();
    const [audioUrl, setAudioUrl] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [markPoints, setMarkPoints] = useState<number[]>([]);
    const [username, setUsername] = useState('');
    const [buttonPos, setButtonPos] = useState({ x: 50, y: 50 });
    const [error, setError] = useState('');
    const [audioError, setAudioError] = useState(false);
    const [audioLoaded, setAudioLoaded] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const user = sessionStorage.getItem('login_username');
        if (!user) {
            router.push('/login');
            return;
        }
        setUsername(user);
        fetchAudioInfo(user);

        const interval = setInterval(() => {
            if (isPlaying) {
                setButtonPos({
                    x: Math.random() * 70 + 15,
                    y: Math.random() * 70 + 15
                });
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const fetchAudioInfo = async (user: string) => {
        try {
            const resp = await fetch(`/api/auth/info?username=${user}&type=audio`);
            if (resp.ok) {
                const data = await resp.json();
                if (data.isLocked) {
                    setIsLocked(true);
                    return;
                }
                setAudioUrl(data.audioUrl || "/audio/rain.wav");
            } else {
                setError('User not found or no audio password set.');
            }
        } catch (e) {
            setError('Error fetching user data.');
        }
    };

    const handleStartRecording = () => {
        setIsPlaying(true);
        setMarkPoints([]);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((e: any) => {
                console.error("Playback failed:", e);
                setAudioError(true);
            });
        }
    };

    const lastClickTime = useRef<number>(0);

    const handleFailure = async (errorMessage = 'Verification failed.') => {
        setError(errorMessage);
        
        // Record failure via the fail API
        await fetch('/api/auth/fail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        
        // Re-check attempts and lock status
        const checkResp = await fetch(`/api/auth/info?username=${username}&type=attempts`);
        if (checkResp.ok) {
            const data = await checkResp.json();
            if (data.isLocked || data.attempts >= 2) {
                setIsLocked(true);
                setTimeout(() => router.push('/login/forgot'), 3000);
            }
        }
    };

    const handleMarkPoint = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isPlaying) return;
        
        // STRRICT DEBOUNCE: Ignore any clicks within 400ms of each other
        const now = Date.now();
        if (now - lastClickTime.current < 400) return;
        lastClickTime.current = now;

        const timestamp = audioRef.current?.currentTime || 0;
        const newTimestamp = parseFloat(timestamp.toFixed(2));

        setMarkPoints(prev => {
            if (prev.length >= 2) return prev;
            const next = [...prev, newTimestamp];
            if (next.length === 2) {
                setTimeout(() => handleStopRecording(), 300);
            }
            return next;
        });
    };

    const handleStopRecording = () => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleSubmit = async () => {
        if (markPoints.length !== 2) {
            setError('Please mark exactly 2 points.');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    type: 'audio',
                    passwordData: { pattern: markPoints }
                })
            });

            if (response.ok) {
                alert('Login successful!');
                router.push('/dashboard');
            } else {
                const data = await response.json();
                handleFailure(data.error || 'Invalid points');
            }
        } catch (error) {
            handleFailure('An error occurred during verification.');
        }
    };

    if (isLocked) {
        return (
            <main>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
                    <h1>Access Denied</h1>
                    <p className="error-text">You have used your 2 attempts. Please reset via Forgot Password.</p>
                </div>
            </main>
        );
    }

    return (
        <main 
            onClick={handleMarkPoint}
            onTouchStart={handleMarkPoint}
            style={{ cursor: isPlaying ? 'pointer' : 'default' }}
        >
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h1>Verify Points</h1>
                <p>Listen to the track and <strong>mark your 2 secret points</strong> to login.</p>

                {error && <div className="error-text" style={{ textAlign: 'center' }}>{error}</div>}

                <div 
                    className="audio-screen" 
                    style={{ 
                        background: 'rgba(0,0,0,0.6)', 
                        position: 'relative', 
                        height: '350px', 
                        overflow: 'hidden',
                        border: isPlaying ? '2px solid #6366f1' : '2px solid transparent',
                        boxShadow: isPlaying ? '0 0 30px rgba(99, 102, 241, 0.4)' : 'none',
                        transition: 'all 0.5s ease'
                    }}
                >
                    {/* Waveform Visualization Bars */}
                    {isPlaying && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.3 }}>
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [40, Math.random() * 150 + 50, 40] }}
                                    transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }}
                                    style={{ width: '8px', background: '#6366f1', borderRadius: '4px' }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Overlay to capture clicks during playback */}
                    {isPlaying && (
                        <div 
                            style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'crosshair' }} 
                            onClick={handleMarkPoint}
                        />
                    )}
                    {audioUrl && (
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            loop
                            onCanPlayThrough={() => setAudioLoaded(true)}
                            onError={() => setAudioError(true)}
                        />
                    )}

                    <AnimatePresence>
                        {!isPlaying ? (
                            <motion.button
                                className="btn"
                                onClick={handleStartRecording}
                                disabled={!audioLoaded && !audioError}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Play size={24} style={{ marginRight: '8px' }} />
                                {markPoints.length > 0 ? 'Retry Verification' : 'Start Listening'}
                            </motion.button>
                        ) : (
                            <div style={{ pointerEvents: 'none' }}>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#6366f1' }}
                                />
                            </div>
                        )}
                    </AnimatePresence>
                    
                    {isPlaying && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '0.8rem' }}>
                            Marked: {markPoints.length} / 2
                        </div>
                    )}
                </div>

                <div className="btn-container" style={{ marginTop: '1.5rem' }}>
                    {markPoints.length === 2 && !isPlaying && (
                        <button className="btn" style={{ width: '100%' }} onClick={handleSubmit}>
                            Verify & Login
                        </button>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => router.push('/login')}>
                            Cancel
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => router.push('/login/forgot')}>
                            <HelpCircle size={16} /> Forgot?
                        </button>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
