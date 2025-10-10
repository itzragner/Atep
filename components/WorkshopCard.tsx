'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Award } from 'lucide-react';

interface WorkshopCardProps {
  workshop: {
    _id: string;
    title: string;
    description: string;
    location: string;
    time: string;
    points: number;
    participants: any[];
    maxParticipants?: number;
  };
  isRegistered?: boolean;
  onRegister?: (workshopId: string) => void;
  userRole?: 'participant' | 'organizer' | 'admin';
}

export default function WorkshopCard({
  workshop,
  isRegistered = false,
  onRegister,
  userRole = 'participant',
}: WorkshopCardProps) {
  const router = useRouter();
  const workshopDate = new Date(workshop.time);
  const isFull =
    workshop.maxParticipants && workshop.participants.length >= workshop.maxParticipants;

  const handleCardClick = () => {
    if (userRole === 'participant') {
      router.push(`/participant/workshops/${workshop._id}`);
    } else if (userRole === 'organizer') {
      router.push(`/organizer/workshops/${workshop._id}`);
    }
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRegister) {
      onRegister(workshop._id);
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{workshop.title}</CardTitle>
          {isRegistered && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Inscrit
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">{workshop.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {workshopDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{workshop.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {workshop.participants.length}
              {workshop.maxParticipants && ` / ${workshop.maxParticipants}`} participants
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="h-4 w-4" />
            <span>{workshop.points} points</span>
          </div>
        </div>

        {onRegister && (
          <Button
            onClick={handleRegisterClick}
            disabled={isRegistered || isFull}
            className="w-full"
          >
            {isRegistered ? 'Déjà inscrit' : isFull ? 'Complet' : "S'inscrire"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}