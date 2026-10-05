import React, { useState } from 'react';
import { 
  Plus, 
  Bot, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Building2, 
  User, 
  Calendar, 
  ChevronRight,
  Send,
  Sparkles,
  BarChart,
  PieChart,
  FileText,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { Task, ViewTab } from '../../types';

interface DashboardViewProps {
  tasks: Task[];
  onNavigateTab: (tab: ViewTab, filterParam?: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenAIChat: () => void;
  onSelectTask: (task: Task) => void;
  onUrgeTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onNavigateTab,
  onOpenNewTaskModal,
  onOpenAIChat,
  onSelectTask,
  onUrgeTask
}) => {
  const total = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const beforeDeadline = tasks.filter(t => t.status === 'completed' && t.timingStatus === 'before_deadline').length;
  const onTime = tasks.filter(t => t.status === 'completed' && t.timingStatus === 'on_time').length;
  const completedLate = tasks.filter(t => t.status === 'completed' && t.timingStatus === 'late').length;
  const notFinished = tasks.filter(t => t.status !== 'completed').length;
  const overdue = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;

  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue'));
  const approachingTasks = tasks.filter(t => t.status !== 'completed' && t.timingStatus === 'approaching');
  const recentTasks = tasks.filter(t => t.status === 'in_progress' && t.timingStatus === 'normal');

  const trieuTasks = tasks.filter(t => t.department === 'Phạm Sơn Triều' || t.assigner?.includes('Phạm Sơn Triều'));
  const tinhTasks = tasks.filter(t => t.department === 'Nguyễn Tấn Tình' || t.assigner?.includes('Nguyễn Tấn Tình'));

  const deptStats = [
    {
      name: 'Phạm Sơn Triều',
      fullName: 'Trưởng phòng Phạm Sơn Triều',
      total: trieuTasks.length,
      completed: trieuTasks.filter(t => t.status === 'completed').length,
      inProgress: trieuTasks.filter(t => t.status === 'in_progress').length,
      overdue: trieuTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length,
      color: 'bg-emerald-500'
    },
    {
      name: 'Nguyễn Tấn Tình',
      fullName: 'Phó Trưởng phòng Nguyễn Tấn Tình',
      total: tinhTasks.length,
      completed: tinhTasks.filter(t => t.status === 'completed').length,
      inProgress: tinhTasks.filter(t => t.status === 'in_progress').length,
      overdue: tinhTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length,
      color: 'bg-teal-500'
    }
  ];

  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);

  const chartItems = [
    { 
      label: 'Hoàn thành trước hạn', 
      count: beforeDeadline, 
      color: '#10b981', 
      desc: `${beforeDeadline} nhiệm vụ`,
      tasks: tasks.filter(t => t.status === 'completed' && t.timingStatus === 'before_deadline')
    },
    { 
      label: 'Hoàn thành trễ hạn', 
      count: completedLate, 
      color: '#f97316', 
      desc: `${completedLate} nhiệm vụ`,
      tasks: tasks.filter(t => t.status === 'completed' && t.timingStatus === 'late')
    },
    { 
      label: 'Hoàn thành đúng hạn', 
      count: onTime, 
      color: '#38bdf8', 
      desc: `${onTime} nhiệm vụ`,
      tasks: tasks.filter(t => t.status === 'completed' && t.timingStatus === 'on_time')
    },
    { 
      label: 'Quá hạn chưa xong', 
      count: overdue, 
      color: '#ef4444', 
      desc: `${overdue} nhiệm vụ`,
      tasks: tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue'))
    },
    { 
      label: 'Đang thực hiện', 
      count: inProgress, 
      color: '#1e40af', 
      desc: `${inProgress} nhiệm vụ`,
      tasks: tasks.filter(t => t.status === 'in_progress')
    }
  ];

  const getAdvisoryStaffSummary = (categoryTasks: Task[]) => {
    const map: Record<string, { name: string; department: string; tasks: Task[] }> = {};
    categoryTasks.forEach(task => {
      const name = task.assignee || 'Chưa phân công';
      if (!map[name]) {
        map[name] = {
          name,
          department: task.department,
          tasks: []
        };
      }
      map[name].tasks.push(task);
    });
    return Object.values(map);
  };

  const circumference = 2 * Math.PI * 65;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Large Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-800 text-white p-6 md:p-8 shadow-xl border border-emerald-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Hệ thống chỉ đạo, điều hành trực tuyến 24/7</span>
            </div>
            
            <h2 className="font-extrabold tracking-tight text-white drop-shadow-md flex flex-col space-y-1">
              <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide">
                TRUNG TÂM ĐIỀU HÀNH TIẾN ĐỘ
              </span>
              <span className="block text-lg sm:text-xl lg:text-2xl font-extrabold text-emerald-100">
                PHÒNG VĂN HÓA - XÃ HỘI
              </span>
              <span className="block text-base sm:text-lg lg:text-xl font-bold text-emerald-200 tracking-wider">
                XÃ TRÀ GIÁP
              </span>
            </h2>

            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Theo dõi và giám sát thời gian thực việc triển khai nhiệm vụ công vụ theo nguyên tắc <strong>"6 Rõ"</strong>: 
              Rõ người, rõ việc, rõ tiến độ, rõ kết quả, rõ trách nhiệm, rõ thẩm quyền.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenNewTaskModal}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 active:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-2 ring-white/60"
              >
                <Plus className="w-4 h-4 stroke-[3] text-emerald-700" />
                <span>GIAO VIỆC MỚI</span>
              </button>
              <button
                onClick={onOpenAIChat}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 active:bg-purple-900 text-white font-bold text-xs sm:text-sm border border-purple-300/40 backdrop-blur-md shadow-md hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-purple-300" />
                <span>TRỢ LÝ AI</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col justify-center items-center p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[210px] shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Chỉ đạo 6 Rõ</span>
            </div>
            <div className="text-3xl font-black text-white mt-1 tabular-nums">{total}</div>
            <div className="text-[11px] text-emerald-100 font-medium">Nhiệm vụ trọng tâm</div>
            <div className="mt-3 pt-3 border-t border-white/15 w-full grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-emerald-300 font-black tabular-nums">{completed}</div>
                <div className="text-[10px] text-emerald-100">Đã xong</div>
              </div>
              <div className="border-x border-white/20">
                <div className="text-amber-300 font-black tabular-nums">{inProgress}</div>
                <div className="text-[10px] text-emerald-100">Đang làm</div>
              </div>
              <div>
                <div className="text-rose-300 font-black tabular-nums">{overdue}</div>
                <div className="text-[10px] text-emerald-100">Quá hạn</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 8 Thẻ Thống Kê Ngang */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tổng quan các chỉ số điều hành (18 Nhiệm vụ)
          </h3>
          <span className="text-[11px] text-slate-400">Nhấp vào thẻ để lọc danh sách</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div 
            onClick={() => onNavigateTab('theo-doi', 'all')}
            className="group p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold text-slate-500 group-hover:text-emerald-700">1. Tổng số</div>
            <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{total}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Toàn bộ nhiệm vụ</div>
          </div>

          <div 
            onClick={() => onNavigateTab('theo-doi', 'in_progress')}
            className="group p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold text-blue-600">2. Đang làm</div>
            <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">{inProgress}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Đang triển khai</div>
          </div>

          <div 
            onClick={() => onNavigateTab('nhiem-vu-hoan-thanh')}
            className="group p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold text-emerald-600">3. Hoàn thành</div>
            <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">{completed}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Đạt yêu cầu</div>
          </div>

          <div 
            onClick={() => onNavigateTab('theo-doi', 'before_deadline')}
            className="group p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/70 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold text-emerald-700">4. Trước hạn</div>
            <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">{beforeDeadline}</div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5">Xuất sắc vượt mốc</div>
          </div>

          <div 
            onClick={() => onNavigateTab('theo-doi', 'on_time')}
            className="group p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-sky-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold text-sky-600">5. Đúng hạn</div>
            <div className="text-2xl font-black text-slate-700 mt-1 tabular-nums">{onTime}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Đúng thời gian</div>
          </div>

          <div 
            onClick={() => onNavigateTab('theo-doi', 'late')}
            className="group p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold text-amber-700">6. Trễ hạn</div>
            <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">{completedLate}</div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">Xong nhưng chậm</div>
          </div>

          <div 
            onClick={() => onNavigateTab('theo-doi', 'incomplete')}
            className="group p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold text-slate-700">7. Chưa xong</div>
            <div className="text-2xl font-black text-indigo-900 mt-1 tabular-nums">{notFinished}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Chưa hoàn thành</div>
          </div>

          <div 
            onClick={() => onNavigateTab('theo-doi', 'overdue')}
            className="group p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/90 shadow-xs hover:border-rose-500 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="text-[11px] font-semibold text-rose-700 flex items-center justify-between">
              <span>8. Quá hạn</span>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1 tabular-nums">{overdue}</div>
            <div className="text-[10px] text-rose-600 font-bold mt-0.5">Cần đôn đốc gấp!</div>
          </div>
        </div>
      </div>

      {/* 3. Donut Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Cơ cấu trạng thái và thời hạn
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500">Tỷ lệ / Tổng 18 việc</span>
            </div>

            <div className="py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="22"
                  />
                  {chartItems.map((slice, i) => {
                    const percent = slice.count / total;
                    const strokeDash = `${percent * circumference} ${circumference}`;
                    const strokeOffset = -accumulatedPercent * circumference;
                    accumulatedPercent += percent;
                    if (slice.count === 0) return null;
                    const isHovered = hoveredSliceIndex === i;
                    return (
                      <circle
                        key={i}
                        cx="80"
                        cy="80"
                        r="65"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 26 : 22}
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        onMouseEnter={() => setHoveredSliceIndex(i)}
                        onMouseLeave={() => setHoveredSliceIndex(null)}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                          opacity: hoveredSliceIndex !== null && !isHovered ? 0.45 : 1
                        }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  {hoveredSliceIndex !== null ? (
                    <>
                      <span 
                        className="text-2xl font-black tabular-nums transition-colors"
                        style={{ color: chartItems[hoveredSliceIndex].color }}
                      >
                        {chartItems[hoveredSliceIndex].count}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase line-clamp-1 px-2">
                        {chartItems[hoveredSliceIndex].label}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-slate-900 tabular-nums">18</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Nhiệm vụ</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs flex-1 min-w-0">
                {chartItems.map((item, idx) => {
                  const isHovered = hoveredSliceIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      onMouseEnter={() => setHoveredSliceIndex(idx)}
                      onMouseLeave={() => setHoveredSliceIndex(null)}
                      className={`flex items-center justify-between gap-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                        isHovered 
                          ? 'bg-slate-100 shadow-xs ring-1 ring-slate-300' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-3 h-3 rounded-sm shrink-0 transition-transform" 
                          style={{ 
                            backgroundColor: item.color,
                            transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                          }} 
                        />
                        <span className={`truncate text-[11px] ${isHovered ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                          {item.label}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums shrink-0 text-[11px]">
                        {item.count} <span className="text-slate-400 font-normal">({Math.round((item.count/total)*100)}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {hoveredSliceIndex !== null && chartItems[hoveredSliceIndex].tasks.length > 0 ? (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: chartItems[hoveredSliceIndex].color }}
                    />
                    <span className="text-[11px] font-bold text-slate-900">
                      Cán bộ tham mưu phụ trách ({chartItems[hoveredSliceIndex].label}):
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {chartItems[hoveredSliceIndex].tasks.length} nhiệm vụ
                  </span>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {getAdvisoryStaffSummary(chartItems[hoveredSliceIndex].tasks).map((staff, sIdx) => (
                    <div key={sIdx} className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{staff.name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          {staff.tasks.length} việc
                        </span>
                      </div>

                      <div className="mt-1 space-y-1">
                        {staff.tasks.map(t => (
                          <div
                            key={t.id}
                            onClick={() => onSelectTask(t)}
                            className="text-[10px] text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50 p-1 rounded flex items-center justify-between gap-2 cursor-pointer transition-colors"
                            title="Nhấp để xem chi tiết nhiệm vụ"
                          >
                            <span className="truncate flex-1">• [{t.id}] {t.title}</span>
                            <span className="shrink-0 text-slate-400 font-mono text-[9px]">Hạn: {t.dueDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 text-center italic mt-1">
                * Rà chuột vào biểu đồ để xem cán bộ tham mưu phụ trách
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tiến độ hoàn thành toàn Phòng: <strong className="text-emerald-700 font-bold">44.4%</strong></span>
            <span>Tỷ lệ vi phạm hạn: <strong className="text-rose-600 font-bold">11.1%</strong></span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Tiến độ thực hiện theo Lãnh đạo phụ trách
                </h3>
              </div>
              <button 
                onClick={() => onNavigateTab('thong-ke-don-vi')}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {deptStats.map((dept, idx) => {
                const completionRate = Math.round((dept.completed / dept.total) * 100);
                return (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-800">{dept.name}</span>
                        <span className="text-[11px] text-slate-500 hidden sm:inline">({dept.fullName})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-600">
                          Tổng: <strong className="text-slate-900">{dept.total} việc</strong>
                        </span>
                        <span className="text-xs font-bold text-emerald-700 tabular-nums">
                          {completionRate}%
                        </span>
                      </div>
                    </div>

                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${(dept.completed / dept.total) * 100}%` }}
                        className="bg-emerald-500 h-full" 
                        title={`Hoàn thành: ${dept.completed}`}
                      />
                      <div 
                        style={{ width: `${(dept.inProgress / dept.total) * 100}%` }}
                        className="bg-blue-600 h-full" 
                        title={`Đang làm: ${dept.inProgress}`}
                      />
                      <div 
                        style={{ width: `${(dept.overdue / dept.total) * 100}%` }}
                        className="bg-rose-500 h-full" 
                        title={`Quá hạn: ${dept.overdue}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Đã xong: {dept.completed}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        Đang làm: {dept.inProgress}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Quá hạn: {dept.overdue}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Đơn vị có khối lượng nhiệm vụ lớn: <strong>Phạm Sơn Triều (11 việc)</strong></span>
            <span className="text-emerald-700 font-semibold cursor-pointer" onClick={() => onNavigateTab('thong-ke-can-bo')}>
              Theo dõi chuyên viên tham mưu →
            </span>
          </div>
        </div>
      </div>

      {/* 4. Ba Cột Dưới Cùng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột 1: Quá hạn */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-100">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold uppercase tracking-tight">
                Quá hạn cần đôn đốc ({overdueTasks.length})
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-md">
              Khẩn cấp
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {overdueTasks.map(task => (
              <div 
                key={task.id}
                className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 hover:border-rose-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-rose-800 mb-1">
                    <span>{task.id}</span>
                    <span className="text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Hạn: {task.dueDate}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {task.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {task.content}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                  <div className="text-slate-600">
                    CB: <strong>{task.assignee}</strong> ({task.department})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUrgeTask(task)}
                      className="px-2 py-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="Gửi phiếu đôn đốc khẩn"
                    >
                      <Send className="w-2.5 h-2.5" />
                      Đôn đốc
                    </button>
                    <button
                      onClick={() => onSelectTask(task)}
                      className="px-2 py-1 text-[10px] font-semibold text-rose-800 hover:bg-rose-200/70 rounded transition-colors cursor-pointer"
                    >
                      Xem
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 text-center">
            <button
              onClick={() => onNavigateTab('theo-doi', 'overdue')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Xem danh sách vi phạm hạn ({overdueTasks.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cột 2: Gần đến hạn */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-100">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-tight">
                Gần đến hạn ({approachingTasks.length})
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
              Sắp tới hạn
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {approachingTasks.slice(0, 3).map(task => (
              <div 
                key={task.id}
                className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 mb-1">
                    <span>{task.id}</span>
                    <span className="text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Hạn: {task.dueDate}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {task.title}
                  </h5>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Tiến độ hiện tại:</span>
                    <span className="font-bold text-amber-800 tabular-nums">{task.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${task.progress}%` }} 
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                  <div className="text-slate-600 truncate max-w-[150px]">
                    CB: <strong>{task.assignee}</strong>
                  </div>
                  <button
                    onClick={() => onSelectTask(task)}
                    className="px-2 py-1 text-[10px] font-semibold text-amber-800 hover:bg-amber-200/60 rounded transition-colors cursor-pointer"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 text-center">
            <button
              onClick={() => onNavigateTab('theo-doi', 'approaching')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả ({approachingTasks.length}) việc sắp đến hạn</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cột 3: Đang triển khai */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-tight">
                Đang triển khai gần đây
              </h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
              Đúng tiến độ
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {recentTasks.slice(0, 3).map(task => (
              <div 
                key={task.id}
                className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/60 hover:border-emerald-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-900 mb-1">
                    <span>{task.id}</span>
                    <span className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Hạn: {task.dueDate}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {task.title}
                  </h5>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Tiến độ thực hiện:</span>
                    <span className="font-bold text-emerald-800 tabular-nums">{task.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${task.progress}%` }} 
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                  <div className="text-slate-600 truncate max-w-[150px]">
                    CB: <strong>{task.assignee}</strong>
                  </div>
                  <button
                    onClick={() => onSelectTask(task)}
                    className="px-2 py-1 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-200/60 rounded transition-colors cursor-pointer"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 text-center">
            <button
              onClick={() => onNavigateTab('kanban')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Xem bảng điều hành Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
