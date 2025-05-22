"use client";

import { useState } from 'react';
import { useAtom } from 'jotai';
import { userTimezoneAtom, eventsQueryAtom, selectedCalendarIdsAtom } from '@/lib/store/atoms';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/lib/hooks/use-toast";
import { createEvent, updateEvent, deleteEvent } from '@/lib/api/events';
import { Event } from '@/lib/types/database';
import { format, parseISO } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import {
  Calendar as CalendarIcon,
  Paintbrush,
  Square,
  Clock,
  MapPin,
  Users,
  AlignLeft,
  Hash,
  Palette,
  X
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { getColorName } from './views/color-picker';

interface EventFormProps {
  event?: Event | null;
  isOpen: boolean;
  onClose: () => void;
  defaultStartTime?: Date | null;
}

type EventFormState = Partial<Event> & {
  guests: string;
  tags: string;
  // colors: string; 
};

export function EventForm({ event, isOpen, onClose, defaultStartTime }: EventFormProps) {
  const [userTimezone] = useAtom(userTimezoneAtom);
  const [selectedCalendarIds] = useAtom(selectedCalendarIdsAtom);
  const [eventsQuery, setEventsQuery] = useAtom(eventsQueryAtom); // eventsQuery includes data, refetch, etc.
  const { toast } = useToast();

  const [formData, setFormData] = useState<EventFormState>({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    start_time:
      event?.start_time ||
      defaultStartTime?.toISOString() ||
      new Date().toISOString(),
    end_time:
      event?.end_time ||
      new Date(
        (defaultStartTime?.getTime() || Date.now()) + 3600000
      ).toISOString(),
    all_day: event?.all_day || false,
    calendar_id: event?.calendar_id || selectedCalendarIds[0],
    timezone: userTimezone,
    guests: '',
    tags: ''
    // colors: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.calendar_id) {
      toast({
        title: "Error",
        description: "Please select a calendar for your event.",
        variant: "destructive",
      });
      return;
    }

    const startTime = new Date(formData.start_time!);
    const endTime = new Date(formData.end_time!);

    if (endTime < startTime) {
      toast({
        title: "Error",
        description: "End time cannot be before start time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { guests, tags, ...cleanedData } = formData;

      if (event) {
        await updateEvent(event.id, cleanedData);
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully.",
        });
      } else {
        await createEvent(cleanedData);
        toast({
          title: "Event created",
          description: "Your event has been created successfully.",
        });
      }

      eventsQuery.refetch();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "There was an error saving your event.",
        variant: "destructive",
      });
    }
  };


  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteEvent(event.id);
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully.",
      });
      eventsQuery.refetch(); // Refetch to update UI with server data
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "There was an error deleting your event.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  const labelStyle = "flex items-center gap-2 text-sm font-medium text-[#2F2E2C]";

  return (
    <div className="h-full flex flex-col">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{event ? 'Edit Event' : 'Create Event'}</h2>
          <p className="text-sm text-muted-foreground">
            {event
              ? 'Make changes to your event here.'
              : 'Add a new event to your calendar.'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 p-4 text-sm text-black font-medium">
          <input
            type="text"
            placeholder="add event name"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border-0 border-b border-gray-400 focus:border-[#4B2065] focus:outline-none text-lg placeholder:text-[#4B2065] placeholder:font-medium bg-transparent"
          />

          {/* Calendar Dropdowns */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-xs">calendar</span>
            </div>
            <div className="flex gap-2">
              {/* Personal calendar dropdown */}
              <Select onValueChange={(value) => console.log("Selected personal calendar:", value)}>
                <SelectTrigger className="bg-[#7B6593] text-white text-sm px-4 py-2 rounded-md shadow-inner w-32">
                  <SelectValue placeholder="personal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">personal</SelectItem>
                  <SelectItem value="work">work</SelectItem>
                </SelectContent>
              </Select>

              {/* Organization calendar dropdown */}
              <Select onValueChange={(value) => console.log("Selected org:", value)}>
                <SelectTrigger className="border text-sm px-4 py-2 rounded-md shadow-sm w-40">
                  <SelectValue placeholder="organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org1">org 1</SelectItem>
                  <SelectItem value="org2">org 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Paintbrush className="w-4 h-4" />
              <span className="text-xs">color</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-6 h-6 bg-black rounded-sm border" />
              <Select onValueChange={(value) => console.log("Selected color:", value)}>
                <SelectTrigger className="border text-sm px-4 py-2 rounded-md shadow-sm w-32">
                  <SelectValue placeholder="color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">location</span>
            </div>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="add physical location or a link"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-xs">guests</span>
            </div>
            <Input
              disabled
              placeholder="Add guests"
              onChange={(e) => setFormData((prev) => ({ ...prev, guests: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlignLeft className='w-4 h-4' />
              <span className="text-xs">description</span>
            </div>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="write a description of the event"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Hash className="w-4 h-4" />
              <span className="text-xs">add tags</span>
            </div>
            <Input
              disabled
              placeholder="Help others find your event"
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="all-day"
              checked={formData.all_day}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, all_day: checked }))}
            />
            <Label htmlFor="all-day">All day event</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start time</Label>
              <Input
                id="start-time"
                type={formData.all_day ? "date" : "datetime-local"}
                value={format(
                  parseISO(formData.start_time!),
                  formData.all_day ? "yyyy-MM-dd" : "yyyy-MM-dd'T'HH:mm"
                )}
                onChange={(e) => {
                  const input = e.target.value;
                  const newDate = formData.all_day
                    ? new Date(input + "T00:00")
                    : new Date(input);

                  setFormData((prev) => ({
                    ...prev,
                    start_time: newDate.toISOString(),
                  }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End time</Label>
              <Input
                id="end-time"
                type={formData.all_day ? "date" : "datetime-local"}
                value={format(
                  parseISO(formData.end_time!),
                  formData.all_day ? "yyyy-MM-dd" : "yyyy-MM-dd'T'HH:mm"
                )}
                onChange={(e) => {
                  const input = e.target.value;
                  const newDate = formData.all_day
                    ? new Date(input + "T00:00")
                    : new Date(input);

                  setFormData((prev) => ({
                    ...prev,
                    end_time: newDate.toISOString(),
                  }));
                }}
                required
              />
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t bg-white sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}

            <Button type="submit" className="bg-[#4B2065] text-white hover:bg-[#3e1b55]">
              {event ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}