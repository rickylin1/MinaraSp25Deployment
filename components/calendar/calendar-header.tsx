"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AuthStatus } from '@/components/auth/auth-status';
import { useAtom } from 'jotai';
import { selectedDateAtom, viewAtom } from '@/lib/store/atoms';
import { cn } from "@/lib/utils";

export function CalendarHeader() {
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [view, setView] = useAtom(viewAtom);

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  const views = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
    { id: 'agenda', label: 'Agenda' },
  ] as const;

  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-medium text-primary">minara calendar</h1>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {views.map((v) => (
              <Button
                key={v.id}
                variant={view === v.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(v.id)}
                className={cn(
                  "rounded-md",
                  view === v.id && "bg-primary text-primary-foreground"
                )}
              >
                {v.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}