import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileDown, 
  CheckSquare, 
  Square,
  User,
  ArrowRight
} from 'lucide-react';
import { Task, DEPARTMENTS } from '../../types';

interface DepartmentStatsViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const DepartmentStatsView: React.FC<DepartmentStatsViewProps> = ({
  tasks,
  onSelectTask
}) => {
  const [selectedDepts, setSelectedDepts] = useState<string[]>([...DEPARTMENTS]);

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length > 1) {
        setSelectedDepts(selectedDepts.filter(d => d !== dept));
      }
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const selectAll = () => setSelectedDepts([...DEPARTMENTS]);

  const filteredTasks = tasks.filter(t => selectedDepts.includes(t.department) || (t.assigner && selectedDepts.some(d => t.assigner.includes(d))));

  const total = filteredTasks.length;
  const completed = filteredTasks.filter(t => t.status === 'completed').length;
  const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
  const overdue = filteredTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;

  const handleExportWord = () => {
    const textContent = `
UBND XÃ TRÀ GIÁP
PHÒNG VĂN HÓA - XÃ HỘI
HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ TRÀ GIÁP TASK V4
BẢN QUYỀN: NGUYỄN VĂN THẠNH

BÁO CÁO TIẾN ĐỘ THỰC HIỆN THEO LÃNH ĐẠO PHỤ TRÁCH
Đơn vị tổng hợp: ${selectedDepts.join(', ')}
Thời điểm xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}

TỔNG QUAN SỐ LIỆU:
- Tổng số việc: ${total} nhiệm vụ
- Đã hoàn thành: ${completed} nhiệm vụ (${total > 0 ? Math.round((completed/total)*100) : 0}%)
- Đang thực hiện: ${inProgress} nhiệm vụ
- Quá hạn chưa xong: ${overdue} nhiệm vụ

DANH SÁCH CHI TIẾT NHIỆM VỤ:
${filteredTasks.map((t, idx) => `
${idx + 1}. [${t.id}] ${t.title}
   - Lãnh đạo: ${t.department} | Chuyên viên: ${t.assignee}
   - Hạn xong: ${t.dueDate} | Tiến độ: ${t.progress}%
   - Trạng thái: ${t.status === 'completed' ? 'Hoàn thành' : t.status === 'overdue' ? 'Quá hạn' : 'Đang làm'}
   ${t.evaluation ? `- Đánh giá: ${t.evaluation.score}/10 điểm (${t.evaluation.conclusion})` : ''}
`).join('\n')}

LÃNH ĐẠO PHÒNG VĂN HÓA - XÃ HỘI
(Đã ký số trên hệ thống TG4)
Phạm Sơn Triều
`;
    const blob = new Blob([textContent], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bao_cao_don_vi_Tra_Giap_${new Date().toISOString().slice(0, 10)}.doc`;
    link.click();
  };

  const handleExportCSV = () => {
    const headers = ['Mã nhiệm vụ,Nội dung,Lãnh đạo phụ trách,Chuyên viên tham mưu,Hạn xong,Tiến độ %,Trạng thái,Đánh giá'];
    const rows = filteredTasks.map(t => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.department}"`,
      `"${t.assignee}"`,
      `"${t.dueDate}"`,
      `${t.progress}%`,
      `"${t.status === 'completed' ? 'Hoàn thành' : t.status === 'overdue' ? 'Quá hạn' : 'Đang làm'}"`,
      `"${t.evaluation ? `${t.evaluation.score}/10` : 'Chưa đánh giá'}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Thong_ke_theo_don_vi_Tra_Giap_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Bộ điều hành 6 rõ • Báo cáo chuyên đề theo lãnh đạo phụ trách</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Thống kê chi tiết theo Lãnh đạo phụ trách
          </h2>
          <p className="text-xs text-slate-500">
            Chọn các lãnh đạo phụ trách bên dưới để so sánh số lượng, tiến độ và xuất báo cáo tổng kết
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
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
            <span>Xuất báo cáo Word</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span>Chọn lãnh đạo phụ trách:</span>
            <button
              onClick={selectAll}
              className="text-[11px] font-normal text-emerald-700 hover:underline cursor-pointer"
            >
              (Chọn tất cả)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {DEPARTMENTS.map(dept => {
              const isChecked = selectedDepts.includes(dept);
              const deptCount = tasks.filter(t => t.department === dept || t.assigner?.includes(dept)).length;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDept(dept)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isChecked 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{dept}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isChecked ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {deptCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Tổng số việc</div>
          <div className="text-3xl font-black text-slate-900 mt-1 tabular-nums">{total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Theo các lãnh đạo đã chọn</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 flex items-center justify-between">
            <span>Hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-1 tabular-nums">{completed}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">
            Tỷ lệ: {total > 0 ? Math.round((completed/total)*100) : 0}%
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs">
          <div className="text-xs font-semibold text-blue-700 flex items-center justify-between">
            <span>Đang thực hiện</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-700 mt-1 tabular-nums">{inProgress}</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">Đang triển khai</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-xs">
          <div className="text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>Quá hạn</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-1 tabular-nums">{overdue}</div>
          <div className="text-[11px] text-rose-600 font-bold mt-0.5">Cần chấn chỉnh tiến độ</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            BẢNG CHI TIẾT CÁC NHIỆM VỤ THEO LÃNH ĐẠO ĐÃ CHỌN ({filteredTasks.length} VIỆC)
          </h3>
          <span className="text-[11px] text-slate-400">Dữ liệu thực tế năm 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 text-center w-12">STT</th>
                <th className="py-3 px-4 w-32">Mã NV</th>
                <th className="py-3 px-4 min-w-[260px]">Nội dung nhiệm vụ</th>
                <th className="py-3 px-3 min-w-[130px]">Lãnh đạo phụ trách</th>
                <th className="py-3 px-3 min-w-[140px]">Chuyên viên tham mưu</th>
                <th className="py-3 px-3 min-w-[100px]">Hạn xong</th>
                <th className="py-3 px-3 min-w-[120px]">Tiến độ %</th>
                <th className="py-3 px-4 min-w-[140px]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.map((task, index) => {
                const isOverdue = task.status === 'overdue' || (task.status !== 'completed' && task.timingStatus === 'overdue');
                const isCompleted = task.status === 'completed';

                return (
                  <tr 
                    key={task.id} 
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-slate-50/90 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-center font-bold text-slate-500 tabular-nums">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {task.id}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 hover:text-emerald-700">
                      {task.title}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{task.department}</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.assignee}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 tabular-nums font-semibold text-slate-700">
                      {task.dueDate}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="tabular-nums font-bold text-slate-800">{task.progress}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Hoàn thành
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Quá hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-blue-600" />
                          Đang làm
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
