'use client';

import ChangePasswordForm from '@/components/ChangePasswordForm';
import WithAuth from '@/lib/withAuth'; // Assuming you want this page protected

export default function ChangePasswordPage() {
  return (
    // Optional: Wrap with WithAuth if this page should only be accessible to authenticated users
    // <WithAuth>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
          {/* The ChangePasswordForm component handles its own title and logic */}
          <ChangePasswordForm />
        </div>
      </div>
    // </WithAuth>
  );
}
