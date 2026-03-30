import { Task, TaskFormData } from '@/types/task';

const STORAGE_KEY = 'tasks';

export const taskStorage = {
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  createTask: (taskData: TaskFormData): Task => {
    const tasks = taskStorage.getTasks();

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || '',
      status: 'pending',
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    taskStorage.saveTasks(updatedTasks);

    return newTask;
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    const tasks = taskStorage.getTasks();

    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    );

    taskStorage.saveTasks(updatedTasks);
    return updatedTasks.find(task => task.id === id);
  },

  deleteTask: (id: string) => {
    const tasks = taskStorage.getTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);

    taskStorage.saveTasks(updatedTasks);
    return true;
  },
};