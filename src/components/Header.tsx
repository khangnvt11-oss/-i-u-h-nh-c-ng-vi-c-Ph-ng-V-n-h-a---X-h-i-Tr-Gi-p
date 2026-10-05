import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Bot, 
  Menu, 
  User, 
  FileCode, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  Plus, 
  Shield, 
  ExternalLink,
  CheckCircle2,
  KeyRound,
  LogOut,
  Users,
  ShieldCheck,
  CheckCheck,
  Briefcase
} from 'lucide-react';
import { Task, UserAccount } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewTaskModal: () => void;
  onOpenAIChat: () => void;
  onOpenOfflineHtmlModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  currentUser: UserAccount;
  onOpenProfileModal: () => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
  onOpenSpecialistBriefing?: () => void;
  onOpenPersonalTasks?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewTaskModal,
  onOpenAIChat,
  onOpenOfflineHtmlModal,
  searchQuery,
  onSearchChange,
  tasks,
  onSelectTask,
  currentUser,
  onOpenProfileModal,
  onSwitchAccount,
  onLogout,
  onOpenSpecialistBriefing,
  onOpenPersonalTasks
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Urgent tasks
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue'));
  const approachingTasks = tasks.filter(t => t.status !== 'completed' && t.timingStatus === 'approaching');
  const totalAlerts = overdueTasks.length + approachingTasks.length;

  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(w => w.charAt(0))
    .join('')
    .toUpperCase() || 'TG';

  const roleLabel = currentUser.role === 'admin' 
    ? 'Quản trị hệ thống' 
    : currentUser.role === 'leader' 
      ? 'Lãnh đạo' 
      : currentUser.role === 'specialist' 
        ? 'Chuyên viên' 
        : 'Kiểm thử';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Notice: Mandatory Copyright requirement in Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-1 text-center text-[11px] font-medium tracking-wide flex items-center justify-center gap-2 shadow-inner">
        <Shield className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
        <span className="truncate">
          Bản quyền của Nguyễn Văn Thạnh • HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ GIAO VIỆC PHÒNG VHXH TRÀ GIÁP TASK V4
        </span>
      </div>

      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm nhiệm vụ, cán bộ, đơn vị, mã số..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Tasks & Handover Briefing button */}
          {onOpenSpecialistBriefing && (
            <button
              onClick={onOpenSpecialistBriefing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Cửa sổ thông báo bàn giao nhiệm vụ & tiến độ công vụ"
            >
              <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Tiến độ của tôi</span>
            </button>
          )}

          {/* Requirement 4: Personal Tasks Quick Button */}
          {onOpenPersonalTasks && (
            <button
              onClick={onOpenPersonalTasks}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Sổ tay nhiệm vụ cá nhân (Riêng tư)"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Việc cá nhân</span>
            </button>
          )}

          {/* Quick Create Task button - Leaders & Admins only */}
          {currentUser.role !== 'specialist' && (
            <button
              onClick={onOpenNewTaskModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm shadow-emerald-700/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Giao việc mới</span>
            </button>
          )}

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAIChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Mở Trợ lý AI công vụ"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-semibold">Trợ lý AI</span>
          </button>

          {/* Export HTML Offline Button */}
          <button
            onClick={onOpenOfflineHtmlModal}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Xuất file HTML đơn để chạy offline trình duyệt"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden xl:inline">Xuất HTML Offline</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Thông báo đôn đốc"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold">Cảnh báo tiến độ giao việc</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/80 px-2 py-0.5 rounded-full font-semibold">
                    {totalAlerts} nhiệm vụ cần chú ý
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                  {/* Overdue */}
                  {overdueTasks.length > 0 && (
                    <div className="p-2 bg-rose-50/50 rounded-lg mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Quá hạn cần đôn đốc khẩn ({overdueTasks.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {overdueTasks.map(task => (
                          <div 
                            key={task.id}
                            onClick={() => {
                              onSelectTask(task);
                              setShowNotifications(false);
                            }}
                            className="p-2 bg-white rounded border border-rose-200/80 hover:border-rose-400 transition-all cursor-pointer text-xs"
                          >
                            <div className="font-semibold text-slate-800 line-clamp-1">{task.title}</div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                              <span>CB: {task.assignee}</span>
                              <span className="text-rose-600 font-bold">Hạn: {task.dueDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approaching */}
                  {approachingTasks.length > 0 && (
                    <div className="p-2 bg-amber-50/50 rounded-lg">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Sắp đến hạn ({approachingTasks.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {approachingTasks.map(task => (
                          <div 
                            key={task.id}
                            onClick={() => {
                              onSelectTask(task);
                              setShowNotifications(false);
                            }}
                            className="p-2 bg-white rounded border border-amber-200/80 hover:border-amber-400 transition-all cursor-pointer text-xs"
                          >
                            <div className="font-semibold text-slate-800 line-clamp-1">{task.title}</div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                              <span>{task.department}</span>
                              <span className="text-amber-600 font-bold">Hạn: {task.dueDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      Không có nhiệm vụ nào quá hạn hoặc cần cảnh báo.
                    </div>
                  )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    Đóng thông báo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User profile with Dropdown & Requirement 4: Personal Tasks function in top-right dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-emerald-500/20">
                {initials}
              </div>
              <div className="hidden md:block min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                    currentUser.role === 'admin' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : currentUser.role === 'leader' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                  }`}>
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">
                  {currentUser.position || 'Chuyên viên'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100">
                <div className="p-3 border-b border-slate-100 mb-1 bg-slate-50/70 rounded-xl">
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">{currentUser.position} • {currentUser.department}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{currentUser.email}</div>
                  <div className="mt-1.5">
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Nhóm quyền: {roleLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5 text-xs text-slate-700">
                  {/* Requirement 4: Personal Tasks function in top-right dropdown */}
                  {onOpenPersonalTasks && (
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenPersonalTasks();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 flex items-center justify-between text-indigo-900 cursor-pointer font-bold border border-indigo-200/70"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Nhiệm vụ cá nhân (Sổ tay)</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-200/80 text-indigo-800 font-bold">
                        Riêng tư
                      </span>
                    </button>
                  )}

                  {/* Tiến độ của tôi */}
                  {onOpenSpecialistBriefing && (
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSpecialistBriefing();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800 cursor-pointer font-medium"
                    >
                      <CheckCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Bàn giao nhiệm vụ & Tiến độ của tôi</span>
                    </button>
                  )}

                  {/* Profile & Password */}
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenProfileModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800 cursor-pointer font-medium"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Hồ sơ cá nhân & Đổi mật khẩu</span>
                  </button>

                  {/* Switch Account */}
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      onSwitchAccount();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800 cursor-pointer font-medium"
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Đổi tài khoản đăng nhập Demo</span>
                  </button>

                  {/* Export HTML */}
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenOfflineHtmlModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800 cursor-pointer font-medium"
                  >
                    <FileCode className="w-4 h-4 text-slate-500" />
                    <span>Tải về file HTML chạy offline</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="mt-1 pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Đăng xuất khỏi hệ thống</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
