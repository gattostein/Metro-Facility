'use client';
import React from 'react';
import WithAuth from '@/lib/withAuth';
import LogoutButton from '@/components/LogoutButton';
import ChangePasswordForm from '@/components/ChangePasswordForm';

export default function AdminDashboard() {
  return (
    <WithAuth requiredRole="admin">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p>Welcome to the Admin Dashboard. Here you can manage users, profiles, etc.</p>
        <LogoutButton />
        <div className="mt-8 border-t pt-8"> {/* Add some space and a separator */}
          <ChangePasswordForm />
        </div>
      </div>
    </WithAuth>
  );
}