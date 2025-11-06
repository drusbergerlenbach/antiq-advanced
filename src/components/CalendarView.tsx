import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types';
import { ChevronLeft, ChevronRight, Plus, X, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';

type CalendarMode = 'day' | 'week' | 'month';

interface CalendarViewProps {
  tasks: Task[];
  categories: Array<{ id: string; name: string; color: string }>;
  onCreateTask: (taskData: { title: string; description: string; categoryId: string; dueAt: string; priority: string; isAllDay: boolean }) => Promise<void>;
  filterCategories: string[];
}

export function CalendarView({ tasks, categories, onCreateTask, filterCategories }: CalendarViewProps) {
  const navigate = useNavigate();
  const { calendarViewState, setCalendarViewState } = useStore();
  const [currentDate, setCurrentDate] = useState(calendarViewState?.date || new Date());
  const [mode, setMode] = useState<CalendarMode>(calendarViewState?.mode || 'week');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [newTaskTime, setNewTaskTime] = useState('12:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const calendarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setCalendarViewState({ mode, date: currentDate });
  }, [mode, currentDate, setCalendarViewState]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;

    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      e.preventDefault();
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unbekannt';
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (mode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (mode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (mode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (mode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setShowDatePicker(false);
  };

  const renderDatePicker = () => {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    const isToday = (date: Date) => {
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    const isSelected = (date: Date) => {
      return (
        date.getDate() === currentDate.getDate() &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    };

    return (
      <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 w-80">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <ChevronLeft className="w-5 h-5 text-antiq-blue" />
          </button>
          <div className="text-sm font-semibold text-antiq-blue">
            {new Date(year, month).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <ChevronRight className="w-5 h-5 text-antiq-blue" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((dayObj, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(dayObj.date)}
              className={`
                aspect-square p-1 text-sm rounded transition
                ${
                  dayObj.isCurrentMonth
                    ? 'text-gray-900 hover:bg-antiq-gray'
                    : 'text-gray-400 hover:bg-gray-50'
                }
                ${
                  isToday(dayObj.date)
                    ? 'bg-antiq-amber text-antiq-blue font-semibold'
                    : ''
                }
                ${
                  isSelected(dayObj.date) && !isToday(dayObj.date)
                    ? 'bg-antiq-blue text-white'
                    : ''
                }
              `}
            >
              {dayObj.day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const openCreateDialog = (date: Date, time?: string) => {
    setSelectedDate(date);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskCategory(categories[0]?.id || '');
    setNewTaskPriority('normal');
    setNewTaskTime(time || '12:00');
    setIsAllDay(false);
    setShowCreateDialog(true);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !selectedDate) return;

    setCreating(true);
    try {
      const dueDate = new Date(selectedDate);

      if (isAllDay) {
        dueDate.setHours(12, 0, 0, 0);
      } else {
        const [hours, minutes] = newTaskTime.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
      }

      await onCreateTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        categoryId: newTaskCategory,
        dueAt: dueDate.toISOString(),
        priority: newTaskPriority,
        isAllDay: isAllDay,
      });

      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setCreating(false);
    }
  };

  const getHeaderText = () => {
    const options: Intl.DateTimeFormatOptions =
      mode === 'month'
        ? { month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'long', year: 'numeric' };

    if (mode === 'week') {
      const start = getWeekStart(currentDate);
      return start.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    }

    return currentDate.toLocaleDateString('de-DE', options);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getTasksForDate = (date: Date) => {
    const filteredTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueAt);
      return isSameDay(taskDate, date);
    });

    const allDayTasks = filteredTasks.filter((task) => task.isAllDay);
    const timedTasks = filteredTasks.filter((task) => !task.isAllDay);

    timedTasks.sort((a, b) => {
      const timeA = new Date(a.dueAt).getTime();
      const timeB = new Date(b.dueAt).getTime();
      return timeA - timeB;
    });

    return [...allDayTasks, ...timedTasks];
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getTaskPosition = (task: Task) => {
    if (task.isAllDay) return null;
    const date = new Date(task.dueAt);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * 60 + minutes;
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    const allDayTasks = dayTasks.filter((task) => task.isAllDay);
    const timedTasks = dayTasks.filter((task) => !task.isAllDay);
    const timeSlots = generateTimeSlots();

    return (
      <div
        className="flex flex-col h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {allDayTasks.length > 0 && (
          <div className="px-4 py-2 border-b border-antiq-gray bg-gray-50">
            <div className="text-xs font-semibold text-gray-600 mb-2">Ganztägig</div>
            <div className="space-y-2">
              {allDayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCalendarViewState({ mode, date: currentDate });
                    navigate(`/task/${task.id}`);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-white rounded-lg shadow-sm border-l-4 p-3 cursor-pointer hover:bg-amber-50 transition-all"
                  style={{ borderLeftColor: getCategoryColor(task.categoryId) }}
                >
                  <div className="font-semibold text-antiq-blue text-sm">{task.title}</div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1"
                    style={{
                      backgroundColor: getCategoryColor(task.categoryId) + '20',
                      color: getCategoryColor(task.categoryId),
                    }}
                  >
                    {getCategoryName(task.categoryId)}
                  </span>
                  {task.description && (
                    <div className="text-xs text-gray-600 mt-1">{task.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <div className="w-16 flex-shrink-0 border-r border-antiq-gray">
              {timeSlots.map((time) => (
                <div key={time} className="h-16 border-b border-antiq-gray flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-gray-500">{time}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-16 border-b border-antiq-gray group relative"
                >
                  <button
                    onClick={() => openCreateDialog(currentDate, time)}
                    className="absolute top-1 right-1 p-1 bg-antiq-amber bg-opacity-20 hover:bg-opacity-40 rounded transition"
                  >
                    <Plus className="w-4 h-4 text-antiq-blue" />
                  </button>
                </div>
              ))}

              {timedTasks.map((task) => {
                const position = getTaskPosition(task);
                if (position === null) return null;
                const topPosition = (position / 60) * 64;

                return (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalendarViewState({ mode, date: currentDate });
                      navigate(`/task/${task.id}`);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                    }}
                    className="absolute left-1 right-1 bg-white rounded-lg shadow-sm border-l-4 p-2 cursor-pointer hover:bg-amber-50 hover:shadow-md transition-all z-10"
                    style={{
                      borderLeftColor: getCategoryColor(task.categoryId),
                      top: `${topPosition}px`,
                      minHeight: '56px',
                    }}
                  >
                    <div className="font-semibold text-antiq-blue text-sm">{task.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {new Date(task.dueAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: getCategoryColor(task.categoryId) + '20',
                          color: getCategoryColor(task.categoryId),
                        }}
                      >
                        {getCategoryName(task.categoryId)}
                      </span>
                    </div>
                    {task.description && (
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const timeSlots = generateTimeSlots();

    const maxAllDayTasks = Math.max(
      ...days.map((date) => getTasksForDate(date).filter((t) => t.isAllDay).length),
      0
    );

    return (
      <div
        className="flex flex-col h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex border-b border-antiq-gray">
          <div className="w-16 flex-shrink-0 border-r border-antiq-gray"></div>
          {days.map((date, index) => {
            const isToday = isSameDay(date, new Date());
            return (
              <div
                key={index}
                className={`flex-1 p-2 text-center border-r border-antiq-gray last:border-r-0 ${
                  isToday ? 'bg-amber-50' : ''
                }`}
              >
                <div className="text-xs text-gray-600">{weekdays[index]}</div>
                <div className={`text-sm font-semibold ${isToday ? 'text-antiq-amber' : 'text-antiq-blue'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {maxAllDayTasks > 0 && (
          <div className="flex border-b border-antiq-gray bg-gray-50">
            <div className="w-16 flex-shrink-0 border-r border-antiq-gray p-2">
              <span className="text-xs text-gray-500 writing-mode-vertical transform -rotate-180">Ganztägig</span>
            </div>
            {days.map((date, index) => {
              const allDayTasks = getTasksForDate(date).filter((t) => t.isAllDay);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={index}
                  className={`flex-1 p-1 border-r border-antiq-gray last:border-r-0 space-y-1 ${
                    isToday ? 'bg-amber-50 bg-opacity-50' : ''
                  }`}
                  style={{ minHeight: '60px' }}
                >
                  {allDayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setCalendarViewState({ mode, date: currentDate });
                        navigate(`/task/${task.id}`);
                      }}
                      className="p-1 rounded text-xs cursor-pointer hover:shadow-sm transition bg-white"
                      style={{
                        borderLeft: `3px solid ${getCategoryColor(task.categoryId)}`,
                      }}
                    >
                      <div className="font-medium text-antiq-blue truncate text-[10px]">{task.title}</div>
                      <div
                        className="text-[8px] font-medium truncate"
                        style={{
                          color: getCategoryColor(task.categoryId),
                        }}
                      >
                        {getCategoryName(task.categoryId)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <div className="w-16 flex-shrink-0 border-r border-antiq-gray">
              {timeSlots.map((time) => (
                <div key={time} className="h-16 border-b border-antiq-gray flex items-start justify-end pr-1 pt-1">
                  <span className="text-[10px] text-gray-500">{time}</span>
                </div>
              ))}
            </div>

            {days.map((date, index) => {
              const timedTasks = getTasksForDate(date).filter((t) => !t.isAllDay);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={index}
                  className={`flex-1 relative border-r border-antiq-gray last:border-r-0 ${
                    isToday ? 'bg-amber-50 bg-opacity-20' : ''
                  }`}
                >
                  {timeSlots.map((time) => (
                    <div key={time} className="h-16 border-b border-antiq-gray group relative">
                      <button
                        onClick={() => openCreateDialog(date, time)}
                        className="absolute top-1 right-1 p-1 bg-antiq-amber bg-opacity-20 hover:bg-opacity-40 rounded transition"
                      >
                        <Plus className="w-4 h-4 text-antiq-blue" />
                      </button>
                    </div>
                  ))}

                  {timedTasks.map((task) => {
                    const position = getTaskPosition(task);
                    if (position === null) return null;
                    const topPosition = (position / 60) * 64;

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setCalendarViewState({ mode, date: currentDate });
                          navigate(`/task/${task.id}`);
                        }}
                        className="absolute left-0.5 right-0.5 bg-white rounded shadow-sm p-1 cursor-pointer hover:shadow-md transition-all z-10"
                        style={{
                          borderLeft: `3px solid ${getCategoryColor(task.categoryId)}`,
                          top: `${topPosition}px`,
                          minHeight: '52px',
                        }}
                      >
                        <div className="font-medium text-antiq-blue text-[10px] truncate">{task.title}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-gray-500 text-[9px]">
                            {new Date(task.dueAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span
                            className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-medium truncate"
                            style={{
                              backgroundColor: getCategoryColor(task.categoryId) + '20',
                              color: getCategoryColor(task.categoryId),
                            }}
                          >
                            {getCategoryName(task.categoryId)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (startDay === 0 ? 6 : startDay - 1));

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    return (
      <div
        className="flex flex-col h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-7 border-b border-antiq-gray">
          {weekdays.map((day, index) => (
            <div key={index} className="p-2 text-center text-xs font-semibold text-gray-600 border-r border-antiq-gray last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === month;
              const isToday = isSameDay(date, new Date());
              const dayTasks = getTasksForDate(date);

              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-1 border-r border-b border-antiq-gray last:border-r-0 ${
                    !isCurrentMonth ? 'bg-gray-50' : ''
                  } ${isToday ? 'bg-amber-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-xs font-medium ${
                      isToday ? 'text-antiq-amber font-bold' : isCurrentMonth ? 'text-antiq-blue' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>
                    {isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateDialog(date);
                        }}
                        className="p-1 bg-antiq-amber bg-opacity-20 hover:bg-opacity-40 rounded transition"
                      >
                        <Plus className="w-4 h-4 text-antiq-blue" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setCalendarViewState({ mode, date: currentDate });
                          navigate(`/task/${task.id}`);
                        }}
                        className="px-1 py-0.5 rounded cursor-pointer"
                        style={{
                          backgroundColor: getCategoryColor(task.categoryId) + '30',
                        }}
                      >
                        <div className="text-[10px] font-medium text-antiq-blue truncate">{task.title}</div>
                        <div
                          className="text-[8px] font-medium truncate"
                          style={{
                            color: getCategoryColor(task.categoryId),
                          }}
                        >
                          {getCategoryName(task.categoryId)}
                        </div>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-[9px] text-gray-500 px-1">+{dayTasks.length - 3} mehr</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-antiq-blue">Neue Aufgabe</h3>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum
                </label>
                <input
                  type="text"
                  value={selectedDate?.toLocaleDateString('de-DE')}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="w-4 h-4 text-antiq-blue border-gray-300 rounded focus:ring-antiq-amber cursor-pointer"
                />
                <label htmlFor="allDay" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Ganztägig
                </label>
              </div>

              {!isAllDay && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uhrzeit
                  </label>
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Aufgabentitel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Beschreibung der Aufgabe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorität
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'normal' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antiq-amber focus:border-transparent"
                >
                  <option value="low">Niedrig</option>
                  <option value="normal">Normal</option>
                  <option value="high">Hoch</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim() || creating}
                  className="flex-1 px-4 py-2 bg-antiq-blue text-white rounded-lg hover:bg-opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Erstellen...' : 'Erstellen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-antiq-gray px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-antiq-gray rounded-lg transition"
              aria-label="Zurück"
            >
              <ChevronLeft className="w-5 h-5 text-antiq-blue" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-antiq-gray rounded-lg transition"
              aria-label="Vorwärts"
            >
              <ChevronRight className="w-5 h-5 text-antiq-blue" />
            </button>
            <div className="relative" ref={datePickerRef}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-antiq-gray rounded-lg transition ml-2"
              >
                <h2 className="text-lg font-semibold text-antiq-blue">{getHeaderText()}</h2>
                <Calendar className="w-4 h-4 text-antiq-blue" />
              </button>
              {showDatePicker && renderDatePicker()}
            </div>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-antiq-amber text-antiq-blue rounded-lg text-sm font-medium hover:bg-opacity-90 transition"
          >
            Heute
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('day')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'day'
                ? 'bg-antiq-blue text-white'
                : 'bg-antiq-gray text-antiq-blue hover:bg-opacity-80'
            }`}
          >
            Tag
          </button>
          <button
            onClick={() => setMode('week')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'week'
                ? 'bg-antiq-blue text-white'
                : 'bg-antiq-gray text-antiq-blue hover:bg-opacity-80'
            }`}
          >
            Woche
          </button>
          <button
            onClick={() => setMode('month')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'month'
                ? 'bg-antiq-blue text-white'
                : 'bg-antiq-gray text-antiq-blue hover:bg-opacity-80'
            }`}
          >
            Monat
          </button>
        </div>
      </div>

      {filterCategories.length > 0 && (
        <div className="bg-white border-b border-antiq-gray px-4 py-2">
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
        </div>
      )}

      <div ref={calendarRef} className="flex-1 overflow-hidden bg-gray-50">
        {mode === 'day' && renderDayView()}
        {mode === 'week' && renderWeekView()}
        {mode === 'month' && renderMonthView()}
      </div>
    </div>
  );
}
