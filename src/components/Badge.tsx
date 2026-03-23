import { Priority } from '../types';
import { getPriorityClass } from '../utils';

interface BadgeProps {
  label: string;
  priority?: Priority;
}

export function Badge({ label, priority = 'medium' }: BadgeProps) {
  return <span className={`badge ${getPriorityClass(priority)}`}>{label}</span>;
}
