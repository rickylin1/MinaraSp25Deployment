import { supabase } from '@/lib/supabase';
import type { Calendar } from '@/lib/types/database';
import type { GoogleCalendar } from '@/lib/types/calendar';
import { isOrgAdmin } from './orgs';

// Function to create a new calendar
export async function createCalendar(calendar: Partial<Calendar>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Authentication error:', userError?.message);
    throw new Error('Not authenticated');
  }

  // Generate UUID with fallback
  const calendarUUID = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  
  // Define current timestamp
  const now = new Date().toISOString();

  const calendarData = {
    id: calendarUUID,
    name: calendar.name || 'Untitled Calendar',
    color: calendar.color || '#000000',
    user_id: user.id,
    created_at: now
  };

  console.log('Creating calendar with data:', calendarData);

  const { data, error } = await supabase
    .from('calendars')
    .upsert(calendarData)
    .select()
    .single();

  if (error) {
    console.error('Error creating calendar:', error.message, error.details);
    throw error;
  }

  console.log('Calendar created successfully:', data);
  return data;
}

// Function to get all calendars for the authenticated user
export async function getCalendars() {
  console.log('Getting user calendars...');
  console.log('testing this branch');

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No authenticated user or error fetching user:', userError);
    return [];
  }

  console.log('Fetching calendars for user:', user.id);

  const { data: userCalendars, error: schemaError } = await supabase
    .from('calendars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (schemaError) {
    console.error('Error fetching user calendars:', schemaError);
    throw schemaError;
  }

  console.log('User calendars:', userCalendars);

  return userCalendars || [];
}

export async function updateCalendar(id: string, calendar: Partial<Calendar>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Not authenticated');

  console.log('Updating calendar ID:', id);
  console.log('Update payload:', calendar);

  const allowedFields: Partial<Calendar> = {
    name: calendar.name,
    color: calendar.color
  };

  const { data, error } = await supabase
    .from('calendars')
    .update(allowedFields)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCalendar(id: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('calendars')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function fetchGoogleCalendars(): Promise<GoogleCalendar[]> {
  const { data, error } = await supabase.auth.getSession();

  if (error) { throw error; }
  if (!data.session?.access_token) throw new Error('No access token');

  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: {
      Authorization: `Bearer ${data.session.provider_token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch calendars');

  const Calendardata = await response.json();
  const calendars: GoogleCalendar[] = Calendardata.items.map((cal: any) => ({
    id: cal.id,
    summary: cal.summary,
    backgroundColor: cal.backgroundColor,
    selected: true,
    eventCount: 0,
  }));

  await Promise.all(calendars.map(async (calendar: GoogleCalendar) => {
    try {
      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?timeMin=${new Date().toISOString()}&timeMax=${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${data.session.provider_token}`,
          },
        }
      );

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        calendar.eventCount = eventsData.items?.length || 0;
      }
    } catch (error) {
      console.error(`Error fetching events for calendar ${calendar.summary}:`, error);
      calendar.eventCount = 0;
    }
  }));

  return calendars;
}

export async function importGoogleCalendars(selectedCalendars: GoogleCalendar[], onProgress?: (progress: number) => void) {
  const { data, error } = await supabase.auth.getSession();

  if (!data.session?.access_token) throw new Error('No access token');
  if (error) throw error;

  const totalCalendars = selectedCalendars.length;
  let completedCalendars = 0;

  for (const calendar of selectedCalendars) {
    const calendarUUID = crypto.randomUUID();

    const exists = await isCalendarInDatabase(calendar.id);
    if (exists) {
      console.error("Calendar already exists");
      continue;
    } else {
      const { data: calendarData, error: schemaError } = await supabase
        .from('calendars')
        .upsert({
          id: calendarUUID,
          name: calendar.summary,
          color: calendar.backgroundColor,
          user_id: data.session?.user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (schemaError) {
        console.error('Error saving calendar:', schemaError);
        continue;
      }

      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?` + 
        `timeMin=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&` + 
        `singleEvents=true&` + 
        `maxResults=2500`,
        {
          headers: {
            Authorization: `Bearer ${data.session?.provider_token}`,
          },
        }
      );

      if (!eventsResponse.ok) {
        console.error('Error fetching events:', await eventsResponse.text());
        continue;
      }

      const eventsData = await eventsResponse.json();

      await supabase
        .from('events')
        .delete()
        .eq('calendar_id', calendarData.id);

      const events = eventsData.items
        .filter((event: any) => {
          if (event.status === 'cancelled') return false;
          const eventStart = new Date(event.start?.dateTime || event.start?.date);
          return eventStart >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        })
        .map((event: any) => ({
          id: crypto.randomUUID(),
          calendar_id: calendarData.id,
          user_id: data.session?.user.id,
          title: event.summary || 'Untitled Event',
          description: event.description || null,
          location: event.location || null,
          start_time: event.start?.dateTime || new Date(event.start?.date).toISOString(),
          end_time: event.end?.dateTime || new Date(event.end?.date).toISOString(),
          all_day: !event.start?.dateTime,
          recurrence_rule: event.recurringEventId ? null : (event.recurrence?.[0]?.replace('RRULE:', '') || null),
          color: "red",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          timezone: 'UTC',
        }));

      if (events.length > 0) {
        const { error: eventError } = await supabase.from('events').insert(events);
        if (eventError) {
          console.error('Error inserting events:', eventError);
        }
      }

      completedCalendars++;
      onProgress?.((completedCalendars / totalCalendars) * 100);
    }
  }

  return await getCalendars();
}

export async function checkGoogleCalendarSync(): Promise<boolean> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return false;
  }
  return true;
}

export async function isCalendarInDatabase(googleCalendarId: string): Promise<boolean> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Not authenticated:', userError);
    return false;
  }
  const { data, error } = await supabase
    .from('calendars')
    .select('id')
    .eq('name', googleCalendarId) // Changed to check name instead of google_calendar_id
    .maybeSingle();

  if (error) {
    console.error('Error checking calendar:', error);
    return false;
  }

  return !!data;
}