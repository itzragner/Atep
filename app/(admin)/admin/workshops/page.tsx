'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Award, Plus, Edit, Trash2, QrCode, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Workshop {
  _id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  points: number;
  participants: any[];
  qrCode: string;
  maxParticipants: number;
  organizerId: any;
}

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  useEffect(() => {
    filterWorkshops();
  }, [searchTerm, filter, workshops]);

  const fetchWorkshops = async () => {
    try {
      const res = await fetch('/api/workshops');
      const data = await res.json();
      setWorkshops(data.workshops || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      setLoading(false);
    }
  };

  const filterWorkshops = () => {
    let filtered = workshops;

    if (searchTerm) {
      filtered = filtered.filter(
        (ws) =>
          ws.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ws.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const now = new Date();
    if (filter === 'upcoming') {
      filtered = filtered.filter((ws) => new Date(ws.time) >= now);
    } else if (filter === 'past') {
      filtered = filtered.filter((ws) => new Date(ws.time) < now);
    }

    setFilteredWorkshops(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workshop ?')) return;

    try {
      const res = await fetch(`/api/workshops/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Workshop supprimé avec succès');
        fetchWorkshops();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting workshop:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingWorkshop(null);
    setShowModal(true);
  };

  const handleShowQR = (workshop: Workshop) => {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center;">
          <h3 style="margin-bottom: 1rem; font-size: 1.5rem; font-weight: bold;">${workshop.title}</h3>
          <img src="${workshop.qrCode}" alt="QR Code" style="width: 300px; height: 300px;" />
          <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 2rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Fermer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Workshops</h1>
            <p className="text-gray-600 mt-2">
              {workshops.length} workshop{workshops.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Workshop
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou lieu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  Tous
                </Button>
                <Button
                  variant={filter === 'upcoming' ? 'default' : 'outline'}
                  onClick={() => setFilter('upcoming')}
                  size="sm"
                >
                  À venir
                </Button>
                <Button
                  variant={filter === 'past' ? 'default' : 'outline'}
                  onClick={() => setFilter('past')}
                  size="sm"
                >
                  Passés
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Workshops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{workshops.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">À venir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {workshops.filter((ws) => new Date(ws.time) >= new Date()).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {workshops.reduce((acc, ws) => acc + ws.participants.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workshops Grid */}
        {filteredWorkshops.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Aucun workshop trouvé</p>
                <Button onClick={handleCreate}>Créer le premier workshop</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <Card key={workshop._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{workshop.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{workshop.description}</p>

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
                        {workshop.participants.length} / {workshop.maxParticipants}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-yellow-600 font-medium">
                      <Award className="h-4 w-4" />
                      <span>+{workshop.points} points</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShowQR(workshop)}
                      className="flex-1"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(workshop)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(workshop._id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Create/Edit */}
        {showModal && (
          <WorkshopModal
            workshop={editingWorkshop}
            onClose={() => {
              setShowModal(false);
              setEditingWorkshop(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setEditingWorkshop(null);
              fetchWorkshops();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Modal Component
function WorkshopModal({
  workshop,
  onClose,
  onSuccess,
}: {
  workshop: Workshop | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: workshop?.title || '',
    description: workshop?.description || '',
    location: workshop?.location || '',
    time: workshop?.time ? new Date(workshop.time).toISOString().slice(0, 16) : '',
    points: workshop?.points || 10,
    maxParticipants: workshop?.maxParticipants || 50,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = workshop ? `/api/workshops/${workshop._id}` : '/api/workshops';
      const method = workshop ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(workshop ? 'Workshop mis à jour' : 'Workshop créé avec succès');
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{workshop ? 'Modifier le Workshop' : 'Nouveau Workshop'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lieu</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date et Heure</label>
              <input
                type="datetime-local"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Participants Max</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({ ...formData, maxParticipants: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Enregistrement...' : workshop ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}