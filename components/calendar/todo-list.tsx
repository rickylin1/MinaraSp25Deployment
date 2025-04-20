"use client";

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Todo {
  id: string;
  label: string;
}

interface TodoItemProps {
  todo: Todo;
}

function TodoItem({ todo }: TodoItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={todo.id} />
      <label htmlFor={todo.id} className="text-sm">
        {todo.label}
      </label>
    </div>
  );
}

const todos: Todo[] = [
  { id: 'groceries', label: 'buy groceries' },
  { id: 'journal', label: 'journal' },
  { id: 'run', label: 'daily run' },
];

export function TodoList() {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">To-do</h3>
      <div className="space-y-2">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Plus className="h-4 w-4 mr-2" />
          add new
        </Button>
      </div>
    </div>
  );
}