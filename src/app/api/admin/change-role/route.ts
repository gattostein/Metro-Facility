// src/app/api/admin/change-role/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// Removed: import { createLogger } from 'some-logger-library';

// Removed: const logger = createLogger();

export async function POST(request: Request) {
  try { // Kept try block
    console.log('Received request to change user role.'); // Reverted to console.log
    const { userId, newRole } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 1. Verificar el usuario y su rol (autorización)
    const { data: { user }, error: userError } = await supabase.auth.getUser(); // Kept capturing user error

    if (userError || !user) { // Kept checking for user error
      console.error('Authentication failed:', userError); // Reverted to console.error
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Authenticated user: ${user.id}`); // Reverted to console.log

    // Obtener el perfil del usuario autenticado para verificar si es admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminError || adminProfile?.role !== 'admin') {
      console.error('Authorization failed for role change:', adminError); // Reverted to console.error
      return NextResponse.json({ error: 'Forbidden: Only administrators can change roles.' }, { status: 403 });
    }

    console.log('User is authorized as admin.'); // Reverted to console.log

    // 2. Validar los datos recibidos
    if (!userId || (newRole !== 'admin' && newRole !== 'normal')) {
      console.warn('Invalid input received:', { userId, newRole }); // Reverted to console.warn
      return NextResponse.json({ error: 'Invalid input: userId and newRole are required and newRole must be "admin" or "normal".' }, { status: 400 });
    }

    console.log(`Attempting to change role for user ${userId} to ${newRole}`); // Reverted to console.log

    // 3. Asegurarse de que el admin no intente cambiar su propio rol
    if (userId === user.id) {
        console.warn('Attempted to change own role:', userId); // Reverted to console.warn
        return NextResponse.json({ error: 'Cannot change your own role.' }, { status: 400 });
    }

    // 4. Actualizar el rol del usuario en la base de datos
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error(`Error updating user ${userId} role to ${newRole}:`, error); // Reverted to console.error (but kept detailed log)
      // Return a more generic error to the client (Kept this)
      return NextResponse.json({ error: 'Failed to update user role due to a server error.' }, { status: 500 });
    }

    // 5. Respuesta exitosa
    console.log(`Successfully updated user ${userId} role to ${newRole}.`); // Reverted to console.log
    return NextResponse.json({ message: 'User role updated successfully' });
  } catch (err) { // Kept catch block
    console.error('Unexpected error:', err); // Reverted to console.error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
