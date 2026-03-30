"use client"

import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';

export function Header() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (loading) return <div className="h-16" />; // Skeleton

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter:blur(0)]:bg-none">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <h1 className="text-xl font-bold">TaskMaster</h1>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
  <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate max-w-[150px]">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
