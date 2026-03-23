import { FilterState, Priority, SortBy, SortOrder, Status, Task } from './types';

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

export function startOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function getDaysDifference(dateString: string) {
  const target = new Date(`${dateString}T00:00:00`);
  const diff = target.getTime() - startOfToday().getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function getDueDateLabel(dateString: string) {
  const diff = getDaysDifference(dateString);
  if (diff === 0) return 'Due Today';
  if (diff < -7) return `${Math.abs(diff)} days overdue`;
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatDate(dateString: string) {
  return getDueDateLabel(dateString);
}

export function isTaskOverdue(task: Task) {
  return getDaysDifference(task.dueDate) < 0;
}

export function filterTasks(tasks: Task[], filters: FilterState) {
  return tasks.filter((task) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;
    if (filters.assigneeIds.length > 0 && !filters.assigneeIds.includes(task.assigneeId)) return false;
    if (filters.dueDateFrom && task.dueDate < filters.dueDateFrom) return false;
    if (filters.dueDateTo && task.dueDate > filters.dueDateTo) return false;
    return true;
  });
}

export function getTasksForStatus(tasks: Task[], status: Status) {
  return tasks.filter((task) => task.status === status);
}

export function sortTasks(tasks: Task[], sortBy: SortBy, sortOrder: SortOrder) {
  const direction = sortOrder === 'asc' ? 1 : -1;
  return [...tasks].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title) * direction;
    if (sortBy === 'priority') return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * direction;
    return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * direction;
  });
}

export function getPriorityClass(priority: Priority) {
  switch (priority) {
    case 'critical':
      return 'priority-critical';
    case 'high':
      return 'priority-high';
    case 'medium':
      return 'priority-medium';
    case 'low':
      return 'priority-low';
  }
}
