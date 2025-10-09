import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await connectDB();

    // ✅ Récupérer les utilisateurs SANS populate
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Transformer les données pour l'affichage
    const usersWithWorkshopCount = users.map(user => ({
      ...user,
      workshopsRegistered: user.workshopsRegistered || [],
    }));

    console.log('✅ Users fetched:', usersWithWorkshopCount.length);

    return NextResponse.json({ users: usersWithWorkshopCount });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 });
  }
}