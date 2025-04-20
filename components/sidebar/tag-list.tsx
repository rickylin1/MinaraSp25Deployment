"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SAMPLE_TAGS = [
  { id: '1', name: 'free food', color: 'yellow' },
  { id: '2', name: 'university-resources', color: 'blue' },
  { id: '3', name: 'career-fair', color: 'green' },
];

export function TagList() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">Find events with tags</h2>
        <div className="flex items-center gap-1 ml-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <span className="sr-only">Filter</span>
            <span className="h-4 w-4">⋮</span>
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {SAMPLE_TAGS.map((tag) => (
          <div key={tag.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-sm bg-${tag.color}-400`} />
            <span className="text-sm">{tag.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 