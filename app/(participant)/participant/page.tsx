'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  MapPin,
} from 'lucide-react';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  points: number;
  participants: any[];
}

interface UserProfile {
  fullName: string;
  email: string;
  points: number;
  workshopsRegistered: Workshop[];
}

interface Attendance {
  workshopId: string;
  timestamp: string;
}

export default function ParticipantDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [attendedWorkshops, setAttendedWorkshops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchAttendance();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      setProfile(data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/attendance/user');
      const data = await res.json();
      if (res.ok) {
        setAttendedWorkshops(
          data.attendances?.map((a: Attendance) => a.workshopId) || []
        );
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const getWorkshopStatus = (workshop: Workshop) => {
    const workshopDate = new Date(workshop.time);
    const now = new Date();
    const isAttended = attendedWorkshops.includes(workshop._id);

    if (isAttended) {
      return { label: 'Présence validée', color: 'green', icon: CheckCircle };
    } else if (workshopDate < now) {
      return { label: 'En attente', color: 'yellow', icon: Clock };
    } else {
      return { label: 'À venir', color: 'blue', icon: Calendar };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  const upcomingWorkshops =
    profile?.workshopsRegistered?.filter(
      (w) => new Date(w.time) > new Date()
    ) || [];

  const pastWorkshops =
    profile?.workshopsRegistered?.filter(
      (w) => new Date(w.time) <= new Date()
    ) || [];

  const pointsEarned = attendedWorkshops.length * 10; // Simplified calculation

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Tableau de Bord</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {profile?.fullName || session?.user?.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Points Totaux</CardTitle>
              <Award className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{profile?.points || 0}</div>
              <p className="text-xs text-blue-100 mt-1">
                {attendedWorkshops.length} workshops complétés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Workshops Inscrits</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile?.workshopsRegistered?.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {upcomingWorkshops.length} à venir
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taux de Présence</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile?.workshopsRegistered?.length
                  ? Math.round(
                      (attendedWorkshops.length /
                        profile.workshopsRegistered.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {attendedWorkshops.length} sur {profile?.workshopsRegistered?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Workshops */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mes Workshops À Venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingWorkshops.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Vous n'êtes inscrit à aucun workshop à venir
                </p>
                <Button onClick={() => router.push('/participant/workshops')}>
                  Découvrir les workshops
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingWorkshops.map((workshop) => {
                  const status = getWorkshopStatus(workshop);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={workshop._id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(`/participant/workshops/${workshop._id}`)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {workshop.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={`bg-${status.color}-100 text-${status.color}-800`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {workshop.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(workshop.time).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {workshop.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {workshop.points} points
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Workshops */}
        {pastWorkshops.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Historique des Workshops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastWorkshops.map((workshop) => {
                  const status = getWorkshopStatus(workshop);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={workshop._id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/participant/workshops/${workshop._id}`)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {workshop.title}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={`bg-${status.color}-100 text-${status.color}-800`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(workshop.time).toLocaleDateString('fr-FR')} • {workshop.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {workshop.points} pts
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}