import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Copy, 
  Check, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { Task } from '../../types';

interface AIAssistantViewProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionType?: 'urge' | 'report' | 'task_breakdown';
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  tasks,
  onOpenTask
}) => {
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue'));
  const approachingTasks = tasks.filter(t => t.status !== 'completed' && t.timingStatus === 'approaching');

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Xin kính chào đồng chí!
Tôi là **Trợ lý AI Điều hành Tiến độ Công vụ (TRÀ GIÁP TASK V4)**.

Tôi đã phân tích toàn bộ **${tasks.length} nhiệm vụ** trong hệ thống và ghi nhận tình hình hiện tại:
- **Quá hạn cần đôn đốc khẩn (${overdueTasks.length} nhiệm vụ)**: ${overdueTasks.map(t => `${t.id} - ${t.assignee}`).join(', ')}
- **Sắp đến hạn trong vài ngày tới (${approachingTasks.length} nhiệm vụ)**
- **Đã hoàn thành đạt yêu cầu (${tasks.filter(t => t.status === 'completed').length} nhiệm vụ)**

Đồng chí cần tôi hỗ trợ soạn thảo công văn đôn đốc, phân tích tiến độ hay gợi ý giải pháp xử lý theo quy trình 6 Rõ?`,
      timestamp: '08:00'
    }
  ]);

  const quickPrompts = [
    'Soạn văn bản đôn đốc khẩn cấp các nhiệm vụ quá hạn',
    'Tóm tắt báo cáo tiến độ tuần này cho Lãnh đạo',
    'Đánh giá hiệu suất công tác của Phòng Văn hóa - Xã hội',
    'Gợi ý phân công nhiệm vụ mới chuẩn quy trình 6 Rõ'
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      let aiReply = '';

      if (query.includes('đôn đốc') || query.includes('quá hạn')) {
        aiReply = `### CÔNG VĂN ĐÔN ĐỐC TIẾN ĐỘ THỰC HIỆN NHIỆM VỤ CÔNG VỤ
**Kính gửi:** 
- Chuyên viên chủ trì các nhiệm vụ chậm tiến độ
- Lãnh đạo phụ trách theo dõi

Căn cứ Quy chế làm việc của Phòng Văn hóa - Xã hội xã Trà Giáp và Bộ điều hành tiến độ giao việc 6 rõ (TRÀ GIÁP TASK V4); qua theo dõi giám sát, hiện nay có nhiệm vụ đã quá hạn nhưng chưa hoàn thành báo cáo minh chứng:

${overdueTasks.map(t => `
- **${t.id}**: *${t.title}*
  + Chuyên viên chủ trì: ${t.assignee}
  + Hạn hoàn thành: **${t.dueDate}**
  + Tiến độ hiện tại: ${t.progress}%
`).join('')}

**Ý KIẾN CHỈ ĐẠO CỦA TRƯỞNG PHÒNG:**
Yêu cầu các đồng chí khẩn trương tập trung giải quyết dứt điểm, nộp sản phẩm hoàn chỉnh về Thường trực phòng trước 17h00 ngày mai. Quá thời hạn trên, kết quả thực hiện sẽ làm căn cứ hạ bậc xếp loại thi đua tháng.`;
      } else if (query.includes('báo cáo') || query.includes('tiến độ')) {
        aiReply = `### BÁO CÁO NHANH TIẾN ĐỘ THỰC HIỆN NHIỆM VỤ GIAO VIỆC
**Kính gửi:** Lãnh đạo Phòng Văn hóa - Xã hội xã Trà Giáp

Hệ thống TRÀ GIÁP TASK V4 trân trọng báo cáo tổng hợp tiến độ:
1. **Tổng số nhiệm vụ**: ${tasks.length} nhiệm vụ
2. **Đã hoàn thành bàn giao nghiệm thu**: ${tasks.filter(t => t.status === 'completed').length} nhiệm vụ (${Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%)
3. **Đang trong thời hạn triển khai**: ${tasks.filter(t => t.status === 'in_progress').length} nhiệm vụ
4. **Quá hạn cần đôn đốc**: ${overdueTasks.length} nhiệm vụ

**Đề xuất kiến nghị:** 
- Tiếp tục đôn đốc khâu hoàn thiện hồ sơ tiếp cận pháp luật và ATTP.
- Khen thưởng các chuyên viên hoàn thành xuất sắc tiến độ trước hạn.`;
      } else {
        aiReply = `Tôi đã tiếp nhận yêu cầu: "${query}".

Theo mô hình **Bộ điều hành 6 Rõ** của Phòng Văn hóa - Xã hội xã Trà Giáp, mọi nhiệm vụ phân công cần thỏa mãn:
1. **Rõ người**: Chỉ định rõ chuyên viên tham mưu trực tiếp.
2. **Rõ việc**: Mục tiêu cụ thể, không giao nhiệm vụ chung chung.
3. **Rõ tiến độ**: Có mốc thời gian ngày bắt đầu và ngày hoàn thành (Hạn chót).
4. **Rõ kết quả**: Sản phẩm bàn giao cụ thể (Báo cáo tổng kết, kế hoạch ký số, tờ trình...).
5. **Rõ trách nhiệm**: Trách nhiệm chính thuộc về chuyên viên tham mưu và Lãnh đạo phụ trách.
6. **Rõ thẩm quyền**: Thẩm quyền phê duyệt thuộc Lãnh đạo Phòng Văn hóa - Xã hội.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Trí tuệ nhân tạo hỗ trợ điều hành công vụ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            TRỢ LÝ AI ĐIỀU HÀNH TIẾN ĐỘ – TRÀ GIÁP TASK V4
          </h2>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Tự động soạn công văn đôn đốc khẩn, tóm tắt báo cáo tiến độ và đề xuất phương án xử lý theo nguyên tắc 6 Rõ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
            <Bot className="w-7 h-7 text-purple-300" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isAI 
                    ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/30' 
                    : 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                }`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isAI 
                    ? 'bg-slate-50 border border-slate-200/80 text-slate-800' 
                    : 'bg-emerald-600 text-white font-medium'
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-200/40 text-[10px]">
                    <span className="font-bold opacity-80">
                      {isAI ? 'Trợ lý AI Công vụ Trà Giáp' : 'Người dùng'}
                    </span>
                    <span className="opacity-60">{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {isAI && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép văn bản</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Gợi ý nhanh:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 transition-all shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Đặt câu hỏi, yêu cầu soạn công văn đôn đốc hoặc phân tích dữ liệu nhiệm vụ..."
            className="flex-1 px-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-purple-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-800"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
