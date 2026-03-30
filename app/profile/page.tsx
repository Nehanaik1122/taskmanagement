'use client';

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, updateProfile, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [name, setName]           = useState('');
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError]   = useState(false);
  const [preview, setPreview]     = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      setName(u.displayName || '');
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setImgError(false);
    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadURL });
      setUser({ ...user, photoURL: downloadURL });
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload. Is Firebase Storage enabled?');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name.trim() });
      setUser({ ...user, displayName: name.trim() });
      toast.success('Name updated!');
    } catch {
      toast.error('Failed to update name.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #8b5cf6', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const photoSrc = preview || (!imgError ? user?.photoURL : null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        .pi { width:100%; padding:.75rem 1rem; border-radius:.75rem; border:1.5px solid rgba(255,255,255,.1); background:rgba(255,255,255,.06); color:white; font-family:'DM Sans',sans-serif; font-size:.95rem; outline:none; transition:border-color .2s; box-sizing:border-box; }
        .pi::placeholder { color:rgba(255,255,255,.25); }
        .pi:focus { border-color:rgba(249,115,22,.55); }
        .card { background:rgba(255,255,255,.045); border:1.5px solid rgba(255,255,255,.08); border-radius:1.25rem; padding:1.75rem; backdrop-filter:blur(16px); margin-bottom:1rem; }
        .slabel { font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.35); margin:0 0 1.1rem; }
        .glow-orb { position:fixed; border-radius:50%; filter:blur(90px); opacity:.2; pointer-events:none; }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#070a12', fontFamily:"'DM Sans',sans-serif", color:'white', padding:'2rem 1rem', position:'relative', overflow:'hidden' }}>
        <div className="glow-orb" style={{ width:480, height:480, background:'#f97316', top:'-12%', right:'-10%' }} />
        <div className="glow-orb" style={{ width:380, height:380, background:'#8b5cf6', bottom:'-8%', left:'-8%' }} />

        <div style={{ maxWidth:500, margin:'0 auto', position:'relative', zIndex:10 }}>

          <motion.button initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
            onClick={() => router.push('/dashboard')}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,.35)', cursor:'pointer', fontSize:'.82rem', padding:'0 0 1.5rem', fontFamily:"'DM Sans',sans-serif" }}>
            ← Back to Dashboard
          </motion.button>

          <motion.h1 initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }}
            style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.5rem,8vw,3.8rem)', letterSpacing:'.04em', background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 1.75rem' }}>
            Your Profile
          </motion.h1>

          {/* Avatar */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }} className="card">
            <p className="slabel">Profile Photo</p>
            <div style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
              <div style={{ position:'relative', flexShrink:0, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,.06)', border:'2px solid rgba(255,255,255,.1)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {photoSrc ? (
                  <img src={photoSrc} alt={displayName} referrerPolicy="no-referrer" onError={() => setImgError(true)}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <span style={{ fontSize:'1.6rem', fontWeight:800, background:'linear-gradient(135deg,#f97316,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{initials}</span>
                )}
                {uploading && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:.8, ease:'linear' }}
                      style={{ width:20, height:20, borderRadius:'50%', border:'2px solid white', borderTopColor:'transparent' }} />
                  </div>
                )}
              </div>

              <div>
                <p style={{ margin:'0 0 .25rem', fontWeight:700, fontSize:'1rem' }}>{displayName}</p>
                <p style={{ margin:'0 0 .75rem', fontSize:'.8rem', color:'rgba(255,255,255,.35)' }}>{user?.email}</p>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoChange} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  style={{ padding:'.45rem 1rem', borderRadius:'.6rem', border:'1.5px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.75)', fontSize:'.78rem', fontWeight:600, fontFamily:"'DM Sans',sans-serif", cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? .5 : 1 }}>
                  {uploading ? 'Uploading…' : '📷 Change Photo'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Name */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:.18 }} className="card">
            <p className="slabel">Display Name</p>
            <div style={{ display:'flex', gap:'.75rem' }}>
              <input className="pi" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
              <button onClick={handleSaveName} disabled={saving}
                style={{ padding:'.7rem 1.5rem', borderRadius:'.75rem', border:'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'.9rem', color:'white', background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', boxShadow:'0 4px 18px rgba(249,115,22,.28)', opacity: saving ? .5 : 1, whiteSpace:'nowrap' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.div>

          {/* Account info */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:.26 }} className="card">
            <p className="slabel">Account</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.75rem 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                <span style={{ fontSize:'.85rem', color:'rgba(255,255,255,.5)' }}>Email</span>
                <span style={{ fontSize:'.85rem', fontWeight:600 }}>{user?.email}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.75rem 0' }}>
                <span style={{ fontSize:'.85rem', color:'rgba(255,255,255,.5)' }}>User ID</span>
                <span style={{ fontSize:'.72rem', fontFamily:'monospace', color:'rgba(255,255,255,.35)' }}>{user?.uid?.slice(0,16)}…</span>
              </div>
            </div>
          </motion.div>

          {/* Sign out */}
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:.32 }} className="card" style={{ marginBottom:0 }}>
            <p className="slabel">Danger Zone</p>
            <button onClick={handleSignOut}
              style={{ padding:'.7rem 1.5rem', borderRadius:'.75rem', border:'1.5px solid rgba(239,68,68,.35)', background:'rgba(239,68,68,.08)', color:'#f87171', fontSize:'.88rem', fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,.08)')}>
              Sign Out →
            </button>
          </motion.div>

        </div>
      </div>
    </>
  );
}
