'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Eye, Lock, Headphones, ShieldCheck } from 'lucide-react';

export default function Register() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [confirmUsername, setConfirmUsername] = useState('');
    const [email, setEmail] = useState('');
    const [authType, setAuthType] = useState('graphical');
    const [error, setError] = useState('');

    const handleNext = () => {
        if (!username || !confirmUsername || !email) {
            setError('Please fill in all fields.');
            return;
        }
        if (username !== confirmUsername) {
            setError('Usernames do not match.');
            return;
        }

        // Store in session storage temporarily to pass to next pages
        sessionStorage.setItem('reg_username', username);
        sessionStorage.setItem('reg_email', email);
        sessionStorage.setItem('reg_auth_type', authType);

        if (authType === 'graphical') {
            router.push('/register/graphical');
        } else {
            router.push('/register/audio');
        }
    };

    return (
        <main>
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <ShieldCheck size={48} color="#6366f1" />
                </div>
                <h1>Create Account</h1>
                <p>Step 1: Set your identity and choose a security method.</p>

                <label htmlFor="username">Create Username</label>
                <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#94a3b8' }} />
                    <input
                        type="text"
                        id="username"
                        placeholder="Choose a unique username"
                        style={{ paddingLeft: '40px' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <label htmlFor="confirmUsername">Double Verification Username</label>
                <div style={{ position: 'relative' }}>
                    <Eye size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#94a3b8' }} />
                    <input
                        type="text"
                        id="confirmUsername"
                        placeholder="Re-type your username"
                        style={{ paddingLeft: '40px' }}
                        value={confirmUsername}
                        onChange={(e) => setConfirmUsername(e.target.value)}
                    />
                </div>

                <label htmlFor="email">Recovery Email Address</label>
                <div style={{ position: 'relative' }}>
                    <ShieldCheck size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#94a3b8' }} />
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email for password recovery"
                        style={{ paddingLeft: '40px' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {error && <div className="error-text">{error}</div>}

                <label>Authentication Method</label>
                <div className="radio-group" style={{ marginBottom: '2rem' }}>
                    <label className="radio-label" style={{ flex: 1, justifyContent: 'center' }}>
                        <input
                            type="radio"
                            name="authType"
                            value="graphical"
                            checked={authType === 'graphical'}
                            onChange={() => setAuthType('graphical')}
                        />
                        <Lock size={18} /> Graphical
                    </label>
                    <label className="radio-label" style={{ flex: 1, justifyContent: 'center' }}>
                        <input
                            type="radio"
                            name="authType"
                            value="audio"
                            checked={authType === 'audio'}
                            onChange={() => setAuthType('audio')}
                        />
                        <Headphones size={18} /> Audio (Blind)
                    </label>
                </div>

                <button className="btn" style={{ width: '100%' }} onClick={handleNext}>
                    Next Step
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem' }}>Already have an account? <span onClick={() => router.push('/login')} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Login here</span></p>
                </div>
            </motion.div>
        </main>
    );
}
