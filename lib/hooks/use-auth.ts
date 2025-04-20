"use client";

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom, isLoadingAtom } from '@/lib/store/atoms';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Show toast when user signs in
      if (event === 'SIGNED_IN' && session?.user) {
        toast({
          title: "Welcome!",
          description: `Signed in as ${session.user.user_metadata.full_name || session.user.email}`,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, setUser, setIsLoading, toast]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signIn = async () => {
    try {
      console.log("Test1") // not running
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=google_calendar&sync=success`,
          scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
          // scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly email profile openid',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account'
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Calendar sync error:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signOut
  };
} 