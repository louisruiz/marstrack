export type TaskType = 'perpetual' | 'daily' | 'weekly' | 'monthly' | 'specific';
export type TaskPriority = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id?: number;
  categoryId: number;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  estimatedDuration?: number; // minutes
  completed?: boolean;
  tags?: string[];
  dueDate?: string;
}

export interface TaskCategory {
  id?: number;
  name: string;
  description?: string;
  color?: string;
}

export interface TaskCompletion {
  id?: number;
  taskId: number;
  date: string;
  completed: boolean;
  duration?: number; // minutes
  notes?: string;
}