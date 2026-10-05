import React, { useMemo } from 'react';
import { 
  Users, 
  BarChart, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Star,
  FileSpreadsheet,
  TrendingUp,
  User
} from 'lucide-react';
import { Task, STAFFS, UserAccount } from '../../types';

interface StaffStatsViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  currentUser?: UserAccount | null;
}

export const StaffStatsView: React.FC<StaffStatsViewProps> = ({
  tasks,
  onSelectTask,
  currentUser
}) => {
  const isSpecialist = currentUser?.role === 'specialist';

  // Requirement 1: If specialist, scope strictly to their own task content upon login (excluding Leadership and other Specialists)
  const scopedStaffList = useMemo(() => {
    if (isSpecialist && currentUser?.name) {
      const uName = currentUser.name.toLowerCase();
      const matched = STAFFS.filter(s => s.name.toLowerCase().includes(uName) || uName.includes(s.name.toLowerCase()));
      if (matched.length > 0) return matched;
      return [{ name: currentUser.name, department: currentUser.department || 'Phòng Văn hóa - Xã hội', role: currentUser.position || 'Chuyên viên' }];
    }
    return STAFFS;
  }, [isSpecialist, currentUser]);

  // Aggregate staff metrics
  const staffData = useMemo(() => {
    return scopedStaffList.map(staff => {
      const staffTasks = tasks.filter(t => 
        (t.assignee && (t.assignee.toLowerCase().includes(staff.name.toLowerCase()) || staff.name.toLowerCase().includes(t.assignee.toLowerCase()))) ||
        (t.coordinatingSpecialist && t.coordinatingSpecialist.toLowerCase().includes(staff.name.toLowerCase()))
      );
      const total = staffTasks.length;
      const completed = staffTasks.filter(t => t.status === 'completed').length;
      const inProgress = staffTasks.filter(t => t.status === 'in_progress').length;
      const overdue = staffTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const rated = staffTasks.filter(t => t.evaluation && t.evaluation.score);
      const avgScore = rated.length > 0 
        ? (rated.reduce((acc, c) => acc + (c.evaluation?.score || 0), 0) / rated.length).toFixed(1)
        : 'Chưa chấm';

      return {
        name: staff.name,
        department: staff.department,
        role: staff.role,
        total,
        completed,
        inProgress,
        overdue,
        rate,
        avgScore,
        tasks: staffTasks
      };
    });
  }, [scopedStaffList, tasks]);

  const handleExportCSV = () => {
    const headers = ['Họ và tên cán bộ,Đơn vị,Chức vụ,Tổng số việc,Đã hoàn thành,Đang làm,Quá hạn,Tỷ lệ hoàn thành %,Điểm đánh giá TB'];
    const rows = staffData.map(s => [
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.role}"`,
      s.total,
      s.completed,
      s.inProgress,
      s.overdue,
      `${s.rate}%`,
      s.avgScore
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Thong_ke_can_bo_${currentUser?.name || 'Tra_Giap'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <Users className="w-4 h-4" />
            <span>Bộ điều hành 6 rõ • Quản trị năng lực & Trách nhiệm cá nhân</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Thống kê theo chuyên viên {isSpecialist ? `(Cá nhân: ${currentUser?.name})` : ''}
          </h2>
          <p className="text-xs text-slate-500">
            {isSpecialist ? (
              <span className="text-emerald-700 font-semibold">
                * Hệ thống chỉ hiển thị báo cáo hiệu suất của riêng đồng chí <strong>{currentUser?.name}</strong> (loại trừ thông tin Lãnh đạo và Chuyên viên khác).
              </span>
            ) : (
              'Đánh giá hiệu suất công vụ của từng chuyên viên tham mưu theo nguyên tắc "Rõ người - Rõ việc"'
            )}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Xuất Excel thống kê</span>
        </button>
      </div>

      {/* Biểu đồ Cột So Sánh Khối Lượng và Tỷ Lệ Hoàn Thành */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              {isSpecialist ? `Hiệu suất thực hiện nhiệm vụ cá nhân (${currentUser?.name})` : `Biểu đồ so sánh khối lượng và tỷ lệ hoàn thành (${staffData.length} Chuyên viên)`}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {staffData.length} Chuyên viên
          </span>
        </div>

        <div className={`grid grid-cols-1 ${staffData.length === 1 ? 'max-w-md' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-4`}>
          {staffData.map((staff, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{staff.name}</span>
                  <span className="text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                    {staff.department}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">{staff.role}</div>

                {/* Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Tỷ lệ xong:</span>
                    <strong className="text-emerald-700 tabular-nums font-black">{staff.rate}%</strong>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${staff.rate}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 mt-3 text-center text-[10px]">
                  <div className="p-1.5 bg-white rounded border border-slate-100">
                    <div className="text-slate-400">Tổng</div>
                    <div className="font-bold text-slate-800 text-xs tabular-nums">{staff.total}</div>
                  </div>
                  <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100">
                    <div className="text-emerald-700">Xong</div>
                    <div className="font-bold text-emerald-800 text-xs tabular-nums">{staff.completed}</div>
                  </div>
                  <div className="p-1.5 bg-rose-50 rounded border border-rose-100">
                    <div className="text-rose-700">Trễ</div>
                    <div className="font-bold text-rose-800 text-xs tabular-nums">{staff.overdue}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Điểm TB:</span>
                <span className="font-extrabold text-amber-700 flex items-center gap-0.5 tabular-nums">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {staff.avgScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng Chi Tiết Cán Bộ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            BẢNG ĐÁNH GIÁ TIẾN ĐỘ VÀ NĂNG LỰC CHUYÊN VIÊN THAM MƯU
          </h3>
          <span className="text-[11px] text-slate-400">Phòng Văn hóa - Xã hội</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[180px]">Họ và tên chuyên viên</th>
                <th className="py-3 px-3 min-w-[130px]">Đơn vị công tác</th>
                <th className="py-3 px-3 min-w-[180px]">Vị trí việc làm</th>
                <th className="py-3 px-3 text-center">Tổng việc</th>
                <th className="py-3 px-3 text-center text-emerald-700">Hoàn thành</th>
                <th className="py-3 px-3 text-center text-blue-700">Đang làm</th>
                <th className="py-3 px-3 text-center text-rose-700">Quá hạn</th>
                <th className="py-3 px-4 text-center">Tỷ lệ xong</th>
                <th className="py-3 px-4 text-center text-amber-800 font-bold">Điểm TB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {staffData.map((staff, index) => (
                <tr key={staff.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500 tabular-nums">
                    {index + 1}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
                        {staff.name.slice(0, 1)}
                      </div>
                      <span>{staff.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-slate-700">{staff.department}</span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                    {staff.role}
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-slate-900 tabular-nums">
                    {staff.total}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-emerald-700 tabular-nums">
                    {staff.completed}
                  </td>

                  <td className="py-3.5 px-3 text-center text-blue-700 tabular-nums font-semibold">
                    {staff.inProgress}
                  </td>

                  <td className="py-3.5 px-3 text-center tabular-nums">
                    {staff.overdue > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        {staff.overdue}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-black text-slate-900 tabular-nums text-xs">
                      {staff.rate}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 tabular-nums">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {staff.avgScore} / 10
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
