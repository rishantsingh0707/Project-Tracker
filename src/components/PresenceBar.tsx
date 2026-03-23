import { USERS } from '../seed';
import { useTaskStore } from '../store';
import { Avatar } from './Avatar';

export function PresenceBar() {
  const { collaborationIndicators } = useTaskStore();
  const activeUsers = USERS.filter((user) =>
    collaborationIndicators.some((indicator) => indicator.userId === user.id)
  );

  return (
    <section className="presence-bar">
      <div className="presence-copy">
        <strong>{activeUsers.length} people are viewing this board</strong>
        <span>Simulated presence updates every few seconds.</span>
      </div>
      <div className="presence-avatars">
        {activeUsers.map((user) => (
          <Avatar key={user.id} initials={user.initials} color={user.color} title={user.name} />
        ))}
      </div>
    </section>
  );
}
