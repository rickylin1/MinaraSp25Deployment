"use client";

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { useAtom } from 'jotai';
import { calendarsAtom, selectedCalendarIdsAtom } from '@/lib/store/atoms';
import type { Calendar as CalendarType } from '@/lib/types/database';

const colorMap = {
  blue: 'bg-blue-400',
  yellow: 'bg-yellow-400',
  purple: 'bg-purple-400',
  green: 'bg-green-400',
  red: 'bg-red-400'
} as const;

interface CalendarItemProps {
  calendar: CalendarType;
  isChecked: boolean;
  onToggle: (calendarId: string) => void;
}

function CalendarItem({ calendar, isChecked, onToggle }: CalendarItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox 
        id={calendar.id} 
        checked={isChecked}
        onCheckedChange={() => onToggle(calendar.id)}
      />
      <div className={`w-3 h-3 rounded-full ${colorMap[calendar.color as keyof typeof colorMap]}`} />
      <label htmlFor={calendar.id} className="text-sm">
        {calendar.name}
      </label>
    </div>
  );
}

export function CalendarList() {
  const [calendars] = useAtom(calendarsAtom);
  const [selectedCalendarIds, setSelectedCalendarIds] = useAtom(selectedCalendarIdsAtom);

  const handleToggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds(prev => {
      if (prev.includes(calendarId)) {
        // Don't allow deselecting if it's the last selected calendar
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== calendarId);
      }
      return [...prev, calendarId];
    });
  };

  const primaryCalendars = calendars.filter(cal => cal.is_primary);
  const otherCalendars = calendars.filter(cal => !cal.is_primary);

  return (
    <div className="space-y-6">
      {primaryCalendars.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">My Calendar</h3>
          {primaryCalendars.map(calendar => (
            <CalendarItem
              key={calendar.id}
              calendar={calendar}
              isChecked={selectedCalendarIds.includes(calendar.id)}
              onToggle={handleToggleCalendar}
            />
          ))}
        </div>
      )}
      
      {otherCalendars.length > 0 && (
        <div className="space-y-2">
          {/* <h3 className="text-sm font-medium">Other Calendars</h3> */}
          {otherCalendars.map(calendar => (
            <CalendarItem
              key={calendar.id}
              calendar={calendar}
              isChecked={selectedCalendarIds.includes(calendar.id)}
              onToggle={handleToggleCalendar}
            />
          ))}
        </div>
      )}
    </div>
  );
}