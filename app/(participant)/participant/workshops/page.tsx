'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  points: number;
  participants: any[];
  maxParticipants: number;
  organizerId: any;
}

export default function ParticipantWorkshopsPage() {
  const { data: session } = useSession();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
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
      setAttendedIds(data.user?.workshopsAttended?.map((w: any) => w._id) || []);
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
        alert(data.error || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert("Erreur lors de l'inscription");
    }
  };

  const handleUnregister = async (workshopId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir vous désinscrire ?')) return;

    try {
      const res = await fetch(`/api/workshops/${workshopId}/unregister`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchWorkshops();
        fetchUserProfile();
        alert('Désinscription réussie');
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la désinscription');
      }
    } catch (error) {
      console.error('Error unregistering:', error);
      alert('Erreur lors de la désinscription');
    }
  };

  const filteredWorkshops =
    filter === 'registered'
      ? workshops.filter((w) => registeredIds.includes(w._id))
      : workshops;

  const isWorkshopFull = (workshop: Workshop) =>
    workshop.participants.length >= workshop.maxParticipants;

  const isWorkshopPast = (workshop: Workshop) => new Date(workshop.time) < new Date();

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
          <p className="text-gray-600 mt-2">
            Découvrez et inscrivez-vous aux workshops pour gagner des points
          </p>
        </div>

        {/* Filters */}
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
                <Clock className="h-4 w-4 mr-2" />
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
                <CheckCircle className="h-4 w-4 mr-2" />
                Mes inscriptions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun workshop disponible pour le moment</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredWorkshops.map((workshop) => {
              const isRegistered = registeredIds.includes(workshop._id);
              const isAttended = attendedIds.includes(workshop._id);
              const isFull = isWorkshopFull(workshop);
              const isPast = isWorkshopPast(workshop);

              return (
                <Card
                  key={workshop._id}
                  className={`hover:shadow-lg transition-shadow ${
                    isPast ? 'opacity-75' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{workshop.title}</CardTitle>
                      {isAttended && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Assisté
                        </Badge>
                      )}
                      {isRegistered && !isAttended && (
                        <Badge className="bg-blue-500">Inscrit</Badge>
                      )}
                      {isFull && !isRegistered && (
                        <Badge variant="destructive">Complet</Badge>
                      )}
                      {isPast && !isAttended && (
                        <Badge variant="secondary">Terminé</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {workshop.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(workshop.time)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{workshop.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>
                          {workshop.participants.length} / {workshop.maxParticipants}{' '}
                          participants
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-yellow-600 font-medium">
                        <Award className="h-4 w-4" />
                        <span>+{workshop.points} points</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4">
                      {isAttended ? (
                        <Button disabled className="w-full" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Déjà assisté
                        </Button>
                      ) : isRegistered ? (
                        <Button
                          onClick={() => handleUnregister(workshop._id)}
                          variant="outline"
                          className="w-full"
                          disabled={isPast}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Se désinscrire
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleRegister(workshop._id)}
                          className="w-full"
                          disabled={isFull || isPast}
                        >
                          {isFull ? 'Complet' : isPast ? 'Terminé' : "S'inscrire"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
            )}
        </div>
        </div>
    </div>
    );
}