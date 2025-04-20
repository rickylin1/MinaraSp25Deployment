import { supabase } from '@/lib/supabase';
import type { Tag } from '@/lib/types/database';

export async function getTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Tag[];
}

export async function createTag(tag: Partial<Tag>) {
  const { data, error } = await supabase
    .from('tags')
    .insert([tag])
    .select()
    .single();

  if (error) throw error;
  return data as Tag;
}

export async function deleteTag(id: string) {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
}