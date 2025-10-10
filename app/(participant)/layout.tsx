'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Calendar, QrCode, User, LogOut, Award } from 'lucide-react';

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role && session.user.role !== 'participant') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/participant" className="flex items-center gap-2">
                <Award className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Workshop Manager</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session?.user?.name || session?.user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            <Link href="/participant">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-3" />
                Tableau de bord
              </Button>
            </Link> 
            <Link href="/participant/workshops">
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-3" />
                Workshops
              </Button>
            </Link>
            <Link href="/participant/scan">
              <Button variant="ghost" className="w-full justify-start">
                <QrCode className="h-4 w-4 mr-3" />
                Scanner QR Code
              </Button>
            </Link>
            <Link href="/participant/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-3" />
                Mon Profil
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}