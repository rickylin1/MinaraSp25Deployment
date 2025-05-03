import { supabase } from '@/lib/supabase';
import type { Calendar } from '@/lib/types/database';
import type { GoogleCalendar } from '@/lib/types/calendar';
import { isOrgAdmin } from './orgs';

// Function to get all calendars for the authenticated user
// Need to add a function to get calendars for a specific org
export async function getCalendars() {
  console.log('Getting user calendars...');
  console.log('testing this branch')

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No authenticated user or error fetching user:', userError);
    return [];
  }

  console.log('Fetching calendars for user:', user.id);

  // Fetch calendars that belong to the authenticated user
  const { data: userCalendars, error: calendarError } = await supabase
    .from('calendars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (calendarError) {
    console.error('Error fetching user calendars:', calendarError);
    throw calendarError;
  }

  console.log('User calendars:', userCalendars);

  return userCalendars || [];
}

export async function createCalendar(calendar: Calendar) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('calendars')
    .insert([{ ...calendar, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCalendar(id: string, calendar: Partial<Calendar>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Not authenticated');

  // Remove sensitive fields
  const allowedFields: Partial<Calendar> = { ...calendar };

  delete allowedFields.id;
  delete allowedFields.user_id;
  delete allowedFields.created_at;
  delete allowedFields.is_primary;
  delete allowedFields.google_calendar_id;

  // Explicitly set updated_at to current time
  allowedFields.updated_at = new Date().toISOString();

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
    .eq('user_id', user.id); // Ensure user owns the calendar

  if (error) throw error;
}

export async function fetchGoogleCalendars(): Promise<GoogleCalendar[]> {
  // const { data: connection } = await supabase
  //   .from('user_connections')
  //   .select('access_token')
  //   .eq('provider', 'google_calendar')
  //   .single();
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

  // Fetch event counts for each calendar
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
  // const { data: connection } = await supabase
  //   .from('user_connections')
  //   .select('access_token')
  //   .eq('provider', 'google')
  //   .single();



  const { data, error } = await supabase.auth.getSession();

  if (!data.session?.access_token) throw new Error('No access token');
  if (error) throw error;

  // Store the Google Calendar connection with onConflict handling
  // await supabase
  //   .from('user_connections')
  //   .upsert({
  //     user_id: session?.user.id,
  //     provider: 'google_calendar',
  //     access_token: connection.access_token,
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString()
  //   }, {
  //     onConflict: 'user_id,provider'
  //   });

  const totalCalendars = selectedCalendars.length;
  let completedCalendars = 0;

  for (const calendar of selectedCalendars) {
    // Generate a new UUID for each calendar
    const calendarUUID = crypto.randomUUID();

    const exists = await isCalendarInDatabase(calendar.id);
    if(exists) {
      console.error("Calendar already exists");
      continue;
    } else{
    // Create or update the calendar in our database
    const { data: calendarData, error: calendarError } = await supabase
      .from('calendars')
      .upsert({
        id: calendarUUID,
        name: calendar.summary,
        color: calendar.backgroundColor,
        user_id: data.session?.user.id,
        is_primary: false,
        google_calendar_id: calendar.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    

    // if (calendarError) {
    //   console.error('Error saving calendar:', calendarError);
    //   continue;
    // }

    
    // Fetch and save events for this calendar
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
    
    // Delete existing events for this calendar (if any)
    await supabase
      .from('events')
      .delete()
      .eq('calendar_id', calendarData.id);

    // Filter and transform events
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
        // google_event_id: event.id,
        // not in the Database yet 
        recurrence_rule: event.recurringEventId ? null : (event.recurrence?.[0]?.replace('RRULE:', '') || null),
        color: "red", // added
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        timezone: 'UTC', // You might want to pass this as a parameter
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
  const { data, error } = await supabase.auth.getSession()
  if (error)
  {
    console.error('Error fetching session:', error);
    return false;
  }
  // // Check for Google Calendar connection only
  // const { data: connection, error: connectionError } = await supabase
  //   .from('user_connections')
  //   .select('access_token')
  //   .eq('user_id', session.user.id)
  //   .eq('provider', 'google_calendar')
  //   .maybeSingle();
  
  // if (connectionError || !connection?.access_token) {
  //   return false;
  // }

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
    .eq('google_calendar_id', googleCalendarId)
    .maybeSingle();

  if (error) {
    console.error('Error checking Google Calendar ID:', error);
    return false;
  }


  return !!data


}