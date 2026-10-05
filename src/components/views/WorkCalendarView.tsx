import React, { useState } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Building2 
} from 'lucide-react';
import { Task } from '../../types';

interface WorkCalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const WorkCalendarView: React.FC<WorkCalendarViewProps> = ({
  tasks,
  onSelectTask
}) => {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  const monthName = `Tháng ${currentMonth < 10 ? '0' + currentMonth : currentMonth}/${currentYear}`;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDaysArray = Array.from({ length: startOffset }, (_, i) => i);

  const getTasksForDay = (day: number) => {
    const formattedDate = `${currentYear}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}-${day < 10 ? '0' + day : day}`;
    return tasks.filter(t => t.dueDate === formattedDate);
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Bộ điều hành 6 rõ • Lịch hạn định công tác</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Lịch công việc và thời hạn giao việc Phòng Văn hóa - Xã hội
          </h2>
          <p className="text-xs text-slate-500">
            Trực quan hóa các mốc thời gian bàn giao sản phẩm của từng cán bộ, chuyên viên
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-[11px] font-bold text-slate-600 uppercase py-2.5">
          <div>Thứ 2</div>
          <div>Thứ 3</div>
          <div>Thứ 4</div>
          <div>Thứ 5</div>
          <div>Thứ 6</div>
          <div className="text-emerald-700">Thứ 7</div>
          <div className="text-rose-600">Chủ nhật</div>
        </div>

        <div className="grid grid-cols-7 border-collapse">
          {emptyDaysArray.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-slate-50/40 border-r border-b border-slate-100" />
          ))}

          {daysArray.map(day => {
            const dayTasks = getTasksForDay(day);
            const isToday = currentYear === 2026 && currentMonth === 10 && day === 5;

            return (
              <div 
                key={day} 
                className={`min-h-[110px] p-2 border-r border-b border-slate-100 flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-emerald-50/30 ring-2 ring-emerald-500/20' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                    isToday ? 'bg-emerald-600 text-white' : 'text-slate-800'
                  }`}>
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      {dayTasks.length} việc
                    </span>
                  )}
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                  {dayTasks.map(t => {
                    const isOverdue = t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue');
                    const isCompleted = t.status === 'completed';
                    const isApproaching = t.status !== 'completed' && t.timingStatus === 'approaching';

                    return (
                      <div
                        key={t.id}
                        onClick={() => onSelectTask(t)}
                        className={`p-1.5 rounded text-[10px] font-semibold transition-all cursor-pointer truncate ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200 hover:bg-emerald-200'
                            : isOverdue
                              ? 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 font-bold'
                              : isApproaching
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                        }`}
                        title={`[${t.id}] ${t.title} - CB: ${t.assignee}`}
                      >
                        <span className="font-mono font-bold mr-1">[{t.id.slice(-3)}]</span>
                        <span>{t.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
