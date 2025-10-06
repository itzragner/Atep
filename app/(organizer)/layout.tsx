import React from 'react';
import Navbar from '@/components/Navbar';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}