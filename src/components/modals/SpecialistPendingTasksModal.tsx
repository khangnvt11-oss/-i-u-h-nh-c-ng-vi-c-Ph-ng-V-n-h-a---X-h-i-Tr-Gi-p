import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Eye, 
  CheckCheck,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { Task, UserAccount } from '../../types';

interface SpecialistPendingTasksModalProps {
  currentUser: UserAccount;
  tasks: Task[];
  onClose: () => void;
  onOpenTaskDetail: (task: Task) => void;
  onOpenFeedback: (task: Task) => void;
}

export const SpecialistPendingTasksModal: React.FC<SpecialistPendingTasksModalProps> = ({
  currentUser,
  tasks,
  onClose,
  onOpenTaskDetail,
  onOpenFeedback
}) => {
  const userTasks = tasks.filter(t => 
    t.assignee?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
    currentUser.name.toLowerCase().includes((t.assignee || '').toLowerCase())
  );

  const rawList = userTasks.length > 0 
    ? userTasks 
    : tasks.filter(t => t.status !== 'completed').slice(0, 6);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const getRemainingDays = (dueDateStr: string): number => {
    try {
      const parts = dueDateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        d.setHours(0, 0, 0, 0);
        return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      const d = new Date(dueDateStr);
      d.setHours(0, 0, 0, 0);
      return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return 999;
    }
  };

  const displayTasks = [...rawList].sort((a, b) => {
    return getRemainingDays(a.dueDate) - getRemainingDays(b.dueDate);
  });

  const pendingTasks = displayTasks.filter(t => t.status !== 'completed');
  const overdueTasks = displayTasks.filter(t => {
    const days = getRemainingDays(t.dueDate);
    return t.status !== 'completed' && (days < 0 || t.status === 'overdue');
  });
  const dueTodayTasks = displayTasks.filter(t => {
    const days = getRemainingDays(t.dueDate);
    return t.status !== 'completed' && days === 0;
  });
  const approachingTasks = displayTasks.filter(t => {
    const days = getRemainingDays(t.dueDate);
    return t.status !== 'completed' && days > 0 && days <= 3;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-6 -mr-6 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bàn giao nhiệm vụ công vụ đầu phiên</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Xin chào: {currentUser.name}!
              </h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                Dưới đây là danh sách các nhiệm vụ công việc được phân công phụ trách và tình trạng tiến độ hoàn thành. Đề nghị rà soát, cập nhật báo cáo hoặc phản hồi trước khi xử lý các công tác khác.
              </p>
            </div>

            <div className="shrink-0 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-right sm:text-left min-w-[160px]">
              <div className="text-[10px] text-emerald-200 uppercase font-semibold">Cán bộ đăng nhập</div>
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-emerald-100">{currentUser.position || 'Chuyên viên'}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-slate-800">
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xs border border-white/40">
              <div className="text-[11px] font-semibold text-slate-500">Được giao phụ trách</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">
                {displayTasks.length}
              </div>
              <div className="text-[10px] text-slate-400">Nhiệm vụ</div>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xs border border-white/40">
              <div className="text-[11px] font-semibold text-blue-600">Đang triển khai</div>
              <div className="text-2xl font-black text-blue-700 mt-0.5 tabular-nums">
                {pendingTasks.length}
              </div>
              <div className="text-[10px] text-blue-500">Cần thực hiện</div>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xs border border-white/40">
              <div className="text-[11px] font-semibold text-amber-600">Sắp đến hạn</div>
              <div className="text-2xl font-black text-amber-700 mt-0.5 tabular-nums">
                {approachingTasks.length}
              </div>
              <div className="text-[10px] text-amber-600">Trong 3 ngày</div>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xs border border-white/40">
              <div className="text-[11px] font-semibold text-rose-600">Quá hạn cần gấp</div>
              <div className="text-2xl font-black text-rose-700 mt-0.5 tabular-nums">
                {overdueTasks.length}
              </div>
              <div className="text-[10px] text-rose-600 font-bold">Cần báo cáo ngay</div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {overdueTasks.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-2.5 text-rose-900 text-xs font-bold animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>CẢNH BÁO TIẾN ĐỘ: Đồng chí có {overdueTasks.length} nhiệm vụ đã QUÁ HẠN hoàn thành! Đề nghị khẩn trương cập nhật kết quả minh chứng hoặc gửi kiến nghị/giải trình.</span>
            </div>
          )}

          {dueTodayTasks.length > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-300 rounded-2xl flex items-center gap-2.5 text-orange-900 text-xs font-bold">
              <Clock className="w-5 h-5 text-orange-600 shrink-0" />
              <span>HẠN CHÓT HÔM NAY: Có {dueTodayTasks.length} nhiệm vụ đến hạn chót trong ngày hôm nay! Vui lòng ưu tiên xử lý.</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Danh sách nhiệm vụ & Tình trạng hoàn thành ({displayTasks.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 italic">
              * Tự động sắp xếp theo thời gian còn lại đến hạn
            </span>
          </div>

          {displayTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Hiện tại đồng chí không có nhiệm vụ tồn đọng cần xử lý.
            </div>
          ) : (
            <div className="space-y-3">
              {displayTasks.map(task => {
                const daysLeft = getRemainingDays(task.dueDate);
                const isOverdue = task.status !== 'completed' && (daysLeft < 0 || task.status === 'overdue');
                const isDueToday = task.status !== 'completed' && daysLeft === 0;
                const isApproaching = task.status !== 'completed' && daysLeft > 0 && daysLeft <= 3;
                const isDone = task.status === 'completed';

                let timingBadgeText = `Còn ${daysLeft} ngày`;
                let timingBadgeClass = 'bg-slate-100 text-slate-700';

                if (isDone) {
                  timingBadgeText = 'Đã hoàn tất';
                  timingBadgeClass = 'bg-emerald-100 text-emerald-800';
                } else if (isOverdue) {
                  timingBadgeText = `Quá hạn ${Math.abs(daysLeft)} ngày!`;
                  timingBadgeClass = 'bg-rose-100 text-rose-800 font-extrabold border border-rose-300 animate-pulse';
                } else if (isDueToday) {
                  timingBadgeText = 'Hạn chót HÔM NAY!';
                  timingBadgeClass = 'bg-orange-100 text-orange-800 font-extrabold border border-orange-300';
                } else if (isApproaching) {
                  timingBadgeText = `Sắp đến hạn (Còn ${daysLeft} ngày)`;
                  timingBadgeClass = 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
                }

                return (
                  <div 
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all text-xs ${
                      isOverdue 
                        ? 'bg-rose-50/60 border-rose-300 shadow-rose-100 hover:border-rose-500 ring-1 ring-rose-200' 
                        : isDueToday
                          ? 'bg-orange-50/60 border-orange-300 shadow-orange-100 hover:border-orange-500 ring-1 ring-orange-200'
                          : isApproaching 
                            ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                            : isDone 
                              ? 'bg-emerald-50/30 border-emerald-200' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                    } shadow-xs hover:shadow-md`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                          {task.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isDone 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isOverdue 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : isDueToday
                                ? 'bg-orange-600 text-white shadow-xs'
                                : isApproaching 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isDone ? 'Đã hoàn thành' : isOverdue ? 'Quá hạn khẩn' : isDueToday ? 'Đến hạn hôm nay' : isApproaching ? 'Sắp đến hạn' : 'Đang thực hiện'}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${timingBadgeClass}`}>
                          {timingBadgeText}
                        </span>

                        <span className="text-slate-500 font-medium text-[11px]">
                          {task.field} • {task.department}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-slate-500">
                          Hạn chót: <strong className={isOverdue ? 'text-rose-600 font-bold' : isDueToday ? 'text-orange-600 font-bold' : 'text-slate-800 font-semibold'}>{task.dueDate}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {task.title}
                      </h4>
                      <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {task.content}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 max-w-sm">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-700">Tiến độ hoàn thành:</span>
                          <span className="font-black text-emerald-700 tabular-nums">{task.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenFeedback(task);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Báo cáo / Phản hồi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenTaskDetail(task);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Đã nắm rõ danh sách nhiệm vụ cần giải quyết trong kỳ điều hành.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-black rounded-xl shadow-md transition-all cursor-pointer hover:gap-3"
          >
            <span>Vào hệ thống làm việc</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
