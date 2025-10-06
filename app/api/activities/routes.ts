import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Activity from '@/models/Activity';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const activitySchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  location: z.string(),
  time: z.string().datetime(),
  type: z.enum(['divertissement', 'workshop']),
  imageUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming');

    let query: any = {};
    if (type) query.type = type;
    if (upcoming === 'true') query.time = { $gte: new Date() };

    const activities = await Activity.find(query).sort({ time: 1 });

    return NextResponse.json({ activities });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = activitySchema.parse(body);

    await connectDB();

    const activity = await Activity.create(validatedData);

    return NextResponse.json(
      {
        message: 'Activité créée avec succès',
        activity,
      },
      { status: 201 }
    );
  }
    catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 }); 
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}