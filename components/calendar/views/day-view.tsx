"use client";

import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { selectedDateAtom, visibleEventsAtom } from '@/lib/store/atoms';
import { EventForm } from '../event-form';
import { useState } from 'react';
import type { Event } from '@/lib/types/database'; 

export function DayView() {
  const [selectedDate] = useAtom(selectedDateAtom);
  const [visibleEvents] = useAtom(visibleEventsAtom);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return visibleEvents.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getHours() === hour;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };
  
  const currentHour = new Date().getHours();
  const currentMinutes = new Date().getMinutes();

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  
  return (
    <div className="flex flex-col">
      <div className="text-center py-4">
        <h2 className="text-xl font-semibold">{format(selectedDate, 'PPPP')}</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {hours.map((hour) => (
          <div key={hour} className="flex border-t">
            <div className="w-20 py-2 px-4 text-right text-sm text-gray-500">
              {format(new Date().setHours(hour), 'ha')}
            </div>
            <div className="flex-1 min-h-[60px] relative">
              {getEventsForHour(hour).map((event) => (
                // <button
                //   key={event.id}
                //   className="absolute left-0 right-0 m-1 p-2 text-sm bg-[#FEF8EE] border border-orange-300 rounded-md text-gray-800 rounded"
                //   onClick={() => setSelectedEvent(event)}
                // >
                //   {event.title}
                // </button>
                <div className="relative group">
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="absolute left-0 right-0 m-1 p-2 text-sm bg-[#FEF8EE] border border-orange-300 rounded-md text-gray-800 rounded"
                  >
                  {event.title}
                  </button>

                  <div className="absolute right-10 bottom-full mb-2 z-50 w-auto max-w-lg min-w-[16rem] p-4 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none space-y-2 whitespace-normal break-words">
                    <div className="text-base font-semibold">{event.title}</div>
                    <div><span className="font-medium text-gray-600"><strong>Time:</strong></span> {formatTime(event.start_time)} – {formatTime(event.end_time)}</div>
                    <div><span className="font-medium text-gray-600"><strong>Location:</strong></span> {event.location ? (event.location) : 'No location available'}</div>
                    <div><span className="font-medium text-gray-600"><strong>Description:</strong></span> {event.description ? (event.description.length > 100 ? `${event.description.slice(0, 100)}...` : event.description) : 'No description available'} </div>
                  </div>
                </div>
              ))}

              {isToday(selectedDate) && hour === currentHour && (
                <div
                  className="absolute left-0 right-0 pointer-events-none z-20"
                  style={{ top: `${(currentMinutes / 60) * 100}%` }}
                >
                  <div className="absolute left-0 -top-[4px] w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-full h-[1px] bg-red-500" />
              </div>
              )}
            </div>
          </div>
        ))}
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