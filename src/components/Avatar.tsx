import { User } from '../types';

interface AvatarProps {
  initials: string;
  color: User['color'];
  size?: 'sm' | 'md';
  title?: string;
}

export function Avatar({ initials, color, size = 'md', title }: AvatarProps) {
  return (
    <span
      className={size === 'sm' ? 'avatar avatar-sm' : 'avatar'}
      style={{ backgroundColor: color }}
      title={title}
      aria-label={title ?? initials}
    >
      {initials}
    </span>
  );
}
