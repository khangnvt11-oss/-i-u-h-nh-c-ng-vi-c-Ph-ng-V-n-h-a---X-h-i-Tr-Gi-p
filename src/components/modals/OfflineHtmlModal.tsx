import React, { useState } from 'react';
import { 
  X, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { Task } from '../../types';
import { generateStandaloneHtml } from '../../utils/generateStandaloneHtml';

interface OfflineHtmlModalProps {
  tasks: Task[];
  onClose: () => void;
}

export const OfflineHtmlModal: React.FC<OfflineHtmlModalProps> = ({ tasks, onClose }) => {
  const [copied, setCopied] = useState(false);
  const standaloneCode = generateStandaloneHtml(tasks);

  const handleDownload = () => {
    const blob = new Blob([standaloneCode], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TRA_GIAP_TASK_V4_OFFLINE.html';
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Xuất mã nguồn HTML đơn lẻ (Standalone Single File)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed">
            <strong>Yêu cầu hoàn thành:</strong> Toàn bộ giao diện và dữ liệu nhiệm vụ được đóng gói trong một file HTML duy nhất (sử dụng Tailwind CSS CDN). Bạn có thể tải về file hoặc sao chép mã nguồn để mở trực tiếp trong bất kỳ trình duyệt nào mà không cần cài đặt Node.js hay server!
          </div>

          <div className="relative">
            <textarea
              readOnly
              rows={12}
              value={standaloneCode}
              className="w-full p-4 font-mono text-[10px] bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Dung lượng: ~{(standaloneCode.length / 1024).toFixed(1)} KB
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã chép mã' : 'Sao chép toàn bộ code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải file .html về máy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
