'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Award, Bell } from 'lucide-react';

interface Stats {
  totalParticipants: number;
  totalWorkshops: number;
  totalPoints: number;
  activeNotifications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalParticipants: 0,
    totalWorkshops: 0,
    totalPoints: 0,
    activeNotifications: 0,
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Admin</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de EventConnect</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Participants
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalParticipants}</div>
              <p className="text-xs text-gray-500 mt-1">Total inscrits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Workshops</CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalWorkshops}</div>
              <p className="text-xs text-gray-500 mt-1">Ateliers actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Points Totaux
              </CardTitle>
              <Award className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalPoints}</div>
              <p className="text-xs text-gray-500 mt-1">Cumulés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Notifications
              </CardTitle>
              <Bell className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.activeNotifications}
              </div>
              <p className="text-xs text-gray-500 mt-1">Actives</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Derniers Workshops</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Liste des workshops récents...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Activités récentes des participants...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}