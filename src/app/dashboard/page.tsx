'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        router.push('/auth/signin');
        return;
      }

      setCurrentUserId(session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error(profileError);
        router.push('/auth/signin');
        return;
      }

      setRole(profile.role);
      setUserName(profile.full_name);
      setLoading(false);
    };

    fetchUserRole();
  }, [router]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {role === 'admin' ? (
        <AdminDashboard userName={userName} userRole={role} currentUserId={currentUserId} />
      ) : role === 'normal' ? (
        <WorkerDashboard userName={userName} userRole={role} />
      ) : (
        <p>You do not have a role assigned.</p>
      )}
    </div>
  );
}

interface CombinedUserProfile {
  id: string;
  email: string | undefined;
  full_name: string | undefined;
  role: string | undefined;
  address?: string;
  contact_number?: string;
  abn?: string;
  bsb?: string;
  account_number?: string;
  auth_user: {
    email: string;
  }[];
}

interface AdminDashboardProps {
  userName: string | null;
  userRole: string | null;
  currentUserId: string | null;
}

function AdminDashboard({ userName, userRole, currentUserId }: AdminDashboardProps) {
  const [users, setUsers] = useState<CombinedUserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserId) {
      const fetchUsers = async () => {
        try {
          const response = await fetch('/api/admin/users');

          if (!response.ok) {
            console.error('API Response Status:', response.status);
            console.error('API Response Text:', await response.text());
            try {
              const errorData = await response.json();
              throw new Error(errorData.error || `API Error: ${response.status}`);
            } catch (jsonError) {
              throw new Error(`Failed to fetch users: Received status ${response.status}`);
            }
          }

          const data: CombinedUserProfile[] = await response.json();
          setUsers(data);

        } catch (err: any) {
          console.error('Error fetching users:', err.message);
          setError(err.message || 'Error loading users.');
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    } else {
      setLoadingUsers(true);
    }
  }, [currentUserId]);

  const handleChangeRole = async (userId: string, currentRole: string | undefined) => {
    if (userId === currentUserId) {
      alert("You cannot change your own role.");
      return;
    }

    setChangingRole(userId);

    const newRole = currentRole === 'admin' ? 'normal' : 'admin';

    try {
      const response = await fetch('/api/admin/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to change role. Please try again.');
      }

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      alert(`Role for user ${userId} changed to ${newRole}`);

    } catch (error: any) {
      console.error('Error changing role:', error.message);
      alert(`Failed to change role: ${error.message}`);
    } finally {
      setChangingRole(null);
    }
  };

  if (loadingUsers) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div>
      <p>Welcome, {userName} ({userRole}) 👑</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">User List</h2>
      {users.length === 0 ? (
        <p>No users registered yet (apart from you, if you are the first).</p>
      ) : (
        <ul className="list-disc ml-6">
          {users.map(user => (
            <li key={user.id} className="mb-4 p-2 border rounded flex justify-between items-center">
              <div>
                <strong>{user.full_name || 'N/A'}</strong> ({user.role || 'N/A'})<br />
                Email: {user.auth_user && user.auth_user.length > 0 ? user.auth_user[0].email : 'N/A'}<br />
                Address: {user.address || 'N/A'}<br />
                Contact: {user.contact_number || 'N/A'}<br />
                ABN: {user.abn || 'N/A'}<br />
                BSB: {user.bsb || 'N/A'}<br />
                Account Number: {user.account_number || 'N/A'}
              </div>
              {user.id !== currentUserId && (
                <button
                  onClick={() => handleChangeRole(user.id, user.role)}
                  className={`ml-4 px-3 py-1 rounded text-white ${user.role === 'admin' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} ${changingRole === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={changingRole === user.id}
                >
                  {changingRole === user.id ? 'Changing...' : (user.role === 'admin' ? 'Demote to Normal' : 'Promote to Admin')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Administrator Features</h2>
      <ul className="list-disc ml-6">
        <li>Manage Workers (list shown above)</li>
        <li>View Location Reports (pending implementation)</li>
        <li>View Invoices (pending implementation)</li>
        <li>Add Company Information (pending implementation)</li>
      </ul>
    </div>
  );
}

interface WorkerDashboardProps {
  userName: string | null;
  userRole: string | null;
}

function WorkerDashboard({ userName, userRole }: WorkerDashboardProps) {
  return (
    <div>
      <p>Welcome, {userName} ({userRole}) 🧹</p>
      <ul className="list-disc ml-6 mt-2">
        <li>View My Assigned Jobs (pending implementation)</li>
        <li>Submit Shift Report (pending implementation)</li>
        <li>View My Payment History (pending implementation)</li>
      </ul>
    </div>
  );
}