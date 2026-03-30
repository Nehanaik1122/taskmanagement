'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  };
}

export default function ProfileDropdown({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Use Google photo if available and not errored
  const showPhoto = user?.photoURL && !imgError;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 40, height: 40,
          borderRadius: '0.75rem',
          border: open
            ? '2px solid rgba(249,115,22,0.7)'
            : '1.5px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.07)',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s, transform 0.15s',
          transform: open ? 'scale(1.05)' : 'scale(1)',
          padding: 0,
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Profile menu"
      >
        {showPhoto ? (
          <img
            src={user.photoURL!}
            alt={displayName}
            referrerPolicy="no-referrer"   // ← fixes Google photo CORS/403
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontSize: '0.85rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {initials}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 220,
              background: 'rgba(15, 15, 25, 0.92)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: '1rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              zIndex: 100,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {/* User info */}
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                overflow: 'hidden', flexShrink: 0,
                border: '1.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {showPhoto ? (
                  <img
                    src={user.photoURL!}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 800,
                    background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{initials}</span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: '0.4rem' }}>
              <DropdownItem
                icon="👤"
                label="View Profile"
                onClick={() => { setOpen(false); router.push('/profile'); }}
              />
              <DropdownItem
                icon="⚙️"
                label="Settings"
                onClick={() => { setOpen(false); router.push('/profile'); }}
              />
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.3rem 0' }} />
              <DropdownItem
                icon="🚪"
                label="Sign Out"
                danger
                onClick={handleSignOut}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({
  icon, label, onClick, danger = false,
}: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.55rem 0.75rem',
        border: 'none', borderRadius: '0.6rem', cursor: 'pointer',
        background: hovered
          ? danger ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.07)'
          : 'transparent',
        color: danger
          ? hovered ? '#f87171' : 'rgba(248,113,113,0.7)'
          : hovered ? 'white' : 'rgba(255,255,255,0.6)',
        fontSize: '0.85rem', fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        textAlign: 'left', transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '0.9rem' }}>{icon}</span>
      {label}
    </button>
  );
}
