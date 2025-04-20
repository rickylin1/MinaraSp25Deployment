"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { GoogleCalendar } from '@/lib/types/calendar';

interface GoogleCalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  calendars: GoogleCalendar[];
  onImport: (selectedCalendars: GoogleCalendar[]) => Promise<void>;
  isLoading: boolean;
}

export function GoogleCalendarDialog({
  isOpen,
  onClose,
  calendars,
  onImport,
  isLoading,
}: GoogleCalendarDialogProps) {
  const [selectedCalendars, setSelectedCalendars] = useState<GoogleCalendar[]>(calendars);

  const handleCalendarToggle = (calendar: GoogleCalendar) => {
    setSelectedCalendars(prev => {
      const isSelected = prev.some(cal => cal.id === calendar.id);
      if (isSelected) {
        return prev.filter(cal => cal.id !== calendar.id);
      } else {
        return [...prev, calendar];
      }
    });
  };

  const handleImportClick = async () => {
    await onImport(selectedCalendars);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Google Calendars</DialogTitle>
          <DialogDescription>
            Select the calendars you want to import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {calendars.map((calendar) => (
            <div key={calendar.id} className="flex items-center space-x-2">
              <Checkbox
                id={calendar.id}
                checked={selectedCalendars.some(cal => cal.id === calendar.id)}
                onCheckedChange={() => handleCalendarToggle(calendar)}
                disabled={isLoading}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: calendar.backgroundColor }}
              />
              <label
                htmlFor={calendar.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {calendar.summary}
                {calendar.eventCount !== undefined && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({calendar.eventCount} events)
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImportClick}
            disabled={isLoading || selectedCalendars.length === 0}
          >
            {isLoading ? 'Importing...' : 'Import Selected'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 