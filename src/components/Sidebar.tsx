import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  CheckSquare, 
  Kanban, 
  Award, 
  CalendarDays, 
  CheckCheck, 
  BarChart3, 
  Building2, 
  Users, 
  Bot, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  Shield,
  UserCheck
} from 'lucide-react';
import { ViewTab, UserAccount } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  overdueCount: number;
  pendingEvaluationCount: number;
  totalTasksCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  currentUser: UserAccount;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  overdueCount,
  pendingEvaluationCount,
  totalTasksCount,
  isOpenMobile,
  onCloseMobile,
  currentUser
}) => {
  const menuItems: { id: ViewTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    { id: 'tong-quan', label: '1. Tổng quan', icon: <LayoutDashboard className="w-4 h-4" />, badge: totalTasksCount, badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { id: 'giao-viec', label: '2. Giao nhiệm vụ', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'theo-doi', label: '3. Theo dõi tiến độ', icon: <CheckSquare className="w-4 h-4" />, badge: overdueCount > 0 ? `${overdueCount} trễ` : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
    { id: 'kanban', label: '4. Kanban tiến độ', icon: <Kanban className="w-4 h-4" /> },
    { id: 'danh-gia', label: '5. Đánh giá nhiệm vụ', icon: <Award className="w-4 h-4" />, badge: pendingEvaluationCount > 0 ? `${pendingEvaluationCount} chưa chấm` : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    { id: 'lich-cong-viec', label: '6. Lịch công việc', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'nhiem-vu-hoan-thanh', label: '7. DS nhiệm vụ hoàn thành', icon: <CheckCheck className="w-4 h-4" />, badge: '8', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { id: 'thong-ke-tong-hop', label: '8. Thống kê tổng hợp', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'thong-ke-don-vi', label: '9. Thống kê theo lãnh đạo', icon: <Building2 className="w-4 h-4" /> },
    { id: 'thong-ke-can-bo', label: '10. Thống kê theo chuyên viên', icon: <Users className="w-4 h-4" /> },
    { id: 'bao-cao-chuyen-sau', label: '11. Báo cáo & Tổng hợp', icon: <FileText className="w-4 h-4" />, badge: 'Mới', badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    { id: 'quan-tri-he-thong', label: '12. Quản trị hệ thống', icon: <Shield className="w-4 h-4" />, badge: 'Admin', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    { id: 'tro-ly-ai', label: '13. Trợ lý AI', icon: <Bot className="w-4 h-4" />, badge: 'AI', badgeColor: 'bg-purple-500/30 text-purple-200 border border-purple-400/40' }
  ];

  // Filter based on logged-in user permissions (Requirement 1)
  const visibleMenuItems = menuItems.filter(item => {
    if (currentUser.role === 'admin') return true;
    return (currentUser.permissions || []).includes(item.id);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs" 
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0b0f19] text-slate-200 flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo and system branding */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-extrabold text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/30 shrink-0">
              <span className="text-base tracking-tight font-black">TG4</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">TRÀ GIÁP TASK V4</span>
                <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">6 RÕ</span>
              </div>
              <h1 className="text-xs font-semibold text-slate-300 truncate">PHÒNG VHXH TRÀ GIÁP</h1>
              <p className="text-[11px] text-slate-400 truncate">Hệ thống điều hành tiến độ</p>
            </div>
          </div>
        </div>

        {/* 6 RÕ banner tagline */}
        <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/30 flex items-center gap-2 text-[11px] text-emerald-300/90">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium truncate">Bộ điều hành 6 rõ • Trách nhiệm & Tiến độ</span>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Chức năng ({visibleMenuItems.length}/13)</span>
            <span className="text-[9px] text-emerald-400 font-mono capitalize">
              {currentUser.role}
            </span>
          </div>
          {visibleMenuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group cursor-pointer
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400')}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Logged in User Bar */}
        <div className="p-2 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-200 truncate text-[11px]">{currentUser.name}</div>
              <div className="text-[9px] text-slate-400 truncate">{currentUser.position}</div>
            </div>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 shrink-0 font-mono">
            {currentUser.role.toUpperCase()}
          </span>
        </div>

        {/* Copyright Attribution Section */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/80">
          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-0.5">
              <span>Nguyễn Văn Thạnh</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-snug">
              Bản quyền: HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ GIAO VIỆC PHÒNG VHXH TRÀ GIÁP TASK V4
            </div>
            <div className="mt-0.5 text-[9px] text-slate-500">
              Đơn vị: PHÒNG VHXH TRÀ GIÁP
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
