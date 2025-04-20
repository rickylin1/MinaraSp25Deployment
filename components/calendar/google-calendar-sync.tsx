"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Calendar } from "lucide-react";
import { useAtom } from 'jotai';
import { calendarsAtom, eventsQueryAtom } from '@/lib/store/atoms';
import { createClient } from '@/lib/supabase/client';
import { useToast } from "@/lib/hooks/use-toast";
import { fetchGoogleCalendars, importGoogleCalendars, checkGoogleCalendarSync } from '@/lib/api/calendars';
import { GoogleCalendarDialog } from './google-calendar-dialog';
import type { GoogleCalendar } from '@/lib/types/calendar';

export function GoogleCalendarSync() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [googleCalendars, setGoogleCalendars] = useState<GoogleCalendar[]>([]);
  const [, refetchEvents] = useAtom(eventsQueryAtom);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    checkGoogleCalendarSync().then(setIsSynced);
  }, []);

  const handleGoogleAuth = useCallback(async () => {
    try {
      console.log("HEREHEREHERE") // not running
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?provider=google_calendar&sync=success`,
          scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
          // scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly email profile openid',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account'
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Error",
        description: "Could not access Google Calendar.",
        variant: "destructive",
      });
    }
  }, [supabase.auth, toast]);

  const handleFetchCalendars = useCallback(async () => {
    try {
      setIsLoading(true);
      const calendars = await fetchGoogleCalendars();
      setGoogleCalendars(calendars);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching Google calendars:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Google calendars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleImport = useCallback(async (selectedCalendars: GoogleCalendar[]) => {
    try {
      setIsLoading(true);
      await importGoogleCalendars(selectedCalendars, (progress) => {
        console.log('Import progress:', progress);
      });
      setIsSynced(true);
      setIsDialogOpen(false);
      refetchEvents();
      toast({
        title: "Success",
        description: "Google calendars imported successfully!",
      });
    } catch (error) {
      console.error('Error importing Google calendars:', error);
      toast({
        title: "Error",
        description: "Failed to import Google calendars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, refetchEvents]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccessSync = params.get('sync') === 'success';

    if (isSuccessSync) {
      // Add a delay to ensure the connection is stored in the database
      setTimeout(async () => {
        try {
          const isConnected = await checkGoogleCalendarSync();
          if (isConnected) {
            await handleFetchCalendars();
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (error) {
          console.error('Error after sync:', error);
          toast({
            title: "Error",
            description: "Could not complete Google Calendar sync. Please try again.",
            variant: "destructive",
          });
        }
      }, 1000);
    }
  }, [handleFetchCalendars, toast]);

  const handleSync = useCallback(async () => {
    if (isSynced) {
      await handleFetchCalendars();
    } else {
      await handleGoogleAuth();
    }
  }, [isSynced, handleFetchCalendars, handleGoogleAuth]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={handleSync}
        disabled={isLoading}
      >
        {isSynced ? (
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span className="text-black">Synced with Google</span>
          </div>
        ) : (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="text-black">Sync with Google</span>
          </div>
        )}
      </Button>

      <GoogleCalendarDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        calendars={googleCalendars}
        onImport={handleImport}
        isLoading={isLoading}
      />
    </>
  );
} 