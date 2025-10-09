import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Workshop from '@/models/Workshop';
import Attendance from '@/models/Attendance';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await connectDB();

    // Vérifier que l'utilisateur existe
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Empêcher de supprimer un admin
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un administrateur' },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur des workshops
    await Workshop.updateMany(
      { participants: params.id },
      { $pull: { participants: params.id } }
    );

    // Supprimer les présences de l'utilisateur
    await Attendance.deleteMany({ participantId: params.id });

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    const allowedUpdates = ['fullName', 'role', 'points'];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const user = await User.findByIdAndUpdate(params.id, { $set: updates }, { new: true }).select(
      '-password'
    );

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Utilisateur mis à jour', user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}