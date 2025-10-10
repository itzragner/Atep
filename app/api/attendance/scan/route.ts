import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import Workshop from '@/models/Workshop';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'participant') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { workshopId, qrData } = await req.json();

    await connectDB();

    // Verify workshop exists
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop introuvable' }, { status: 404 });
    }

    // Verify QR code matches
    if (workshop.qrCode !== qrData) {
      return NextResponse.json({ error: 'QR Code invalide' }, { status: 400 });
    }

    // Check if already marked present
    const existingAttendance = await Attendance.findOne({
      participantId: session.user.id,
      workshopId: workshopId,
    });

    if (existingAttendance) {
      return NextResponse.json({ error: 'Présence déjà enregistrée' }, { status: 400 });
    }

    // Check if user is registered for the workshop
    const user = await User.findById(session.user.id);
    const isRegistered = user.workshopsRegistered.some(
      (id: mongoose.Types.ObjectId) => id.toString() === workshopId
    );

    if (!isRegistered) {
      return NextResponse.json(
        { error: 'Vous devez être inscrit au workshop' },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendance = await Attendance.create({
      workshopId,
      participantId: session.user.id,
      method: 'qr',
      timestamp: new Date(),
    });

    // Award points to user
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { points: workshop.points },
    });

    return NextResponse.json(
      {
        message: 'Présence confirmée avec succès',
        attendance,
        pointsAwarded: workshop.points,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error scanning QR code:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}