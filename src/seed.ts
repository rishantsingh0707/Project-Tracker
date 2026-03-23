import { Priority, Status, Task, User } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Ava Patel', initials: 'AP', color: '#fb7185' },
  { id: 'u2', name: 'Noah Kim', initials: 'NK', color: '#60a5fa' },
  { id: 'u3', name: 'Sara Ali', initials: 'SA', color: '#34d399' },
  { id: 'u4', name: 'Liam Ross', initials: 'LR', color: '#f59e0b' },
  { id: 'u5', name: 'Mia Chen', initials: 'MC', color: '#a78bfa' },
  { id: 'u6', name: 'Owen Diaz', initials: 'OD', color: '#f97316' }
];

const TITLE_PARTS_A = ['Launch', 'Optimize', 'Refactor', 'Design', 'Audit', 'Ship', 'Review', 'Scale', 'Polish', 'Document'];
const TITLE_PARTS_B = ['reporting dashboard', 'client onboarding flow', 'billing engine', 'mobile handoff', 'retention campaign', 'release checklist', 'QA matrix', 'access controls', 'design tokens', 'API integration'];
const DESCRIPTORS = [
  'Coordinate cross-team dependencies and keep the execution path visible.',
  'Reduce friction in the current workflow and tighten the handoff quality.',
  'Validate scope, resolve edge cases, and prepare for stakeholder review.',
  'Keep progress transparent while preserving a clean delivery cadence.',
  'Surface risks early and unblock the next milestone before it stalls.'
];

const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function formatISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function generateTasks(count = 520): Task[] {
  const today = new Date();

  return Array.from({ length: count }, (_, index) => {
    const assignee = randomItem(USERS);
    const priority = randomItem(PRIORITIES);
    const status = randomItem(STATUSES);
    const dueOffset = randomInt(-18, 28);
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + dueOffset);

    const shouldOmitStartDate = Math.random() < 0.18;
    const startDate = new Date(dueDate);
    startDate.setDate(dueDate.getDate() - randomInt(0, 8));

    return {
      id: `task-${index + 1}`,
      title: `${randomItem(TITLE_PARTS_A)} ${randomItem(TITLE_PARTS_B)}`,
      description: randomItem(DESCRIPTORS),
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      priority,
      status,
      startDate: shouldOmitStartDate ? undefined : formatISODate(startDate),
      dueDate: formatISODate(dueDate)
    };
  });
}
