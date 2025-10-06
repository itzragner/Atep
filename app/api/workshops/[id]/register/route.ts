import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'participant') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await connectDB();

    const workshop = await Workshop.findById(params.id);
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop introuvable' }, { status: 404 });
    }

    // Vérifier si le workshop est complet
    if (workshop.participants.length >= (workshop.maxParticipants || 50)) {
      return NextResponse.json({ error: 'Workshop complet' }, { status: 400 });
    }

    // ✅ Conversion en ObjectId
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Vérifier si déjà inscrit
    if (workshop.participants.includes(userObjectId)) {
      return NextResponse.json({ error: 'Déjà inscrit' }, { status: 400 });
    }

    // Ajouter le participant au workshop
    workshop.participants.push(userObjectId);
    await workshop.save();

    // Ajouter le workshop à l'utilisateur
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { workshopsRegistered: params.id },
    });

    return NextResponse.json({
      message: 'Inscription réussie',
      workshop,
    });
  } catch (error) {
    console.error('Error registering for workshop:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}