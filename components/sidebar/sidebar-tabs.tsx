"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SidebarTabsProps {
  activeTab: "calendars" | "events";
  onTabChange: (tab: "calendars" | "events") => void;
}

export function SidebarTabs({ activeTab, onTabChange }: SidebarTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "calendars" | "events")} className="w-full">
      <TabsList className="w-full bg-white">
        <TabsTrigger value="calendars" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          Calendars
        </TabsTrigger>
        <TabsTrigger value="events" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          Events
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 