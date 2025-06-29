'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Asegúrate de que la ruta sea correcta

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Define la URL a la que Supabase redirigirá al usuario después de hacer clic en el enlace del correo.
    // Debes crear esta página (por ejemplo, src/app/auth/update-password/page.tsx)
    const redirectUrl = `${window.location.origin}/auth/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('If your email address is registered, you will receive a link to reset your password.');
      setEmail(''); // Limpiar el campo de email
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Reset Password</h3>
        <form onSubmit={handleResetPassword}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
              >
                Send reset link
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
