import React, { useMemo } from 'react';
import { 
  Kanban, 
  Plus, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Task, TaskStatus, UserAccount } from '../../types';

interface KanbanViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskModal: () => void;
  currentUser?: UserAccount | null;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onOpenNewTaskModal,
  currentUser
}) => {
  const isSpecialist = currentUser?.role === 'specialist';

  // Requirement 1: If specialist, scope strictly to their own task content upon login (excluding Leadership and other Specialists)
  const scopedTasks = useMemo(() => {
    if (isSpecialist && currentUser?.name) {
      const uName = currentUser.name.toLowerCase();
      return tasks.filter(t => {
        const aName = (t.assignee || '').toLowerCase();
        const cName = (t.coordinatingSpecialist || '').toLowerCase();
        return aName.includes(uName) || uName.includes(aName) || cName.includes(uName);
      });
    }
    return tasks;
  }, [tasks, isSpecialist, currentUser]);

  // Columns definition: 5 columns
  const columns: { id: TaskStatus | 'not_started'; title: string; count: number; badgeColor: string; headerBg: string }[] = [
    {
      id: 'not_started',
      title: 'Chưa bắt đầu',
      count: scopedTasks.filter(t => t.progress === 0 && t.status !== 'overdue' && t.status !== 'completed').length,
      badgeColor: 'bg-slate-200 text-slate-700',
      headerBg: 'border-t-slate-400'
    },
    {
      id: 'in_progress',
      title: 'Đang thực hiện',
      count: scopedTasks.filter(t => t.status === 'in_progress' && t.progress > 0).length,
      badgeColor: 'bg-blue-100 text-blue-800',
      headerBg: 'border-t-blue-500'
    },
    {
      id: 'review',
      title: 'Chờ duyệt / Nghiệm thu',
      count: scopedTasks.filter(t => t.status === 'review').length,
      badgeColor: 'bg-purple-100 text-purple-800',
      headerBg: 'border-t-purple-500'
    },
    {
      id: 'completed',
      title: 'Đã hoàn thành',
      count: scopedTasks.filter(t => t.status === 'completed').length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      headerBg: 'border-t-emerald-500'
    },
    {
      id: 'overdue',
      title: 'Quá hạn cảnh báo',
      count: scopedTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length,
      badgeColor: 'bg-rose-100 text-rose-700',
      headerBg: 'border-t-rose-500'
    }
  ];

  const getTasksForColumn = (colId: TaskStatus | 'not_started') => {
    if (colId === 'not_started') {
      return scopedTasks.filter(t => t.progress === 0 && t.status !== 'overdue' && t.status !== 'completed');
    }
    if (colId === 'in_progress') {
      return scopedTasks.filter(t => t.status === 'in_progress' && t.progress > 0);
    }
    if (colId === 'review') {
      return scopedTasks.filter(t => t.status === 'review');
    }
    if (colId === 'completed') {
      return scopedTasks.filter(t => t.status === 'completed');
    }
    if (colId === 'overdue') {
      return scopedTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue'));
    }
    return [];
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <Kanban className="w-4 h-4" />
            <span>Bộ điều hành 6 rõ • Bảng tiến độ trực quan Kanban</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản trị luồng công việc theo thẻ Kanban {isSpecialist ? `(Cá nhân: ${currentUser?.name})` : ''}
          </h2>
          <p className="text-xs text-slate-500">
            {isSpecialist 
              ? `Hiển thị riêng ${scopedTasks.length} nhiệm vụ của đồng chí ${currentUser?.name} theo các giai đoạn tiến độ.`
              : 'Dễ dàng quan sát và chuyển đổi giai đoạn từ Giao việc đến Hoàn thành nghiệm thu'}
          </p>
        </div>

        {!isSpecialist && (
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-700/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm việc mới</span>
          </button>
        )}
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = getTasksForColumn(col.id);

          return (
            <div 
              key={col.id} 
              className={`bg-slate-100/80 rounded-2xl p-3 border border-slate-200 border-t-4 ${col.headerBg} flex flex-col min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-3 mb-2 border-b border-slate-200/70">
                <span className="text-xs font-bold text-slate-800">{col.title}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor} tabular-nums`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards in this column */}
              <div className="space-y-2.5 flex-1">
                {colTasks.map(task => {
                  const isOverdue = task.status === 'overdue' || (task.status !== 'completed' && task.timingStatus === 'overdue');
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {task.id}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {task.field}
                        </span>
                      </div>

                      <h4 
                        onClick={() => onSelectTask(task)}
                        className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 leading-snug line-clamp-2 transition-colors"
                      >
                        {task.title}
                      </h4>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium truncate max-w-[120px]">
                            <User className="w-3 h-3 text-slate-400" />
                            {task.assignee}
                          </span>
                          <span className={`tabular-nums font-bold text-[10px] ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                            Hạn: {task.dueDate}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'}`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 tabular-nums">
                            {task.progress}%
                          </span>
                        </div>
                      </div>

                      {/* Fast transition buttons */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className="text-emerald-700 font-semibold hover:underline"
                        >
                          Chi tiết
                        </button>

                        <div className="flex items-center gap-1">
                          {col.id !== 'completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(task.id, 'completed');
                              }}
                              className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded font-semibold transition-colors"
                              title="Chuyển sang Hoàn thành"
                            >
                              Xong
                            </button>
                          )}
                          {col.id === 'completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(task.id, 'in_progress');
                              }}
                              className="px-1.5 py-0.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded font-semibold transition-colors"
                              title="Chuyển lại Đang làm"
                            >
                              Mở lại
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    Không có nhiệm vụ trong mục này
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
