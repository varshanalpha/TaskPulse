import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Task, TaskFormData, TaskStatus } from '../types';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  dbSchemaMissing: boolean;
  isUsingLocalStorage: boolean;
  createTask: (data: TaskFormData) => Promise<boolean>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskComplete: (id: string) => Promise<boolean>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<boolean>;
  moveTaskStatus: (id: string, newStatus: TaskStatus) => Promise<boolean>;
  toggleStar: (id: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
  dismissSchemaAlert: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    user_id: 'demo-user-12345',
    title: 'Configure Supabase authentication & RLS policies',
    description: 'Connect client publishable key and write SQL security rules for per-user task isolation.',
    status: 'completed',
    priority: 'urgent',
    category: 'Backend',
    due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-1', title: 'Verify Supabase connection', completed: true },
      { id: 'sub-2', title: 'Draft RLS policies', completed: true },
      { id: 'sub-3', title: 'Test user session persistence', completed: true },
    ],
    is_starred: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-task-2',
    user_id: 'demo-user-12345',
    title: 'Design Kanban board with drag & micro-interactions',
    description: 'Implement responsive 4-column layout with status badges, priority tags, and completion triggers.',
    status: 'in_progress',
    priority: 'high',
    category: 'Design',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-4', title: 'Design card visual tokens', completed: true },
      { id: 'sub-5', title: 'Add fluid status transitions', completed: false },
    ],
    is_starred: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-task-3',
    user_id: 'demo-user-12345',
    title: 'Implement search, multi-filters & sorting engine',
    description: 'Enable searching task titles/descriptions, filtering by category, priority, and date.',
    status: 'todo',
    priority: 'medium',
    category: 'Frontend',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-6', title: 'Real-time text query debounce', completed: false },
      { id: 'sub-7', title: 'Category pill badges', completed: false },
    ],
    is_starred: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-task-4',
    user_id: 'demo-user-12345',
    title: 'Deploy production build to Vercel/Netlify',
    description: 'Set up automated CI/CD pipeline, environment secret injection, and domain routing.',
    status: 'backlog',
    priority: 'low',
    category: 'DevOps',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [],
    is_starred: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-task-5',
    user_id: 'demo-user-12345',
    title: 'Run end-to-end task workflow validation',
    description: 'Verify CRUD lifecycle across mobile viewport and multiple browsers.',
    status: 'review',
    priority: 'high',
    category: 'QA',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-8', title: 'Verify task creation on mobile', completed: true },
      { id: 'sub-9', title: 'Check offline recovery', completed: false },
    ],
    is_starred: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbSchemaMissing, setDbSchemaMissing] = useState(false);
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState(false);

  // Helper to fire celebratory confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
      });
    } catch {
      // Ignore if canvas-confetti is not available
    }
  };

  // Load from local storage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('taskpulse_local_tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        setTasks(INITIAL_DEMO_TASKS);
        localStorage.setItem('taskpulse_local_tasks', JSON.stringify(INITIAL_DEMO_TASKS));
      }
    } catch (e) {
      console.error('Failed to load local tasks', e);
      setTasks(INITIAL_DEMO_TASKS);
    }
    setIsUsingLocalStorage(true);
    setLoading(false);
  }, []);

  // Save to local storage
  const saveToLocalStorage = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    try {
      localStorage.setItem('taskpulse_local_tasks', JSON.stringify(updatedTasks));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  };

  // Fetch tasks from Supabase or fallback
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      loadFromLocalStorage();
      return;
    }

    try {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });

      if (user?.id) {
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      }

      const { data, error: sbError } = await query;

      if (sbError) {
        // Table not found in Supabase schema cache
        if (sbError.code === 'PGRST205' || sbError.message?.includes('Could not find the table')) {
          console.warn('Supabase tasks table not yet created. Using local storage fallback.');
          setDbSchemaMissing(true);
          loadFromLocalStorage();
          return;
        }
        throw sbError;
      }

      setDbSchemaMissing(false);
      setIsUsingLocalStorage(false);
      // Clean and normalize tasks
      const normalizedTasks: Task[] = (data || []).map((t) => ({
        ...t,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
        is_starred: !!t.is_starred,
      }));
      setTasks(normalizedTasks);
    } catch (err: any) {
      console.warn('Error fetching tasks from Supabase:', err.message || err);
      setError(err.message || 'Failed to fetch tasks from Supabase');
      // Graceful fallback to local storage so UI is fully usable
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [user?.id, isDemoMode, loadFromLocalStorage]);

  // Initial load & real-time setup
  useEffect(() => {
    fetchTasks();

    if (isDemoMode || dbSchemaMissing) return;

    // Realtime channel listener for live Supabase synchronization
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task;
            setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Task;
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setTasks((prev) => prev.filter((t) => t.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, isDemoMode, dbSchemaMissing]);

  // CREATE TASK
  const createTask = async (data: TaskFormData): Promise<boolean> => {
    const newTask: Task = {
      id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      user_id: user?.id || null,
      title: data.title.trim(),
      description: data.description.trim(),
      status: data.status,
      priority: data.priority,
      category: data.category || 'General',
      due_date: data.due_date || null,
      subtasks: data.subtasks || [],
      is_starred: !!data.is_starred,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isUsingLocalStorage || dbSchemaMissing || isDemoMode) {
      saveToLocalStorage([newTask, ...tasks]);
      return true;
    }

    try {
      const { data: inserted, error: sbError } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (sbError) throw sbError;
      if (inserted) {
        setTasks((prev) => [inserted as Task, ...prev]);
      }
      return true;
    } catch (err: any) {
      console.warn('Falling back to local storage on insert error:', err);
      saveToLocalStorage([newTask, ...tasks]);
      return true;
    }
  };

  // UPDATE TASK
  const updateTask = async (id: string, updates: Partial<Task>): Promise<boolean> => {
    const updatedWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isUsingLocalStorage || dbSchemaMissing || isDemoMode) {
      const updatedList = tasks.map((t) => (t.id === id ? { ...t, ...updatedWithTimestamp } : t));
      saveToLocalStorage(updatedList);
      return true;
    }

    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedWithTimestamp } : t)));

    try {
      const { error: sbError } = await supabase
        .from('tasks')
        .update(updatedWithTimestamp)
        .eq('id', id);

      if (sbError) throw sbError;
      return true;
    } catch (err) {
      console.warn('Update failed in Supabase, keeping local state:', err);
      return true;
    }
  };

  // DELETE TASK
  const deleteTask = async (id: string): Promise<boolean> => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (isUsingLocalStorage || dbSchemaMissing || isDemoMode) {
      saveToLocalStorage(tasks.filter((t) => t.id !== id));
      return true;
    }

    try {
      const { error: sbError } = await supabase.from('tasks').delete().eq('id', id);
      if (sbError) {
        setTasks(previous);
        throw sbError;
      }
      return true;
    } catch (err: any) {
      console.warn('Supabase delete error:', err);
      saveToLocalStorage(previous.filter((t) => t.id !== id));
      return true;
    }
  };

  // TOGGLE TASK COMPLETION
  const toggleTaskComplete = async (id: string): Promise<boolean> => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return false;

    const newStatus: TaskStatus = target.status === 'completed' ? 'todo' : 'completed';
    if (newStatus === 'completed') {
      triggerCelebration();
    }

    return updateTask(id, { status: newStatus });
  };

  // TOGGLE SUBTASK
  const toggleSubtask = async (taskId: string, subtaskId: string): Promise<boolean> => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return false;

    const updatedSubtasks = target.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // If all subtasks are complete and status is not completed, prompt celebration
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
    if (allDone && target.status !== 'completed') {
      triggerCelebration();
    }

    return updateTask(taskId, { subtasks: updatedSubtasks });
  };

  // MOVE TASK STATUS (for Kanban drag or status dropdown)
  const moveTaskStatus = async (id: string, newStatus: TaskStatus): Promise<boolean> => {
    if (newStatus === 'completed') {
      triggerCelebration();
    }
    return updateTask(id, { status: newStatus });
  };

  // TOGGLE STAR
  const toggleStar = async (id: string): Promise<boolean> => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return false;
    return updateTask(id, { is_starred: !target.is_starred });
  };

  const dismissSchemaAlert = () => {
    setDbSchemaMissing(false);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        dbSchemaMissing,
        isUsingLocalStorage,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubtask,
        moveTaskStatus,
        toggleStar,
        refreshTasks: fetchTasks,
        dismissSchemaAlert,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
