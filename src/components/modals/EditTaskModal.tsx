import React, { useState, useMemo } from 'react';
import { 
  X, 
  Save, 
  Edit3, 
  Calendar, 
  User, 
  Building2, 
  Check, 
  Clock, 
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';
import { Task, FIELDS, DEPARTMENTS, STAFFS } from '../../types';

interface EditTaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSaveTask: (updatedTask: Task) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  onClose,
  onSaveTask
}) => {
  if (!task) return null;

  const specialistNames = useMemo(() => {
    const list = STAFFS
      .filter(s => s.name !== 'Phạm Sơn Triều' && s.name !== 'Nguyễn Tấn Tình')
      .map(s => s.name);
    return Array.from(new Set(list));
  }, []);

  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [assignee, setAssignee] = useState(task.assignee);
  const [department, setDepartment] = useState(task.department);
  const [field, setField] = useState(task.field);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal'>(task.priority);
  const [coordinatingSpecialist, setCoordinatingSpecialist] = useState(task.coordinatingSpecialist || '');
  const [coDepartment, setCoDepartment] = useState(task.coDepartment || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề nhiệm vụ');
      return;
    }
    if (!dueDate) {
      setError('Vui lòng chọn hạn hoàn thành');
      return;
    }

    setIsSaving(true);
    const updated: Task = {
      ...task,
      title: title.trim(),
      content: content.trim() || title.trim(),
      assignee,
      department,
      field,
      dueDate,
      priority,
      coordinatingSpecialist: coordinatingSpecialist || undefined,
      coDepartment: coDepartment.trim(),
      notes: notes.trim()
    };

    onSaveTask(updated);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Edit3 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-300 bg-black/20 px-2 py-0.5 rounded">
                  {task.id}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Chỉnh sửa nội dung nhiệm vụ giao chuyên viên
                </h3>
              </div>
              <p className="text-[11px] text-emerald-100">
                Điều chỉnh tiêu đề, nội dung, chuyên viên tham mưu và thời hạn hoàn thành
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Tiêu đề nhiệm vụ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-semibold"
              placeholder="Nhập tiêu đề nhiệm vụ..."
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Nội dung công việc chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
              placeholder="Mô tả cụ thể yêu cầu, sản phẩm đầu ra, quy trình triển khai..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chuyên viên tham mưu chính</span>
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
              >
                {specialistNames.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lãnh đạo phụ trách</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
              >
                {DEPARTMENTS.map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Lĩnh vực</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
              >
                {FIELDS.map((f, idx) => (
                  <option key={idx} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>Hạn hoàn thành</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
              >
                <option value="normal">Bình thường</option>
                <option value="high">Quan trọng (Cao)</option>
                <option value="urgent">Khẩn cấp (Hỏa tốc)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Chuyên viên phối hợp</span>
              </label>
              <select
                value={coordinatingSpecialist}
                onChange={(e) => setCoordinatingSpecialist(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
              >
                <option value="">-- Không có / Tự thực hiện --</option>
                {specialistNames.filter(n => n !== assignee).map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Đơn vị / Cơ quan phối hợp</span>
              </label>
              <input
                type="text"
                value={coDepartment}
                onChange={(e) => setCoDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                placeholder="Ví dụ: Công an xã, Trạm y tế, Địa chính..."
              />
            </div>
          </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Ghi chú chỉ đạo</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                placeholder="Lưu ý của lãnh đạo hoặc căn cứ công văn..."
              />
            </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi nội dung'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
