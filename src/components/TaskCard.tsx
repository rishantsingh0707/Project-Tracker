import React from 'react';
import { Task, User } from '../types';
import { formatDate, isTaskOverdue } from '../utils';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { USERS } from '../seed';

interface TaskCardProps {
  task: Task;
  onPointerDown: (e: React.PointerEvent, task: Task) => void;
  isDragging?: boolean;
  collaboratingUsers?: User[];
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPointerDown,
  isDragging = false,
  collaboratingUsers = []
}) => {
  const assignee = USERS.find((u) => u.id === task.assigneeId);
  const isOverdue = isTaskOverdue(task);

  return (
    <div
      onPointerDown={(e) => onPointerDown(e, task)}
      className={isDragging ? 'task-card task-card-hidden' : 'task-card'}
    >
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <Badge label={task.priority} priority={task.priority} />
      </div>

      <p className="task-card-description">{task.description}</p>

      <div className="task-card-footer">
        <div className="task-card-assignee">
          {assignee && <Avatar initials={assignee.initials} color={assignee.color} size="sm" />}
          <span>{assignee?.name}</span>
        </div>
        <span className={isOverdue ? 'due-label due-overdue' : 'due-label'}>
          {formatDate(task.dueDate)}
        </span>
      </div>

      {collaboratingUsers.length > 0 && (
        <div className="collaboration-strip">
          <div className="avatar-stack" aria-label="Other viewers">
            {collaboratingUsers.slice(0, 3).map((user) => (
              <Avatar
                key={user.id}
                initials={user.initials}
                color={user.color}
                size="sm"
                title={user.name}
              />
            ))}
          </div>
          {collaboratingUsers.length > 3 && (
            <span className="stack-overflow">+{collaboratingUsers.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};
