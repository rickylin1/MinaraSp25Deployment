'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '@/lib/store/atoms';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { OnboardingSidebar } from '@/components/onboarding/onboarding-sidebar';
import { SidebarTabs } from '@/components/sidebar/sidebar-tabs';
import { TagList } from '@/components/sidebar/tag-list';
import { CalendarList } from '@/components/calendar/calendar-list';
import { CustomizeStep } from '@/components/onboarding/customize-step';
import { cn } from '@/lib/utils';
import { EventDialog } from '../calendar/event-dialog';
import { EventForm } from '../calendar/event-form';
import { ToggleForm } from '../calendar/toggle-form';

interface SidebarProps {
  isLoggedIn?: boolean;
}

export function Sidebar({ isLoggedIn = false }: SidebarProps) {
  const [user] = useAtom(userAtom);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isCustomizeCollapsed, setIsCustomizeCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendars' | 'events'>(
    'calendars'
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const [showCalendars, setShowCalendars] = useState(false);

  // Show initial onboarding for users who haven't seen it
  if (!hasCompletedOnboarding && !user) {
    return (
      <OnboardingSidebar
        onComplete={() => {
          setHasCompletedOnboarding(true);
          setIsCustomizeCollapsed(false);
        }}
      />
    );
  }

  return (
    <aside className='w-96 h-full flex flex-col'>
      <div
        className={cn(
          'flex-1 bg-white rounded-lg overflow-hidden transition-all duration-300 flex flex-col'
        )}>
        <SidebarTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className='flex-1 overflow-y-auto'>
          <div className='p-4'>
            {activeTab === 'calendars' ? (
              <div className='space-y-4'>
                {user ? (
                  <>
                    <>
                      {!isDialogOpen && (
                        <Button
                          className='w-full justify-start gap-2 rounded-full'
                          size='sm'
                          onClick={openDialog}
                        >
                          <Plus className='h-4 w-4' />
                          Create
                        </Button>
                      )}
                    </>

                    <>
                    <button
                        onClick={() => setShowCalendars(prev => !prev)}
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        {showCalendars ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        Your Calendars
                      </button>
                      {showCalendars && (
                        <CalendarList />
                      )}
                    </>

                    <ToggleForm
                      isOpen={isDialogOpen}
                      onClose={closeDialog}
                    />
                  </>
                ) : (
                  <TagList />
                )}
              </div>
            ) : (
              <div className='space-y-4'>
                <>
                  <>
                    {!isDialogOpen && (
                      <Button
                        className='w-full justify-start gap-2 rounded-full'
                        size='sm'
                        onClick={openDialog}
                      >
                        <Plus className='h-4 w-4' />
                        Create
                      </Button>
                    )}
                  </>
                  <EventForm
                    isOpen={isDialogOpen}
                    onClose={closeDialog}
                  />
                </>
              </div>
            )}
          </div>
        </div>
      </div>

      {!hasCompletedOnboarding && (
        <div
          className={cn(
            'mt-4 transition-all duration-300',
            isCustomizeCollapsed ? 'h-12' : 'h-auto'
          )}>
          {isCustomizeCollapsed ? (
            <Button
              variant='ghost'
              className='w-full justify-between h-12 bg-secondary/30 hover:bg-secondary/40 text-xs'
              onClick={() => setIsCustomizeCollapsed(false)}>
              customize your minara experience
              <ChevronDown className='h-4 w-4' />
            </Button>
          ) : (
            <CustomizeStep
              onComplete={() => setHasCompletedOnboarding(true)}
              onHide={() => setIsCustomizeCollapsed(true)}
            />
          )}
        </div>
      )}
    </aside>
  );
}
