import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { generateTasks, USERS } from './seed';
import { CollaborationIndicator, FilterState, SortBy, SortOrder, Task, ViewMode } from './types';

const TASKS_STORAGE_KEY = 'velozity-project-tracker-tasks';

const defaultFilters: FilterState = {
  statuses: [],
  priorities: [],
  assigneeIds: []
};

interface TaskStoreState {
  tasks: Task[];
  filters: FilterState;
  sortBy: SortBy;
  sortOrder: SortOrder;
  view: ViewMode;
  draggedTaskId: string | null;
  dragSourceStatus: Task['status'] | null;
  collaborationIndicators: CollaborationIndicator[];
}

type Action =
  | { type: 'set-filters'; payload: FilterState }
  | { type: 'clear-filters' }
  | { type: 'set-sort'; payload: { sortBy: SortBy; sortOrder: SortOrder } }
  | { type: 'set-view'; payload: ViewMode }
  | { type: 'set-dragged-task'; payload: string | null }
  | { type: 'set-drag-source-status'; payload: Task['status'] | null }
  | { type: 'update-task'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'set-collaboration'; payload: CollaborationIndicator[] };

const initialState: TaskStoreState = {
  tasks: generateTasks(),
  filters: defaultFilters,
  sortBy: 'due-date',
  sortOrder: 'asc',
  view: 'kanban',
  draggedTaskId: null,
  dragSourceStatus: null,
  collaborationIndicators: USERS.slice(0, 3).map((user, index) => ({
    userId: user.id,
    taskId: `task-${index + 1}`,
    mode: index % 2 === 0 ? 'viewing' : 'editing'
  }))
};

function loadTasksFromStorage() {
  try {
    const stored = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!stored) return generateTasks();

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return generateTasks();

    return parsed as Task[];
  } catch {
    return generateTasks();
  }
}

function reducer(state: TaskStoreState, action: Action): TaskStoreState {
  switch (action.type) {
    case 'set-filters':
      return { ...state, filters: action.payload };
    case 'clear-filters':
      return { ...state, filters: defaultFilters };
    case 'set-sort':
      return { ...state, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder };
    case 'set-view':
      return { ...state, view: action.payload };
    case 'set-dragged-task':
      return { ...state, draggedTaskId: action.payload };
    case 'set-drag-source-status':
      return { ...state, dragSourceStatus: action.payload };
    case 'update-task':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        )
      };
    case 'set-collaboration':
      return { ...state, collaborationIndicators: action.payload };
    default:
      return state;
  }
}

function parseFiltersFromURL(): FilterState {
  const params = new URLSearchParams(window.location.search);
  return {
    statuses: (params.get('statuses')?.split(',').filter(Boolean) ?? []) as FilterState['statuses'],
    priorities: (params.get('priorities')?.split(',').filter(Boolean) ?? []) as FilterState['priorities'],
    assigneeIds: params.get('assignees')?.split(',').filter(Boolean) ?? [],
    dueDateFrom: params.get('dueDateFrom') ?? undefined,
    dueDateTo: params.get('dueDateTo') ?? undefined
  };
}

function buildURLFromFilters(filters: FilterState) {
  const params = new URLSearchParams();
  if (filters.statuses.length) params.set('statuses', filters.statuses.join(','));
  if (filters.priorities.length) params.set('priorities', filters.priorities.join(','));
  if (filters.assigneeIds.length) params.set('assignees', filters.assigneeIds.join(','));
  if (filters.dueDateFrom) params.set('dueDateFrom', filters.dueDateFrom);
  if (filters.dueDateTo) params.set('dueDateTo', filters.dueDateTo);
  const query = params.toString();
  return query ? `${window.location.pathname}?${query}` : window.location.pathname;
}

interface TaskStoreValue extends TaskStoreState {
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: SortBy, sortOrder: SortOrder) => void;
  setView: (view: ViewMode) => void;
  setDraggedTaskId: (id: string | null) => void;
  setDragSourceStatus: (status: Task['status'] | null) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

const TaskStoreContext = createContext<TaskStoreValue | null>(null);

export function TaskStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (baseState) => ({
    ...baseState,
    tasks: loadTasksFromStorage(),
    filters: parseFiltersFromURL()
  }));
  const hasMounted = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      dispatch({ type: 'set-filters', payload: parseFiltersFromURL() });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const nextUrl = buildURLFromFilters(state.filters);
    if (!hasMounted.current) {
      window.history.replaceState({}, '', nextUrl);
      hasMounted.current = true;
      return;
    }
    window.history.pushState({}, '', nextUrl);
  }, [state.filters]);

  useEffect(() => {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.tasks));
  }, [state.tasks]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch({
        type: 'set-collaboration',
        payload: state.collaborationIndicators.map((indicator) => {
          const randomTask = state.tasks[Math.floor(Math.random() * state.tasks.length)];
          return {
            ...indicator,
            taskId: randomTask.id,
            mode: Math.random() > 0.65 ? 'editing' : 'viewing'
          };
        })
      });
    }, 2600);

    return () => window.clearInterval(interval);
  }, [state.collaborationIndicators, state.tasks]);

  const value = useMemo<TaskStoreValue>(
    () => ({
      ...state,
      setFilters: (filters) => dispatch({ type: 'set-filters', payload: filters }),
      clearFilters: () => dispatch({ type: 'clear-filters' }),
      setSortBy: (sortBy, sortOrder) => dispatch({ type: 'set-sort', payload: { sortBy, sortOrder } }),
      setView: (view) => dispatch({ type: 'set-view', payload: view }),
      setDraggedTaskId: (id) => dispatch({ type: 'set-dragged-task', payload: id }),
      setDragSourceStatus: (status) => dispatch({ type: 'set-drag-source-status', payload: status }),
      updateTask: (id, updates) => dispatch({ type: 'update-task', payload: { id, updates } })
    }),
    [state]
  );

  return <TaskStoreContext.Provider value={value}>{children}</TaskStoreContext.Provider>;
}

export function useTaskStore() {
  const context = useContext(TaskStoreContext);
  if (!context) throw new Error('useTaskStore must be used within TaskStoreProvider');
  return context;
}
