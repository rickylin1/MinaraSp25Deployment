import { supabase } from '@/lib/supabase';
import { RRule } from 'rrule';
import type { Event } from '@/lib/types/database';
import type { ViewType } from '@/lib/types/calendar';

// Helper function to get date range for view
export function getDateRangeForView(view: ViewType, date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (view) {
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - dayOfWeek + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
}

function expandRecurringEvent(event: Event, start: Date, end: Date): Event[] {
  if (!event.recurrence_rule) return [event];

  const rule = RRule.fromString(event.recurrence_rule);
  const instances = rule.between(start, end);

  return instances.map(date => ({
    ...event,
    id: `${event.id}_${date.toISOString()}`,
    start_time: date.toISOString(),
    end_time: new Date(
      date.getTime() + (new Date(event.end_time).getTime() - new Date(event.start_time).getTime())
    ).toISOString()
  }));
}

// Internal function to fetch events with date range
async function fetchEventsForDateRange(
  start: Date,
  end: Date,
  calendarIds?: string[]
): Promise<Event[]> {
  console.log('Fetching events with params:', {
    start: start.toISOString(),
    end: end.toISOString(),
    calendarIds
  });

  let query = supabase
    .from('events')
    .select('*, calendar:calendars(*)');

  // Search setSelectedCalendarIds. In calendar view we try to initially fetch all calendars and set this global var.
  //if (calendarIds?.length) {
    //query = query.in('calendar_id', calendarIds);
  //}

  const { data, error } = await query.or(
    `and(start_time.gte.${start.toISOString()},start_time.lt.${end.toISOString()}),` +
    `and(end_time.gt.${start.toISOString()},end_time.lt.${end.toISOString()}),` +
    `and(start_time.lt.${start.toISOString()},end_time.gt.${end.toISOString()}),` +
    `and(recurrence_rule.neq.null,start_time.lt.${end.toISOString()})`
  );

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  console.log('Raw events from database:', data);
  
  if (!data) return [];

  const expandedEvents = data.flatMap(event => expandRecurringEvent(event, start, end));
  console.log('Events after expansion:', expandedEvents);

  return expandedEvents;
}

// Main getEvents function with overloads
export async function getEvents(start: Date, end: Date): Promise<Event[]>;
export async function getEvents(view: ViewType, selectedDate: Date, calendarIds: string[]): Promise<Event[]>;
export async function getEvents(
  viewOrStart: ViewType | Date,
  selectedDateOrEnd: Date,
  calendarIds?: string[]
): Promise<Event[]> {
  console.log('getEvents called with:', { viewOrStart, selectedDateOrEnd, calendarIds });

  // Case 1: Direct date range query
  if (viewOrStart instanceof Date) {
    console.log('Using direct date range query');
    return fetchEventsForDateRange(viewOrStart, selectedDateOrEnd);
  }
  
  // Case 2: View-based query
  if (calendarIds?.length === 0) {
    console.log('No calendar IDs provided, returning empty array');
    return [];
  }

  const { start, end } = getDateRangeForView(viewOrStart, selectedDateOrEnd);
  console.log('Calculated date range:', { start, end });
  
  return fetchEventsForDateRange(start, end, calendarIds);
}

export async function createEvent(event: Partial<Event>, tagIds?: string[]) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  console.log('Creating event with data:', event);

  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .insert([{ ...event, user_id: user.id }])
    .select()
    .single();

  if (eventError) {
    console.error('Error creating event:', eventError);
    throw eventError;
  }

  console.log('Created event:', eventData);

  if (tagIds?.length) {
    const eventTags = tagIds.map(tagId => ({
      event_id: eventData.id,
      tag_id: tagId,
    }));

    const { error: tagError } = await supabase
      .from('event_tags')
      .insert(eventTags);

    if (tagError) throw tagError;
  }

  return eventData as Event;
}

export async function updateEvent(id: string, event: Partial<Event>, tagIds?: string[]) {
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (eventError) throw eventError;

  if (tagIds) {
    // Remove existing tags
    const { error: deleteError } = await supabase
      .from('event_tags')
      .delete()
      .eq('event_id', id);

    if (deleteError) throw deleteError;

    // Add new tags
    if (tagIds.length) {
      const eventTags = tagIds.map(tagId => ({
        event_id: id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('event_tags')
        .insert(eventTags);

      if (tagError) throw tagError;
    }
  }

  return eventData as Event;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}