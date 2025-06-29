'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [abn, setAbn] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const [isFirstUser, setIsFirstUser] = useState(false);
  const router = useRouter();

  // Check if there are users in the 'user_profiles' table
  useEffect(() => {
    const checkFirstUser = async () => {
      const { data, error } = await supabase.from('user_profiles').select('id', { count: 'exact' });
      if (!error && data && data.length === 0) { // Added data check
        setIsFirstUser(true);
      } else {
        setIsFirstUser(false); // Ensure it's false if users exist or on error
      }
    };

    checkFirstUser();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          address: address,
          contact_number: contactNumber,
          abn: abn,
          bsb: bsb,
          account_number: accountNumber,
        },
      },
    });

    // --- DEBUG: Log sign-up result ---
    console.log('Sign Up Result - Data:', data);
    console.log('Sign Up Result - Error:', signupError);
    // --- END DEBUG ---


    if (signupError) {
      setError(signupError.message);
      return;
    }

    // Profile creation is now handled by a database trigger
    // after the user is successfully created in auth.users.
    // The trigger should handle setting the admin role for the first user.

    // Check if session and user are present in data after successful sign-up
    if (data.session && data.user) {
        console.log('Sign Up Successful, redirecting...');
        // Redirect after successful signup
        router.push('/auth/signin'); // or /auth/signin if already ready
    } else {
        // This case might happen if email confirmation is required
        console.log('Sign Up successful, but no session data returned. Email confirmation likely required.');
        // You might want to show a message to the user to check their email
        alert('Sign up successful! Please check your email to confirm your account.');
        // Optionally redirect to a confirmation pending page
        // router.push('/auth/confirm');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form onSubmit={handleSignUp} className="mt-4">
        <div>
          <label className="block text-sm">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Address/Suburb</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Contact Number</label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <div className="mt-2">
          <label className="block text-sm">ABN</label>
          <input
            type="text"
            value={abn}
            onChange={(e) => setAbn(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <div className="mt-2">
          <label className="block text-sm">BSB</label>
          <input
            type="text"
            value={bsb}
            onChange={(e) => setBsb(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>
        {error && <div className="mt-2 text-red-600">{error}</div>}
        <div className="mt-4">
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
