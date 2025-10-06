import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Workshop from '@/models/Workshop';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();

    const workshop = await Workshop.findById(params.id)
      .populate('organizerId', 'fullName email')
      .populate('participants', 'fullName email points');

    if (!workshop) {
      return NextResponse.json({ error: 'Workshop introuvable' }, { status: 404 });
    }

    return NextResponse.json({ workshop });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    const workshop = await Workshop.findByIdAndUpdate(params.id, body, { new: true });

    if (!workshop) {
      return NextResponse.json({ error: 'Workshop introuvable' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Workshop mis à jour', workshop });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await connectDB();

    const workshop = await Workshop.findByIdAndDelete(params.id);

    if (!workshop) {
      return NextResponse.json({ error: 'Workshop introuvable' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Workshop supprimé avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}