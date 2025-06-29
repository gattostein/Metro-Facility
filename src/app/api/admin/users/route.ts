// Import createServerClient from the new @supabase/ssr package
import { createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient type
import { cookies } from 'next/headers'; // Should be imported from here
import { NextResponse } from 'next/server';

// --- REMOVED WORKAROUND: Manually declare createRouteHandlerClient ---
// The function is not available at runtime, so we use createServerClient instead.
// declare module '@supabase/ssr' {
//   export function createRouteHandlerClient<
//     Database = any,
//     SchemaName extends string & keyof Database = 'public' extends keyof Database
//       ? 'public'
//       : string & keyof Database,
//   >(options: { cookies: () => ReturnType<typeof cookies> }): SupabaseClient<Database, SchemaName>;
// }
// --- END REMOVED WORKAROUND ---


// Define the expected structure of the combined user data
interface CombinedUserProfile {
    id: string; // auth.users ID
    email: string | undefined;
    full_name: string | undefined;
    role: string | undefined;
    address?: string;
    contact_number?: string;
    abn?: string;
    bsb?: string;
    account_number?: string;
}

// Define the expected structure of the profile data when selecting only 'role'
interface UserRoleProfile {
    role: string;
}


export async function GET() {
    // Get the cookie store - cookies() needs to be awaited in dynamic functions
    const cookieStore = await cookies(); // Await the cookies() function

    // --- DEBUG: Log cookies received by the API route with details ---
    const allCookies = cookieStore.getAll(); // Now cookieStore is the awaited object
    console.log('API Route Cookies Received:');
    allCookies.forEach((cookie: { name: string, value: string }) => {
        console.log(`  Name: ${cookie.name}, Value: ${cookie.value.substring(0, 20)}...`); // Log name and partial value
    });
    // --- END DEBUG ---

    // Client to get the user's session (uses Anon Key from env)
    // Use createServerClient and manually provide cookie methods
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll(); // Use the awaited cookieStore
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options) // Use the awaited cookieStore
                        );
                    } catch (e) {
                        // Log error if setting cookies fails (e.g., in a Server Component context)
                        console.error('Failed to set cookie in API Route:', e);
                    }
                },
                // Optional: Implement get and remove if needed by other auth-helpers functions
                // get(name) { return cookieStore.get(name)?.value; },
                // remove(name) { cookieStore.delete(name); },
            },
        }
    );


    // Create a separate client for admin operations (uses Service Role Key)
    // Ensure SUPABASE_SERVICE_ROLE_KEY is set in your server-side environment variables
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, // Use the public URL
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Use the Service Role Key
    );


    try {
        // 1. Get the current user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            console.error('API Route getSession failed:', sessionError?.message || 'No session found'); // Log the specific session error
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check if the current user is an admin by fetching their profile role
        // Explicitly type the data returned by the select query
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single<UserRoleProfile>(); // Add type annotation here

        if (profileError || !profile || profile.role !== 'admin') {
            // If profile not found, error, or not admin
            console.error('API Route Forbidden: User is not admin or profile error', profileError);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. If the user is an admin, fetch all users from auth.users using the admin client
        const { data: authUsersData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers(); // Use supabaseAdmin here

        if (authUsersError) {
            console.error('Error listing auth users:', authUsersError);
            // Return a more specific error if needed, but 500 is fine for internal error
            return NextResponse.json({ error: 'Error fetching user authentication data' }, { status: 500 });
        }

        const authUsers = authUsersData.users;
        const authUserIds = authUsers.map(user => user.id);

        // 4. Fetch corresponding profiles from user_profiles using the regular client
        // This is okay because the RLS on user_profiles should handle permissions
        const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name, role, address, contact_number, abn, bsb, account_number')
            .in('id', authUserIds); // Fetch profiles only for existing auth users

        if (profilesError) {
            console.error('Error fetching user profiles for admin:', profilesError);
            return NextResponse.json({ error: 'Error fetching user profile data' }, { status: 500 });
        }

        // Explicitly type profilesData before mapping
        const profilesMap = new Map((profilesData as CombinedUserProfile[] | null)?.map(profile => [profile.id, profile]) || []);


        // 5. Combine auth user data and profile data
        const combinedUsers: CombinedUserProfile[] = authUsers.map(authUser => {
            const profile = profilesMap.get(authUser.id);
            return {
                id: authUser.id,
                email: authUser.email,
                full_name: profile?.full_name,
                role: profile?.role,
                address: profile?.address,
                contact_number: profile?.contact_number,
                abn: profile?.abn,
                bsb: profile?.bsb,
                account_number: profile?.account_number,
            };
        });

        // 6. Return the combined data
        return NextResponse.json(combinedUsers);

    } catch (error) {
        console.error('Unexpected error in admin users API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
