import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userTimezoneAtom } from '@/lib/store/atoms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from '@/lib/supabase/client';

export function TimezoneModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [userTimezone, setUserTimezone] = useAtom(userTimezoneAtom);
  const [selectedTimezone, setSelectedTimezone] = useState(userTimezone);
  const supabase = createClient();

  useEffect(() => {
    const checkTimezone = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

      if (!profile?.timezone) {
        setIsOpen(true);
        setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      } else {
        setUserTimezone(profile.timezone);
      }
    };

    checkTimezone();
  }, [setUserTimezone, supabase]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ timezone: selectedTimezone })
      .eq('id', user.id);

    setUserTimezone(selectedTimezone);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Your Timezone</DialogTitle>
          <DialogDescription>
            Please select your timezone to ensure events are displayed correctly.
          </DialogDescription>
        </DialogHeader>

        <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {Intl.supportedValuesOf('timeZone').map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button onClick={handleSave}>Save Timezone</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 