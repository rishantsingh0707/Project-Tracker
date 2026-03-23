import React from 'react';
import { Task } from '../types';
import { filterTasks } from '../utils';
import { useTaskStore } from '../store';
import { Avatar } from './Avatar';
import { USERS } from '../seed';

interface TimelineViewProps {
  tasks: Task[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks }) => {
  const { filters, collaborationIndicators } = useTaskStore();
  const filteredTasks = filterTasks(tasks, filters);

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const allDates = filteredTasks.flatMap((task) => {
    const dates = [new Date(`${task.dueDate}T00:00:00`)];
    if (task.startDate) dates.push(new Date(`${task.startDate}T00:00:00`));
    return dates;
  });

  const earliestTaskDate = allDates.length ? new Date(Math.min(...allDates.map((d) => d.getTime()))) : monthStart;
  const latestTaskDate = allDates.length ? new Date(Math.max(...allDates.map((d) => d.getTime()))) : monthEnd;
  const minDate = new Date(Math.min(monthStart.getTime(), earliestTaskDate.getTime()));
  const maxDate = new Date(Math.max(monthEnd.getTime(), latestTaskDate.getTime()));

  if (maxDate.getTime() - minDate.getTime() < 30 * 24 * 60 * 60 * 1000) {
    maxDate.setDate(maxDate.getDate() + 30);
  }

  const dayCount = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const pixelsPerDay = 40;
  const totalWidth = dayCount * pixelsPerDay;

  const getCollaboratingUsers = (taskId: string) => {
    const indicators = collaborationIndicators.filter((ind) => ind.taskId === taskId);
    const userIds = [...new Set(indicators.map((ind) => ind.userId))];
    return USERS.filter((user) => userIds.includes(user.id));
  };

  const getTaskPosition = (dateString: string) => {
    const taskDate = new Date(`${dateString}T00:00:00`);
    const daysFromStart = Math.floor((taskDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysFromStart * pixelsPerDay;
  };

  const getTaskWidth = (task: Task) => {
    if (!task.startDate) return 14;
    const startDate = new Date(`${task.startDate}T00:00:00`);
    const endDate = new Date(`${task.dueDate}T00:00:00`);
    endDate.setDate(endDate.getDate() + 1);
    const daysSpan = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(daysSpan * pixelsPerDay, 14);
  };

  const getTodayPosition = () => {
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysFromStart = Math.floor((todayDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysFromStart * pixelsPerDay;
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="view-empty-state">
        <div className="empty-icon">T</div>
        <h3>No tasks to display</h3>
        <p>Try a wider filter range to populate the timeline again.</p>
      </div>
    );
  }

  const todayPosition = getTodayPosition();

  return (
    <div className="timeline-shell">
      <div className="timeline-header">
        <div style={{ width: `${totalWidth}px`, minWidth: '100%' }}>
          <div className="timeline-row">
            <div className="timeline-task-col timeline-heading">Task</div>
            <div className="timeline-days">
              {Array.from({ length: dayCount }).map((_, i) => {
                const date = new Date(minDate);
                date.setDate(date.getDate() + i);
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();

                return (
                  <div key={i} style={{ width: `${pixelsPerDay}px` }} className={isToday ? 'timeline-day timeline-day-today' : 'timeline-day'}>
                    {i % 4 === 0 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="timeline-scroll">
        <div style={{ width: `${totalWidth}px`, minWidth: '100%' }} className="relative">
          <div
            style={{
              left: `${todayPosition + 224}px`,
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#ef4444',
              zIndex: 10
            }}
          />

          <div className="timeline-body">
            {filteredTasks.map((task) => {
              const startDate = task.startDate || task.dueDate;
              const position = getTaskPosition(startDate);
              const width = getTaskWidth(task);
              const collabUsers = getCollaboratingUsers(task.id);

              const priorityColors: Record<string, string> = {
                critical: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500'
              };

              return (
                <div key={task.id} className="timeline-task-row">
                  <div className="timeline-task-col">
                    <strong>{task.title}</strong>
                    <span>{task.assigneeName}</span>
                  </div>
                  <div className="timeline-track">
                    <div
                      style={{ left: `${position}px`, width: `${width}px` }}
                      className={`timeline-bar ${priorityColors[task.priority]}`}
                      title={task.title}
                    >
                      <span>{task.title}</span>
                    </div>

                    {collabUsers.length > 0 && (
                      <div className="timeline-collab">
                        {collabUsers.slice(0, 3).map((user) => (
                          <Avatar
                            key={user.id}
                            initials={user.initials}
                            color={user.color}
                            size="sm"
                            title={user.name}
                          />
                        ))}
                        {collabUsers.length > 3 && <span className="stack-overflow">+{collabUsers.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
