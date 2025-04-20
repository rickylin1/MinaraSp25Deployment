import { Calendar } from './database';

export type ViewType = 'day' | 'week' | 'month' | 'year' | 'agenda';

export type { Event, Calendar } from './database';

export interface CalendarStore {
  calendars: Calendar[];
  events: Event[];
  selectedDate: Date;
  view: ViewType;
  isLoading: boolean;
  error: Error | null;
  selectedCalendarIds: string[];
  fetchCalendars: () => Promise<void>;
  toggleCalendar: (calendarId: string) => void;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  backgroundColor: string;
  selected: boolean;
  eventCount?: number;
}