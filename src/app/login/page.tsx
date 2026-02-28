'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Headphones, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [authType, setAuthType] = useState('graphical');
    const [error, setError] = useState('');

    const handleNext = async () => {
        if (!username) {
            setError('Please enter your username.');
            return;
        }

        // Store in session storage for the next pages
        sessionStorage.setItem('login_username', username);
        sessionStorage.setItem('login_auth_type', authType);

        if (authType === 'graphical') {
            router.push('/login/graphical');
        } else {
            router.push('/login/audio');
        }
    };

    return (
        <main>
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1>Welcome Back</h1>
                <p>Login to your account using your security method.</p>

                <label htmlFor="username">Username</label>
                <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#94a3b8' }} />
                    <input
                        type="text"
                        id="username"
                        placeholder="Your username"
                        style={{ paddingLeft: '40px' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                {error && <div className="error-text">{error}</div>}

                <label>Authentication Method</label>
                <div className="radio-group">
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="authType"
                            value="graphical"
                            checked={authType === 'graphical'}
                            onChange={() => setAuthType('graphical')}
                        />
                        <Lock size={18} /> Graphical
                    </label>
                    <label className="radio-label">
                        <input
                            type="radio"
                            name="authType"
                            value="audio"
                            checked={authType === 'audio'}
                            onChange={() => setAuthType('audio')}
                        />
                        <Headphones size={18} /> Audio
                    </label>
                </div>

                <button className="btn" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={handleNext}>
                    Proceed to Verification
                </button>

                <div style={{ textAlign: 'center' }}>
                    <Link href="/login/forgot" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <HelpCircle size={14} /> Forgot password?
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
