import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { userTimezoneAtom } from '@/lib/store/atoms';
import { useState, useEffect } from 'react';

interface TimeGridProps {
  hours: number[];
}

export function TimeGrid({ hours }: TimeGridProps) {
  const [userTimezone] = useAtom(userTimezoneAtom);
  const [timeZoneAbbr, setTimeZoneAbbr] = useState('UTC');

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: userTimezone,
    });
    const abbr =
      formatter
        .formatToParts(new Date())
        .find((part) => part.type === 'timeZoneName')?.value || userTimezone;
    setTimeZoneAbbr(abbr);
  }, [userTimezone]);

  return (
    <div className="relative w-16 flex flex-col h-full">
      <div className="flex-1">
        {hours.map((hour) => (
          <div key={hour} className="relative h-12">
            <div className="absolute right-2 top-0 text-xs text-muted-foreground select-none">
              {format(new Date().setHours(hour), 'ha')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}