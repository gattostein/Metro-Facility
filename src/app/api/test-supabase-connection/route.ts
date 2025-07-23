import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (e) {
            console.error('Failed to set cookie in API Route:', e);
          }
        },
      },
    }
  );

  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unexpected error' });
  }
}
