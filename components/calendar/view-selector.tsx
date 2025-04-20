"use client";

import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CalendarDays,
  CalendarRange,
  List
} from "lucide-react";
import { ViewType } from "@/lib/types/calendar";

interface ViewSelectorProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewSelector({ view, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={view === 'day' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('day')}
      >
        <CalendarIcon className="h-4 w-4 mr-2" />
        Day
      </Button>
      <Button
        variant={view === 'week' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('week')}
      >
        <CalendarRange className="h-4 w-4 mr-2" />
        Week
      </Button>
      <Button
        variant={view === 'month' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('month')}
      >
        <CalendarDays className="h-4 w-4 mr-2" />
        Month
      </Button>
      <Button
        variant={view === 'year' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('year')}
      >
        <CalendarIcon className="h-4 w-4 mr-2" />
        Year
      </Button>
      <Button
        variant={view === 'agenda' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('agenda')}
      >
        <List className="h-4 w-4 mr-2" />
        Agenda
      </Button>
    </div>
  );
}