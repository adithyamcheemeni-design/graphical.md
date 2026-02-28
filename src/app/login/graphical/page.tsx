'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldAlert, HelpCircle, ArrowLeft } from 'lucide-react';

const STAGE_IMAGE_VERIFY = 1;
const STAGE_PUZZLE_VERIFY = 2;

const ANIMALS = [
    { id: 'lion', name: 'Lion', src: '/images/lion.png' },
    { id: 'tiger', name: 'Tiger', src: '/images/tiger.png' },
    { id: 'elephant', name: 'Elephant', src: '/images/elephant.png' },
    { id: 'giraffe', name: 'Giraffe', src: '/images/giraffe.png' },
    { id: 'zebra', name: 'Zebra', src: '/images/zebra.png' },
    { id: 'panda', name: 'Panda', src: '/images/panda.png' }
];

export default function GraphicalLogin() {
    const router = useRouter();
    const [stage, setStage] = useState(STAGE_IMAGE_VERIFY);
    const [username, setUsername] = useState('');
    const [displayImages, setDisplayImages] = useState([]);
    const [correctImageId, setCorrectImageId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPuzzles, setSelectedPuzzles] = useState([]);
    const [error, setError] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const user = sessionStorage.getItem('login_username');
        if (!user) {
            router.push('/login');
            return;
        }
        setUsername(user);
        fetchPasswordInfo(user);
    }, []);

    const fetchPasswordInfo = async (user: string) => {
        try {
            const resp = await fetch(`/api/auth/info?username=${user}&type=graphical`);
            if (resp.ok) {
                const data = await resp.json();
                if (data.isLocked) {
                    setIsLocked(true);
                    return;
                }
                setCorrectImageId(data.imageId);

                // Mix correct image with 5 decoys
                const correctImg = ANIMALS.find(a => a.id === data.imageId);
                const decoys = ANIMALS.filter(a => a.id !== data.imageId);
                const selectedDecoys = decoys.sort(() => 0.5 - Math.random()).slice(0, 5);
                
                const mixed = [correctImg, ...selectedDecoys].sort(() => 0.5 - Math.random());
                setDisplayImages(mixed as any);
            } else {
                setError('User not found or no graphical password set.');
            }
        } catch (e) {
            setError('Error fetching user data.');
        }
    };

    const handleNext = () => {
        if (!selectedImage) return;
        setStage(STAGE_PUZZLE_VERIFY);
    };

    const handleFailure = async (errorMessage = 'Verification failed.') => {
        setError(errorMessage);
        
        // Record failure via the login API (this will update attempts)
        // We'll call a dummy login if we're just at the image stage to record the attempt
        if (stage === STAGE_IMAGE_VERIFY) {
             await fetch('/api/auth/fail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
        }
        
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

    const handlePuzzleSelect = (index: number) => {
        if (selectedPuzzles.includes(index as never)) {
            setSelectedPuzzles(selectedPuzzles.filter(p => (p as any) !== index));
        } else if (selectedPuzzles.length < 2) {
            setSelectedPuzzles([...selectedPuzzles, index as never]);
        }
    };

    const handleSubmit = async () => {
        if (selectedPuzzles.length !== 2) return;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    type: 'graphical',
                    passwordData: {
                        imageId: (selectedImage as any).id,
                        puzzles: selectedPuzzles.sort((a, b) => (a as any) - (b as any))
                    }
                })
            });

            if (response.ok) {
                alert('Login successful!');
                router.push('/dashboard');
            } else {
                const data = await response.json();
                handleFailure(data.error || 'Invalid puzzle pieces.');
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
                    <p className="error-text">You have used your 2 attempts for this login session. Returning to login...</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <motion.div 
                className="glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {stage === STAGE_IMAGE_VERIFY ? (
                    <>
                        <h1>Verify Image</h1>
                        <p>Select your registered animal password.</p>
                        {error && <div className="error-text" style={{ textAlign: 'center' }}>{error}</div>}

                        <div className="image-grid">
                            {displayImages.map((animal: any) => (
                                <div
                                    key={animal.id}
                                    className={`image-item ${selectedImage?.id === animal.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedImage(animal)}
                                >
                                    <img src={animal.src} alt="Animal Option" />
                                </div>
                            ))}
                        </div>

                        <button 
                            className="btn" 
                            style={{ width: '100%', marginBottom: '1rem' }} 
                            disabled={!selectedImage} 
                            onClick={handleNext}
                        >
                            Verify Image
                        </button>
                    </>
                ) : (
                    <>
                        <h1>Verify Puzzle</h1>
                        <p>Select the 2 puzzle pieces of your password.</p>
                        {error && <div className="error-text" style={{ textAlign: 'center' }}>{error}</div>}

                        <div className="puzzle-grid">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                                const row = Math.floor(i / 3);
                                const col = i % 3;
                                return (
                                    <div
                                        key={i}
                                        className={`puzzle-piece ${selectedPuzzles.includes(i as never) ? 'selected' : ''}`}
                                        style={{
                                            backgroundImage: selectedImage ? `url(${(selectedImage as any).src})` : 'none',
                                            backgroundPosition: `${col * 50}% ${row * 50}%`
                                        }}
                                        onClick={() => handlePuzzleSelect(i)}
                                    />
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                className="btn btn-secondary" 
                                style={{ flex: 1 }} 
                                onClick={() => { setStage(STAGE_IMAGE_VERIFY); setSelectedPuzzles([]); }}
                            >
                                <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back
                            </button>
                            <button 
                                className="btn" 
                                style={{ flex: 1 }} 
                                disabled={selectedPuzzles.length !== 2} 
                                onClick={handleSubmit}
                            >
                                Login
                            </button>
                        </div>
                    </>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link href="/login/forgot" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <HelpCircle size={14} /> Forgot password?
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
