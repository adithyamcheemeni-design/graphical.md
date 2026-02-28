'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, LogOut, User, Settings, Bell, Lock, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        const user = sessionStorage.getItem('login_username');
        if (!user) {
            router.push('/login');
            return;
        }
        setUsername(user);
        fetchLogs(user);
    }, []);

    const fetchLogs = async (user: string) => {
        const { data } = await supabase
            .from('login_logs')
            .select('*')
            .eq('username', user)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (data) setLogs(data);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        router.push('/');
    };

    return (
        <main style={{ background: '#0f172a', color: 'white', minHeight: '100vh', width: '100%' }}>
            <nav style={{ width: '100%', padding: '1.5rem 2rem', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={32} color="#6366f1" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>SecureAuth</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                        <User size={18} color="#94a3b8" />
                        <span style={{ fontWeight: 600 }}>{username}</span>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '3rem' }}
                >
                    <h1 style={{ textAlign: 'left', fontSize: '3rem' }}>Welcome back, {username}!</h1>
                    <p style={{ textAlign: 'left', fontSize: '1.2rem' }}>Your account is protected with multi-factor biometric authentication.</p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <motion.div 
                        whileHover={{ y: -5 }}
                        style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Lock size={24} color="#6366f1" />
                        </div>
                        <h3>Security Status</h3>
                        <p style={{ margin: '1rem 0' }}>Your graphical and audio passwords are active and healthy. Last login was successful.</p>
                        <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Protected
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -5 }}
                        style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Bell size={24} color="#06b6d4" />
                        </div>
                        <h3>Recent Activity</h3>
                        <div style={{ margin: '1rem 0' }}>
                            {logs.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
                                    {logs.slice(0, 3).map((log) => (
                                        <li key={log.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span>
                                                <span style={{ color: log.status === 'SUCCESS' ? '#10b981' : '#f43f5e', fontWeight: 700 }}>
                                                    {log.status}
                                                </span>
                                                <br />
                                                <small style={{ color: '#94a3b8' }}>{log.auth_type}</small>
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No activity logs found.</p>
                            )}
                        </div>
                        <button 
                            onClick={() => setShowLogs(!showLogs)}
                            style={{ color: '#06b6d4', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        >
                            {showLogs ? 'Hide Logs' : 'View Detailed History'}
                        </button>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -5 }}
                        style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Settings size={24} color="#a855f7" />
                        </div>
                        <h3>Quick Settings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                            <button style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.75rem', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Change Audio Track</button>
                            <button style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.75rem', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>Reset Graphical Puzzle</button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
