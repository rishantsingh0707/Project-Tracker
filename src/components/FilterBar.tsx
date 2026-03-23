import React, { useEffect, useRef, useState } from 'react';
import { Priority, Status } from '../types';
import { useTaskStore } from '../store';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { DateInput } from './DateInput';
import { USERS } from '../seed';

export const FilterBar: React.FC = () => {
  const { filters, setFilters, clearFilters } = useTaskStore();
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assigneeIds.length > 0 ||
    Boolean(filters.dueDateFrom) ||
    Boolean(filters.dueDateTo);

  const handleStatusToggle = (status: Status) => {
    setFilters({
      ...filters,
      statuses: filters.statuses.includes(status)
        ? filters.statuses.filter((s) => s !== status)
        : [...filters.statuses, status]
    });
  };

  const handlePriorityToggle = (priority: Priority) => {
    setFilters({
      ...filters,
      priorities: filters.priorities.includes(priority)
        ? filters.priorities.filter((p) => p !== priority)
        : [...filters.priorities, priority]
    });
  };

  const handleAssigneeToggle = (assigneeId: string) => {
    setFilters({
      ...filters,
      assigneeIds: filters.assigneeIds.includes(assigneeId)
        ? filters.assigneeIds.filter((id) => id !== assigneeId)
        : [...filters.assigneeIds, assigneeId]
    });
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    setFilters({
      ...filters,
      dueDateFrom: type === 'from' ? value || undefined : filters.dueDateFrom,
      dueDateTo: type === 'to' ? value || undefined : filters.dueDateTo
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="filter-shell">
      <div className="filter-row">
        <div className="filter-cluster">
          <div className="filter-dropdown">
            <Button
              variant={openFilter === 'status' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
            >
              Status {filters.statuses.length > 0 && `(${filters.statuses.length})`}
            </Button>
            {openFilter === 'status' && (
              <div className="dropdown-panel">
                {(['todo', 'in-progress', 'in-review', 'done'] as Status[]).map((status) => (
                  <Checkbox
                    key={status}
                    label={status === 'todo' ? 'To Do' : status === 'in-progress' ? 'In Progress' : status === 'in-review' ? 'In Review' : 'Done'}
                    checked={filters.statuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="filter-dropdown">
            <Button
              variant={openFilter === 'priority' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setOpenFilter(openFilter === 'priority' ? null : 'priority')}
            >
              Priority {filters.priorities.length > 0 && `(${filters.priorities.length})`}
            </Button>
            {openFilter === 'priority' && (
              <div className="dropdown-panel">
                {(['critical', 'high', 'medium', 'low'] as Priority[]).map((priority) => (
                  <Checkbox
                    key={priority}
                    label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                    checked={filters.priorities.includes(priority)}
                    onChange={() => handlePriorityToggle(priority)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="filter-dropdown">
            <Button
              variant={openFilter === 'assignee' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setOpenFilter(openFilter === 'assignee' ? null : 'assignee')}
            >
              Assignee {filters.assigneeIds.length > 0 && `(${filters.assigneeIds.length})`}
            </Button>
            {openFilter === 'assignee' && (
              <div className="dropdown-panel dropdown-scroll">
                {USERS.map((user) => (
                  <Checkbox
                    key={user.id}
                    label={user.name}
                    checked={filters.assigneeIds.includes(user.id)}
                    onChange={() => handleAssigneeToggle(user.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="filter-dropdown">
            <Button
              variant={openFilter === 'date' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setOpenFilter(openFilter === 'date' ? null : 'date')}
            >
              Due Date {(filters.dueDateFrom || filters.dueDateTo) && '(active)'}
            </Button>
            {openFilter === 'date' && (
              <div className="dropdown-panel date-panel">
                <DateInput
                  label="From"
                  value={filters.dueDateFrom || ''}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <DateInput
                  label="To"
                  value={filters.dueDateTo || ''}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  className="mt-3"
                />
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <Button variant="danger" size="sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="filter-summary">
            <span className="filter-summary-label">Active filters:</span>
            {filters.statuses.length > 0 && (
              <span className="summary-pill">
                Status: {filters.statuses.map((s) => s.toUpperCase()).join(', ')}
              </span>
            )}
            {filters.priorities.length > 0 && (
              <span className="summary-pill">
                Priority: {filters.priorities.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
              </span>
            )}
            {filters.assigneeIds.length > 0 && (
              <span className="summary-pill">Assignees: {filters.assigneeIds.length} selected</span>
            )}
            {(filters.dueDateFrom || filters.dueDateTo) && (
              <span className="summary-pill">
                Due Date: {filters.dueDateFrom && `from ${filters.dueDateFrom}`} {filters.dueDateTo && `to ${filters.dueDateTo}`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
