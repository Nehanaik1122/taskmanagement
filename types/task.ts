export type TaskStatus = 'pending' | 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate: string;
}
