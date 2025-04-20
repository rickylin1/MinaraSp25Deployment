import { supabase } from '@/lib/supabase';
import type { Task } from '@/lib/types/database';

export async function getTasks(calendarId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('due_date');

  if (error) throw error;
  return data as Task[];
}

export async function createTask(task: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, task: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}