import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await connectDB();

    const attendances = await Attendance.find({
      participantId: session.user.id,
    })
      .populate('workshopId', 'title time points')
      .sort({ timestamp: -1 });

    return NextResponse.json({ attendances }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}