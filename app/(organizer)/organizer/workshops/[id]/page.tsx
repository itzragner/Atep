"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


import {
  Calendar,
  MapPin,
  Users,
  Award,
  CheckCircle,
  XCircle,
  ArrowLeft,
  QrCode,
} from "lucide-react";

interface Participant {
  _id: string;
  fullName: string;
  email: string;
  points: number;
}

interface Workshop {
  _id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  points: number;
  participants: Participant[];
  maxParticipants?: number;
  qrCode?: string;
}

interface AttendanceRecord {
  participantId: string;
  workshopId: string;
  timestamp: string;
  method: "qr" | "manual";
}

export default function OrganizerWorkshopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchWorkshopDetails();
    fetchAttendances();
  }, [params.id]);

  const fetchWorkshopDetails = async () => {
    try {
      const res = await fetch(`/api/workshops/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setWorkshop(data.workshop);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching workshop:", error);
      setLoading(false);
    }
  };

  const fetchAttendances = async () => {
    try {
      const res = await fetch(`/api/attendance/workshop/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setAttendances(data.attendances || []);
      }
    } catch (error) {
      console.error("Error fetching attendances:", error);
    }
  };

  const handleValidateAttendance = async () => {
    if (selectedParticipants.length === 0) {
      alert("Veuillez sélectionner au moins un participant");
      return;
    }

    try {
      const promises = selectedParticipants.map((participantId) =>
        fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workshopId: params.id,
            participantId,
            method: "manual",
          }),
        })
      );

      await Promise.all(promises);

      alert("Présences validées avec succès !");
      setSelectedParticipants([]);
      fetchAttendances();
      fetchWorkshopDetails();
    } catch (error) {
      console.error("Error validating attendance:", error);
      alert("Erreur lors de la validation");
    }
  };

  const isParticipantPresent = (participantId: string) => {
    return attendances.some((a) => a.participantId === participantId);
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Workshop non trouvé</p>
      </div>
    );
  }

  const workshopDate = new Date(workshop.time);
  const presentCount = attendances.length;
  const registeredCount = workshop.participants.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* Workshop Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{workshop.title}</CardTitle>
            <p className="text-gray-600">{workshop.description}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {workshopDate.toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Lieu</p>
                  <p className="font-medium">{workshop.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Award className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="font-medium">{workshop.points} points</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Présents</p>
                  <p className="font-medium">
                    {presentCount} / {registeredCount}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Button */}
            <div className="mt-4">
              <Button
                onClick={() => setShowQR(!showQR)}
                variant="outline"
                size="sm"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQR ? "Masquer" : "Afficher"} le QR Code
              </Button>

              {showQR && workshop.qrCode && (
                <div className="mt-4 p-4 bg-white border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    QR Code pour ce workshop :
                  </p>
                  <div className="bg-gray-100 p-2 rounded font-mono text-sm break-all">
                    {workshop.qrCode}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Les participants peuvent scanner ce code pour confirmer leur
                    présence
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Liste des Participants
              </CardTitle>
              {selectedParticipants.length > 0 && (
                <Button onClick={handleValidateAttendance}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider la présence ({selectedParticipants.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {registeredCount === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aucun participant inscrit pour le moment
              </p>
            ) : (
              <div className="space-y-2">
                {workshop.participants.map((participant) => {
                  const isPresent = isParticipantPresent(participant._id);
                  const isSelected = selectedParticipants.includes(
                    participant._id
                  );

                  return (
                    <div
                      key={participant._id}
                      className={`border rounded-lg p-4 flex items-center gap-4 ${
                        isPresent
                          ? "bg-green-50 border-green-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {!isPresent && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleParticipant(participant._id)}
                          className="h-4 w-4"
                        />
                      )}

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {participant.fullName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {participant.email}
                        </p>
                      </div>

                      {isPresent ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Présent
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Absent
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
