"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GoogleCalendarSync } from "@/components/calendar/google-calendar-sync";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomizeStepProps {
  onComplete: () => void;
  onHide: () => void;
}

export function CustomizeStep({ onComplete, onHide }: CustomizeStepProps) {
  const { user } = useAuth();

  return (
    <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
      <p className="text-xs text-muted-foreground">
        just some options to customize your experience. you&apos;ll have to sign in to save your settings.
      </p>

      <div className="space-y-2">
        <Card className="p-3 bg-primary text-primary-foreground">
          <h3 className="text-xs font-medium">connect + google calendar</h3>
          <p className="text-xs opacity-80 mb-2">see all your current calendars - immediately.</p>
          {user ? (
            <GoogleCalendarSync />
          ) : (
            <Button 
              variant="secondary" 
              className="w-full bg-secondary/30 hover:bg-secondary/40 text-primary-foreground h-8 text-xs" 
              disabled
            >
              connect + login with google calendar
            </Button>
          )}
        </Card>

        <Card className="p-3 bg-primary text-primary-foreground">
          <h3 className="text-xs font-medium">add your classes</h3>
          <p className="text-xs opacity-80 mb-2">see your semester course schedule in seconds.</p>
          <Input 
            placeholder="find your classes" 
            disabled 
            className="bg-secondary/30 border-0 placeholder:text-primary-foreground/70 h-8 text-xs"
          />
        </Card>

        <Card className="p-3 bg-primary text-primary-foreground">
          <h3 className="text-xs font-medium">find some organizations</h3>
          <p className="text-xs opacity-80 mb-2">add new clubs or your RSOs&apos; calendars or find university resources</p>
          <Input 
            placeholder="type an org's name" 
            disabled 
            className="bg-secondary/30 border-0 placeholder:text-primary-foreground/70 h-8 text-xs"
          />
        </Card>

        <Card className="p-3 bg-primary text-primary-foreground">
          <h3 className="text-xs font-medium">follow some tags</h3>
          <p className="text-xs opacity-80 mb-2">pick some tags to find events you care about</p>
          <Select disabled>
            <SelectTrigger className="bg-secondary/30 border-0 h-8 text-xs">
              <SelectValue placeholder="type an interest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder">Select tags...</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      </div>

      <div className="flex justify-end items-center gap-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onHide}
          className="text-muted-foreground hover:text-muted-foreground/80 text-xs h-8"
        >
          hide for now
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onComplete}
          className="px-4 bg-primary hover:bg-primary/90 text-xs h-8"
        >
          let&apos;s get started!
        </Button>
      </div>
    </div>
  );
} 