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

export function CalendarView() {
  const [view] = useAtom(viewAtom);
  const [user] = useAtom(userAtom);
  const [isAuthLoading] = useAtom(isLoadingAtom);
  const [calendarsQuery] = useAtom(calendarsQueryAtom);
  const [eventsQuery] = useAtom(eventsQueryAtom);
  const [selectedCalendarIds, setSelectedCalendarIds] = useAtom(
    selectedCalendarIdsAtom
  );

  // Initialize selected calendar IDs when calendars are loaded
  useEffect(() => {
    if (calendarsQuery.data && selectedCalendarIds.length === 0) {
      // console.log('Initializing calendar selection with:', calendarsQuery.data);

      // Select all calendars by default
      const allCalendarIds = calendarsQuery.data.map((cal) => cal.id);
      // console.log('Selecting all calendars:', allCalendarIds);
      setSelectedCalendarIds(allCalendarIds);
    }
  }, [calendarsQuery.data, selectedCalendarIds, setSelectedCalendarIds]);




  // Log state changes
  useEffect(() => {
    // console.log('Calendar state:', {
    //   isLoading: isAuthLoading || calendarsQuery.isLoading || eventsQuery.isLoading,
    //   calendars: calendarsQuery.data,
    //   selectedCalendarIds,
    //   eventsQueryStatus: eventsQuery.status,
    //   events: eventsQuery.data
    // });
  }, [isAuthLoading, calendarsQuery, eventsQuery, selectedCalendarIds]);

  const isLoading =
    isAuthLoading ||
    calendarsQuery.isLoading ||
    (eventsQuery.status === 'pending' && selectedCalendarIds.length > 0);

  return (
    <div className='h-screen flex flex-col'>
      <CalendarHeader />
      <div className='flex-1 flex overflow-hidden p-4 gap-4 bg-background'>
        <Sidebar isLoggedIn={!!user} />
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
                {view === 'week' && <WeekView />}
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
