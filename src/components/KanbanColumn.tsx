import React from 'react';
import { Task, Status, User } from '../types';
import { getTasksForStatus } from '../utils';
import { useTaskStore } from '../store';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: Status;
  label: string;
  tasks: Task[];
  getCollaboratingUsers: (taskId: string) => User[];
  onTaskPointerDown: (e: React.PointerEvent, task: Task) => void;
  onColumnPointerEnter: (status: Status) => void;
  onColumnPointerLeave: () => void;
  isDragOverColumn?: boolean;
  placeholderHeight?: number;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  label,
  tasks,
  getCollaboratingUsers,
  onTaskPointerDown,
  onColumnPointerEnter,
  onColumnPointerLeave,
  isDragOverColumn = false,
  placeholderHeight = 96
}) => {
  const { draggedTaskId, dragSourceStatus } = useTaskStore();
  const columnTasks = getTasksForStatus(tasks, status);
  const isSourceColumn = dragSourceStatus === status;
  const showEmptyState = columnTasks.length === 0 && !(draggedTaskId && isSourceColumn);

  return (
    <div
      onPointerEnter={() => onColumnPointerEnter(status)}
      onPointerLeave={onColumnPointerLeave}
      className={isDragOverColumn ? 'kanban-column kanban-column-active' : 'kanban-column'}
    >
      <div className="kanban-column-header">
        <h3>{label}</h3>
        <span className="count-pill">{columnTasks.length}</span>
      </div>

      <div className="kanban-scroller">
        {showEmptyState ? (
          <div className="empty-state">
            <div className="empty-icon">+</div>
            <p>No tasks in {label.toLowerCase()}</p>
            <span>Drag a card here or change a task status from the list.</span>
          </div>
        ) : (
          columnTasks.map((task) => (
            <React.Fragment key={task.id}>
              {draggedTaskId === task.id && isSourceColumn ? (
                <div className="drag-placeholder" style={{ height: placeholderHeight }} />
              ) : (
                <TaskCard
                  task={task}
                  onPointerDown={onTaskPointerDown}
                  isDragging={draggedTaskId === task.id}
                  collaboratingUsers={getCollaboratingUsers(task.id)}
                />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};
