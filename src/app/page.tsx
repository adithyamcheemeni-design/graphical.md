'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Headphones, Fingerprint } from 'lucide-react';

export default function Home() {
  return (
    <main>
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Shield size={64} color="#6366f1" />
            <motion.div
              style={{ position: 'absolute', top: -10, right: -10 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Fingerprint size={24} color="#06b6d4" />
            </motion.div>
          </div>
        </div>

        <h1>SecureAuth</h1>
        <p>Advanced graphical and cued audio authentication for a safer digital experience.</p>

        <div className="btn-container">
          <Link href="/login" className="btn">
            Login
          </Link>
          <Link href="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>

        <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <Lock size={16} /> Graphical
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <Headphones size={16} /> Cued Audio
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
