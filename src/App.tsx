import { FilterBar } from './components/FilterBar';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { PresenceBar } from './components/PresenceBar';
import { TimelineView } from './components/TimelineView';
import { TaskStoreProvider, useTaskStore } from './store';

function TrackerShell() {
  const { tasks, view, setView } = useTaskStore();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Multi-view project tracker</p>
          <h1>Velozity Workspace</h1>
          <p className="topbar-copy">
            One shared dataset across Kanban, list, and timeline views with live presence.
          </p>
        </div>

        <div className="view-switcher" aria-label="Choose tracker view">
          <button
            className={view === 'kanban' ? 'view-tab active' : 'view-tab'}
            onClick={() => setView('kanban')}
          >
            Kanban
          </button>
          <button
            className={view === 'list' ? 'view-tab active' : 'view-tab'}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            className={view === 'timeline' ? 'view-tab active' : 'view-tab'}
            onClick={() => setView('timeline')}
          >
            Timeline
          </button>
        </div>
      </header>

      <PresenceBar />
      <FilterBar />

      <main className="content-panel">
        {view === 'kanban' && <KanbanView tasks={tasks} />}
        {view === 'list' && <ListView tasks={tasks} />}
        {view === 'timeline' && <TimelineView tasks={tasks} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TaskStoreProvider>
      <TrackerShell />
    </TaskStoreProvider>
  );
}
