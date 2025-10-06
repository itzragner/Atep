import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'organizer' | 'participant';
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'admin' | 'organizer' | 'participant';
    _id?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    id: string;
  }
}