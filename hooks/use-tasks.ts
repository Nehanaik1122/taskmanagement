import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskFormData } from '@/types/task';
import { taskStorage } from '@/lib/storage';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title'>('dueDate');

  useEffect(() => {
    setTasks(taskStorage.getTasks());
  }, []);

  const createTask = (taskData: TaskFormData) => {
    const newTask = taskStorage.createTask(taskData);
    setTasks(taskStorage.getTasks());
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updated = taskStorage.updateTask(id, updates);
    if (updated) setTasks(taskStorage.getTasks());
    return updated;
  };

  const deleteTask = (id: string) => {
    const success = taskStorage.deleteTask(id);
    if (success) setTasks(taskStorage.getTasks());
    return success;
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  return {
    tasks: filteredAndSortedTasks,
    allTasks: tasks,
    filter,
    setFilter,
    search,
    setSearch,
    sortBy,
    setSortBy,
    createTask,
    updateTask,
    deleteTask,
  };
};
