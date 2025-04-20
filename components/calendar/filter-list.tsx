"use client";

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";

interface Filter {
  id: string;
  label: string;
}

interface FilterItemProps {
  filter: Filter;
}

function FilterItem({ filter }: FilterItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={filter.id} />
      <label htmlFor={filter.id} className="text-sm">
        {filter.label}
      </label>
    </div>
  );
}

const filters: Filter[] = [
  { id: 'free-food', label: 'Free food' },
  { id: 'intramural-sports', label: 'Intramural sports' },
  { id: 'midterms', label: 'Midterms of all students' },
];

export function FilterList() {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Your Filters</h3>
      <div className="space-y-2">
        {filters.map((filter) => (
          <FilterItem key={filter.id} filter={filter} />
        ))}
      </div>
    </div>
  );
}