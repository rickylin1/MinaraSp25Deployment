"use client";

import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  parseISO,
  max,
  min,
  differenceInDays,
  startOfDay,
  endOfDay
} from "date-fns";
import { cn } from "@/lib/utils";
import { useAtom } from 'jotai';
import {
  selectedDateAtom,
  selectedCalendarIdsAtom,
  userTimezoneAtom,
  visibleEventsAtom,
  isLoadingAtom,
  calendarsAtom,
  groupedEventsAtom
} from '@/lib/store/atoms';
import { EventForm } from '../event-form';
import { useState } from 'react';
import type { Event } from '@/lib/types/database';
import { TimeGrid } from '../time-grid';
import { formatInTimeZone } from 'date-fns-tz';

function DayHeader({ day }: { day: Date }) {
  const isToday = isSameDay(day, new Date());

  return (
    <div className="border-b p-2 text-center sticky top-0 bg-white">
      <div className="text-sm font-medium">
        {format(day, 'EEE')}
      </div>
      <div className={cn(
        "text-2xl w-10 h-10 rounded-full flex items-center justify-center mx-auto",
        isToday && "bg-primary text-white"
      )}>
        {format(day, 'd')}
      </div>
    </div>
  );
}

function AllDayEvents({
  days,
  events,
  onEventClick,
}: {
  days: Date[];
  events: Event[];
  onEventClick: (event: Event) => void;
}) {
  const allDayEvents = useMemo(() => {
    return events.filter(event => {
      const eventStart = parseISO(event.start_time);
      const eventEnd = parseISO(event.end_time);
      return event.all_day ||
        (eventEnd.getTime() - eventStart.getTime()) >= 24 * 60 * 60 * 1000;
    });
  }, [events]);
  

  const eventRows = useMemo(() => {
    const rows: Event[][] = [];
    const eventPositions = new Map<string, number>();

    allDayEvents.sort((a, b) =>
      parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
    );

    allDayEvents.forEach(event => {
      const eventStart = parseISO(event.start_time);
      const eventEnd = parseISO(event.end_time);

      let rowIndex = 0;
      let foundRow = false;

      while (!foundRow && rowIndex < rows.length) {
        const row = rows[rowIndex];
        const lastEventInRow = row[row.length - 1];
        const lastEventEnd = parseISO(lastEventInRow.end_time);

        if (eventStart.getTime() >= lastEventEnd.getTime()) {
          foundRow = true;
          row.push(event);
          eventPositions.set(event.id, rowIndex);
        }

        rowIndex++;
      }

      if (!foundRow) {
        rows.push([event]);
        eventPositions.set(event.id, rows.length - 1);
      }
    });

    return { rows, positions: eventPositions };
  }, [allDayEvents]);

  const getEventWidth = useCallback((event: Event) => {
    const eventStart = parseISO(event.start_time);
    const eventEnd = parseISO(event.end_time);
    const weekStart = startOfDay(days[0]);
    const weekEnd = endOfDay(days[days.length - 1]);

    const start = max([eventStart, weekStart]);
    const end = min([eventEnd, weekEnd]);

    const daySpan = differenceInDays(end, start) + 1;
    return `${Math.min(daySpan, 7) / 7 * 100}%`;
  }, [days]);

  const getEventOffset = useCallback((event: Event) => {
    const eventStart = parseISO(event.start_time);
    const weekStart = startOfDay(days[0]);
    const dayOffset = differenceInDays(eventStart, weekStart);
    return `${Math.min(Math.max(0, dayOffset), 6) / 7 * 100}%`;
  }, [days]);

  return (
    <div className="border-b bg-white">
      <div className="relative" style={{ minHeight: eventRows.rows.length * 24 + 'px' }}>
        {eventRows.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="absolute w-full" style={{ top: rowIndex * 24 + 'px' }}>
            {row.map((event) => (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className="absolute h-6 px-2 py-1 text-xs text-left bg-[#FEF8EE] border border-orange-300 rounded-md text-gray-800 truncate shadow-sm"
                style={{
                  left: getEventOffset(event),
                  width: getEventWidth(event),
                }}
                title={`${event.title}${event.location ? ` - ${event.location}` : ''}`}
              >
                {event.title}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function calculateHeightPercentage(event: Event): number {
  const eventStart = parseISO(event.start_time);
  const eventEnd = parseISO(event.end_time);
  const eventStartHour = eventStart.getHours() + eventStart.getMinutes() / 60;
  const eventEndHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
  const duration = eventEndHour - eventStartHour;
  return Math.max(0, duration * 100);
}

function TimeSlot({ day, hour, events, onEventClick }: {
  day: Date;
  hour: number;
  events: Event[];
  onEventClick: (event: Event) => void;
}) {
  const isToday = isSameDay(day, new Date());

  const currentHour = new Date().getHours();

  const eventsInSlot = events.filter(event => {
    const eventStart = parseISO(event.start_time);
    const eventEnd = parseISO(event.end_time);
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(day);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return eventStart.getTime() < slotEnd.getTime() && eventEnd.getTime() > slotStart.getTime();
  });

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex h-12 border-b border-r relative group hover:bg-accent/50 transition-colors">
      <div className="flex-1 border-l">
        {isToday && hour === currentHour && <CurrentTimeIndicator />}
        {eventsInSlot.map((event) => {
          const eventStart = parseISO(event.start_time);
          const eventEnd = parseISO(event.end_time);
          const eventStartHour = eventStart.getHours() + eventStart.getMinutes() / 60;
          const eventEndHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
          const height = calculateHeightPercentage(event);
          const topOffset = (eventStartHour - hour) * 100;

          return (
            <div>
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className="absolute left-0 right-0 mx-1 p-1 text-xs text-left flex items-start justify-start bg-[#FEF8EE] border border-orange-300 rounded-md text-gray-800 truncate shadow-sm"
                style={{
                  top: `${topOffset}%`,
                  height: `${height}%`,
                  minHeight: '18px',
                  zIndex: 10
                }}
              >
              {event.title}
              </button>

              <div className="absolute left-10 bottom-full mb-2 z-50 w-auto max-w-lg min-w-[16rem] p-4 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none space-y-2 whitespace-normal break-words">
                <div className="text-base font-semibold">{event.title}</div>
                <div><span className="font-medium text-gray-600"><strong>Time:</strong></span> {formatTime(event.start_time)} – {formatTime(event.end_time)}</div>
                <div><span className="font-medium text-gray-600"><strong>Location:</strong></span> {event.location ? (event.location) : 'No location available'}</div>
                <div><span className="font-medium text-gray-600"><strong>Description:</strong></span> {event.description ? (event.description.length > 100 ? `${event.description.slice(0, 100)}...` : event.description) : 'No description available'} </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="w-4" />
    </div>
  );
}

TimeSlot.displayName = 'TimeSlot';

const CurrentTimeIndicator = () => {
  const [userTimezone] = useAtom(userTimezoneAtom);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const updateNow = () => setNow(new Date());
    updateNow();
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentTime = formatInTimeZone(now, userTimezone, 'HH:mm');
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);

  const totalMinutesInDay = 24 * 60;
  const currentMinutesInDay = currentHour * 60 + currentMinute;
  const topPercentage = (currentMinutesInDay / totalMinutesInDay) * 100;

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-20"
      style={{ top: `${topPercentage}%` }}
    >
      <div className="relative w-full">
        <div className="absolute left-0 -top-[4px] w-2 h-2 rounded-full bg-red-500" />
        <div className="w-full h-[1px] bg-red-500" />
      </div>
    </div>
  );
};

CurrentTimeIndicator.displayName = 'CurrentTimeIndicator';

export function WeekView() {
  const [selectedDate] = useAtom(selectedDateAtom);
  const [groupedEvents] = useAtom(groupedEventsAtom);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userTimezone] = useAtom(userTimezoneAtom);
  const [timeZoneAbbr, setTimeZoneAbbr] = useState('UTC');
  const [isLoading] = useAtom(isLoadingAtom);
  const [visibleEvents] = useAtom(visibleEventsAtom);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('WeekView isLoading state:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: userTimezone,
    });
    const abbr =
      formatter
        .formatToParts(new Date())
        .find((part) => part.type === 'timeZoneName')?.value || userTimezone;
    setTimeZoneAbbr(abbr);
  }, [userTimezone]);

  useEffect(() => {
    if (scrollRef.current) {
      const pixelsPerHour = 48;
      scrollRef.current.scrollTop = 9 * pixelsPerHour;
    }
  }, []);

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center sticky top-0 bg-white z-30">
        <div className="w-16 flex items-center justify-end pr-2">
          <span className="text-xs text-muted-foreground">
            {timeZoneAbbr}
          </span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-7 border-b">
            {days.map((day) => (
              <DayHeader key={day.toISOString()} day={day} />
            ))}
          </div>
          <AllDayEvents days={days} events={visibleEvents} onEventClick={handleEventClick} />
        </div>
      </div>
      <div ref={scrollRef} className="flex flex-1 overflow-y-auto">
        <TimeGrid hours={hours} />

        <div className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-cols-7">
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {days.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const eventsInSlot = (groupedEvents?.[dayKey]?.[hour] ?? []).filter(event => !event.all_day);

                  return (
                    <TimeSlot
                      key={`${day.toISOString()}-${hour}`}
                      day={day}
                      hour={hour}
                      events={eventsInSlot}
                      onEventClick={handleEventClick}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventForm
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}