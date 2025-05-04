"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { useAtom } from 'jotai';
import { selectedDateAtom, visibleEventsAtom } from '@/lib/store/atoms';
import { EventForm } from '../event-form';
import { useState } from 'react';
import type { Event } from '@/lib/types/database';
import { cn } from "@/lib/utils";

export function MonthView() {
  const [selectedDate] = useAtom(selectedDateAtom);
  const [visibleEvents] = useAtom(visibleEventsAtom);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return visibleEvents.filter(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      return (
        (eventStart >= dayStart && eventStart <= dayEnd) || // Event starts on this day
        (eventEnd >= dayStart && eventEnd <= dayEnd) || // Event ends on this day
        (eventStart <= dayStart && eventEnd >= dayEnd) // Event spans over this day
      );
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const calculateTooltipPosition = (day: Date) => {
    const dayIndex = day.getDate(); 
    const rowHeight = 100; 
    const gridHeight = 700; 
    const position = (dayIndex * rowHeight) / gridHeight; 
  
    if (position > 0.75) {
      return "bottom-full"; 
    } else {
      return "top-full";
    }
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="p-2 text-center font-medium">
          {day}
        </div>
      ))}
      {days.map((day, index) => (
        <div
          key={day.toISOString()}
          className="min-h-[100px] border p-2"
        >
          <div
            className={cn(
              "font-medium",
              "w-10 h-10 rounded-full flex items-center justify-center mx-auto",
              isToday(day) && "bg-primary text-white"
            )}
          >
          {format(day, 'd')}
          </div>
          <div className="space-y-1">
            {getEventsForDay(day).map((event) => (
              <div className="relative group">
                <button
                  key={event.id}
                  className="w-full text-left text-sm p-1 bg-[#FEF8EE] border border-orange-300 rounded-md text-gray-800 truncate"
                  onClick={() => setSelectedEvent(event)}
                >
                {event.title}
                </button>

                <div className={cn(
                  "absolute z-50 w-auto max-w-lg min-w-[16rem] p-4 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none space-y-2 whitespace-normal break-words",
                  calculateTooltipPosition(day)
                )}>
                  <div className="text-base font-semibold">{event.title}</div>
                  <div><span className="font-medium text-gray-600"><strong>Time:</strong></span> {formatTime(event.start_time)} – {formatTime(event.end_time)}</div>
                  <div><span className="font-medium text-gray-600"><strong>Location:</strong></span> {event.location ? (event.location) : 'No location available'}</div>
                  <div><span className="font-medium text-gray-600"><strong>Description:</strong></span> {event.description ? (event.description.length > 100 ? `${event.description.slice(0, 100)}...` : event.description) : 'No description available'} </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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