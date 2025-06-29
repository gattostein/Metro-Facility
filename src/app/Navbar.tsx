'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user.email ?? null);
      setIsLoggedIn(!!data.session); // Set isLoggedIn based on session existence
    };
    getSession();

    // Optional: Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      setIsLoggedIn(!!session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };

  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // No need to manually set state here, the auth listener will handle it
    // Redirect after logout
    window.location.href = "/auth/signin"; // Or router.push('/auth/signin');
  };

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
      <div className="space-x-4 text-sm">
        <Link href="/" className="hover:underline">Home</Link>
        {isLoggedIn && ( // Show Dashboard and Invoices links only when logged in
          <>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/invoices" className="hover:underline">Invoice Generator</Link> {/* Added Invoice Generator link */}
            <Link href="/change-password" className="hover:underline">Change Password</Link> {/* Added Change Password link */}
          </>
        )}
      </div>
      {userEmail && (
        <div className="flex items-center gap-4 text-sm">
          <span>{userEmail}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      )}
      {!isLoggedIn && ( // Show Sign In/Sign Up only when not logged in
        <div className="space-x-4 text-sm">
          <Link href="/auth/signin" className="hover:underline">Sign In</Link>
          <Link href="/auth/signup" className="hover:underline">Sign Up</Link>
        </div>
      )}
    </nav>
  );
}