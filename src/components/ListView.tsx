import React, { useCallback, useRef, useState } from 'react';
import { Task, Status } from '../types';
import { filterTasks, formatDate, isTaskOverdue, sortTasks } from '../utils';
import { useTaskStore } from '../store';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { USERS } from '../seed';

interface ListViewProps {
  tasks: Task[];
}

const ROW_HEIGHT = 74;
const BUFFER_SIZE = 5;

export const ListView: React.FC<ListViewProps> = ({ tasks }) => {
  const {
    filters,
    sortBy,
    sortOrder,
    setSortBy,
    updateTask,
    collaborationIndicators,
    clearFilters
  } = useTaskStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 620;

  const filteredTasks = filterTasks(tasks, filters);
  const sortedTasks = sortTasks(filteredTasks, sortBy, sortOrder);
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
  const visibleEndIndex = Math.min(
    sortedTasks.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_SIZE
  );
  const visibleRows = sortedTasks.slice(visibleStartIndex, visibleEndIndex);

  const getCollaboratingUsers = (taskId: string) => {
    const indicators = collaborationIndicators.filter((ind) => ind.taskId === taskId);
    const userIds = [...new Set(indicators.map((ind) => ind.userId))];
    return USERS.filter((user) => userIds.includes(user.id));
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy, sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleStatusChange = (taskId: string, newStatus: Status) => {
    updateTask(taskId, { status: newStatus });
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="view-empty-state">
        <div className="empty-icon">0</div>
        <h3>No tasks match these filters</h3>
        <p>Clear the filters to bring the full task table back into view.</p>
        <button onClick={clearFilters} className="button button-primary">
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="list-shell">
      <div className="list-header-row">
        <div className="list-grid">
          <div>
            <button onClick={() => handleSort('title')} className={sortBy === 'title' ? 'sort-button active' : 'sort-button'}>
              Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          <div>
            <button onClick={() => handleSort('priority')} className={sortBy === 'priority' ? 'sort-button active' : 'sort-button'}>
              Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          <div>Status</div>
          <div>Assignee</div>
          <div>
            <button onClick={() => handleSort('due-date')} className={sortBy === 'due-date' ? 'sort-button active' : 'sort-button'}>
              Due Date {sortBy === 'due-date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          <div>Presence</div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="list-scroll-area"
        style={{ height: containerHeight }}
      >
        <div style={{ height: `${visibleStartIndex * ROW_HEIGHT}px` }} />

        {visibleRows.map((task) => {
          const assignee = USERS.find((u) => u.id === task.assigneeId);
          const isOverdue = isTaskOverdue(task);
          const collabUsers = getCollaboratingUsers(task.id);

          return (
            <div key={task.id} className="list-row" style={{ minHeight: `${ROW_HEIGHT}px` }}>
              <div className="list-grid">
                <div className="list-title-cell">
                  <strong>{task.title}</strong>
                  <span>{task.description}</span>
                </div>
                <div>
                  <Badge label={task.priority} priority={task.priority} />
                </div>
                <div>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as Status)}
                    className="status-select"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="in-review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="task-card-assignee">
                  {assignee && <Avatar initials={assignee.initials} color={assignee.color} size="sm" />}
                  <span>{task.assigneeName}</span>
                </div>
                <div className={isOverdue ? 'due-label due-overdue' : 'due-label'}>
                  {formatDate(task.dueDate)}
                </div>
                <div>
                  {collabUsers.length > 0 ? (
                    <div className="avatar-stack">
                      {collabUsers.slice(0, 2).map((user) => (
                        <Avatar
                          key={user.id}
                          initials={user.initials}
                          color={user.color}
                          size="sm"
                          title={user.name}
                        />
                      ))}
                      {collabUsers.length > 2 && <span className="stack-overflow">+{collabUsers.length - 2}</span>}
                    </div>
                  ) : (
                    <span className="muted">No viewers</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ height: `${Math.max(0, (sortedTasks.length - visibleEndIndex) * ROW_HEIGHT)}px` }} />
      </div>

      <div className="list-footer">
        Showing {visibleStartIndex + 1}-{Math.min(visibleEndIndex, sortedTasks.length)} of {sortedTasks.length} tasks
      </div>
    </div>
  );
};
