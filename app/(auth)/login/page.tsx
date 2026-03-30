'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode]               = useState<'login' | 'signup'>('login');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Email / Password ──────────────────────────────────────────────────────
  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created!');
      }
      router.push('/dashboard');
    } catch (err: any) {
      const msg =
        err.code === 'auth/user-not-found'     ? 'No account found with this email.' :
        err.code === 'auth/wrong-password'     ? 'Incorrect password.' :
        err.code === 'auth/email-already-in-use' ? 'Email already in use.' :
        err.code === 'auth/weak-password'      ? 'Password must be at least 6 characters.' :
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in with Google!');
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

        .title-gradient {
          background: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6, #06b6d4);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 5s ease infinite alternate;
        }

        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        .glow-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.3;
          pointer-events: none;
          animation: orbFloat 9s ease-in-out infinite alternate;
        }

        @keyframes orbFloat {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(24px, -18px) scale(1.08); }
        }

        .field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .field::placeholder { color: rgba(255,255,255,0.28); }
        .field:focus {
          border-color: rgba(249,115,22,0.55);
          background: rgba(255,255,255,0.09);
        }

        .primary-btn {
          width: 100%;
          padding: 0.8rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: white;
          background: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6);
          background-size: 200%;
          box-shadow: 0 4px 20px rgba(249,115,22,0.3);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
        }
        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(249,115,22,0.4);
        }
        .primary-btn:active:not(:disabled) { transform: scale(0.97); }
        .primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .google-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.75rem;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          transition: background 0.2s, transform 0.15s, border-color 0.2s;
        }
        .google-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.11);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }
        .google-btn:active:not(:disabled) { transform: scale(0.97); }
        .google-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255,255,255,0.2);
          font-size: 0.75rem;
          font-family: 'DM Sans', sans-serif;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }

        .tab-btn {
          flex: 1;
          padding: 0.5rem;
          border-radius: 0.6rem;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#070a12',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Orbs */}
        <div className="glow-orb" style={{ width: 520, height: 520, background: '#f97316', top: '-15%', left: '-12%' }} />
        <div className="glow-orb" style={{ width: 420, height: 420, background: '#8b5cf6', bottom: '-12%', right: '-10%', animationDelay: '2s' }} />
        <div className="glow-orb" style={{ width: 280, height: 280, background: '#06b6d4', top: '35%', left: '58%', animationDelay: '4s' }} />

        {/* Grid */}
        <div style={{
          position: 'fixed', inset: 0, opacity: 0.035, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}
        >
          {/* ── Big title ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2.8rem, 9vw, 5rem)',
              lineHeight: 1.05,
              letterSpacing: '0.02em',
              margin: 0,
            }}>
              {['Task', 'Management', 'Dashboard'].map((word, wi) => (
                <span key={wi} style={{ display: 'block' }}>
                  {word.split('').map((char, ci) => (
                    <motion.span
                      key={ci}
                      className="title-gradient"
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + wi * 0.1 + ci * 0.025, duration: 0.35 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem', fontSize: '0.85rem', letterSpacing: '0.05em' }}
            >
              {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
            </motion.p>
          </motion.div>

          {/* ── Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{
              background: 'rgba(255,255,255,0.045)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: '1.5rem',
              padding: '1.75rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            }}
          >
            {/* Tab switcher */}
            <div style={{
              display: 'flex', gap: '0.4rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.75rem', padding: '0.3rem',
              marginBottom: '1.5rem',
            }}>
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  className="tab-btn"
                  onClick={() => setMode(m)}
                  style={{
                    background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: mode === m ? 'white' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Google button */}
              <button className="google-btn" onClick={handleGoogle} disabled={googleLoading}>
                {googleLoading ? (
                  <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Connecting…</span>
                ) : (
                  <>
                    {/* Google SVG icon */}
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.5-4.7l-6.2-5.2C29.4 35.6 26.8 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.8 39.8 16.4 44 24 44z"/>
                      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C41 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="divider">or</div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Email
                </label>
                <input
                  className="field"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                    style={{ paddingRight: '2.8rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                className="primary-btn"
                onClick={handleEmailAuth}
                disabled={loading}
                style={{ marginTop: '0.25rem' }}
              >
                {loading
                  ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'login' ? 'Sign In →' : 'Create Account →')
                }
              </button>

              {/* Toggle mode */}
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', margin: 0 }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#fb923c', fontWeight: 700, fontSize: '0.82rem',
                    fontFamily: "'DM Sans', sans-serif", padding: 0,
                  }}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
