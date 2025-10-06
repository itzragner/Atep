'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Calendar, Bell, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserProfile {
  fullName: string;
  email: string;
  points: number;
  workshopsRegistered: any[];
}

interface Notification {
  _id: string;
  message: string;
  type: string;
  timestamp: string;
  relatedWorkshopId?: any;
}

export default function ParticipantDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/users/profile').then((res) => res.json()),
      fetch('/api/notifications').then((res) => res.json()),
    ])
      .then(([profileData, notifData]) => {
        setProfile(profileData.user);
        setNotifications(notifData.notifications || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Espace</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {profile?.fullName || session?.user?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mes Points</CardTitle>
              <Award className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{profile?.points || 0}</div>
              <p className="text-xs text-blue-100 mt-1">Points cumulés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Workshops</CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile?.workshopsRegistered?.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inscrits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Classement</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">#12</div>
              <p className="text-xs text-gray-500 mt-1">Sur 150 participants</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Fil d'actualité</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucune notification pour le moment
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 rounded-lg border-l-4 ${
                        notif.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : notif.type === 'reminder'
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notif.timestamp)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prochains Workshops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Design Thinking</h4>
                  <p className="text-sm text-gray-600 mt-1">Salle B03</p>
                  <p className="text-xs text-gray-500 mt-2">Aujourd'hui à 14h00</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">+15 points</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Développement Web</h4>
                  <p className="text-sm text-gray-600 mt-1">Salle A12</p>
                  <p className="text-xs text-gray-500 mt-2">Demain à 10h30</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">+20 points</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}