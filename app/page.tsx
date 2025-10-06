'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar, Users, Award } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      switch (session.user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'organizer':
          router.push('/organizer');
          break;
        case 'participant':
          router.push('/participant');
          break;
        default:
          router.push('/login');
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bienvenue sur <span className="text-blue-600">EventConnect</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La plateforme complète de gestion d'événements et de workshops pour une expérience
            interactive et engageante
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestion des Workshops</h3>
            <p className="text-gray-600">
              Organisez et gérez vos workshops facilement avec un système complet de planification
              et de suivi
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Suivi des Participants</h3>
            <p className="text-gray-600">
              Suivez la participation en temps réel avec un système de QR code et de validation
              automatique
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Système de Points</h3>
            <p className="text-gray-600">
              Motivez vos participants avec un système de points et un classement interactif
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}