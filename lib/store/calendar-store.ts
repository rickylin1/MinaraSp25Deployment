import { supabase } from "../supabase";

const fetchCalendars = async () => {
    const { data: calendars, error } = await supabase
      .from('calendars')
      .select(`
        id,
        name,
        color,
        events (*)
      `)
      .order('created_at', { ascending: true });
  
    if (error) {
      console.error('Error fetching calendars:', error);
      return;
    }
  
    return calendars || [];
  };