'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import NotificationCenter from '@/components/NotificationCenter';
import { 
  Calendar, 
  Home, 
  LogOut, 
  Settings, 
  Users, 
  Activity 
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const getNavigationLinks = () => {
    switch (session.user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: Home },
          { href: '/admin/workshops', label: 'Workshops', icon: Calendar },
          { href: '/admin/users', label: 'Utilisateurs', icon: Users },
          { href: '/admin/activities', label: 'Activités', icon: Activity },
        ];
      case 'organizer':
        return [
          { href: '/organizer', label: 'Dashboard', icon: Home },
          { href: '/organizer/workshops', label: 'Mes Workshops', icon: Calendar },
          { href: '/organizer/notifications', label: 'Notifications', icon: Activity },
        ];
      case 'participant':
        return [
          { href: '/participant', label: 'Accueil', icon: Home },
          { href: '/participant/workshops', label: 'Workshops', icon: Calendar },
          { href: '/participant/activities', label: 'Activités', icon: Activity },
          { href: '/participant/profile', label: 'Profil', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const links = getNavigationLinks();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              EventConnect
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />

            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-700">{session.user.name}</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {session.user.role}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}