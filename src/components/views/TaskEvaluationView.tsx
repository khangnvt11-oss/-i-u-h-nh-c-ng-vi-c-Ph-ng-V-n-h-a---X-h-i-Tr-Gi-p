import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Save, 
  FileSpreadsheet, 
  FileDown, 
  Check, 
  Sparkles, 
  Calendar, 
  Building2, 
  User, 
  Star, 
  Shield, 
  MessageSquare 
} from 'lucide-react';
import { Task, TaskEvaluation, UserAccount } from '../../types';

interface TaskEvaluationViewProps {
  tasks: Task[];
  onSaveEvaluation: (taskId: string, evaluation: TaskEvaluation) => void;
  currentUser?: UserAccount | null;
  onOpenFeedback?: (task: Task) => void;
}

export const TaskEvaluationView: React.FC<TaskEvaluationViewProps> = ({
  tasks,
  onSaveEvaluation,
  currentUser,
  onOpenFeedback
}) => {
  const isSpecialist = currentUser?.role === 'specialist';
  const evaluatedTasks = tasks.filter(t => t.evaluation !== undefined);
  const pendingEvaluationTasks = tasks.filter(t => t.evaluation === undefined);

  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    pendingEvaluationTasks.length > 0 ? pendingEvaluationTasks[0].id : tasks[0].id
  );

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  const [completionLevel, setCompletionLevel] = useState<string>(
    selectedTask.evaluation?.completionLevel || 'Hoàn thành tốt'
  );
  const [quality, setQuality] = useState<string>(
    selectedTask.evaluation?.quality || 'Tốt'
  );
  const [progressScore, setProgressScore] = useState<string>(
    selectedTask.evaluation?.progressScore || (selectedTask.status === 'overdue' ? 'Trễ hạn' : 'Đúng hạn')
  );
  const [score, setScore] = useState<number>(
    selectedTask.evaluation?.score || 9
  );
  const [leaderComments, setLeaderComments] = useState<string>(
    selectedTask.evaluation?.leaderComments || ''
  );
  const [conclusion, setConclusion] = useState<string>(
    selectedTask.evaluation?.conclusion || 'Đạt yêu cầu kế hoạch đề ra'
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setCompletionLevel(task.evaluation?.completionLevel || 'Hoàn thành tốt');
    setQuality(task.evaluation?.quality || 'Tốt');
    setProgressScore(task.evaluation?.progressScore || (task.status === 'overdue' ? 'Trễ hạn' : 'Đúng hạn'));
    setScore(task.evaluation?.score || (task.status === 'overdue' ? 6 : 9));
    setLeaderComments(task.evaluation?.leaderComments || (
      task.status === 'overdue' 
        ? 'Nhiệm vụ chậm tiến độ so với kế hoạch; yêu cầu đôn đốc cán bộ tham mưu khẩn trương hoàn thành báo cáo minh chứng.'
        : `Cán bộ ${task.assignee} triển khai bám sát chỉ đạo, sản phẩm đầu ra rõ ràng, đạt chất lượng.`
    ));
    setConclusion(task.evaluation?.conclusion || (
      task.status === 'overdue' ? 'Chưa đạt yêu cầu tiến độ, nhắc nhở rút kinh nghiệm' : 'Đạt yêu cầu nhiệm vụ được giao'
    ));
    setSaveSuccess(false);
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSpecialist) {
      alert('Tài khoản Chuyên viên không có quyền chấm điểm nhiệm vụ.');
      return;
    }
    const evaluatorName = (currentUser?.role === 'admin' || currentUser?.role === 'leader') && currentUser?.name 
      ? `${currentUser.name} – ${currentUser.position || 'Lãnh đạo'}` 
      : 'Phạm Sơn Triều – Trưởng phòng';

    const evaluationData: TaskEvaluation = {
      completionLevel,
      quality,
      progressScore,
      score,
      leaderComments,
      conclusion,
      evaluatedAt: new Date().toISOString().slice(0, 10),
      evaluator: evaluatorName
    };

    onSaveEvaluation(selectedTaskId, evaluationData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportWord = () => {
    const textContent = `
UBND XÃ TRÀ GIÁP
PHÒNG VĂN HÓA - XÃ HỘI
HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ PHÒNG VHXH TRÀ GIÁP TASK V4
BẢN QUYỀN: NGUYỄN VĂN THẠNH

PHIẾU ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN NHIỆM VỤ CÔNG VỤ
Mã nhiệm vụ: ${selectedTask.id}
Tên nhiệm vụ: ${selectedTask.title}
Lãnh đạo phụ trách: ${selectedTask.department}
Chuyên viên tham mưu: ${selectedTask.assignee}
Lĩnh vực phụ trách: ${selectedTask.field}
Người giao nhiệm vụ: ${selectedTask.assigner || 'Phạm Sơn Triều – Trưởng phòng'}
Ngày giao: ${selectedTask.assignedDate} - Hạn xong: ${selectedTask.dueDate}
Tiến độ hiện tại: ${selectedTask.progress}%

KẾT QUẢ ĐÁNH GIÁ:
1. Mức độ hoàn thành: ${completionLevel}
2. Chất lượng kết quả: ${quality}
3. Tiến độ thực hiện: ${progressScore}
4. Điểm xếp loại: ${score} / 10 Điểm
5. Nhận xét của lãnh đạo: ${leaderComments}
6. Kết luận đánh giá: ${conclusion}

Trà Giáp, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm 2026
LÃNH ĐẠO PHỤ TRÁCH ĐÁNH GIÁ
Phạm Sơn Triều
Trưởng phòng
`;
    const blob = new Blob([textContent], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Phieu_danh_gia_${selectedTask.id}.doc`;
    link.click();
  };

  const handleExportExcel = () => {
    const headers = ['Mã nhiệm vụ,Nội dung,Cán bộ tham mưu,Đơn vị,Điểm,Mức độ,Tiến độ,Nhận xét lãnh đạo,Kết luận'];
    const rows = tasks.map(t => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.assignee}"`,
      `"${t.department}"`,
      t.evaluation ? `${t.evaluation.score}/10` : 'Chưa chấm',
      `"${t.evaluation?.completionLevel || 'Chưa đánh giá'}"`,
      `"${t.evaluation?.progressScore || (t.status === 'overdue' ? 'Quá hạn' : 'Đang làm')}"`,
      `"${(t.evaluation?.leaderComments || '').replace(/"/g, '""')}"`,
      `"${(t.evaluation?.conclusion || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Bang_danh_gia_nhiem_vu_Tra_Giap_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <Award className="w-4 h-4" />
              <span>Bộ điều hành 6 rõ • Thẩm quyền & Tiêu chí xếp loại</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Đánh giá và nghiệm thu nhiệm vụ công vụ
            </h2>
            <p className="text-xs text-slate-500">
              Đánh giá thực chất, công khai theo mức độ hoàn thành, chất lượng và thời hạn bàn giao
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-blue-600" />
              <span>Xuất Word (Phiếu đánh giá)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Tổng số nhiệm vụ</div>
              <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{tasks.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Toàn bộ danh mục giao việc</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
              {tasks.length}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-700">Đã đánh giá</div>
              <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">{evaluatedTasks.length}</div>
              <div className="text-[11px] text-emerald-600/80 mt-0.5">Đã có điểm & kết luận ({Math.round((evaluatedTasks.length/tasks.length)*100)}%)</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-700">Chưa đánh giá</div>
              <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">{pendingEvaluationTasks.length}</div>
              <div className="text-[11px] text-amber-600/80 mt-0.5">Cần lãnh đạo rà soát chấm điểm</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh sách nhiệm vụ ({tasks.length})
            </h3>
            <span className="text-[11px] text-slate-400">Chọn nhiệm vụ để xem/chấm điểm</span>
          </div>

          <div className="max-h-[700px] overflow-y-auto space-y-2.5 pr-1">
            {tasks.map(task => {
              const isSelected = task.id === selectedTaskId;
              const hasEvaluation = task.evaluation !== undefined;

              return (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-slate-500">{task.id}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      hasEvaluation 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {hasEvaluation ? `Đã chấm: ${task.evaluation?.score} đ` : 'Chưa chấm'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {task.title}
                  </h4>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">CB: <strong>{task.assignee}</strong></span>
                    <span className="tabular-nums font-semibold text-slate-700">Tiến độ: {task.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                MÃ: {selectedTask.id}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Đơn vị: <strong className="text-slate-900">{selectedTask.department}</strong>
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-2 leading-snug">
              {selectedTask.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {selectedTask.content}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block">Chuyên viên tham mưu:</span>
                <strong className="text-slate-800">{selectedTask.assignee}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Người giao:</span>
                <strong className="text-slate-800">{selectedTask.assigner?.split('–')[0]}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Lĩnh vực phụ trách:</span>
                <strong className="text-slate-800">{selectedTask.field}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Hạn xong:</span>
                <strong className="text-slate-800">{selectedTask.dueDate}</strong>
              </div>
            </div>
          </div>

          {isSpecialist && (
            <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-900 uppercase">
                      Chế độ xem kết quả đánh giá (Chuyên viên)
                    </h4>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Theo quy định, chuyên viên không có quyền chấm điểm. Đồng chí có quyền xem kết quả đánh giá của Lãnh đạo và gửi văn bản giải trình hoặc ý kiến phản hồi.
                    </p>
                  </div>
                </div>

                {onOpenFeedback && (
                  <button
                    type="button"
                    onClick={() => onOpenFeedback(selectedTask)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Gửi ý kiến phản hồi / Giải trình</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitEvaluation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Mức độ hoàn thành
                </label>
                <select
                  disabled={isSpecialist}
                  value={completionLevel}
                  onChange={(e) => setCompletionLevel(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium ${
                    isSpecialist ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-emerald-500 cursor-pointer'
                  }`}
                >
                  <option value="Hoàn thành xuất sắc">Hoàn thành xuất sắc</option>
                  <option value="Hoàn thành tốt">Hoàn thành tốt</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Chưa hoàn thành">Chưa hoàn thành</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Chất lượng kết quả
                </label>
                <select
                  disabled={isSpecialist}
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium ${
                    isSpecialist ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-emerald-500 cursor-pointer'
                  }`}
                >
                  <option value="Xuất sắc">Xuất sắc</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Đạt yêu cầu">Đạt yêu cầu</option>
                  <option value="Cần chỉnh sửa bổ sung">Cần chỉnh sửa bổ sung</option>
                  <option value="Chưa đạt">Chưa đạt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Tiến độ thực hiện
                </label>
                <select
                  disabled={isSpecialist}
                  value={progressScore}
                  onChange={(e) => setProgressScore(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium ${
                    isSpecialist ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-emerald-500 cursor-pointer'
                  }`}
                >
                  <option value="Trước hạn">Trước hạn</option>
                  <option value="Đúng hạn">Đúng hạn</option>
                  <option value="Trễ hạn">Trễ hạn</option>
                  <option value="Đang làm trong hạn">Đang làm trong hạn</option>
                  <option value="Quá hạn cần đôn đốc">Quá hạn cần đôn đốc</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>4. Điểm xếp loại (Thang điểm 1 – 10)</span>
                </label>
                <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
                  {score} / 10 Điểm
                </span>
              </div>
              <div className="grid grid-cols-10 gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = score === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={isSpecialist}
                      onClick={() => !isSpecialist && setScore(num)}
                      className={`py-2 rounded-lg text-xs font-black transition-all ${
                        isSpecialist 
                          ? isSelected
                            ? 'bg-slate-700 text-white cursor-default'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isSelected 
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/30 scale-105 cursor-pointer' 
                            : num < 5 
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer' 
                              : num <= 7 
                                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer' 
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. Nhận xét / Đánh giá của lãnh đạo phụ trách
              </label>
              <textarea
                disabled={isSpecialist}
                rows={3}
                value={leaderComments}
                onChange={(e) => setLeaderComments(e.target.value)}
                placeholder="Nhập ý kiến chỉ đạo, nhận xét cụ thể về tinh thần trách nhiệm, mức độ chủ động và chất lượng sản phẩm tham mưu..."
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-normal leading-relaxed ${
                  isSpecialist ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-emerald-500'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                6. Kết luận đánh giá
              </label>
              <input
                disabled={isSpecialist}
                type="text"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Ví dụ: Đạt xuất sắc nhiệm vụ được giao / Hoàn thành tốt..."
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold ${
                  isSpecialist ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-emerald-500'
                }`}
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <Check className="w-3.5 h-3.5" />
                    Đã lưu kết quả đánh giá thành công!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isSpecialist ? (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu kết luận đánh giá</span>
                  </button>
                ) : (
                  onOpenFeedback && (
                    <button
                      type="button"
                      onClick={() => onOpenFeedback(selectedTask)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Phản hồi / Báo cáo giải trình</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
