"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/lib/hooks/use-toast";
import { createEvent, updateEvent, deleteEvent } from "@/lib/api/events";
import type { Event } from "@/lib/types/calendar";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  calendars: { id: string; name: string; color: string }[];
  onEventCreated?: (event: Event) => void;
  onEventUpdated?: (event: Event) => void;
  onEventDeleted?: (eventId: string) => void;
}

export function EventDialog({
  isOpen,
  onClose,
  event,
  calendars,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
}: EventDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    location: event?.location || "",
    startTime: event?.start_time || new Date().toISOString(),
    endTime: event?.end_time || new Date().toISOString(),
    allDay: event?.all_day || false,
    calendarId: event?.calendar_id || calendars[0]?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (event) {
        const updatedEvent = await updateEvent(event.id, {
          ...formData,
          id: event.id,
        });
        onEventUpdated?.(updatedEvent);
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully.",
        });
      } else {
        const newEvent = await createEvent(formData);
        onEventCreated?.(newEvent);
        toast({
          title: "Event created",
          description: "Your event has been created successfully.",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setIsLoading(true);

    try {
      await deleteEvent(event.id);
      onEventDeleted?.(event.id);
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 text-sm text-black font-medium">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{event ? "Edit Event" : "Create Event"}</h2>
        <p className="text-sm text-muted-foreground">
          {event ? "Make changes to your event here." : "Add a new event to your calendar."}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="calendar">Calendar</Label>
        <Select
          value={formData.calendarId}
          onValueChange={(value) => setFormData({ ...formData, calendarId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a calendar" />
          </SelectTrigger>
          <SelectContent>
            {calendars.map((calendar) => (
              <SelectItem key={calendar.id} value={calendar.id}>
                {calendar.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="all-day"
          checked={formData.allDay}
          onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
        />
        <Label htmlFor="all-day">All day</Label>
      </div>

      <div className="flex justify-between pt-4">
        {event && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {event ? "Save changes" : "Create"}
        </Button>
      </div>
    </form>
  );
}