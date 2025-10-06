'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  participants: any[];
}

export default function OrganizerDashboard() {
  const { data: session } = useSession();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workshops?upcoming=true')
      .then((res) => res.json())
      .then((data) => {
        setWorkshops(data.workshops || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleSendNotification = (workshopId: string) => {
    // Logique pour envoyer une notification
    console.log('Notification pour workshop:', workshopId);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Espace Organisateur</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {session?.user?.name || 'Organisateur'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mes Workshops</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{workshops.length}</div>
              <p className="text-xs text-gray-500 mt-1">À venir</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {workshops.reduce((acc, w) => acc + w.participants.length, 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total inscrits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Send className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mt-2">
                Envoyer une notification
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workshops à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workshops.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun workshop à venir pour le moment
                </p>
              ) : (
                workshops.map((workshop) => (
                  <div
                    key={workshop._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {workshop.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{workshop.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(workshop.time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {workshop.participants.length} participants
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendNotification(workshop._id)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Notifier
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}