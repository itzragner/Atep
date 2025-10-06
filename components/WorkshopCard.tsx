'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Award } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  onRegister?: (workshopId: string) => void;
  onViewDetails?: (workshopId: string) => void;
  isRegistered?: boolean;
  showActions?: boolean;
}

export default function WorkshopCard({
  workshop,
  onRegister,
  onViewDetails,
  isRegistered = false,
  showActions = true,
}: WorkshopCardProps) {
  const participantsCount = workshop.participants?.length || 0;
  const maxParticipants = workshop.maxParticipants || 50;
  const isFull = participantsCount >= maxParticipants;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">{workshop.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm line-clamp-2">{workshop.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(workshop.time)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{workshop.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {participantsCount} / {maxParticipants} participants
            </span>
            {isFull && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                Complet
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
            <Award className="h-4 w-4" />
            <span>+{workshop.points} points</span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-4">
            {isRegistered ? (
              <Button variant="secondary" className="flex-1" disabled>
                Inscrit
              </Button>
            ) : (
              <Button
                onClick={() => onRegister?.(workshop._id)}
                className="flex-1"
                disabled={isFull}
              >
                {isFull ? 'Complet' : "S'inscrire"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => onViewDetails?.(workshop._id)}
            >
              Détails
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}