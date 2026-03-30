'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl">Loading...</p>
    </div>
  );
}
