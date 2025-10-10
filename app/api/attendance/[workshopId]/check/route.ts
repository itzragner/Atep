import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { workshopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await connectDB();

    const attendance = await Attendance.findOne({
      participantId: session.user.id,
      workshopId: params.workshopId,
    });

    if (!attendance) {
      return NextResponse.json({ attendance: null }, { status: 200 });
    }

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error) {
    console.error('Error checking attendance:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}