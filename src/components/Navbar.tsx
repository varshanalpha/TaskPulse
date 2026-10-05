import React from 'react';
import { 
  CheckCircle2, 
  Plus, 
  Search, 
  LayoutGrid, 
  ListTodo, 
  BarChart3, 
  Moon, 
  Sun, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { ViewMode, FilterState } from '../types';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSetupModal?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  onOpenCreateModal,
  onOpenAuthModal,
  theme,
  onToggleTheme,
  mobileSidebarOpen,
  onToggleMobileSidebar,
}) => {
  const { user, isDemoMode, signOut } = useAuth();

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Left: Mobile hamburger & Logo */}
        <div className="navbar-left">
          <button 
            type="button"
            className="mobile-menu-btn" 
            onClick={onToggleMobileSidebar}
            aria-label="Toggle menu"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="brand-logo">
            <div className="brand-icon">
              <CheckCircle2 size={22} className="brand-icon-svg" />
            </div>
            <div className="brand-text">
              <span className="brand-title">TaskPulse</span>
              <span className="brand-subtitle">Pro Management</span>
            </div>
          </div>
        </div>

        {/* Center: Search & View Switcher */}
        <div className="navbar-center">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks, descriptions, tags... (Ctrl+K)"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="search-input"
            />
            {filters.search && (
              <button 
                type="button"
                className="clear-search-btn" 
                onClick={() => onFilterChange({ search: '' })}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="view-mode-tabs">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => onViewModeChange('kanban')}
              title="Kanban Board View"
            >
              <LayoutGrid size={16} />
              <span className="tab-label">Board</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              title="List Table View"
            >
              <ListTodo size={16} />
              <span className="tab-label">List</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'analytics' ? 'active' : ''}`}
              onClick={() => onViewModeChange('analytics')}
              title="Productivity Analytics"
            >
              <BarChart3 size={16} />
              <span className="tab-label">Analytics</span>
            </button>
          </div>
        </div>

        {/* Right: Actions, Theme, Auth */}
        <div className="navbar-right">
          <button
            type="button"
            className="create-task-btn"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="create-btn-text">New Task</span>
          </button>

          <button
            type="button"
            className="icon-action-btn theme-toggle"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="user-profile-menu">
              <div className="user-avatar-pill" title={user.email || 'Logged in'}>
                <div className="user-avatar-circle">
                  {user.user_metadata?.full_name ? (
                    user.user_metadata.full_name.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon size={14} />
                  )}
                </div>
                <span className="user-name">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  {isDemoMode && <span className="guest-badge">Guest</span>}
                </span>
              </div>
              <button
                type="button"
                className="icon-action-btn sign-out-btn"
                onClick={signOut}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="login-btn"
              onClick={onOpenAuthModal}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
