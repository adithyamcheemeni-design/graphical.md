'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Key, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSendOTP = async () => {
        if (!email || !username) {
            setError('Please enter both username and email.');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, action: 'send' })
            });
            
            if (response.ok) {
                setMessage('OTP has been sent to your email.');
                setError('');
                setStep(2);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to send OTP.');
            }
        } catch (e) {
            setError('An error occurred.');
        }
    };

    const handleReset = async () => {
        if (!otp || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }

        try {
            const response = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, otp, action: 'verify' })
            });

            if (response.ok) {
                setMessage('Your identity has been verified. Account unlocked.');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.error || 'Invalid OTP.');
            }
        } catch (e) {
            setError('An error occurred.');
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
                <h1>Reset Password</h1>
                <p>Verify your identity via email to regain access.</p>

                {message && <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}
                {error && <div className="error-text" style={{ textAlign: 'center' }}>{error}</div>}

                {step === 1 ? (
                    <>
                        <label htmlFor="username">Username</label>
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#94a3b8' }} />
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                style={{ paddingLeft: '40px' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <label htmlFor="email">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#94a3b8' }} />
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your registered email"
                                style={{ paddingLeft: '40px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button className="btn" style={{ width: '100%', marginTop: '1rem' }} onClick={handleSendOTP}>
                            Send OTP
                        </button>
                    </>
                ) : (
                    <>
                        <label htmlFor="otp">OTP Field</label>
                        <div style={{ position: 'relative' }}>
                            <Key size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: '#94a3b8' }} />
                            <input
                                type="text"
                                id="otp"
                                placeholder="Enter 4-digit code"
                                style={{ paddingLeft: '40px' }}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <button className="btn" style={{ width: '100%' }} onClick={handleReset}>
                            Verify & Reset
                        </button>
                    </>
                )}

                <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={16} /> Back to Login
                </button>
            </motion.div>
        </main>
    );
}
