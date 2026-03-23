import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Task, Status, User } from '../types';
import { filterTasks } from '../utils';
import { useTaskStore } from '../store';
import { KanbanColumn } from './KanbanColumn';
import { USERS } from '../seed';
import { Badge } from './Badge';
import { Avatar } from './Avatar';

interface KanbanViewProps {
  tasks: Task[];
}

const STATUSES: Array<{ id: Status; label: string }> = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'in-review', label: 'In Review' },
  { id: 'done', label: 'Done' }
];

export const KanbanView: React.FC<KanbanViewProps> = ({ tasks }) => {
  const {
    filters,
    updateTask,
    setDraggedTaskId,
    dragSourceStatus,
    setDragSourceStatus,
    collaborationIndicators
  } = useTaskStore();

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragPlaceholderHeight, setDragPlaceholderHeight] = useState<number>(96);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [isSnappingBack, setIsSnappingBack] = useState(false);
  const columnRefs = useRef<Record<Status, HTMLDivElement | null>>({
    todo: null,
    'in-progress': null,
    'in-review': null,
    done: null
  });

  const getCollaboratingUsers = (taskId: string): User[] => {
    const indicators = collaborationIndicators.filter((ind) => ind.taskId === taskId);
    const userIds = [...new Set(indicators.map((ind) => ind.userId))];
    return USERS.filter((user) => userIds.includes(user.id));
  };

  useEffect(() => {
    return () => {
      setDraggedTaskId(null);
      setDragSourceStatus(null);
    };
  }, [setDragSourceStatus, setDraggedTaskId]);

  const getColumnUnderPointer = (x: number, y: number): Status | null => {
    const entries = Object.entries(columnRefs.current) as Array<[Status, HTMLDivElement | null]>;
    for (const [status, ref] of entries) {
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return status;
      }
    }
    return null;
  };

  const resetDragState = () => {
    setDraggedTask(null);
    setDragPosition(null);
    setDraggedTaskId(null);
    setDragSourceStatus(null);
    setDragOverStatus(null);
    setIsSnappingBack(false);
  };

  const handlePointerDown = (e: React.PointerEvent, task: Task) => {
    if ((e.target as HTMLElement).closest('button, select, input')) return;

    const cardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragPlaceholderHeight(cardRect.height);
    setOriginRect(cardRect);
    setDragOffset({ x: e.clientX - cardRect.left, y: e.clientY - cardRect.top });
    setDraggedTask(task);
    setDraggedTaskId(task.id);
    setDragSourceStatus(task.status);
    setDragPosition({ x: e.clientX, y: e.clientY });
    setDragOverStatus(task.status);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    const handlePointerMove = (event: PointerEvent) => {
      setDragPosition({ x: event.clientX, y: event.clientY });
      setDragOverStatus(getColumnUnderPointer(event.clientX, event.clientY));
    };

    const handlePointerUp = (event: PointerEvent) => {
      const targetStatus = getColumnUnderPointer(event.clientX, event.clientY);
      if (targetStatus && targetStatus !== task.status) {
        updateTask(task.id, { status: targetStatus });
      }

      if (!targetStatus && originRect) {
        setIsSnappingBack(true);
        setDragPosition({
          x: originRect.left + dragOffset.x,
          y: originRect.top + dragOffset.y
        });
        window.setTimeout(resetDragState, 200);
      } else {
        resetDragState();
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="kanban-view">
      <div className="kanban-grid">
        {STATUSES.map((status) => (
          <div
            key={status.id}
            ref={(el) => {
              columnRefs.current[status.id] = el;
            }}
          >
            <KanbanColumn
              status={status.id}
              label={status.label}
              tasks={filteredTasks}
              getCollaboratingUsers={getCollaboratingUsers}
              onTaskPointerDown={handlePointerDown}
              onColumnPointerEnter={(nextStatus) => setDragOverStatus(nextStatus)}
              onColumnPointerLeave={() => setDragOverStatus(null)}
              isDragOverColumn={dragOverStatus === status.id}
              placeholderHeight={dragPlaceholderHeight}
            />
          </div>
        ))}
      </div>

      {draggedTask && dragPosition && (
        <div className="drag-layer">
          <div
            className="drag-ghost"
            style={{
              top: dragPosition.y - dragOffset.y,
              left: dragPosition.x - dragOffset.x,
              width: originRect?.width,
              transition: isSnappingBack ? 'top 0.18s ease, left 0.18s ease' : 'none'
            }}
          >
            <KanbanGhost task={draggedTask} />
          </div>
        </div>
      )}
    </div>
  );
};

const KanbanGhost: React.FC<{ task: Task }> = ({ task }) => {
  const assignee = USERS.find((u) => u.id === task.assigneeId);

  return (
    <div className="task-card task-card-ghost">
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <Badge label={task.priority} priority={task.priority} />
      </div>
      <p className="task-card-description">{task.description}</p>
      <div className="task-card-assignee">
        {assignee && (
          <>
            <Avatar initials={assignee.initials} color={assignee.color} size="sm" />
            <span>{assignee.name}</span>
          </>
        )}
      </div>
    </div>
  );
};
