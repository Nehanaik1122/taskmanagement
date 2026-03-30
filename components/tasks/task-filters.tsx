'use client';

import { TaskStatus } from '@/types/task';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskFiltersProps {
  onFilterChange: (filter: TaskStatus | 'all') => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: 'dueDate' | 'title') => void;
}

export function TaskFilters({ onFilterChange, onSearchChange, onSortChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Input
        placeholder="Search tasks..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <Select onValueChange={onFilterChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dueDate">Due Date</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
