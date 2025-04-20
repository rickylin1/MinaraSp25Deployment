"use client";

import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import type { Getter } from 'jotai';
import { getEvents } from '@/lib/api/events';
import { getCalendars } from '@/lib/api/calendars';
import type { Event, Calendar } from '@/lib/types/database';
import type { ViewType } from '@/lib/types/calendar';
import type { User } from '@supabase/supabase-js';
import { parseISO, format, addHours } from 'date-fns';


// Base atoms for UI state
export const selectedDateAtom = atom<Date>(new Date());
export const viewAtom = atom<ViewType>('week');
export const userTimezoneAtom = atom<string>(
  typeof window !== 'undefined' 
    ? Intl.DateTimeFormat().resolvedOptions().timeZone 
    : 'UTC'
);
export const userAtom = atom<User | null>(null);
export const isLoadingAtom = atom<boolean>(true);

// Calendar selection atoms
export const selectedCalendarIdsAtom = atom<string[]>([]);

// Query-based atoms for data fetching
export const calendarsQueryAtom = atomWithQuery((get: Getter) => ({
  queryKey: ['calendars', get(userAtom)?.id],
  queryFn: async () => {
    const calendars = await getCalendars();
    return calendars as Calendar[];
  },
  enabled: !!get(userAtom)?.id,
}));

export const calendarsAtom = atom(
  (get: Getter) => get(calendarsQueryAtom).data ?? []
);

// Events query atom with date range and calendar filtering
export const eventsQueryAtom = atomWithQuery((get: Getter) => {
  const view = get(viewAtom);
  const selectedDate = get(selectedDateAtom);
  const selectedCalendarIds = get(selectedCalendarIdsAtom);
  const user = get(userAtom);

  // console.log('eventsQueryAtom dependencies:', {
  //   view,
  //   selectedDate: selectedDate.toISOString(),
  //   selectedCalendarIds,
  //   userId: user?.id
  // });

  const isEnabled = !!user?.id && selectedCalendarIds.length > 0;
  // console.log('eventsQueryAtom enabled:', isEnabled);

  return {
    queryKey: ['events', view, selectedDate.toISOString(), selectedCalendarIds, user?.id],
    queryFn: async () => {
      console.log('eventsQueryAtom queryFn executing with:', {
        view,
        selectedDate: selectedDate.toISOString(),
        selectedCalendarIds
      });

      if (!selectedCalendarIds.length) {
        console.log('No selected calendars, returning empty array');
        return [];
      }

      if (!user?.id) {
        console.log('No user ID, returning empty array');
        return [];
      }

      const events = await getEvents(view, selectedDate, selectedCalendarIds);
      console.log('eventsQueryAtom received events:', events);
      return events;
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
    suspense: false,
  };
});

// Derived atoms for filtered and grouped events
export const eventsAtom = atom(
  (get: Getter) => get(eventsQueryAtom).data ?? []
);

export const visibleEventsAtom = atom(
  (get: Getter) => {
    const events = get(eventsAtom);
    const selectedCalendarIds = get(selectedCalendarIdsAtom);
    return events.filter((event: Event) => selectedCalendarIds.includes(event.calendar_id));
  }
);

/*export const groupedEventsAtom = atom(
  (get: Getter) => {
    const events = get(visibleEventsAtom);
    const grouped: { [date: string]: { [hour: number]: Event[] } } = {};
    
    events.forEach((event: Event) => {
      const date = event.start_time.split('T')[0];
      const hour = new Date(event.start_time).getHours();
      
      if (!grouped[date]) {
        grouped[date] = {};
      }
      if (!grouped[date][hour]) {
        grouped[date][hour] = [];
      }
      
      grouped[date][hour].push(event);
    });
    
    return grouped;
  }
);*/


export const groupedEventsAtom = atom((get) => {
  const events = get(visibleEventsAtom);
  const grouped: { [date: string]: { [hour: number]: Event[] } } = {};

  events.forEach((event: Event) => {
    if (event.all_day) return; // skip all-day events, handled elsewhere

    const start = parseISO(event.start_time);
    const end = parseISO(event.end_time);

    let current = new Date(start);

    while (current <= end) {
      const dateKey = format(current, 'yyyy-MM-dd');
      const hour = current.getHours();

      if (!grouped[dateKey]) grouped[dateKey] = {};
      if (!grouped[dateKey][hour]) grouped[dateKey][hour] = [];

      grouped[dateKey][hour].push(event);

      current = addHours(current, 1);
    }
  });

  return grouped;
});
