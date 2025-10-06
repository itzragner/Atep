import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import Workshop from '@/models/Workshop';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const attendanceSchema = z.object({
  workshopId: z.string(),
  participantId: z.string(),
  method: z.enum(['qr', 'manual']).default('qr'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === 'participant') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = attendanceSchema.parse(body);

    await connectDB();

    const existingAttendance = await Attendance.findOne({
      participantId: validatedData.participantId,
      workshopId: validatedData.workshopId,
    });

    if (existingAttendance) {
      return NextResponse.json({ error: 'Présence déjà enregistrée' }, { status: 400 });
    }

    const workshop = await Workshop.findById(validatedData.workshopId);
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop introuvable' }, { status: 404 });
    }

    const attendance = await Attendance.create({
      ...validatedData,
      validatedBy: session.user.id,
      timestamp: new Date(),
    });

    await User.findByIdAndUpdate(validatedData.participantId, {
      $inc: { points: workshop.points },
    });

    // ✅ Conversion en ObjectId
    const participantObjectId = new mongoose.Types.ObjectId(validatedData.participantId);
    
    if (!workshop.participants.includes(participantObjectId)) {
      workshop.participants.push(participantObjectId);
      await workshop.save();
    }

    return NextResponse.json(
      {
        message: 'Présence enregistrée avec succès',
        attendance,
        pointsAwarded: workshop.points,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get('workshopId');
    const participantId = searchParams.get('participantId');

    let query: any = {};
    if (workshopId) query.workshopId = workshopId;
    if (participantId) query.participantId = participantId;

    const attendances = await Attendance.find(query)
      .populate('participantId', 'fullName email')
      .populate('workshopId', 'title time')
      .populate('validatedBy', 'fullName')
      .sort({ timestamp: -1 });

    return NextResponse.json({ attendances });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}