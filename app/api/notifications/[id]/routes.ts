import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const notification = await Notification.findByIdAndUpdate(
      params.id,
      { isRead: body.isRead },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}