// src/components/LogoutButton.tsx
'use client';

import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      // Redirige al login después de cerrar sesión
      router.push('/auth/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 bg-red-500 text-white rounded"
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
