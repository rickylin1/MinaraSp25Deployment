import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// const BASE_URL =
//   process.env.NODE_ENV === "development"
//     ? "http://localhost:3000"
//     : "https://www.minara.app";

const ALLOWED_ORIGINS = ["https://www.https://minara-sp25-deployment-rickylin1s-projects.vercel.app/.app", "http://localhost:3000"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const redirectOrigin = ALLOWED_ORIGINS.includes(origin)
  ? origin
  : "https://www.minara.app"; // default safe domain

  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code as string)
    
    if (error) throw error
    if (!data.user) throw new Error('No user data')
    // Create profile if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata.full_name,
        avatar_url: data.user.user_metadata.avatar_url,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
    }

    // Store the provider token in user_connections
    // const provider = searchParams.get('provider') || 'google';
    // console.log('Using provider:', provider);

    // if (provider === 'google' || provider === 'google_calendar') {
    //   const result = await supabase.from('user_connections').upsert(
    //     {
    //       user_id: data.user.id,
    //       provider: provider,
    //       access_token: data.session?.provider_token,
    //       refresh_token: data.session?.provider_refresh_token,
    //       created_at: new Date().toISOString(),
    //       updated_at: new Date().toISOString()
    //     },
    //     {
    //       onConflict: 'user_id,provider'
    //     }
    //   );
    //   console.log('Upsert result:', result);
    // }

    console.log('Auth callback - Redirecting to:', `${redirectOrigin}/calendar?sync=success`);
    return NextResponse.redirect(`${redirectOrigin}/calendar?sync=success`)

  } catch (error) {
    console.error('Auth callback error:', error)
    console.log('Auth callback - Error redirecting to:', `${redirectOrigin}/calendar?error=auth_failed`);
    return NextResponse.redirect(`${redirectOrigin}/calendar?error=auth_failed`)
  }
}