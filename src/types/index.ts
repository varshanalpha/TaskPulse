export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id?: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  due_date?: string | null;
  subtasks: Subtask[];
  is_starred?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  due_date?: string | null;
  subtasks: Subtask[];
  is_starred?: boolean;
}

export type ViewMode = 'kanban' | 'list' | 'analytics';

export interface FilterState {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: string;
  onlyStarred: boolean;
  onlyDueToday: boolean;
  sortBy: 'created_at' | 'due_date' | 'priority' | 'title' | 'status';
  sortOrder: 'asc' | 'desc';
}
