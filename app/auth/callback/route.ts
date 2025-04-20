import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://www.minara.app";


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  try {
    const supabase = createClient()
    console.log("Authentication loading")
    console.log(code)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code as string)
    
    if (error) throw error
    if (!data.user) throw new Error('No user data')
    // Create profile if it doesn't exist
    // const { error: profileError } = await supabase
    //   .from('profiles')
    //   .upsert({
    //     id: data.user.id,
    //     email: data.user.email,
    //     full_name: data.user.user_metadata.full_name,
    //     avatar_url: data.user.user_metadata.avatar_url,
    //     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString()
    //   }, {
    //     onConflict: 'id'
    //   })

    // if (profileError) {
    //   console.error('Error creating profile:', profileError)
    // }

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

    console.log('Auth callback - Redirecting to:', `${BASE_URL}/calendar?sync=success`);
    return NextResponse.redirect(`${BASE_URL}/calendar?sync=success`)

  } catch (error) {
    console.error('Auth callback error:', error)
    console.log('Auth callback - Error redirecting to:', `${BASE_URL}/calendar?error=auth_failed`);
    return NextResponse.redirect(`${BASE_URL}/calendar?error=auth_failed`)
  }
}