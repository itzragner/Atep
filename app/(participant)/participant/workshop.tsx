'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import WorkshopCard from '@/components/WorkshopCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  points: number;
  participants: any[];
  maxParticipants?: number;
}

export default function ParticipantWorkshopsPage() {
  const { data: session } = useSession();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'registered'>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkshops();
    fetchUserProfile();
  }, [filter]);

  const fetchWorkshops = async () => {
    try {
      const upcoming = filter === 'all' ? '' : '?upcoming=true';
      const res = await fetch(`/api/workshops${upcoming}`);
      const data = await res.json();
      setWorkshops(data.workshops || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      setRegisteredIds(data.user?.workshopsRegistered?.map((w: any) => w._id) || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleRegister = async (workshopId: string) => {
    try {
      const res = await fetch(`/api/workshops/${workshopId}/register`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchWorkshops();
        fetchUserProfile();
        alert('Inscription réussie !');
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Erreur lors de l\'inscription');
    }
  };

  const filteredWorkshops =
    filter === 'registered'
      ? workshops.filter((w) => registeredIds.includes(w._id))
      : workshops;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement des workshops...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workshops Disponibles</h1>
          <p className="text-gray-600 mt-2">Découvrez et inscrivez-vous aux workshops</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setFilter('upcoming')}
              >
                À venir
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Tous
              </Button>
              <Button
                variant={filter === 'registered' ? 'default' : 'outline'}
                onClick={() => setFilter('registered')}
              >
                Mes inscriptions
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Aucun workshop disponible pour le moment</p>
            </div>
          ) : (
            filteredWorkshops.map((workshop) => (
              <WorkshopCard
                key={workshop._id}
                workshop={workshop}
                isRegistered={registeredIds.includes(workshop._id)}
                onRegister={handleRegister}
                onViewDetails={(id) => console.log('View details:', id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}