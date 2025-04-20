"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { CalendarForm } from "./calendar-form";
import { OrgForm } from "./org-form";

interface ToggleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedName: string, type: "calendar" | "organization") => void;
}

export function ToggleForm({ isOpen, onClose, onSave }: ToggleFormProps) {
  const { toast } = useToast();

  enum CalendarColor {
    Color = 'color',
    Black = 'black',
    White = 'white'
  }

  enum VisibilityTypes {
    Invitees = 'invitees',
    Org_Members = 'org_members',
    Everyone = 'everyone'
  }

  interface FormData {
    name?: string | undefined;
    description?: string | undefined;
    tags?: string | undefined; 
    members?: string | undefined; 
    colors?: CalendarColor; 
    visibility?: VisibilityTypes;
    // Add other optional fields as needed
  }

  // Use a single state object for all form data
  const initialFormData: FormData = {
    name: "",
    description: "",
    tags: "",
    members: "",
    colors: CalendarColor.Color,
    visibility: VisibilityTypes.Invitees
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedForm, setSelectedForm] = useState<"calendar" | "organization">("calendar");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name != null && formData.name.trim() === "") {
      toast({
        title: "Error",
        description: "Event name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    onSave?.(formData.name ?? "", selectedForm);
    toast({
      title: "Saved",
      description: `Saved the ${selectedForm} form with the name: "${formData.name}".`,
    });

    // Reset all form fields
    setFormData({ name: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 text-sm text-black font-medium">
      {/* Form Type Box Toggle */}
      <div className="flex gap-4 justify-center mb-4">
        <div
          onClick={() => setSelectedForm("calendar")}
          className={`cursor-pointer p-2 w-1/3 text-center rounded-md border-2 ${selectedForm === "calendar" ? "bg-[#4B2065] text-white" : "bg-white text-[#4B2065] border-[#4B2065]"}`}
        >
          <span className="font-semibold">Calendar</span>
        </div>

        <div
          onClick={() => setSelectedForm("organization")}
          className={`cursor-pointer p-2 w-1/3 text-center rounded-md border-2 ${selectedForm === "organization" ? "bg-[#4B2065] text-white" : "bg-white text-[#4B2065] border-[#4B2065]"}`}
        >
          <span className="font-semibold">Organization</span>
        </div>
      </div>

      {/* Conditionally Render Forms */}
      {selectedForm === "calendar" && <CalendarForm formData={formData} setFormData={setFormData} />}
      {selectedForm === "organization" && <OrgForm formData={formData} setFormData={setFormData} />}

      {/* Save/Cancel Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#4B2065] text-white hover:bg-[#3e1b55]">
          Save
        </Button>
      </div>
    </form>
  );
}