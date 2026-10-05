import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TaskModal } from './components/TaskModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { SupabaseSetupBanner } from './components/SupabaseSetupBanner';
import type { ViewMode, FilterState, Task, TaskStatus, TaskFormData } from './types';
import { Plus } from 'lucide-react';
import './App.css';

const MainApplication: React.FC = () => {
  const { tasks, loading, createTask, updateTask } = useTasks();

  // View & Theme State
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('taskpulse_theme') as 'dark' | 'light') || 'dark';
  });

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState<TaskStatus>('todo');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    onlyStarred: false,
    onlyDueToday: false,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskpulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search or N for new task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input') as HTMLInputElement | null;
        if (searchInput) searchInput.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setTaskModalOpen(true);
        setEditingTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search text matching title or description
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = (task.description || '').toLowerCase().includes(q);
          const matchCategory = (task.category || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCategory) return false;
        }

        // Status filter
        if (filters.status !== 'all' && task.status !== filters.status) {
          return false;
        }

        // Priority filter
        if (filters.priority !== 'all' && task.priority !== filters.priority) {
          return false;
        }

        // Category filter
        if (filters.category !== 'all' && task.category !== filters.category) {
          return false;
        }

        // Starred only
        if (filters.onlyStarred && !task.is_starred) {
          return false;
        }

        // Due today only
        if (filters.onlyDueToday) {
          if (!task.due_date || task.status === 'completed') return false;
          const today = new Date().toISOString().split('T')[0];
          if (!task.due_date.startsWith(today)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        if (filters.sortBy === 'title') {
          return a.title.localeCompare(b.title) * order;
        }
        if (filters.sortBy === 'due_date') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) * order;
        }
        if (filters.sortBy === 'priority') {
          const priorityWeights: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityWeights[a.priority] - priorityWeights[b.priority]) * order;
        }
        if (filters.sortBy === 'status') {
          const statusWeights: Record<string, number> = { backlog: 1, todo: 2, in_progress: 3, review: 4, completed: 5 };
          return (statusWeights[a.status] - statusWeights[b.status]) * order;
        }
        // Default: created_at
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * order;
      });
  }, [tasks, filters]);

  // Modal open handlers
  const handleOpenCreate = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setDefaultStatusForNew(status);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (formData: TaskFormData): Promise<boolean> => {
    if (editingTask) {
      return await updateTask(editingTask.id, formData);
    } else {
      return await createTask(formData);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        filters={filters}
        onFilterChange={handleFilterChange}
        onOpenCreateModal={() => handleOpenCreate('todo')}
        onOpenSetupModal={() => setSetupModalOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="main-content">
        {/* Top Navbar */}
        <Navbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
          onOpenCreateModal={() => handleOpenCreate('todo')}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onOpenSetupModal={() => setSetupModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Supabase Notice Banner if table is pending */}
        <SupabaseSetupBanner onOpenSetupModal={() => setSetupModalOpen(true)} />

        {/* Main View Area */}
        <main className="view-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading tasks from Supabase...</p>
            </div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onOpenCreateWithStatus={handleOpenCreate}
            />
          ) : viewMode === 'list' ? (
            <ListView
              tasks={filteredTasks}
              filters={filters}
              onFilterChange={handleFilterChange}
              onEditTask={handleEditTask}
              onOpenCreate={() => handleOpenCreate('todo')}
            />
          ) : (
            <AnalyticsDashboard
              tasks={tasks}
              onOpenCreate={() => handleOpenCreate('todo')}
            />
          )}
        </main>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        type="button"
        className="mobile-fab"
        onClick={() => handleOpenCreate('todo')}
        aria-label="Create task"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultStatus={defaultStatusForNew}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <SupabaseSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <MainApplication />
      </TaskProvider>
    </AuthProvider>
  );
}
