'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Headphones, Volume2, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const AUDIO_OPTIONS = [
    { id: 'nights', name: 'The Nights (Avicii)', url: '/audio/The Nights (PenduJatt.Com.Se).mp3' },
    { id: 'rain', name: 'Rain', url: '/audio/rain.wav' },
    { id: 'thud', name: 'Deep Thud', url: '/audio/thud.wav' },
    { id: 'static', name: 'White Noise', url: '/audio/static.wav' },
    { id: 'buzz', name: 'Electric Buzz', url: '/audio/buzz.wav' }
];

const STAGE_RECORD = 1;
const STAGE_VERIFY = 2;

export default function AudioRegister() {
    const router = useRouter();
    const [stage, setStage] = useState(STAGE_RECORD);
    const [audioUrl, setAudioUrl] = useState(AUDIO_OPTIONS[0].url);
    const [isPlaying, setIsPlaying] = useState(false);
    const [markPoints, setMarkPoints] = useState<number[]>([]);
    const [verifyPoints, setVerifyPoints] = useState<number[]>([]);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [buttonPos, setButtonPos] = useState({ x: 50, y: 50 });
    const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);
    const [audioError, setAudioError] = useState(false);
    const [audioLoaded, setAudioLoaded] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const user = sessionStorage.getItem('reg_username');
        const userEmail = sessionStorage.getItem('reg_email');
        if (!user) {
            router.push('/register');
            return;
        }
        setUsername(user);
        setEmail(userEmail || '');

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

    const handleStartRecording = () => {
        setIsPlaying(true);
        if (stage === STAGE_RECORD) {
            setMarkPoints([]);
        } else {
            setVerifyPoints([]);
        }
        setError('');
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => {
                console.error("Playback failed:", e);
                setAudioError(true);
            });
        }
    };

    const handleMarkPoint = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isPlaying) return;
        
        // Prevent double triggering from mouse + touch
        if (e.type === 'touchstart') {
            (e as any)._processed = true;
        } else if (e.type === 'click' && (e as any)._processed) {
            return;
        }

        // Ripple effect
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const id = Date.now();
        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000);

        const timestamp = audioRef.current?.currentTime || 0;
        const newTimestamp = parseFloat(timestamp.toFixed(2));

        if (stage === STAGE_RECORD) {
            setMarkPoints(prev => {
                if (prev.length >= 2) return prev;
                const next = [...prev, newTimestamp];
                if (next.length === 2) {
                    setTimeout(() => handleStopRecording(), 300);
                }
                return next;
            });
        } else {
            setVerifyPoints(prev => {
                if (prev.length >= 2) return prev;
                const next = [...prev, newTimestamp];
                if (next.length === 2) {
                    setTimeout(() => handleStopRecording(), 300);
                }
                return next;
            });
        }
    };

    const handleStopRecording = () => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleNextStage = () => {
        if (markPoints.length !== 2) return;
        setStage(STAGE_VERIFY);
        setVerifyPoints([]);
        setError('Now, repeat your two points to verify you remember them.');
    };

    const handleSubmit = async () => {
        if (markPoints.length !== 2 || verifyPoints.length !== 2) {
            setError('Please mark exactly 2 points in both stages.');
            return;
        }

        // Check if verified points match with 0.5s tolerance
        const matches = markPoints.every((point, i) => Math.abs(point - verifyPoints[i]) < 0.5);

        if (!matches) {
            setError('The verification points do not match. Please reset and try again.');
            setVerifyPoints([]);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    type: 'audio',
                    passwordData: { pattern: markPoints, audioUrl }
                })
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => router.push('/login'), 2500);
            } else {
                const data = await response.json();
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('An error occurred during registration.');
        }
    };

    return (
        <main style={{ cursor: isPlaying ? 'pointer' : 'default' }}>
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '2rem 0' }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}
                        >
                            <CheckCircle size={64} color="#10b981" />
                        </motion.div>
                        <h1>Password Set!</h1>
                        <p>Your 2-point audio key has been verified and saved.</p>
                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Redirecting to login...</p>
                    </motion.div>
                ) : (
                    <>
                        <h1>{stage === STAGE_RECORD ? 'Audio Passpoint' : 'Verify Points'}</h1>
                        <p>
                            {stage === STAGE_RECORD 
                                ? 'Tap the screen twice during the audio to create your password.'
                                : 'Now repeat the same two taps to confirm your password.'}
                        </p>

                        {error && <div className="error-text" style={{ textAlign: 'center', margin: '1rem 0', color: stage === STAGE_VERIFY && !error.includes('fail') ? '#6366f1' : '#ef4444' }}>{error}</div>}

                        {!isPlaying && stage === STAGE_RECORD && markPoints.length === 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label>Background Sound:</label>
                                <select 
                                    className="btn btn-secondary" 
                                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                                    value={audioUrl}
                                    onChange={(e) => setAudioUrl(e.target.value)}
                                >
                                    {AUDIO_OPTIONS.map(opt => (
                                        <option key={opt.id} value={opt.url}>{opt.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

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

                            {isPlaying && (
                                <div 
                                    style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'crosshair' }} 
                                    onClick={handleMarkPoint}
                                />
                            )}
                            
                            {ripples.map(ripple => (
                                <motion.div
                                    key={ripple.id}
                                    initial={{ scale: 0, opacity: 0.8 }}
                                    animate={{ scale: 4, opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    style={{
                                        position: 'absolute',
                                        left: ripple.x,
                                        top: ripple.y,
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        pointerEvents: 'none',
                                        zIndex: 11
                                    }}
                                />
                            ))}

                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                loop
                                onCanPlayThrough={() => setAudioLoaded(true)}
                                onError={() => setAudioError(true)}
                            />

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
                                        {stage === STAGE_RECORD ? (markPoints.length > 0 ? 'Retry Recording' : 'Start Recording') : 'Start Verification'}
                                    </motion.button>
                                ) : (
                                    <div style={{ pointerEvents: 'none' }}>
                                        {/* Pulse Effect only, no moving button */}
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            style={{ width: '100px', height: '100px', borderRadius: '50%', background: stage === STAGE_RECORD ? '#6366f1' : '#a855f7' }}
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                            
                            {isPlaying && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '0.8rem', zIndex: 12 }}>
                                    Points: {(stage === STAGE_RECORD ? markPoints : verifyPoints).length} / 2
                                </div>
                            )}
                        </div>

                        <div className="btn-container" style={{ marginTop: '1.5rem' }}>
                            {stage === STAGE_RECORD && markPoints.length === 2 && !isPlaying && (
                                <button className="btn" style={{ width: '100%' }} onClick={handleNextStage}>
                                    Next: Verify My Points
                                </button>
                            )}

                            {stage === STAGE_VERIFY && verifyPoints.length === 2 && !isPlaying && (
                                <button className="btn" style={{ width: '100%', background: '#10b981' }} onClick={handleSubmit}>
                                    Confirm & Register
                                </button>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => {
                                    if (stage === STAGE_VERIFY) {
                                        setStage(STAGE_RECORD);
                                        setMarkPoints([]);
                                        setVerifyPoints([]);
                                        setError('');
                                    } else {
                                        router.push('/register');
                                    }
                                }}>
                                    {stage === STAGE_VERIFY ? 'Reset' : 'Cancel'}
                                </button>
                                <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => router.push('/login/forgot')}>
                                    <HelpCircle size={16} /> Forgot?
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </main>
    );
}
