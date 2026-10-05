import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Paperclip, 
  Star, 
  Send, 
  Award,
  ShieldCheck,
  Edit3,
  MessageSquare,
  Users,
  FileText
} from 'lucide-react';
import { Task, TaskStatus, UserAccount } from '../../types';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateProgress: (taskId: string, newProgress: number) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenEvaluation: (task: Task) => void;
  onUrgeTask: (task: Task) => void;
  onOpenEditTask?: (task: Task) => void;
  onOpenFeedback?: (task: Task) => void;
  currentUser?: UserAccount | null;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateProgress,
  onUpdateStatus,
  onOpenEvaluation,
  onUrgeTask,
  onOpenEditTask,
  onOpenFeedback,
  currentUser
}) => {
  if (!task) return null;

  const [currentProgress, setCurrentProgress] = useState(task.progress);

  const isOverdue = task.status === 'overdue' || (task.status !== 'completed' && task.timingStatus === 'overdue');
  const isCompleted = task.status === 'completed';
  const isApproaching = task.status !== 'completed' && task.timingStatus === 'approaching';

  const canEdit = currentUser ? (currentUser.role === 'admin' || currentUser.role === 'leader') : false;

  const handleSaveProgress = () => {
    onUpdateProgress(task.id, currentProgress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              {task.id}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {task.department} • {task.field}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                isCompleted 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : isOverdue 
                    ? 'bg-rose-100 text-rose-700' 
                    : isApproaching 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-blue-100 text-blue-800'
              }`}>
                {isCompleted ? 'Đã hoàn thành' : isOverdue ? 'Quá hạn chưa xong' : isApproaching ? 'Sắp đến hạn' : 'Đang thực hiện'}
              </span>

              <span className="text-slate-400 font-medium text-[11px]">
                Hạn chót: <strong className="text-slate-900 font-bold">{task.dueDate}</strong>
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {task.title}
            </h3>
            <p className="text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {task.content}
            </p>
          </div>

          {/* 6 RÕ Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60">
            <div>
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">1. Rõ Người (Tham mưu)</span>
              <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{task.assignee}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">2. Thẩm quyền giao</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {task.assigner.split('–')[0]}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">3. Lãnh đạo phụ trách</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {task.department}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">4. Ngày ban hành</span>
              <div className="font-semibold text-slate-800 mt-0.5 tabular-nums">
                {task.assignedDate}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">5. Hạn định bàn giao</span>
              <div className="font-bold text-rose-700 mt-0.5 tabular-nums">
                {task.dueDate}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">6. Phối hợp</span>
              <div className="font-semibold text-slate-800 mt-0.5 truncate">
                {task.coDepartment || 'Không'}
              </div>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Tiến độ thực hiện hiện tại:</span>
              <span className="font-black text-emerald-700 tabular-nums text-sm">{currentProgress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={currentProgress}
              onChange={(e) => setCurrentProgress(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSaveProgress}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Cập nhật % tiến độ
              </button>
              {task.progress !== 100 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentProgress(100);
                    onUpdateProgress(task.id, 100);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  Đánh dấu hoàn thành 100%
                </button>
              )}
            </div>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <span className="font-bold text-slate-800 block mb-1.5">Tệp tài liệu đính kèm:</span>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((file, idx) => {
                  const fileName = typeof file === 'string' ? file : file.name;
                  const fileSize = typeof file !== 'string' && file.size 
                    ? ` (${(file.size / 1024).toFixed(0)} KB)` 
                    : '';
                  return (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fileName}{fileSize}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Specialist Feedback History Timeline */}
          {task.feedbackList && task.feedbackList.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <span>Lịch sử phản hồi & Báo cáo của chuyên viên ({task.feedbackList.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">Ghi nhận thời gian thực</span>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {task.feedbackList.map((fb) => (
                  <div key={fb.id} className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{fb.sender}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-teal-50 text-teal-700 rounded font-semibold border border-teal-200">
                          {fb.type === 'progress_report' ? 'Báo cáo tiến độ' :
                           fb.type === 'collaborator_request' ? 'Xin phối hợp' :
                           fb.type === 'deadline_adjustment' ? 'Xin gia hạn' : 'Ý kiến vướng mắc'}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">{fb.createdAt}</span>
                    </div>

                    <div className="text-slate-700 leading-relaxed font-medium">
                      "{fb.content}"
                    </div>

                    <div className="mt-1.5 pt-1 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                      {fb.progress !== undefined && (
                        <span>Tiến độ báo cáo: <strong className="text-emerald-700">{fb.progress}%</strong></span>
                      )}
                      {fb.proposedDueDate && (
                        <span>Hạn đề xuất: <strong className="text-rose-600">{fb.proposedDueDate}</strong></span>
                      )}
                      {fb.proposedCollaborators && fb.proposedCollaborators.length > 0 && (
                        <span>Xin phối hợp: <strong className="text-blue-700">{fb.proposedCollaborators.join(', ')}</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation if available */}
          {task.evaluation && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Kết quả đánh giá của Lãnh đạo</span>
                </span>
                <span className="font-black text-emerald-800 text-xs tabular-nums bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {task.evaluation.score}/10 Điểm
                </span>
              </div>
              <div className="text-slate-700 text-xs italic">
                "{task.evaluation.leaderComments}"
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold pt-1 border-t border-emerald-200/50">
                Kết luận: {task.evaluation.conclusion} • Đánh giá bởi {task.evaluation.evaluator}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenFeedback && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFeedback(task);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Báo cáo & Phản hồi</span>
              </button>
            )}

            {canEdit && onOpenEditTask && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditTask(task);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Chỉnh sửa nội dung</span>
              </button>
            )}

            {isOverdue && (
              <button
                onClick={() => {
                  onClose();
                  onUrgeTask(task);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi phiếu đôn đốc khẩn</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenEvaluation(task);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Chấm điểm</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
