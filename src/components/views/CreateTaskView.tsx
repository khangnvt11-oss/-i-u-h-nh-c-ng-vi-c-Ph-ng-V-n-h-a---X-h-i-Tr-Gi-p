import React, { useState, useRef, useMemo } from 'react';
import { 
  PlusCircle, 
  Save, 
  Send, 
  Paperclip, 
  Calendar, 
  User, 
  Building2, 
  Check, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  FileText,
  Upload,
  Trash2,
  FileSpreadsheet,
  File,
  AlertTriangle
} from 'lucide-react';
import { Task, DEPARTMENTS, FIELDS, STAFFS, UserAccount } from '../../types';
import { databaseService } from '../../services/databaseService';

interface CreateTaskViewProps {
  onAddTask: (task: Task) => void;
  nextId: string;
  onSuccess: () => void;
  currentUser?: UserAccount | null;
}

interface AttachedFileInfo {
  name: string;
  size: number;
  type: string;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export const CreateTaskView: React.FC<CreateTaskViewProps> = ({
  onAddTask,
  nextId,
  onSuccess,
  currentUser
}) => {
  const isSpecialist = currentUser?.role === 'specialist';
  const registeredAccounts = databaseService.loadAccounts();

  // Filter only actual specialists (strictly excluding leadership)
  const specialistStaffs = useMemo<string[]>(() => {
    const fromAccounts = registeredAccounts.filter(a => 
      (a.role === 'specialist' || a.position?.toLowerCase().includes('chuyên viên')) &&
      !a.position?.toLowerCase().includes('trưởng phòng') &&
      !a.position?.toLowerCase().includes('phó trưởng phòng') &&
      a.name !== 'Phạm Sơn Triều' &&
      a.name !== 'Nguyễn Tấn Tình'
    );
    const names = new Set<string>();
    STAFFS.forEach(s => {
      if (s.name !== 'Phạm Sơn Triều' && s.name !== 'Nguyễn Tấn Tình') {
        names.add(s.name);
      }
    });
    fromAccounts.forEach(a => names.add(a.name));
    return Array.from(names);
  }, [registeredAccounts]);

  // Leaders list for Task Assignor (strictly excluding Specialist Nguyen Van Thanh)
  const leaderAssigners = useMemo<string[]>(() => {
    const list = registeredAccounts.filter(a => 
      a.name !== 'Nguyễn Văn Thạnh' && 
      (a.role === 'leader' || a.position?.includes('Trưởng') || a.position?.includes('Phó'))
    );
    const names = new Set<string>();
    const result: string[] = [];
    
    // Default standard leaders
    result.push('Phạm Sơn Triều – Trưởng phòng');
    names.add('Phạm Sơn Triều');
    result.push('Nguyễn Tấn Tình – Phó Trưởng phòng');
    names.add('Nguyễn Tấn Tình');

    list.forEach(l => {
      if (!names.has(l.name)) {
        names.add(l.name);
        result.push(`${l.name} – ${l.position || 'Lãnh đạo'}`);
      }
    });

    return result;
  }, [registeredAccounts]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [department, setDepartment] = useState('Phạm Sơn Triều');
  const [field, setField] = useState('Văn hóa - Thông tin');
  const [assignee, setAssignee] = useState(() => specialistStaffs[0] || 'Hồ Ngọc Thanh Sơn');
  const [coordinatingSpecialist, setCoordinatingSpecialist] = useState('');
  const [assigner, setAssigner] = useState('Phạm Sơn Triều – Trưởng phòng');
  const [assignedDate, setAssignedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('high');
  const [coDepartment, setCoDepartment] = useState('');
  const [attachments, setAttachments] = useState<AttachedFileInfo[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const newFiles: AttachedFileInfo[] = [];
    const oversizedFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        oversizedFiles.push(`${file.name} (${formatFileSize(file.size)})`);
      } else {
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream'
        });
      }
    });

    if (oversizedFiles.length > 0) {
      setUploadError(`Cảnh báo giới hạn dung lượng: Các tệp sau vượt quá giới hạn cho phép (tối đa 15MB/tệp):\n${oversizedFiles.join(', ')}`);
    }

    if (newFiles.length > 0) {
      setAttachments(prev => [...prev, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const attachmentNames = attachments.map(a => a.name);

    const newTask: Task = {
      id: nextId,
      title: title.trim(),
      content: content.trim(),
      assigner,
      assignee,
      department,
      field,
      assignedDate,
      dueDate,
      progress: 0,
      status: 'in_progress',
      timingStatus: 'normal',
      priority,
      coordinatingSpecialist: coordinatingSpecialist || undefined,
      coDepartment: coordinatingSpecialist 
        ? `${coordinatingSpecialist}${coDepartment.trim() ? ' • ' + coDepartment.trim() : ''}`
        : coDepartment.trim() || undefined,
      attachments: attachmentNames.length > 0 ? attachmentNames : undefined
    };

    onAddTask(newTask);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onSuccess();
    }, 1500);
  };

  if (isSpecialist) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="bg-white rounded-2xl p-8 border border-amber-200/80 shadow-md text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Giới hạn quyền hạn: Chức năng Giao nhiệm vụ
          </h2>
          <p className="text-xs text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Theo quy định phân quyền hệ thống, chỉ <strong>Lãnh đạo phòng</strong> (Trưởng phòng, Phó Trưởng phòng) và <strong>Quản trị viên</strong> mới có quyền khởi tạo và phân công nhiệm vụ mới.
          </p>
          <p className="text-xs text-slate-500 mt-1.5">
            Tài khoản Chuyên viên của đồng chí <strong>{currentUser?.name}</strong> có quyền theo dõi tiến độ, gửi báo cáo kết quả, xin phối hợp, kiến nghị gia hạn và sử dụng Sổ tay cá nhân.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={onSuccess}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Chuyển sang Bảng Theo dõi tiến độ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Bộ điều hành 6 rõ • Giao nhiệm vụ công vụ</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Phiếu giao nhiệm vụ và phân công trách nhiệm
          </h2>
          <p className="text-xs text-slate-500">
            Rõ người chủ trì, rõ cán bộ tham mưu, rõ hạn định bàn giao kết quả và thẩm quyền phê duyệt
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            MÃ TỰ SINH: {nextId}
          </span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tiêu đề nhiệm vụ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tóm tắt tên nhiệm vụ cần triển khai..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nội dung nhiệm vụ và yêu cầu sản phẩm đầu ra <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả cụ thể nội dung công việc, tiêu chuẩn nghiệm thu, chỉ tiêu định lượng, các mốc thời gian bàn giao sản phẩm..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 leading-relaxed font-normal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lãnh đạo phụ trách <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 cursor-pointer font-medium"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Chuyên viên tham mưu phụ trách <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 cursor-pointer font-semibold text-emerald-800"
              >
                {specialistStaffs.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lĩnh vực chuyên môn <span className="text-rose-500">*</span>
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 cursor-pointer font-medium"
              >
                {FIELDS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Người giao nhiệm vụ
              </label>
              <select
                value={assigner}
                onChange={(e) => setAssigner(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-bold cursor-pointer"
              >
                {leaderAssigners.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ngày giao việc
              </label>
              <input
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hạn xong (Deadline) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-bold text-rose-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mức độ ưu tiên
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    priority === 'urgent' 
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  Hỏa tốc
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    priority === 'high' 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Ưu tiên cao
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    priority === 'normal' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Bình thường
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Chuyên viên phối hợp</span>
                <span className="text-[10px] text-emerald-600 font-semibold">(Tài khoản HT)</span>
              </label>
              <select
                value={coordinatingSpecialist}
                onChange={(e) => setCoordinatingSpecialist(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-semibold cursor-pointer"
              >
                <option value="">-- Chọn chuyên viên phối hợp --</option>
                {specialistStaffs.filter(name => name !== assignee).map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Đơn vị / Cơ quan phối hợp (Nếu có)
              </label>
              <input
                type="text"
                value={coDepartment}
                onChange={(e) => setCoDepartment(e.target.value)}
                placeholder="Ví dụ: Công an xã, Địa chính, Đoàn thanh niên..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tải lên hồ sơ, văn bản đính kèm từ thiết bị
              </label>
              <span className="text-[11px] text-slate-400">
                Hỗ trợ chọn nhiều tệp • Giới hạn tối đa 15MB/tệp
              </span>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 bg-slate-50/60 hover:bg-emerald-50/20 text-center transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Nhấp để chọn tệp từ máy tính hoặc kéo thả tệp vào đây
                </div>
                <div className="text-[11px] text-slate-500">
                  Hỗ trợ: PDF, Word (.docx), Excel (.xlsx), Hình ảnh, Tệp nén (.zip, .rar)
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{uploadError}</span>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-600">
                  Đã đính kèm ({attachments.length} tệp):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate text-[11px]">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAttachment(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Xóa tệp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {isSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Đã giao nhiệm vụ thành công vào hệ thống!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Ban hành & Kích hoạt giao việc</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
