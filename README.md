# ⚡ TaskPulse — Full-Stack Task Management Application

A full-stack task management web application built with **React 19**, **TypeScript**, **Vite**, and **Supabase (PostgreSQL, Auth & Realtime)**.

Designed with a sleek, dark/light glassmorphic UI, fluid micro-interactions, responsive Kanban board, dense list table, and real-time productivity analytics.

---

## 🚀 Key Features

- **🔐 User Authentication & Authorization**:
  - Email/Password sign up and sign in powered by Supabase Auth.
  - Per-user Row Level Security (RLS) data isolation: each user can securely manage their own tasks.
  - Instant "Continue as Guest" demo mode for immediate evaluation without credentials.
- **✨ Full CRUD Operations for Tasks**:
  - **Create**: Detailed tasks with title, description, priority (`urgent`, `high`, `medium`, `low`), status (`backlog`, `todo`, `in_progress`, `review`, `completed`), category, due date, and interactive checklist subtasks.
  - **Read & Filter**: Real-time debounce search, multi-category filters, priority pills, starred filter, due today filter, and sorting.
  - **Update**: In-place status transitions, drag-and-drop, inline table selects, full editing modal, and checklist toggles.
  - **Delete**: Task deletion with optimistic UI update and database synchronization.
  - **Celebration Trigger**: Confetti explosion powered by `canvas-confetti` when tasks or all subtasks are completed!
- **📌 Multiple Working Views**:
  - **Kanban Board**: Drag-and-drop 5-column board (`Backlog`, `To Do`, `In Progress`, `In Review`, `Completed`) with column counters, progress bars, and overdue warnings.
  - **List Table**: High-density productivity table with sortable columns, expandable subtasks checklist, and inline status/priority dropdowns.
  - **Analytics Dashboard**: Real-time productivity metrics, completion velocity, overdue alerts, status distribution bars, and category breakdown.
- **🎨 Modern Aesthetic Design**:
  - Glassmorphic translucent cards with backdrop blur.
  - Vibrant HSL-balanced accent gradients (indigo/violet/amber/emerald).
  - One-click Dark and Light theme toggle with persisted user preference.
  - Fully responsive for desktop, tablet, and mobile screens (including mobile navigation drawer and floating action button).
- **🛡️ Resilience & Offline Demo Mode**:
  - Automatic detection of Supabase schema cache.
  - If the SQL table `public.tasks` has not yet been migrated, the app seamlessly runs in Local Storage Demo Mode and displays an in-app setup assistant with a 1-click SQL copy button.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 8](https://vitejs.dev/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL 15, Auth GoTrue, Realtime WebSocket Channels)
- **Icons & Styling**: [Lucide React](https://lucide.dev/), Custom Glassmorphic CSS Design System
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

### Directory Structure

```
Task/
├── .env                         # Supabase project URL & publishable key
├── supabase_schema.sql          # Ready-to-run PostgreSQL schema & RLS policies
├── src/
│   ├── types/
│   │   └── index.ts             # TypeScript definitions for Tasks, Users, Filters
│   ├── lib/
│   │   └── supabase.ts          # Supabase client instantiation & helpers
│   ├── context/
│   │   ├── AuthContext.tsx      # Supabase Auth provider & Guest session state
│   │   └── TaskContext.tsx      # Full CRUD operations, optimistic updates & Realtime
│   ├── components/
│   │   ├── Navbar.tsx           # Search, view tabs, theme toggle & auth menu
│   │   ├── Sidebar.tsx          # Category filters, priority pills & completion ring
│   │   ├── KanbanBoard.tsx      # 5-column drag-and-drop board
│   │   ├── ListView.tsx         # Interactive data table with expandable subtasks
│   │   ├── AnalyticsDashboard.tsx # KPI metric cards & workflow distribution
│   │   ├── TaskModal.tsx        # Create & Edit task dialog with checklist builder
│   │   ├── AuthModal.tsx        # Sign In / Sign Up tabbed dialog & Guest access
│   │   ├── SupabaseSetupModal.tsx # 30s SQL setup assistant & connection tester
│   │   └── SupabaseSetupBanner.tsx # Non-intrusive status notification banner
│   ├── App.tsx                  # Root orchestration & keyboard shortcuts (Ctrl+K)
│   ├── App.css                  # Comprehensive design system & responsive styling
│   ├── index.css                # Base tokens, glassmorphism & typography variables
│   └── main.tsx                 # React entry point
└── package.json
```

---

## ⚡ Supabase Setup (30-Second Guide)

Your Supabase project URL and Publishable key are already configured in `.env`:
- **Project URL**: `https://eokyzoktstqwbkzpqndd.supabase.co`
- **Publishable Key**: `sb_publishable_GdDJtNZUNphnQDb-Q9Q9qA_9uPmaGPm`

To activate live PostgreSQL cloud sync:
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/eokyzoktstqwbkzpqndd/sql/new).
2. Open [`supabase_schema.sql`](file:///Users/varshan/Desktop/Task/supabase_schema.sql) in this repository or click **"SQL Setup Needed"** inside the running app to copy the migration.
3. Paste the SQL query into the Supabase SQL editor and click **Run**.
4. In TaskPulse, click **"Test & Sync Connection"** in the setup modal. The badge will switch to **"Supabase Live"** and all changes will sync directly to your cloud PostgreSQL database with Realtime WebSocket support!

---

## 🏃 Running Locally

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the development server
npm run dev

# 3. Build production bundle
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
