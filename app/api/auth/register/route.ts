import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['admin', 'organizer', 'participant']).default('participant'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await User.create({
      email: validatedData.email,
      password: hashedPassword,
      fullName: validatedData.fullName,
      role: validatedData.role,
    });

    return NextResponse.json(
      {
        message: 'Utilisateur créé avec succès',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
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