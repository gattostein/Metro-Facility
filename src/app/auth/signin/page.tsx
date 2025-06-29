'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // --- DEBUG: Log sign-in result ---
    console.log('Sign In Result - Data:', data);
    console.log('Sign In Result - Error:', signInError);
    // --- END DEBUG ---


    if (signInError) {
      setError(signInError.message);
    } else {
      // Check if session and user are present in data after successful sign-in
      if (data.session && data.user) {
         console.log('Sign In Successful, redirecting...');
         router.push('/dashboard'); // Redirect to the main dashboard after login
      } else {
         // This case should ideally not happen on success, but good to log
         console.log('Sign In reported success but no session/user in data.');
         setError('Sign in failed: No session data.'); // Or handle as a specific error
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Sign In</h1>
      <form onSubmit={handleSignIn} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Sign In
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
      <div className="mt-4 text-center text-sm">
        <p className="mb-2"> {/* Añadir un pequeño margen inferior */}
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </p>
        <p>
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
