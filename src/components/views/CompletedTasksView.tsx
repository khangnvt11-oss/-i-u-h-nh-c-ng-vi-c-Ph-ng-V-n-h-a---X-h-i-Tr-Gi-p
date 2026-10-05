import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCheck, 
  Clock, 
  FileSpreadsheet, 
  FileText, 
  User, 
  Building2, 
  Calendar, 
  Star, 
  Eye,
  Filter,
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { Task, UserAccount } from '../../types';
import { databaseService } from '../../services/databaseService';

interface CompletedTasksViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  currentUser?: UserAccount | null;
}

export const CompletedTasksView: React.FC<CompletedTasksViewProps> = ({
  tasks,
  onSelectTask,
  currentUser
}) => {
  const isSpecialist = currentUser?.role === 'specialist';

  // Requirement 1: If specialist, scope strictly to their own task content upon login (excluding Leadership and other Specialists)
  const userScopedTasks = useMemo(() => {
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

  const [filterSpecialist, setFilterSpecialist] = useState<string>('all');
  const [filterLeader, setFilterLeader] = useState<string>('all');
  const [specialistsList, setSpecialistsList] = useState<UserAccount[]>([]);
  const [leadersList, setLeadersList] = useState<UserAccount[]>([]);

  // Requirement 3 & 4: Fetch accounts to populate filter dropdowns (Leaders and Specialists from the database)
  // Strictly exclude Specialist Nguyen Van Thanh from the Leader filter
  useEffect(() => {
    databaseService.fetchAccountsFromApi().then(accounts => {
      if (accounts && accounts.length > 0) {
        // Specialists list (deduplicated, excluding leadership)
        const rawSpecs = accounts.filter(a => 
          (a.role === 'specialist' || a.position?.toLowerCase().includes('chuyên viên')) &&
          !a.position?.toLowerCase().includes('trưởng') &&
          !a.position?.toLowerCase().includes('phó') &&
          a.name !== 'Phạm Sơn Triều' &&
          a.name !== 'Nguyễn Tấn Tình'
        );
        const specMap = new Map<string, UserAccount>();
        rawSpecs.forEach(s => {
          if (!specMap.has(s.name)) specMap.set(s.name, s);
        });
        setSpecialistsList(Array.from(specMap.values()));

        // Leaders list (strictly excluding Specialist Nguyen Van Thanh)
        const rawLeaders = accounts.filter(a => 
          a.name !== 'Nguyễn Văn Thạnh' && 
          (a.role === 'leader' || a.position?.toLowerCase().includes('trưởng') || a.position?.toLowerCase().includes('phó'))
        );
        const leaderMap = new Map<string, UserAccount>();
        rawLeaders.forEach(l => {
          if (!leaderMap.has(l.name)) leaderMap.set(l.name, l);
        });
        setLeadersList(Array.from(leaderMap.values()));
      }
    });
  }, []);

  const completedTasks = userScopedTasks.filter(t => t.status === 'completed');
  const incompleteTasks = userScopedTasks.filter(t => t.status !== 'completed');

  // Requirement 3: Change "Filter by Unit" to "Filter by Specialist" and add "Filter by Supervising Leader"
  const filteredCompleted = useMemo(() => {
    return completedTasks.filter(t => {
      if (!isSpecialist && filterSpecialist !== 'all') {
        const s = filterSpecialist.toLowerCase();
        const a = (t.assignee || '').toLowerCase();
        if (!a.includes(s) && !s.includes(a)) return false;
      }
      if (!isSpecialist && filterLeader !== 'all') {
        const l = filterLeader.toLowerCase();
        const dept = (t.department || '').toLowerCase();
        const assigner = (t.assigner || '').toLowerCase();
        if (!dept.includes(l) && !assigner.includes(l)) return false;
      }
      return true;
    });
  }, [completedTasks, isSpecialist, filterSpecialist, filterLeader]);

  const handleExportCSV = () => {
    const headers = ['STT,Mã nhiệm vụ,Nội dung nhiệm vụ,Ngày giao,Hạn xong,Ngày hoàn thành,Lãnh đạo phụ trách,Chuyên viên tham mưu,Đơn vị,Điểm,Kết luận đánh giá'];
    const rows = filteredCompleted.map((t, idx) => [
      idx + 1,
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.assignedDate}"`,
      `"${t.dueDate}"`,
      `"${t.completedDate || t.dueDate}"`,
      `"${t.assigner}"`,
      `"${t.assignee}"`,
      `"${t.department}"`,
      t.evaluation ? `${t.evaluation.score}/10` : 'N/A',
      `"${(t.evaluation?.conclusion || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `DS_Nhiem_vu_hoan_thanh_${currentUser?.name || 'Tra_Giap'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 2 Thẻ lớn: Nhiệm vụ hoàn thành và Nhiệm vụ chưa hoàn thành */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Thẻ 1: Nhiệm vụ hoàn thành */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
            <CheckCheck className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>Nghiệm thu đạt yêu cầu</span>
              </div>
              <h3 className="text-lg font-bold text-emerald-50">
                {isSpecialist ? `Nhiệm vụ đã hoàn thành (${currentUser?.name})` : 'Nhiệm vụ đã hoàn thành'}
              </h3>
              <div className="text-4xl sm:text-5xl font-black mt-2 tracking-tight tabular-nums">
                {completedTasks.length} <span className="text-xl font-medium text-emerald-100">/ {userScopedTasks.length}</span>
              </div>
              <p className="text-xs text-emerald-100 mt-2">
                Tỷ lệ hoàn thành: <strong>{userScopedTasks.length > 0 ? Math.round((completedTasks.length / userScopedTasks.length) * 100) : 0}%</strong>
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20">
              <CheckCheck className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Thẻ 2: Nhiệm vụ chưa hoàn thành */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
            <Clock className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs mb-2 text-slate-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Đang điều hành & đôn đốc</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">Nhiệm vụ chưa hoàn thành</h3>
              <div className="text-4xl sm:text-5xl font-black mt-2 tracking-tight tabular-nums text-amber-400">
                {incompleteTasks.length} <span className="text-xl font-medium text-slate-400">/ {userScopedTasks.length}</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Nhiệm vụ đang triển khai hoặc cần hoàn thiện sản phẩm báo cáo
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table of Completed Tasks */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Danh sách chi tiết {filteredCompleted.length} nhiệm vụ đã hoàn thành
            </h3>
            <p className="text-xs text-slate-500">
              {isSpecialist 
                ? `Hiển thị danh sách nhiệm vụ đã hoàn thành của riêng đồng chí ${currentUser?.name}`
                : 'Các nhiệm vụ đã có sản phẩm bàn giao và được Lãnh đạo phê duyệt nghiệm thu'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Requirement 3: Change "Filter by Unit" to "Filter by Specialist" and add "Filter by Supervising Leader" */}
            {!isSpecialist && (
              <>
                {/* 1. Filter by Specialist */}
                <select
                  value={filterSpecialist}
                  onChange={(e) => setFilterSpecialist(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="all">-- Lọc theo chuyên viên (Tất cả) --</option>
                  {specialistsList.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* 2. Filter by Supervising Leader */}
                <select
                  value={filterLeader}
                  onChange={(e) => setFilterLeader(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="all">-- Lọc theo lãnh đạo phụ trách (Tất cả) --</option>
                  {leadersList.map(l => (
                    <option key={l.id} value={l.name}>
                      {l.name} ({l.position || 'Lãnh đạo'})
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất danh sách</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 text-center w-12">STT</th>
                <th className="py-3 px-4 w-32">Mã nhiệm vụ</th>
                <th className="py-3 px-4 min-w-[260px]">Nội dung</th>
                <th className="py-3 px-3 min-w-[100px]">Ngày giao</th>
                <th className="py-3 px-3 min-w-[100px]">Hạn xong</th>
                <th className="py-3 px-3 min-w-[130px]">Lãnh đạo giao việc</th>
                <th className="py-3 px-3 min-w-[140px]">Chuyên viên tham mưu</th>
                <th className="py-3 px-4 min-w-[220px]">Đánh giá & Kết luận</th>
                <th className="py-3 px-4 text-center w-20">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCompleted.map((task, index) => {
                const evalData = task.evaluation;
                const isBefore = task.timingStatus === 'before_deadline';

                return (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-500 tabular-nums">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {task.id}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div 
                        onClick={() => onSelectTask(task)}
                        className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
                      >
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{task.department}</span>
                        <span>•</span>
                        <span>{task.field}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 tabular-nums">
                      {task.assignedDate}
                    </td>

                    <td className="py-3 px-3">
                      <div className="tabular-nums font-semibold text-slate-800">{task.dueDate}</div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold mt-0.5 ${
                        isBefore ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isBefore ? 'Trước hạn' : 'Trễ hạn'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700">
                      <div className="font-semibold text-[11px]">{task.assigner.split('–')[0]}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.assignee}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {evalData ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200 tabular-nums">
                              {evalData.score}/10 Điểm
                            </span>
                            <span className="font-semibold text-slate-800 text-[11px]">
                              {evalData.completionLevel}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                            "{evalData.leaderComments}"
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có phiếu đánh giá</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectTask(task)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Xem toàn bộ hồ sơ nghiệm thu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số nhiệm vụ hoàn thành: <strong className="text-slate-900 font-bold">{filteredCompleted.length}</strong> việc</span>
          <span className="text-emerald-700 font-semibold">100% nhiệm vụ đã được nghiệm thu bàn giao đầy đủ</span>
        </div>
      </div>
    </div>
  );
};
