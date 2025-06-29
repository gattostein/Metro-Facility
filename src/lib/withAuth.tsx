// src/lib/withAuth.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';

interface WithAuthProps {
  children: ReactNode;
  requiredRole?: string; // Opcional: si quieres restringir por rol
}

const WithAuth = ({ children, requiredRole }: WithAuthProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setIsLoading(false);
        return;
      }

      if (requiredRole && profileData.role !== requiredRole) {
        setError('You do not have access to this page.');
        router.push('/auth/login');
        return;
      }

      setUser(session.user);
      setIsLoading(false);
    };

    checkSession();
  }, [router, requiredRole]);

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>{error}</div>;

  return <>{children}</>;
};

export default WithAuth;
