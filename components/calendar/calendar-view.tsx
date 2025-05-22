'use client';

import { useAtom } from 'jotai';
import {
  viewAtom,
  userAtom,
  isLoadingAtom,
  calendarsQueryAtom,
  eventsQueryAtom,
  selectedCalendarIdsAtom,
} from '@/lib/store/atoms';
import { YearView } from './views/year-view';
import { WeekView } from './views/week-view';
import { MonthView } from './views/month-view';
import { AgendaView } from './views/agenda-view';
import { DayView } from './views/day-view';
import { CalendarHeader } from './calendar-header';
import { Sidebar } from '../layout/sidebar';
import { TimezoneModal } from './timezone-modal';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import { EventForm } from '../calendar/event-form';
import type { Event } from '@/lib/types/database';


export function CalendarView() {
  const [view] = useAtom(viewAtom);
  const [user] = useAtom(userAtom);
  const [isAuthLoading] = useAtom(isLoadingAtom);
  const [calendarsQuery] = useAtom(calendarsQueryAtom);
  const [eventsQuery] = useAtom(eventsQueryAtom);
  const [selectedCalendarIds, setSelectedCalendarIds] = useAtom(selectedCalendarIdsAtom);

  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [defaultStartTime, setDefaultStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'calendars' | 'events'>('calendars');

  const openCreateEvent = (date: Date) => {
    setEventToEdit(null);
    setDefaultStartTime(date);
    setIsEventFormOpen(true);
    setActiveTab('events'); // ensure event form shows
  };

  const openEditEvent = (event: Event) => {
    setEventToEdit(event);
    setDefaultStartTime(null);
    setIsEventFormOpen(true);
    setActiveTab('events');
  };

  const closeEventForm = () => {
    setIsEventFormOpen(false);
    setEventToEdit(null);
    setDefaultStartTime(null);
  };

  // Initialize calendar selection
  useEffect(() => {
    if (calendarsQuery.data && selectedCalendarIds.length === 0) {
      setSelectedCalendarIds(calendarsQuery.data.map(cal => cal.id));
    }
  }, [calendarsQuery.data]);

  const isLoading =
    isAuthLoading ||
    calendarsQuery.isLoading ||
    (eventsQuery.status === 'pending' && selectedCalendarIds.length > 0);

  return (
    <div className='h-screen flex flex-col'>
      <CalendarHeader />
      <div className='flex-1 flex overflow-hidden p-4 gap-4 bg-background'>
        <Sidebar
          isLoggedIn={!!user}
          isEventFormOpen={isEventFormOpen}
          eventToEdit={eventToEdit}
          defaultStartTime={defaultStartTime}
          onCloseEventForm={() => {
            setIsEventFormOpen(false);
            setEventToEdit(null);
            setDefaultStartTime(null);
          }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className='flex-1 bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='h-full overflow-auto'>
            {isLoading ? (
              <div className='flex items-center justify-center h-full'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <p className='text-sm text-muted-foreground ml-2'>
                  Loading your calendar...
                </p>
              </div>
            ) : (
              <>
                {view === 'week' && (
                  <WeekView
                  onSlotClick={(date) => {
                    setActiveTab('events');
                    setEventToEdit(null);
                    setDefaultStartTime(date);
                    setIsEventFormOpen(true);
                  }}
                  onEventClick={(event) => {
                    setActiveTab('events');
                    setEventToEdit(event);
                    setDefaultStartTime(null);
                    setIsEventFormOpen(true);
                  }}
                />
                )}
                {view === 'month' && <MonthView />}
                {view === 'year' && <YearView />}
                {view === 'agenda' && <AgendaView />}
                {view === 'day' && <DayView />}
              </>
            )}
          </div>
        </main>
      </div>
      {user && <TimezoneModal />}
    </div>
  );
}