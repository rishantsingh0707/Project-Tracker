export type Status = 'todo' | 'in-progress' | 'in-review' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ViewMode = 'kanban' | 'list' | 'timeline';
export type SortBy = 'title' | 'priority' | 'due-date';
export type SortOrder = 'asc' | 'desc';
export type CollaborationMode = 'viewing' | 'editing';

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  priority: Priority;
  status: Status;
  startDate?: string;
  dueDate: string;
}

export interface FilterState {
  statuses: Status[];
  priorities: Priority[];
  assigneeIds: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface CollaborationIndicator {
  userId: string;
  taskId: string;
  mode: CollaborationMode;
}
