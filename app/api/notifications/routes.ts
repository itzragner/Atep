import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const notificationSchema = z.object({
  message: z.string().min(1),
  recipientRole: z.enum(['admin', 'organizer', 'participant', 'all']),
  type: z.enum(['info', 'warning', 'reminder', 'update']).default('info'),
  relatedWorkshopId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'organizer')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = notificationSchema.parse(body);

    await connectDB();

    const notification = await Notification.create({
      ...validatedData,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        message: 'Notification créée avec succès',
        notification,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
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

    const notifications = await Notification.find({
      $or: [{ recipientRole: session.user.role }, { recipientRole: 'all' }],
    })
      .populate('createdBy', 'fullName')
      .populate('relatedWorkshopId', 'title time')
      .sort({ timestamp: -1 })
      .limit(50);

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}