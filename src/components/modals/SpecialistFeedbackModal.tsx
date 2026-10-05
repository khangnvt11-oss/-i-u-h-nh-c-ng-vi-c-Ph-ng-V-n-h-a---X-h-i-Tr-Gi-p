import React, { useState, useRef } from 'react';
import { 
  X, 
  Send, 
  Upload, 
  Paperclip, 
  Trash2, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  HelpCircle,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { Task, TaskAttachment, FeedbackType, TaskFeedback, STAFFS, UserAccount } from '../../types';

interface SpecialistFeedbackModalProps {
  task: Task | null;
  currentUser: UserAccount;
  onClose: () => void;
  onSubmitFeedback: (taskId: string, feedbackData: Partial<TaskFeedback>) => void;
}

export const SpecialistFeedbackModal: React.FC<SpecialistFeedbackModalProps> = ({
  task,
  currentUser,
  onClose,
  onSubmitFeedback
}) => {
  if (!task) return null;

  const [activeTab, setActiveTab] = useState<FeedbackType>('progress_report');
  
  // Progress & Completion Report state
  const [progress, setProgress] = useState(task.progress);
  const [reportContent, setReportContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<TaskAttachment[]>([]);
  
  // Collaborator request state
  const [selectedCollaborator, setSelectedCollaborator] = useState(STAFFS[0]?.name || '');
  const [collaboratorReason, setCollaboratorReason] = useState('');
  
  // Deadline adjustment state
  const [proposedDueDate, setProposedDueDate] = useState(task.dueDate);
  const [extensionReason, setExtensionReason] = useState('');

  // General / Issue report state
  const [issueContent, setIssueContent] = useState('');

  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles: TaskAttachment[] = [];

    for (const f of files) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`Tệp "${f.name}" (${(f.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      validFiles.push({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      });
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let feedbackData: Partial<TaskFeedback> = {
      sender: currentUser.name,
      senderRole: currentUser.position || currentUser.role,
      type: activeTab
    };

    if (activeTab === 'progress_report') {
      if (!reportContent.trim()) {
        setFileError('Vui lòng nhập nội dung báo cáo kết quả thực hiện');
        setIsSubmitting(false);
        return;
      }
      feedbackData = {
        ...feedbackData,
        title: progress >= 100 ? 'Báo cáo hoàn thành 100% nhiệm vụ' : `Cập nhật tiến độ: ${progress}%`,
        content: reportContent.trim(),
        progress,
        attachments: uploadedFiles
      };
    } else if (activeTab === 'collaborator_request') {
      if (!collaboratorReason.trim()) {
        setFileError('Vui lòng nhập lý do và nội dung cần phối hợp');
        setIsSubmitting(false);
        return;
      }
      feedbackData = {
        ...feedbackData,
        title: `Đề xuất bổ sung cán bộ phối hợp: ${selectedCollaborator}`,
        content: `Kiến nghị phân công phối hợp: ${selectedCollaborator}. Lý do: ${collaboratorReason.trim()}`,
        proposedCollaborators: [selectedCollaborator]
      };
    } else if (activeTab === 'deadline_adjustment') {
      if (!extensionReason.trim()) {
        setFileError('Vui lòng nhập lý do xin điều chỉnh thời hạn');
        setIsSubmitting(false);
        return;
      }
      feedbackData = {
        ...feedbackData,
        title: `Đề xuất điều chỉnh thời hạn hoàn thành: ${proposedDueDate}`,
        content: `Xin gia hạn đến ngày: ${proposedDueDate}. Căn cứ và lý do: ${extensionReason.trim()}`,
        proposedDueDate
      };
    } else {
      if (!issueContent.trim()) {
        setFileError('Vui lòng nhập nội dung vướng mắc hoặc ý kiến phản hồi');
        setIsSubmitting(false);
        return;
      }
      feedbackData = {
        ...feedbackData,
        title: 'Báo cáo khó khăn, vướng mắc & Xin ý kiến chỉ đạo',
        content: issueContent.trim()
      };
    }

    onSubmitFeedback(task.id, feedbackData);
    setSuccessMsg('Đã gửi phản hồi thành công lên hệ thống điều hành.');
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <MessageSquare className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-300 bg-black/20 px-2 py-0.5 rounded">
                  {task.id}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Chuyên viên phản hồi & Báo cáo tiến độ
                </h3>
              </div>
              <p className="text-[11px] text-teal-100 truncate max-w-md mt-0.5">
                {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('progress_report')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'progress_report'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Báo cáo tiến độ & Hoàn thành</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collaborator_request')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'collaborator_request'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Xin người phối hợp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deadline_adjustment')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'deadline_adjustment'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Xin điều chỉnh hạn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('issue_report')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'issue_report'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>4. Báo cáo vướng mắc</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {fileError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div>
              <span className="text-slate-400">Chuyên viên phụ trách:</span>{' '}
              <strong className="text-slate-800">{task.assignee}</strong>
            </div>
            <div>
              <span className="text-slate-400">Hạn bàn giao:</span>{' '}
              <strong className="text-rose-600 font-bold">{task.dueDate}</strong>
            </div>
            <div>
              <span className="text-slate-400">Tiến độ hiện tại:</span>{' '}
              <strong className="text-emerald-700 font-bold">{task.progress}%</strong>
            </div>
          </div>

          {activeTab === 'progress_report' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">
                    Mức độ hoàn thành công việc đạt được:
                  </span>
                  <span className="text-base font-black text-emerald-700 tabular-nums">
                    {progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-200/60">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProgress(50)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-white rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgress(80)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-white rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      80%
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgress(100)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      Đã hoàn thành 100%
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 italic">
                    {progress >= 100 ? 'Sẽ chuyển trạng thái sang "Đã hoàn thành"' : 'Đang tiếp tục thực hiện'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nội dung báo cáo kết quả thực hiện / Minh chứng sản phẩm <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
                  placeholder="Mô tả cụ thể các hạng mục đã hoàn thành, số liệu kết quả, dự thảo văn bản đã chuẩn bị..."
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Tệp tin đính kèm kết quả (PDF, Word, Excel, Ảnh...)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tối đa 15MB/tệp</span>
                </label>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl bg-emerald-50/20 hover:bg-emerald-50/40 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-800">
                    Bấm vào đây để chọn tệp từ máy tính
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Hỗ trợ tải lên nhiều tệp tin cùng lúc (Biểu mẫu báo cáo, danh sách ký nhận, quyết định...)
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                    {uploadedFiles.map((file, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({file.size ? (file.size / 1024).toFixed(0) : 0} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'collaborator_request' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 leading-relaxed text-[11px]">
                <strong className="block font-bold mb-0.5">Quy trình phối hợp công vụ:</strong>
                Chuyên viên chủ trì đề xuất Lãnh đạo phòng phân công thêm cán bộ chuyên môn để cùng phối hợp thẩm tra, thu thập số liệu hoặc thực hiện nhiệm vụ liên ngành.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Chọn cán bộ đề xuất phối hợp <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCollaborator}
                  onChange={(e) => setSelectedCollaborator(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-semibold cursor-pointer"
                >
                  {STAFFS.filter(s => s.name !== task.assignee).map((s, idx) => (
                    <option key={idx} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Lý do và nội dung cần phối hợp <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={collaboratorReason}
                  onChange={(e) => setCollaboratorReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  placeholder="Nêu rõ lý do cần phối hợp, khối lượng công việc và trách nhiệm dự kiến của cán bộ phối hợp..."
                  required
                />
              </div>
            </div>
          )}

          {activeTab === 'deadline_adjustment' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 leading-relaxed text-[11px]">
                <strong className="block font-bold mb-0.5">Quy định điều chỉnh tiến độ:</strong>
                Đề xuất gia hạn chỉ được chấp thuận khi có lý do khách quan (chờ số liệu cấp trên, phụ thuộc vào kiểm tra thực địa, hoặc khối lượng phát sinh theo chỉ đạo mới).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">
                    Hạn hoàn thành ban đầu
                  </label>
                  <input
                    type="text"
                    disabled
                    value={task.dueDate}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hạn mới đề xuất <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    value={proposedDueDate}
                    onChange={(e) => setProposedDueDate(e.target.value)}
                    min={task.dueDate}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Lý do và căn cứ xin điều chỉnh hạn <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  placeholder="Giải trình rõ ràng nguyên nhân chậm trễ và cam kết thời gian hoàn thành theo hạn mới..."
                  required
                />
              </div>
            </div>
          )}

          {activeTab === 'issue_report' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-purple-900 leading-relaxed text-[11px]">
                <strong className="block font-bold mb-0.5">Báo cáo vướng mắc & Xin ý kiến Lãnh đạo:</strong>
                Gửi trực tiếp ý kiến về những bất cập trong quy trình, chính sách, hoặc cần ý kiến thống nhất từ Lãnh đạo phòng trước khi triển khai tiếp.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nội dung vướng mắc & Đề xuất hướng xử lý <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={issueContent}
                  onChange={(e) => setIssueContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
                  placeholder="Mô tả cụ thể vướng mắc, khó khăn thực tế và đề xuất phương án chỉ đạo..."
                  required
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Gửi bởi: <strong>{currentUser.name}</strong> ({currentUser.position || 'Chuyên viên'})
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi cho Lãnh đạo'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
