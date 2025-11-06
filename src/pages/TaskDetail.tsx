import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Task, Interval } from '../types';
import { formatDateTime, formatFileSize } from '../utils/dateFormat';
import { ArrowLeft, Trash2, Upload, MessageSquare, Paperclip, Send } from 'lucide-react';

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    categories,
    user,
    fetchTask,
    updateTask,
    createTask,
    deleteTask,
    addComment,
    addAttachment,
    deleteAttachment,
  } = useStore();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    dueAt: '',
    assignee: '',
    intervalType: 'none' as Interval['type'],
    intervalMode: 'relative' as Interval['mode'],
  });
  const [isAllDay, setIsAllDay] = useState(false);
  const [isUntimed, setIsUntimed] = useState(false);

  const isNew = id === 'new';

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      const now = new Date();
      setFormData({
        title: '',
        description: '',
        categoryId: categories[0]?.id || '',
        dueAt: now.toISOString().slice(0, 16),
        assignee: '',
        intervalType: 'none',
        intervalMode: 'relative',
      });
      setIsAllDay(false);
      setIsUntimed(true);
    } else if (id) {
      loadTask(id);
    }
  }, [id, categories]);

  const loadTask = async (taskId: string) => {
    setLoading(true);
    try {
      const data = await fetchTask(taskId);
      setTask(data);

      if (data.dueAt) {
        const dueDate = new Date(data.dueAt);
        const year = dueDate.getFullYear();
        const month = String(dueDate.getMonth() + 1).padStart(2, '0');
        const day = String(dueDate.getDate()).padStart(2, '0');
        const hours = String(dueDate.getHours()).padStart(2, '0');
        const minutes = String(dueDate.getMinutes()).padStart(2, '0');
        const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;

        setFormData({
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          dueAt: localDateTimeString,
          assignee: data.assignee || '',
          intervalType: data.interval.type,
          intervalMode: data.interval.mode,
        });
        setIsAllDay(data.isAllDay || false);
        setIsUntimed(false);
      } else {
        const now = new Date();
        setFormData({
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          dueAt: now.toISOString().slice(0, 16),
          assignee: data.assignee || '',
          intervalType: data.interval.type,
          intervalMode: data.interval.mode,
        });
        setIsAllDay(false);
        setIsUntimed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const taskData = {
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      dueAt: isUntimed ? null : new Date(formData.dueAt).toISOString(),
      status: 'open' as const,
      priority: 'normal' as const,
      assignee: formData.assignee || undefined,
      interval: {
        type: formData.intervalType,
        mode: formData.intervalMode,
      },
      isAllDay: isAllDay,
    };

    if (isNew) {
      await createTask({
        ...taskData,
        attachments: [],
        comments: [],
      } as any);
      navigate(-1);
    } else if (id) {
      await updateTask(id, taskData);
      await loadTask(id);
    }
  };

  const handleDelete = async () => {
    if (!id || isNew) return;
    if (!window.confirm('Aufgabe wirklich löschen?')) return;

    await deleteTask(id);
    navigate(-1);
  };

  const handleAddComment = async () => {
    if (!id || isNew || !commentText.trim()) return;

    await addComment(id, commentText.trim());
    setCommentText('');
    await loadTask(id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || isNew) return;
    const file = e.target.files?.[0];
    if (!file) return;

    await addAttachment(id, { name: file.name, size: file.size });
    await loadTask(id);
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id || isNew) return;
    if (!window.confirm('Anhang wirklich löschen?')) return;

    await deleteAttachment(id, attachmentId);
    await loadTask(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-antiq-gray px-4 py-4 flex items-center justify-between shadow-soft">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-antiq-gray rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-antiq-blue" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-antiq-blue text-white rounded-lg hover:bg-opacity-90 transition font-medium"
          >
            Speichern
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl mx-auto w-full space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Projektbericht fertigstellen"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Finaler Bericht für Q4 Projekt erstellen und an Team senden"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900 appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                }}
              >
                {categories
                  .filter((c) => c.active)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Fällig am</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Zeitgesteuert</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUntimed(!isUntimed);
                      if (!isUntimed) {
                        setIsAllDay(false);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-antiq-amber focus:ring-offset-2 ${
                      !isUntimed ? 'bg-antiq-blue' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        !isUntimed ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  type={isAllDay ? "date" : "datetime-local"}
                  value={isAllDay ? formData.dueAt.slice(0, 10) : formData.dueAt}
                  onChange={(e) => {
                    if (isAllDay) {
                      const dateValue = e.target.value;
                      setFormData({ ...formData, dueAt: `${dateValue}T12:00` });
                    } else {
                      setFormData({ ...formData, dueAt: e.target.value });
                    }
                  }}
                  disabled={isUntimed}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                />
                {!isUntimed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allDayDetail"
                      checked={isAllDay}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsAllDay(checked);
                        if (checked) {
                          const dateOnly = formData.dueAt.slice(0, 10);
                          setFormData({ ...formData, dueAt: `${dateOnly}T12:00` });
                        }
                      }}
                      className="w-4 h-4 text-antiq-blue border-gray-300 rounded focus:ring-antiq-amber cursor-pointer"
                    />
                    <label htmlFor="allDayDetail" className="text-sm text-gray-700 cursor-pointer">
                      Ganztägig
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zugewiesen an</label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Team Lead"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Wiederholung</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intervall</label>
              <select
                value={formData.intervalType}
                onChange={(e) => setFormData({ ...formData, intervalType: e.target.value as Interval['type'] })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900 appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                }}
              >
                <option value="none">Keine</option>
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
                <option value="yearly">Jährlich</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modus</label>
              <select
                value={formData.intervalMode}
                onChange={(e) => setFormData({ ...formData, intervalMode: e.target.value as Interval['mode'] })}
                disabled={formData.intervalType === 'none'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900 appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-500"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                }}
              >
                <option value="relative">Relativ</option>
                <option value="absolute">Absolut</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-gray-600" />
              Anhänge ({task?.attachments.length || 0})
            </h3>
            {!isNew && (
              <label className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 cursor-pointer transition font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Hochladen
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {isNew ? (
            <p className="text-gray-500 text-sm">Anhänge können nach dem Erstellen der Aufgabe hinzugefügt werden</p>
          ) : task?.attachments.length === 0 ? (
            <p className="text-gray-500 text-sm">Keine Anhänge vorhanden</p>
          ) : (
            <div className="space-y-2">
              {task?.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{att.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            Kommentare ({task?.comments.length || 0})
          </h3>

          {!isNew && task && task.comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {task.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })} {new Date(comment.createdAt).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
          )}

          {isNew ? (
            <p className="text-gray-500 text-sm">Kommentare können nach dem Erstellen der Aufgabe hinzugefügt werden</p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Kommentar hinzufügen..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent text-gray-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Senden
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
