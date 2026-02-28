'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { CheckCircle } from 'lucide-react';

const STAGE_IMAGE_SELECT = 1;
const STAGE_PUZZLE_SELECT = 2;
const STAGE_SUCCESS = 3;

const ANIMALS = [
    { id: 'lion', name: 'Lion', src: '/images/lion.png' },
    { id: 'tiger', name: 'Tiger', src: '/images/tiger.png' },
    { id: 'elephant', name: 'Elephant', src: '/images/elephant.png' },
    { id: 'giraffe', name: 'Giraffe', src: '/images/giraffe.png' },
    { id: 'zebra', name: 'Zebra', src: '/images/zebra.png' },
    { id: 'panda', name: 'Panda', src: '/images/panda.png' }
];

export default function GraphicalRegister() {
    const router = useRouter();
    const [stage, setStage] = useState(STAGE_IMAGE_SELECT);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPuzzles, setSelectedPuzzles] = useState([]);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const user = sessionStorage.getItem('reg_username');
        const userEmail = sessionStorage.getItem('reg_email');
        if (!user) {
            router.push('/register');
            return;
        }
        setUsername(user);
        setEmail(userEmail || '');
    }, []);

    const handleImageSelect = (animal: any) => {
        setSelectedImage(animal);
    };

    const goToPuzzle = () => {
        if (!selectedImage) return;
        setStage(STAGE_PUZZLE_SELECT);
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
        if (!selectedImage) return;

        const passwordData = {
            imageId: (selectedImage as any).id,
            puzzles: selectedPuzzles.sort((a, b) => a - b)
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    type: 'graphical',
                    passwordData
                })
            });

            if (response.ok) {
                setStage(STAGE_SUCCESS);
                setTimeout(() => {
                    router.push('/login');
                }, 2500);
            } else {
                const data = await response.json();
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration.');
        }
    };

    return (
        <main>
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                {stage === STAGE_IMAGE_SELECT ? (
                    <>
                        <h1>Select Image</h1>
                        <p>Choose an animal to use as the base for your graphical password.</p>

                        <div className="image-grid">
                            {ANIMALS.map((animal) => (
                                <div
                                    key={animal.id}
                                    className={`image-item ${(selectedImage as any)?.id === animal.id ? 'selected' : ''}`}
                                    onClick={() => handleImageSelect(animal)}
                                >
                                    <img src={animal.src} alt={animal.name} />
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn"
                            style={{ width: '100%' }}
                            disabled={!selectedImage}
                            onClick={goToPuzzle}
                        >
                            Continue to Puzzle
                        </button>
                    </>
                ) : stage === STAGE_PUZZLE_SELECT ? (
                    <>
                        <h1>Create Puzzle Key</h1>
                        <p>Select exactly 2 puzzle pieces of the {(selectedImage as any)?.name || 'animal'} to form your password.</p>

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
                                onClick={() => setStage(STAGE_IMAGE_SELECT)}
                            >
                                Back
                            </button>
                            <button
                                className="btn"
                                style={{ flex: 1 }}
                                disabled={selectedPuzzles.length !== 2}
                                onClick={handleSubmit}
                            >
                                Complete
                            </button>
                        </div>
                    </>
                ) : (
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
                        <h1>Registration Successful!</h1>
                        <p>Your graphical password has been securely saved.</p>
                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Redirecting to login...</p>
                    </motion.div>
                )}
            </motion.div>
        </main>
    );
}
