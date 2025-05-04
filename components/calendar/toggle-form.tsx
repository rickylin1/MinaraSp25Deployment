'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';
import { CalendarForm } from './calendar-form';
import { OrgForm } from './org-form';
import { createCalendar } from '@/lib/api/calendars';

interface ToggleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToggleForm({ isOpen, onClose }: ToggleFormProps) {
  const { toast } = useToast();

  interface FormData {
    name?: string;
    colors?: string;
  }

  const initialFormData: FormData = {
    name: '',
    colors: '#000000',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedForm, setSelectedForm] = useState<'calendar' | 'organization'>(
    'calendar'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: 'Error',
        description: 'Calendar name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedForm === 'calendar') {
        const calendarData = await createCalendar({
          name: formData.name,
          color: formData.colors,
        });
        toast({
          title: 'Success',
          description: `Created calendar: "${calendarData.name}".`,
        });
      } else {
        toast({
          title: 'Info',
          description: 'Organization creation not implemented yet.',
        });
      }

      setFormData(initialFormData);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to create ${selectedForm}: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-6 p-4 text-sm text-black font-medium'>
      {/* Form Type Box Toggle */}
      <div className='flex gap-4 justify-center mb-4'>
        <div
          onClick={() => setSelectedForm('calendar')}
          className={`cursor-pointer p-2 w-1/3 text-center rounded-md border-2 ${
            selectedForm === 'calendar'
              ? 'bg-[#4B2065] text-white'
              : 'bg-white text-[#4B2065] border-[#4B2065]'
          }`}>
          <span className='font-semibold'>Calendar</span>
        </div>

        <div
          onClick={() => setSelectedForm('organization')}
          className={`cursor-pointer p-2 w-1/3 text-center rounded-md border-2 ${
            selectedForm === 'organization'
              ? 'bg-[#4B2065] text-white'
              : 'bg-white text-[#4B2065] border-[#4B2065]'
          }`}>
          <span className='font-semibold'>Organization</span>
        </div>
      </div>

      {/* Conditionally Render Forms */}
      {selectedForm === 'calendar' && (
        <CalendarForm
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {selectedForm === 'organization' && (
        <OrgForm
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* Save/Cancel Buttons */}
      <div className='flex justify-end gap-2 pt-2'>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}>
          Cancel
        </Button>
        <Button
          type='submit'
          className='bg-[#4B2065] text-white hover:bg-[#3e1b55]'>
          Save
        </Button>
      </div>
    </form>
  );
}
