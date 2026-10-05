import React, { useMemo } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Printer, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Award,
  User
} from 'lucide-react';
import { Task, FIELDS, DEPARTMENTS, UserAccount } from '../../types';

interface GeneralStatsViewProps {
  tasks: Task[];
  currentUser?: UserAccount | null;
}

export const GeneralStatsView: React.FC<GeneralStatsViewProps> = ({ tasks, currentUser }) => {
  const isSpecialist = currentUser?.role === 'specialist';

  // Requirement 1: If specialist, scope strictly to their own task content upon login (excluding Leadership and other Specialists)
  const scopedTasks = useMemo(() => {
    if (isSpecialist && currentUser?.name) {
      const uName = currentUser.name.toLowerCase();
      return tasks.filter(t => {
        const aName = (t.assignee || '').toLowerCase();
        const cName = (t.coordinatingSpecialist || '').toLowerCase();
        return aName.includes(uName) || uName.includes(aName) || cName.includes(uName);
      });
    }
    return tasks;
  }, [tasks, isSpecialist, currentUser]);

  // Aggregate by Field
  const fieldStats = useMemo(() => {
    const activeFields = isSpecialist 
      ? FIELDS.filter(f => scopedTasks.some(t => t.field === f))
      : FIELDS;

    return activeFields.map(fieldName => {
      const fieldTasks = scopedTasks.filter(t => t.field === fieldName);
      const total = fieldTasks.length;
      const completed = fieldTasks.filter(t => t.status === 'completed').length;
      const beforeDeadline = fieldTasks.filter(t => t.status === 'completed' && t.timingStatus === 'before_deadline').length;
      const onTime = fieldTasks.filter(t => t.status === 'completed' && t.timingStatus === 'on_time').length;
      const approaching = fieldTasks.filter(t => t.status !== 'completed' && t.timingStatus === 'approaching').length;
      const inProgress = fieldTasks.filter(t => t.status === 'in_progress').length;
      const overdue = fieldTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        name: fieldName,
        total,
        completed,
        beforeDeadline,
        onTime,
        approaching,
        inProgress,
        overdue,
        completionRate
      };
    });
  }, [scopedTasks, isSpecialist]);

  // Aggregate by Department / Leadership (Excluded if specialist, or only show their own summary)
  const deptStats = useMemo(() => {
    if (isSpecialist) {
      return [];
    }
    return DEPARTMENTS.map(deptName => {
      const deptTasks = scopedTasks.filter(t => t.department === deptName || t.assigner?.includes(deptName));
      const total = deptTasks.length;
      const completed = deptTasks.filter(t => t.status === 'completed').length;
      const beforeDeadline = deptTasks.filter(t => t.status === 'completed' && t.timingStatus === 'before_deadline').length;
      const late = deptTasks.filter(t => t.status === 'completed' && t.timingStatus === 'late').length;
      const inProgress = deptTasks.filter(t => t.status === 'in_progress').length;
      const overdue = deptTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const ratedTasks = deptTasks.filter(t => t.evaluation && t.evaluation.score);
      const avgScore = ratedTasks.length > 0 
        ? (ratedTasks.reduce((acc, cur) => acc + (cur.evaluation?.score || 0), 0) / ratedTasks.length).toFixed(1)
        : 'Chưa chấm';

      return {
        name: deptName,
        total,
        completed,
        beforeDeadline,
        late,
        inProgress,
        overdue,
        completionRate,
        avgScore
      };
    });
  }, [scopedTasks, isSpecialist]);

  // Grand totals
  const grandTotal = scopedTasks.length;
  const grandCompleted = scopedTasks.filter(t => t.status === 'completed').length;
  const grandBefore = scopedTasks.filter(t => t.status === 'completed' && t.timingStatus === 'before_deadline').length;
  const grandOnTime = scopedTasks.filter(t => t.status === 'completed' && t.timingStatus === 'on_time').length;
  const grandApproaching = scopedTasks.filter(t => t.status !== 'completed' && t.timingStatus === 'approaching').length;
  const grandInProgress = scopedTasks.filter(t => t.status === 'in_progress').length;
  const grandOverdue = scopedTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
  const grandRate = grandTotal > 0 ? Math.round((grandCompleted / grandTotal) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Lĩnh vực,Tổng số,Hoàn thành,Trước hạn,Đúng hạn,Sắp đến hạn,Đang thực hiện,Quá hạn,Tỷ lệ hoàn thành %'];
    const rows = fieldStats.map(f => [
      `"${f.name}"`,
      f.total,
      f.completed,
      f.beforeDeadline,
      f.onTime,
      f.approaching,
      f.inProgress,
      f.overdue,
      `${f.completionRate}%`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Bao_cao_tong_hop_${currentUser?.name || 'Tra_Giap'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Bộ điều hành 6 rõ • Báo cáo số liệu quản trị tổng hợp</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Thống kê tổng hợp tiến độ giao việc {isSpecialist ? `(Cá nhân: ${currentUser?.name})` : 'Phòng VH-XH'}
          </h2>
          <p className="text-xs text-slate-500">
            {isSpecialist ? (
              <span className="text-emerald-700 font-semibold">
                * Dữ liệu thống kê tổng hợp được giới hạn cho riêng nhiệm vụ của đồng chí <strong>{currentUser?.name}</strong> (loại trừ thông tin Lãnh đạo và Chuyên viên khác).
              </span>
            ) : (
              'Số liệu thống kê tự động đồng bộ theo các lĩnh vực công tác và Lãnh đạo phụ trách'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Table 1: BẢNG TỔNG HỢP THEO LĨNH VỰC */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            BẢNG TỔNG HỢP TIẾN ĐỘ THEO LĨNH VỰC {isSpecialist ? `CỦA CHUYÊN VIÊN ${currentUser?.name?.toUpperCase()}` : ''}
          </h3>
          <span className="text-[11px] text-slate-400">
            {fieldStats.length} Lĩnh vực có nhiệm vụ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[200px]">Lĩnh vực chuyên môn</th>
                <th className="py-3 px-3 text-center">Tổng số</th>
                <th className="py-3 px-3 text-center text-emerald-700">Hoàn thành</th>
                <th className="py-3 px-3 text-center">Trước hạn</th>
                <th className="py-3 px-3 text-center">Đúng hạn</th>
                <th className="py-3 px-3 text-center text-amber-700">Sắp đến hạn</th>
                <th className="py-3 px-3 text-center text-blue-700">Đang thực hiện</th>
                <th className="py-3 px-3 text-center text-rose-700">Quá hạn</th>
                <th className="py-3 px-4 text-right min-w-[130px]">Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {fieldStats.map((item, index) => (
                <tr key={item.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-500 tabular-nums">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3 px-3 text-center font-black text-slate-800 tabular-nums">
                    {item.total}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700 tabular-nums">
                    {item.completed}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 tabular-nums">
                    {item.beforeDeadline}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 tabular-nums">
                    {item.onTime}
                  </td>
                  <td className="py-3 px-3 text-center text-amber-700 font-semibold tabular-nums">
                    {item.approaching}
                  </td>
                  <td className="py-3 px-3 text-center text-blue-700 font-semibold tabular-nums">
                    {item.inProgress}
                  </td>
                  <td className="py-3 px-3 text-center tabular-nums">
                    {item.overdue > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        {item.overdue}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${item.completionRate}%` }} 
                        />
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums text-xs min-w-[36px]">
                        {item.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Total Summary Row */}
              <tr className="bg-emerald-50/60 font-black text-slate-900 border-t-2 border-emerald-300">
                <td colSpan={2} className="py-3.5 px-4 text-left uppercase text-emerald-950 font-bold">
                  {isSpecialist ? `TỔNG CỘNG (${currentUser?.name?.toUpperCase()})` : 'TỔNG CỘNG TOÀN ĐƠN VỊ'}
                </td>
                <td className="py-3.5 px-3 text-center tabular-nums text-base">{grandTotal}</td>
                <td className="py-3.5 px-3 text-center tabular-nums text-emerald-700 text-base">{grandCompleted}</td>
                <td className="py-3.5 px-3 text-center tabular-nums text-emerald-800">{grandBefore}</td>
                <td className="py-3.5 px-3 text-center tabular-nums">{grandOnTime}</td>
                <td className="py-3.5 px-3 text-center tabular-nums text-amber-800">{grandApproaching}</td>
                <td className="py-3.5 px-3 text-center tabular-nums text-blue-800">{grandInProgress}</td>
                <td className="py-3.5 px-3 text-center tabular-nums text-rose-700">{grandOverdue}</td>
                <td className="py-3.5 px-4 text-right text-emerald-800 tabular-nums text-base">
                  {grandRate}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: THỐNG KÊ THEO LÃNH ĐẠO PHỤ TRÁCH (Only shown for Leadership / Admin) */}
      {!isSpecialist && deptStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              THỐNG KÊ THEO LÃNH ĐẠO PHỤ TRÁCH VÀ ĐIỂM ĐÁNH GIÁ TRUNG BÌNH
            </h3>
            <span className="text-[11px] text-slate-400">{deptStats.length} Lãnh đạo</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[200px]">Lãnh đạo phụ trách</th>
                  <th className="py-3 px-3 text-center">Tổng số việc</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Hoàn thành</th>
                  <th className="py-3 px-3 text-center">Trước hạn</th>
                  <th className="py-3 px-3 text-center">Trễ hạn</th>
                  <th className="py-3 px-3 text-center text-blue-700">Đang thực hiện</th>
                  <th className="py-3 px-3 text-center text-rose-700">Quá hạn</th>
                  <th className="py-3 px-4 text-center">Tỷ lệ hoàn thành</th>
                  <th className="py-3 px-4 text-center text-amber-800 font-bold">Điểm đánh giá TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {deptStats.map((dept, index) => (
                  <tr key={dept.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-500 tabular-nums">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {dept.name}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-slate-800 tabular-nums">
                      {dept.total}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700 tabular-nums">
                      {dept.completed}
                    </td>
                    <td className="py-3 px-3 text-center text-emerald-800 tabular-nums">
                      {dept.beforeDeadline}
                    </td>
                    <td className="py-3 px-3 text-center text-amber-700 tabular-nums">
                      {dept.late}
                    </td>
                    <td className="py-3 px-3 text-center text-blue-700 tabular-nums">
                      {dept.inProgress}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums">
                      {dept.overdue > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {dept.overdue}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {dept.completionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 tabular-nums">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {dept.avgScore} / 10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
