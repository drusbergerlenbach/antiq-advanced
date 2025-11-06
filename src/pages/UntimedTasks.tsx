import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Task } from '../types';
import { Search, Filter, CheckCircle2, Clock, Plus } from 'lucide-react';
import { CategoryPanel } from '../components/CategoryPanel';
import { Logo } from '../components/Logo';
import { SnoozeDialog } from '../components/SnoozeDialog';

export function UntimedTasks() {
  const navigate = useNavigate();
  const [snoozeDialogOpen, setSnoozeDialogOpen] = useState(false);
  const [snoozeTaskId, setSnoozeTaskId] = useState<string | null>(null);

  const {
    tasks,
    categories,
    filterCategories,
    searchQuery,
    setSearchQuery,
    fetchTasks,
    updateTask,
    snoozeTask,
    toggleCategoryPanel,
  } = useStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.dueAt !== null) return false;

      if (filterCategories.length > 0 && !filterCategories.includes(task.categoryId)) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [tasks, filterCategories, searchQuery]);

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unbekannt';
  };

  const handleMarkDone = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await updateTask(taskId, { status: task.status === 'completed' ? 'open' : 'completed' });
    }
  };

  const handleOpenSnoozeDialog = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setSnoozeTaskId(taskId);
    setSnoozeDialogOpen(true);
  };

  const handleSnooze = async (days: number) => {
    if (snoozeTaskId) {
      await snoozeTask(snoozeTaskId, days);
      setSnoozeDialogOpen(false);
      setSnoozeTaskId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-antiq-gray px-4 py-4 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-2xl font-bold text-antiq-blue">Anti<span className="text-antiq-amber">Q</span></h1>
              <p className="text-xs text-gray-600">Organize with intelligence.</p>
            </div>
          </div>
          <button
            onClick={toggleCategoryPanel}
            className="px-4 py-2 bg-antiq-amber text-antiq-blue rounded-lg font-medium hover:bg-opacity-90 transition flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Kategorien</span>
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Aufgaben suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent"
            />
          </div>

          {filterCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Kategorien:</span>
              {filterCategories.map((catId) => {
                const cat = categories.find((c) => c.id === catId);
                if (!cat) return null;
                return (
                  <span
                    key={catId}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: cat.color + '20',
                      color: cat.color,
                    }}
                  >
                    {cat.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Keine zeitlosen Aufgaben gefunden</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categoryColor={getCategoryColor(task.categoryId)}
                categoryName={getCategoryName(task.categoryId)}
                onMarkDone={handleMarkDone}
                onOpenSnooze={handleOpenSnoozeDialog}
                onClick={() => navigate(`/task/${task.id}`)}
              />
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => navigate('/task/new')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-antiq-amber text-antiq-blue rounded-full shadow-soft-lg flex items-center justify-center hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-antiq-amber focus:ring-opacity-30 transition"
      >
        <Plus className="w-6 h-6" />
      </button>

      <CategoryPanel />

      <SnoozeDialog
        isOpen={snoozeDialogOpen}
        onClose={() => setSnoozeDialogOpen(false)}
        onSnooze={handleSnooze}
        onSnoozeUntil={() => {}}
      />
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  categoryColor: string;
  categoryName: string;
  onMarkDone: (e: React.MouseEvent, taskId: string) => void;
  onOpenSnooze: (e: React.MouseEvent, taskId: string) => void;
  onClick: () => void;
}

function TaskCard({ task, categoryColor, categoryName, onMarkDone, onOpenSnooze, onClick }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-soft border-l-4 p-4 hover:bg-amber-50 hover:shadow-[0_0_6px_rgba(0,0,0,0.1)] transition-all duration-200 cursor-pointer relative"
      style={{ borderLeftColor: categoryColor }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-antiq-blue mb-1">{task.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: categoryColor + '20',
            color: categoryColor,
          }}
        >
          {categoryName}
        </span>
        {task.status === 'snoozed' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Verschoben
          </span>
        )}
        {task.status === 'completed' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Erledigt
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => onMarkDone(e, task.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            task.status === 'completed'
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {task.status === 'completed' ? 'Erledigt' : 'Erledigen'}
        </button>
        {task.status !== 'completed' && (
          <button
            onClick={(e) => onOpenSnooze(e, task.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            Verschieben
          </button>
        )}
      </div>
    </div>
  );
}
