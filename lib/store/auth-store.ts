import { atom } from 'jotai';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const userAtom = atom<User | null>(null);
export const isLoadingAtom = atom(true);

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}