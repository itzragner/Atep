import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import Workshop from '@/models/Workshop';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { workshopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['organizer', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await connectDB();

    // Verify workshop exists and belongs to organizer (if not admin)
    const workshop = await Workshop.findById(params.workshopId);
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop introuvable' }, { status: 404 });
    }

    if (
      session.user.role === 'organizer' &&
      workshop.organizerId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const attendances = await Attendance.find({
      workshopId: params.workshopId,
    })
      .populate('participantId', 'fullName email')
      .sort({ timestamp: -1 });

    return NextResponse.json({ attendances }, { status: 200 });
  } catch (error) {
    console.error('Error fetching workshop attendances:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}