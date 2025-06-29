'use client';
import React from 'react';
import WithAuth from '@/lib/withAuth';
import LogoutButton from '@/components/LogoutButton';
import ChangePasswordForm from '@/components/ChangePasswordForm';

export default function UserDashboard() {
  return (
    <WithAuth requiredRole="user">
      <div className="p-4">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <p>Welcome to your user dashboard. Here you can view your profile and other user-related data.</p>
        <LogoutButton />

        <div className="mt-8 border-t pt-8"> {/* Añadir un poco de espacio y un separador */}
          <ChangePasswordForm />
        </div>
      </div>

    </WithAuth>
  );
}