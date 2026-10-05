import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  User, 
  Edit3, 
  Eye, 
  FileDown, 
  Plus, 
  ArrowUpDown,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { Task, DEPARTMENTS, UserAccount, STAFFS } from '../../types';
import { databaseService } from '../../services/databaseService';

interface TaskTrackingViewProps {
  tasks: Task[];
  initialFilter?: string;
  onSelectTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  onUpdateProgress: (taskId: string, newProgress: number) => void;
  currentUser?: UserAccount | null;
  onOpenEditTask?: (task: Task) => void;
  onOpenFeedback?: (task: Task) => void;
}

export const TaskTrackingView: React.FC<TaskTrackingViewProps> = ({
  tasks,
  initialFilter,
  onSelectTask,
  onOpenNewTaskModal,
  onUpdateProgress,
  currentUser,
  onOpenEditTask,
  onOpenFeedback
}) => {
  const isSpecialist = currentUser?.role === 'specialist';
  const isLeaderOrAdmin = currentUser ? (currentUser.role === 'admin' || currentUser.role === 'leader') : false;

  // Requirement 1: If specialist, filter tasks strictly to their own task content upon login (excluding Leadership and other Specialists)
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

  const [selectedLeader, setSelectedLeader] = useState<string>('all');
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialFilter && ['in_progress', 'completed', 'overdue'].includes(initialFilter) 
      ? initialFilter 
      : 'all'
  );
  const [selectedTiming, setSelectedTiming] = useState<string>(
    initialFilter && ['before_deadline', 'on_time', 'late', 'approaching', 'overdue'].includes(initialFilter)
      ? initialFilter
      : 'all'
  );
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'progress' | 'id'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load specialist accounts and fields (excluding leadership)
  const specialistAccounts = useMemo(() => {
    const list = databaseService.loadAccounts().filter(a => 
      (a.role === 'specialist' || a.position?.toLowerCase().includes('chuyên viên')) &&
      !a.position?.toLowerCase().includes('trưởng') &&
      !a.position?.toLowerCase().includes('phó') &&
      a.name !== 'Phạm Sơn Triều' &&
      a.name !== 'Nguyễn Tấn Tình'
    );
    const map = new Map<string, { id: string; name: string }>();
    list.forEach(a => map.set(a.name, { id: a.id, name: a.name }));
    STAFFS.forEach(s => {
      if (!map.has(s.name) && s.name !== 'Phạm Sơn Triều' && s.name !== 'Nguyễn Tấn Tình') {
        map.set(s.name, { id: s.name, name: s.name });
      }
    });
    return Array.from(map.values());
  }, []);

  const fieldsList = useMemo(() => {
    return databaseService.loadFields();
  }, []);

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    return scopedTasks.filter(t => {
      // Leader Filter (Only applicable if not specialist, or for their own supervising leader)
      if (!isSpecialist && selectedLeader !== 'all' && t.department !== selectedLeader && !t.assigner?.includes(selectedLeader)) return false;

      // Specialist Filter (Only applicable if not specialist)
      if (!isSpecialist && selectedSpecialist !== 'all') {
        const sName = selectedSpecialist.toLowerCase();
        const aName = (t.assignee || '').toLowerCase();
        if (!aName.includes(sName) && !sName.includes(aName)) return false;
      }

      // Work Area / Field Filter
      if (selectedField !== 'all' && t.field !== selectedField) return false;

      // Status
      if (selectedStatus === 'in_progress' && t.status !== 'in_progress') return false;
      if (selectedStatus === 'completed' && t.status !== 'completed') return false;
      if (selectedStatus === 'overdue' && (t.status !== 'overdue' && t.timingStatus !== 'overdue')) return false;
      if (selectedStatus === 'incomplete' && t.status === 'completed') return false;
      
      // Timing
      if (selectedTiming !== 'all') {
        if (selectedTiming === 'overdue' && t.timingStatus !== 'overdue' && t.status !== 'overdue') return false;
        if (selectedTiming === 'approaching' && t.timingStatus !== 'approaching') return false;
        if (selectedTiming === 'before_deadline' && t.timingStatus !== 'before_deadline') return false;
        if (selectedTiming === 'on_time' && t.timingStatus !== 'on_time') return false;
        if (selectedTiming === 'late' && t.timingStatus !== 'late') return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.assignee?.toLowerCase().includes(q) ||
          t.department?.toLowerCase().includes(q) ||
          t.field?.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc' ? a.dueDate.localeCompare(b.dueDate) : b.dueDate.localeCompare(a.dueDate);
      }
      if (sortBy === 'progress') {
        return sortOrder === 'asc' ? a.progress - b.progress : b.progress - a.progress;
      }
      return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    });
  }, [scopedTasks, isSpecialist, selectedLeader, selectedSpecialist, selectedField, selectedStatus, selectedTiming, search, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const headers = ['Mã nhiệm vụ,Nội dung,Người giao,Chuyên viên tham mưu,Lãnh đạo phụ trách,Lĩnh vực,Ngày giao,Hạn xong,Tiến độ %,Trạng thái,Đánh giá'];
    const rows = filteredTasks.map(t => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.assigner}"`,
      `"${t.assignee}"`,
      `"${t.department}"`,
      `"${t.field}"`,
      `"${t.assignedDate}"`,
      `"${t.dueDate}"`,
      `${t.progress}%`,
      `"${t.status === 'completed' ? 'Hoàn thành' : t.status === 'overdue' ? 'Quá hạn' : 'Đang làm'}"`,
      `"${t.evaluation ? `${t.evaluation.score}/10 - ${t.evaluation.conclusion}` : 'Chưa đánh giá'}"`
    ].join(','));
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tien_do_giao_viec_${currentUser?.name || 'Tra_Giap'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <Clock className="w-4 h-4" />
            <span>Bộ điều hành 6 rõ • Bảng theo dõi tiến độ công việc</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Theo dõi tiến độ thực hiện nhiệm vụ công vụ {isSpecialist ? `(Cá nhân: ${currentUser?.name})` : ''}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSpecialist ? (
              <span className="text-emerald-700 font-semibold">
                * Hệ thống hiển thị riêng các nhiệm vụ của đồng chí <strong>{currentUser?.name}</strong> theo phân quyền Chuyên viên (không bao gồm thông tin Lãnh đạo và Chuyên viên khác).
              </span>
            ) : (
              `Tổng cộng ${filteredTasks.length} / ${tasks.length} nhiệm vụ phù hợp với điều kiện lọc`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel / CSV</span>
          </button>
          {!isSpecialist && (
            <button
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Giao việc mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSpecialist ? 'lg:grid-cols-3' : 'lg:grid-cols-5'} gap-2.5`}>
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã NV, nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            />
          </div>

          {/* Leaders & Specialists Filter - Only visible to Leadership/Admins */}
          {!isSpecialist && (
            <>
              <div>
                <select
                  value={selectedLeader}
                  onChange={(e) => setSelectedLeader(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 cursor-pointer"
                >
                  <option value="all">-- Tất cả Lãnh đạo phụ trách --</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedSpecialist}
                  onChange={(e) => setSelectedSpecialist(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 cursor-pointer"
                >
                  <option value="all">-- Tất cả Chuyên viên tham mưu --</option>
                  {specialistAccounts.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 cursor-pointer"
            >
              <option value="all">-- Tất cả trạng thái --</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="overdue">Quá hạn chưa xong</option>
            </select>
          </div>

          {/* Filter Timing */}
          <div>
            <select
              value={selectedTiming}
              onChange={(e) => setSelectedTiming(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 cursor-pointer"
            >
              <option value="all">-- Tất cả tình trạng hạn --</option>
              <option value="overdue">Đã quá hạn</option>
              <option value="approaching">Sắp đến hạn</option>
              <option value="before_deadline">Trước hạn</option>
              <option value="on_time">Đúng hạn</option>
              <option value="late">Trễ hạn</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Lĩnh vực phụ trách:</span>
          <button
            onClick={() => { setSelectedField('all'); setSelectedLeader('all'); setSelectedSpecialist('all'); setSelectedStatus('all'); setSelectedTiming('all'); setSearch(''); }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
              selectedField === 'all' && selectedLeader === 'all' && selectedSpecialist === 'all' && selectedStatus === 'all' && selectedTiming === 'all' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({scopedTasks.length})
          </button>

          {fieldsList.slice(0, 6).map(fName => {
            const count = scopedTasks.filter(t => t.field === fName).length;
            const isSelected = selectedField === fName;
            return (
              <button
                key={fName}
                onClick={() => setSelectedField(isSelected ? 'all' : fName)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {fName} ({count})
              </button>
            );
          })}

          <button
            onClick={() => { setSelectedTiming('overdue'); setSelectedStatus('all'); }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ml-auto ${
              selectedTiming === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Quá hạn ({scopedTasks.filter(t => t.status === 'overdue' || t.timingStatus === 'overdue').length})
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[280px]">Nội dung nhiệm vụ</th>
                <th className="py-3 px-3 min-w-[130px]">Lãnh đạo giao việc</th>
                <th className="py-3 px-3 min-w-[140px]">Chuyên viên tham mưu</th>
                <th className="py-3 px-3 min-w-[120px]">
                  <button 
                    onClick={() => {
                      if (sortBy === 'dueDate') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('dueDate'); setSortOrder('asc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Hạn xong</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 min-w-[140px]">
                  <button 
                    onClick={() => {
                      if (sortBy === 'progress') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('progress'); setSortOrder('desc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                  >
                    <span>Tiến độ %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.map((task, index) => {
                const isOverdue = task.status === 'overdue' || (task.status !== 'completed' && task.timingStatus === 'overdue');
                const isApproaching = task.status !== 'completed' && task.timingStatus === 'approaching';
                const isCompleted = task.status === 'completed';

                return (
                  <tr 
                    key={task.id} 
                    className={`hover:bg-slate-50/90 transition-colors ${isOverdue ? 'bg-rose-50/30' : isApproaching ? 'bg-amber-50/20' : ''}`}
                  >
                    {/* STT */}
                    <td className="py-3 px-4 text-center font-bold text-slate-500 tabular-nums">
                      {index + 1}
                    </td>

                    {/* Nội dung nhiệm vụ */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          {task.id}
                        </span>
                        <div>
                          <div 
                            onClick={() => onSelectTask(task)}
                            className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
                          >
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                            <span className="text-emerald-700 font-medium">{task.field}</span>
                            {task.coDepartment && (
                              <>
                                <span>•</span>
                                <span>Phối hợp: {task.coDepartment}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Người giao */}
                    <td className="py-3 px-3 text-slate-700">
                      <div className="font-semibold text-[11px] text-slate-800">{task.assigner.split('–')[0]}</div>
                      <div className="text-[10px] text-slate-500">{task.department}</div>
                    </td>

                    {/* Chuyên viên tham mưu */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{task.assignee}</span>
                      </div>
                    </td>

                    {/* Hạn xong with status badges */}
                    <td className="py-3 px-3">
                      <div className="tabular-nums font-semibold text-slate-800">
                        {task.dueDate}
                      </div>
                      <div className="mt-0.5">
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Quá hạn
                          </span>
                        )}
                        {isApproaching && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-2.5 h-2.5" />
                            Sắp đến hạn
                          </span>
                        )}
                        {isCompleted && (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            task.timingStatus === 'before_deadline' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {task.timingStatus === 'before_deadline' ? 'Trước hạn' : 'Trễ hạn'}
                          </span>
                        )}
                        {!isOverdue && !isApproaching && !isCompleted && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Đang trong hạn
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tiến độ % */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-800 tabular-nums">{task.progress}%</span>
                        <span className="text-[10px] text-slate-400">
                          {task.progress === 100 ? 'Hoàn thành' : task.progress > 0 ? 'Đang làm' : 'Chưa bắt đầu'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            task.progress === 100 
                              ? 'bg-emerald-500' 
                              : isOverdue 
                                ? 'bg-rose-500' 
                                : isApproaching 
                                  ? 'bg-amber-500' 
                                  : 'bg-blue-600'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      {/* Fast adjust if not completed */}
                      {!isCompleted && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <button
                            onClick={() => onUpdateProgress(task.id, Math.max(0, task.progress - 10))}
                            className="px-1.5 py-0.2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold"
                            title="Giảm 10%"
                          >
                            -10%
                          </button>
                          <button
                            onClick={() => onUpdateProgress(task.id, Math.min(100, task.progress + 10))}
                            className="px-1.5 py-0.2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold"
                            title="Tăng 10%"
                          >
                            +10%
                          </button>
                          <button
                            onClick={() => onUpdateProgress(task.id, 100)}
                            className="px-1.5 py-0.2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[9px] font-bold ml-auto"
                            title="Đánh dấu xong 100%"
                          >
                            Xong 100%
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectTask(task)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Xem chi tiết nhiệm vụ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {onOpenFeedback && (
                          <button
                            onClick={() => onOpenFeedback(task)}
                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Báo cáo tiến độ / Phản hồi"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}

                        {isLeaderOrAdmin && onOpenEditTask && (
                          <button
                            onClick={() => onOpenEditTask(task)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa nội dung nhiệm vụ"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">Không tìm thấy nhiệm vụ phù hợp</div>
            <div className="text-xs text-slate-400 mt-1">Đồng chí có thể thử tìm kiếm từ khóa khác</div>
          </div>
        )}

        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Hiển thị <strong>{filteredTasks.length}</strong> trên tổng số <strong>{scopedTasks.length}</strong> nhiệm vụ
          </div>
        </div>
      </div>
    </div>
  );
};
