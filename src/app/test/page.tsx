'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function TestPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('user_profiles').select('*');
      if (error) {
        console.error('Error fetching user_profiles:', error.message);
        setError('Failed to load user profiles');
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Profiles</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && profiles.length === 0 && (
        <p>No user profiles found.</p>
      )}

      {!loading && !error && profiles.length > 0 && (
        <table className="min-w-full bg-white border rounded shadow-md">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border-b">Full Name</th>
              <th className="p-2 border-b">Email</th>
              <th className="p-2 border-b">Role</th>
              <th className="p-2 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id}>
                <td className="p-2 border-b">{profile.full_name}</td>
                <td className="p-2 border-b">{profile.email}</td>
                <td className="p-2 border-b">{profile.role}</td>
                <td className="p-2 border-b">{new Date(profile.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

