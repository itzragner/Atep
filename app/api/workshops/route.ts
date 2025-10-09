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
  time: z.string(),
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

    const workshops = await Workshop.find(query).sort({ time: 1 }).lean();

    console.log('✅ Workshops fetched:', workshops.length);

    return NextResponse.json({ workshops });
  } catch (error: any) {
    console.error('❌ Error fetching workshops:', error.message);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('📡 POST /api/workshops - Session:', session?.user?.email);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'organizer')) {
      console.error('❌ Non autorisé - Role:', session?.user?.role);
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    console.log('📦 Body reçu:', body);

    const validatedData = workshopSchema.parse(body);
    console.log('✅ Données validées:', validatedData);

    await connectDB();
    console.log('✅ MongoDB connecté');

    // Générer un ID unique pour le QR code
    const workshopId = `WS-${Date.now()}`;
    console.log('🔑 Workshop ID:', workshopId);

    // Générer le QR code
    const qrCode = await QRCode.toDataURL(workshopId);
    console.log('✅ QR Code généré');

    // Convertir la date string en Date
    const workshopTime = new Date(validatedData.time);
    console.log('📅 Date convertie:', workshopTime);

    const workshop = await Workshop.create({
      title: validatedData.title,
      description: validatedData.description,
      location: validatedData.location,
      time: workshopTime,
      points: validatedData.points,
      maxParticipants: validatedData.maxParticipants,
      organizerId: session.user.id,
      qrCode: qrCode,
      participants: [],
    });

    console.log('✅ Workshop créé:', workshop._id);

    return NextResponse.json(
      {
        message: 'Workshop créé avec succès',
        workshop,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Erreur complète:', error);
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);

    if (error instanceof z.ZodError) {
      console.error('❌ Erreurs de validation:', error.issues);
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error.message,
      },
      { status: 500 }
    );
  }
}