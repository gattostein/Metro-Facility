'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Asegúrate de que la ruta sea correcta
import { useRouter } from 'next/navigation'; // Importar useRouter para redireccionar

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Tu contraseña ha sido actualizada exitosamente.');
      setPassword('');
      setConfirmPassword('');
      // Opcional: Redirigir al usuario a la página de inicio de sesión después de un breve retraso
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000); // Redirigir después de 3 segundos
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Actualizar Contraseña</h3>
        <form onSubmit={handleUpdatePassword}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="password">
                Nueva Contraseña
              </label>
              <input
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="confirmPassword">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                placeholder="Confirma tu nueva contraseña"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
              >
                Actualizar Contraseña
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
