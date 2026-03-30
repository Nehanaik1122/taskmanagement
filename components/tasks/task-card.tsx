'use client';

import { Task, TaskStatus } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { TaskForm } from './task-form';
import { useTasks } from '@/hooks/use-tasks';

interface TaskCardProps {
  task: Task;
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks();

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask(task.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
          <div className="flex gap-1">
            <TaskForm task={task}>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </TaskForm>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Badge className={statusColors[task.status]}>
          {task.status.replace('-', ' ').toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{task.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
          <SelectStatus value={task.status} onChange={handleStatusChange} />
        </div>
      </CardContent>
    </Card>
  );
}

function SelectStatus({ value, onChange }: { value: TaskStatus; onChange: (value: TaskStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className="text-sm border rounded px-2 py-1"
    >
      <option value="todo">To Do</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  );
}
