import { useAtom } from 'jotai';
import { userTimezoneAtom } from '@/lib/store/atoms';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from '@/lib/supabase/client';

export function TimezoneSettings() {
  const [userTimezone, setUserTimezone] = useAtom(userTimezoneAtom);
  const supabase = createClient();

  const handleTimezoneChange = async (timezone: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ timezone: timezone })
      .eq('id', user.id);

    setUserTimezone(timezone);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Timezone Settings</h2>
      <div className="max-w-xs">
        <Select value={userTimezone} onValueChange={handleTimezoneChange}>
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
      </div>
    </div>
  );
} 