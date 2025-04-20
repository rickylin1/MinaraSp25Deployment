"use client";

import { format } from 'date-fns';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { selectedDateAtom, eventsAtom } from '@/lib/store/atoms';
import { EventForm } from '../event-form';
import type { Event } from '@/lib/types/database';
import { formatDateTime } from '@/lib/utils/date';

export function AgendaView() {
  const [selectedDate] = useAtom(selectedDateAtom);
  const [events] = useAtom(eventsAtom);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="flex flex-col">
      <div className="text-center py-4">
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
      </div>
      <div className="flex-1 overflow-auto">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events scheduled
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {sortedEvents.map((event) => (
              <button
                key={event.id}
                className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    {event.location && (
                      <p className="text-sm text-muted-foreground">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(event.start_time)}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
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