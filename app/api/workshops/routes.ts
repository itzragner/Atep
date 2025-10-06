import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import QRCode from 'qrcode';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const workshopSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  location: z.string(),
  time: z.string().datetime(),
  points: z.number().min(0).default(10),
  maxParticipants: z.number().min(1).default(50),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get('upcoming');

    let query = {};
    if (upcoming === 'true') {
      query = { time: { $gte: new Date() } };
    }

    const workshops = await Workshop.find(query)
      .populate('organizerId', 'fullName email')
      .populate('participants', 'fullName email points')
      .sort({ time: 1 });

    return NextResponse.json({ workshops });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'organizer')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = workshopSchema.parse(body);

    await connectDB();

    const workshopId = new Date().getTime().toString();
    const qrCode = await QRCode.toDataURL(workshopId);

    const workshop = await Workshop.create({
      ...validatedData,
      organizerId: session.user.id,
      qrCode,
      participants: [],
    });

    return NextResponse.json(
      {
        message: 'Workshop créé avec succès',
        workshop,
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