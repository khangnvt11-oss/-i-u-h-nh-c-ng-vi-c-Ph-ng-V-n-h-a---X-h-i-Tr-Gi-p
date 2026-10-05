import React, { useState } from 'react';
import { 
  X, 
  Send, 
  AlertTriangle, 
  Copy, 
  Check, 
  Printer, 
  Building2, 
  User, 
  Clock 
} from 'lucide-react';
import { Task } from '../../types';
import { databaseService } from '../../services/databaseService';

interface UrgeModalProps {
  task: Task | null;
  onClose: () => void;
}

export const UrgeModal: React.FC<UrgeModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const dispatchContent = `
ỦY BAN NHÂN DÂN XÃ TRÀ GIÁP
PHÒNG VĂN HÓA - XÃ HỘI
Số: ..... /PĐĐ-VHXH
V/v: Đôn đốc khẩn cấp tiến độ thực hiện nhiệm vụ công vụ theo Bộ điều hành 6 Rõ
---------------------------------------

Kính gửi: 
- Lãnh đạo phụ trách: Đồng chí ${task.department}
- Chuyên viên chủ trì: Đồng chí ${task.assignee}

Qua theo dõi trên Hệ thống điều hành tiến độ TRÀ GIÁP TASK V4, Phòng Văn hóa - Xã hội xã Trà Giáp nhận thấy:
Nhiệm vụ: "${task.title}" (Mã số: ${task.id})
- Người giao nhiệm vụ: ${task.assigner}
- Thời hạn yêu cầu hoàn thành: ${task.dueDate}
- Tiến độ thực tế hiện tại: ${task.progress}% (Hiện đã QUÁ THỜI HẠN quy định).

Để đảm bảo kỷ cương hành chính và tiến độ chung của Phòng Văn hóa - Xã hội, Trưởng phòng VH-XH YÊU CẦU:
1. Đồng chí ${task.assignee} khẩn trương tập trung giải quyết, nộp báo cáo kết quả và tài liệu minh chứng trước 17h00 ngày mai.
2. Lãnh đạo phụ trách ${task.department} chịu trách nhiệm trực tiếp đôn đốc, kiểm tra chất lượng sản phẩm tham mưu.
3. Trường hợp tiếp tục chậm trễ không có lý do chính đáng sẽ xem xét đánh giá xếp loại không hoàn thành nhiệm vụ trong tháng.

Nơi nhận:
- Như trên;
- Trưởng phòng (để b/c);
- Lưu: VT, Hệ thống TG4.

TRƯỞNG PHÒNG
(Đã ký số trên hệ thống)

Phạm Sơn Triều
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(dispatchContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setSent(true);
    databaseService.urgeTask(
      task.id,
      `Phát phiếu đôn đốc khẩn cấp nhiệm vụ [${task.id}] "${task.title}" cho cán bộ ${task.assignee}.`
    );
    databaseService.addAuditLog(
      'Phạm Sơn Triều – Trưởng phòng',
      'ĐÔN_ĐỐC_KHẨN',
      task.id,
      `Phát lệnh đôn đốc khẩn cán bộ ${task.assignee} hoàn thành nhiệm vụ "${task.title}".`
    );
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-700 to-rose-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Phiếu đôn đốc tiến độ khẩn cấp (Bộ điều hành 6 Rõ)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 leading-snug">
            <strong>Cảnh báo:</strong> Nhiệm vụ <strong>[{task.id}]</strong> do cán bộ <strong>{task.assignee}</strong> phụ trách đã quá hạn <strong>{task.dueDate}</strong>. Phiếu đôn đốc sẽ gửi thông báo trực tiếp đến hộp thư công vụ và lưu vào hồ sơ thi đua.
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-800">
            {dispatchContent}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép nội dung'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{sent ? 'Đang gửi...' : 'Phát lệnh đôn đốc ngay'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
