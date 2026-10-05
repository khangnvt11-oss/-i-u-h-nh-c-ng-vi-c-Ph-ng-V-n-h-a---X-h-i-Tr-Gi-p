import React, { useState, useMemo, useEffect } from 'react';
import { ViewTab, Task, TaskEvaluation, TaskStatus, UserAccount } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { TaskTrackingView } from './components/views/TaskTrackingView';
import { TaskEvaluationView } from './components/views/TaskEvaluationView';
import { CompletedTasksView } from './components/views/CompletedTasksView';
import { GeneralStatsView } from './components/views/GeneralStatsView';
import { DepartmentStatsView } from './components/views/DepartmentStatsView';
import { StaffStatsView } from './components/views/StaffStatsView';
import { CreateTaskView } from './components/views/CreateTaskView';
import { KanbanView } from './components/views/KanbanView';
import { WorkCalendarView } from './components/views/WorkCalendarView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { AdvancedReportsView } from './components/views/AdvancedReportsView';
import { SystemAdminView } from './components/views/SystemAdminView';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { UrgeModal } from './components/modals/UrgeModal';
import { OfflineHtmlModal } from './components/modals/OfflineHtmlModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { EditTaskModal } from './components/modals/EditTaskModal';
import { SpecialistFeedbackModal } from './components/modals/SpecialistFeedbackModal';
import { SpecialistPendingTasksModal } from './components/modals/SpecialistPendingTasksModal';
import { PersonalTasksModal } from './components/modals/PersonalTasksModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { databaseService } from './services/databaseService';
import { TaskFeedback } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPersonalTasksModalOpen, setIsPersonalTasksModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>(() => databaseService.loadTasks());
  const [currentTab, setCurrentTab] = useState<ViewTab>('tong-quan');
  const [trackingFilter, setTrackingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [taskToUrge, setTaskToUrge] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToFeedback, setTaskToFeedback] = useState<Task | null>(null);
  const [showSpecialistPendingBriefing, setShowSpecialistPendingBriefing] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Sync with Database backend on mount
  useEffect(() => {
    databaseService.fetchTasksFromApi().then((serverTasks) => {
      if (serverTasks && serverTasks.length > 0) {
        setTasks(serverTasks);
      }
    });
  }, []);

  // Derived counts
  const overdueCount = useMemo(() => {
    return tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
  }, [tasks]);

  const pendingEvaluationCount = useMemo(() => {
    return tasks.filter(t => t.evaluation === undefined).length;
  }, [tasks]);

  // Next Task ID
  const nextId = useMemo(() => {
    const nextNum = tasks.length + 1;
    return `NV-2026-${nextNum < 100 ? (nextNum < 10 ? '00' + nextNum : '0' + nextNum) : nextNum}`;
  }, [tasks.length]);

  // Auth actions
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    databaseService.saveCurrentUser(user);
    setIsLoginModalOpen(false);

    // Display briefing notification
    setShowSpecialistPendingBriefing(true);

    // Requirement 1: If specialist, their active tab starts on Progress Tracking ('theo-doi')
    if (user.role === 'specialist') {
      setCurrentTab('theo-doi');
    } else if (user.role !== 'admin' && !(user.permissions || []).includes(currentTab)) {
      setCurrentTab('tong-quan');
    }
  };

  const handleLogout = () => {
    databaseService.saveCurrentUser(null);
    setCurrentUser(null);
    setShowSpecialistPendingBriefing(false);
    setIsPersonalTasksModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    databaseService.saveCurrentUser(updatedUser);
  };

  // Edit task content
  const handleSaveEditedTask = (updatedTask: Task) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updated);
    databaseService.saveTasks(updated);
    databaseService.updateTask(updatedTask.id, {
      title: updatedTask.title,
      content: updatedTask.content,
      assignee: updatedTask.assignee,
      department: updatedTask.department,
      field: updatedTask.field,
      dueDate: updatedTask.dueDate,
      priority: updatedTask.priority,
      coDepartment: updatedTask.coDepartment,
      notes: updatedTask.notes,
      updatedBy: currentUser?.name || 'Hệ thống điều hành'
    } as any);

    if (selectedTaskDetail?.id === updatedTask.id) {
      setSelectedTaskDetail(updatedTask);
    }
  };

  // Specialist feedback & completion report
  const handleSubmitFeedback = async (taskId: string, feedbackData: Partial<TaskFeedback>) => {
    const res = await databaseService.submitTaskFeedback(taskId, feedbackData);
    if (res.success && res.task) {
      const updated = tasks.map(t => t.id === taskId ? res.task! : t);
      setTasks(updated);
      databaseService.saveTasks(updated);
      if (selectedTaskDetail?.id === taskId) {
        setSelectedTaskDetail(res.task);
      }
    }
  };

  // Safe tab selection according to permissions
  const handleSelectTab = (tab: ViewTab) => {
    if (!currentUser) return;
    if (currentUser.role === 'admin' || (currentUser.permissions || []).includes(tab)) {
      setCurrentTab(tab);
      setTrackingFilter('all');
    } else {
      alert(`Tài khoản thuộc nhóm "${currentUser.role.toUpperCase()}" chưa được cấp quyền truy cập chức năng này.`);
    }
  };

  // Task actions with persistent database sync
  const handleAddTask = (newTask: Task) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    databaseService.saveTasks(updated);
    databaseService.createTask(newTask);
    databaseService.addAuditLog(
      newTask.assigner.split('–')[0].trim(),
      'GIAO_VIỆC_MỚI',
      newTask.id,
      `Giao nhiệm vụ: "${newTask.title}" cho chuyên viên ${newTask.assignee}. Hạn xong: ${newTask.dueDate}.`
    );
    setCurrentTab('theo-doi');
  };

  // Requirement 4: Transfer data from Personal Tasks to central system with full details during synchronization
  const handleSyncPersonalTaskToCentral = (newOfficialTask: Task) => {
    const updated = [newOfficialTask, ...tasks];
    setTasks(updated);
    databaseService.saveTasks(updated);
    databaseService.createTask(newOfficialTask);
    databaseService.addAuditLog(
      currentUser?.name || 'Chuyên viên',
      'ĐỒNG_BỘ_VIỆC_CÁ_NHÂN',
      newOfficialTask.id,
      `Chuyển nhiệm vụ từ Sổ tay cá nhân lên hệ thống chung: "${newOfficialTask.title}".`
    );
  };

  const handleUpdateProgress = (taskId: string, newProgress: number) => {
    const isDone = newProgress >= 100;
    const today = new Date().toISOString().slice(0, 10);
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          progress: newProgress,
          status: isDone ? 'completed' as TaskStatus : t.status === 'completed' ? 'in_progress' as TaskStatus : t.status,
          timingStatus: isDone ? (t.dueDate < today ? 'late' as const : 'before_deadline' as const) : t.timingStatus,
          completedDate: isDone ? (t.completedDate || today) : undefined
        };
      }
      return t;
    });

    setTasks(updated);
    databaseService.saveTasks(updated);
    databaseService.updateTask(taskId, { progress: newProgress });
    databaseService.addAuditLog(
      currentUser?.name || 'Chuyên viên tham mưu',
      'CẬP_NHẬT_TIẾN_ĐỘ',
      taskId,
      `Điều chỉnh tiến độ hoàn thành thành ${newProgress}%.`
    );

    if (selectedTaskDetail && selectedTaskDetail.id === taskId) {
      setSelectedTaskDetail(prev => prev ? { ...prev, progress: newProgress } : null);
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : (t.progress === 100 ? 50 : t.progress),
          completedDate: newStatus === 'completed' ? (t.completedDate || today) : undefined
        };
      }
      return t;
    });

    setTasks(updated);
    databaseService.saveTasks(updated);
    databaseService.updateTask(taskId, { status: newStatus });
    databaseService.addAuditLog(
      currentUser?.name || 'Hệ thống điều hành',
      'CHUYỂN_TRẠNG_THÁI',
      taskId,
      `Chuyển đổi trạng thái nhiệm vụ sang: ${newStatus}.`
    );
  };

  const handleSaveEvaluation = (taskId: string, evaluation: TaskEvaluation) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          evaluation
        };
      }
      return t;
    });

    setTasks(updated);
    databaseService.saveTasks(updated);
    databaseService.evaluateTask(taskId, evaluation);
    databaseService.addAuditLog(
      evaluation.evaluator.split('–')[0].trim(),
      'ĐÁNH_GIÁ_NGHIỆM_THU',
      taskId,
      `Nghiệm thu đánh giá: ${evaluation.score}/10 điểm. Kết luận: ${evaluation.conclusion}.`
    );
  };

  const handleNavigateWithFilter = (tab: ViewTab, filterParam?: string) => {
    handleSelectTab(tab);
    if (filterParam) {
      setTrackingFilter(filterParam);
    }
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Fixed Sidebar with permission filtering */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        overdueCount={overdueCount}
        pendingEvaluationCount={pendingEvaluationCount}
        totalTasksCount={tasks.length}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTaskModal={() => handleSelectTab('giao-viec')}
          onOpenAIChat={() => handleSelectTab('tro-ly-ai')}
          onOpenOfflineHtmlModal={() => setShowOfflineModal(true)}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q.trim() && currentTab === 'tong-quan') {
              handleSelectTab('theo-doi');
            }
          }}
          tasks={tasks}
          onSelectTask={(task) => setSelectedTaskDetail(task)}
          currentUser={currentUser}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onSwitchAccount={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onOpenSpecialistBriefing={() => setShowSpecialistPendingBriefing(true)}
          onOpenPersonalTasks={() => setIsPersonalTasksModalOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'tong-quan' && (
            <DashboardView
              tasks={tasks}
              onNavigateTab={handleNavigateWithFilter}
              onOpenNewTaskModal={() => handleSelectTab('giao-viec')}
              onOpenAIChat={() => handleSelectTab('tro-ly-ai')}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onUrgeTask={(task) => setTaskToUrge(task)}
            />
          )}

          {currentTab === 'giao-viec' && (
            <CreateTaskView
              onAddTask={handleAddTask}
              nextId={nextId}
              onSuccess={() => handleSelectTab('theo-doi')}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'theo-doi' && (
            <TaskTrackingView
              tasks={tasks}
              initialFilter={trackingFilter}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onOpenNewTaskModal={() => handleSelectTab('giao-viec')}
              onUpdateProgress={handleUpdateProgress}
              currentUser={currentUser}
              onOpenEditTask={(task) => setTaskToEdit(task)}
              onOpenFeedback={(task) => setTaskToFeedback(task)}
            />
          )}

          {currentTab === 'kanban' && (
            <KanbanView
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onUpdateStatus={handleUpdateStatus}
              onOpenNewTaskModal={() => handleSelectTab('giao-viec')}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'danh-gia' && (
            <TaskEvaluationView
              tasks={tasks}
              onSaveEvaluation={handleSaveEvaluation}
              currentUser={currentUser}
              onOpenFeedback={(task) => setTaskToFeedback(task)}
            />
          )}

          {currentTab === 'lich-cong-viec' && (
            <WorkCalendarView
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
            />
          )}

          {currentTab === 'nhiem-vu-hoan-thanh' && (
            <CompletedTasksView
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'thong-ke-tong-hop' && (
            <GeneralStatsView
              tasks={tasks}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'thong-ke-don-vi' && (
            <DepartmentStatsView
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
            />
          )}

          {currentTab === 'thong-ke-can-bo' && (
            <StaffStatsView
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'bao-cao-chuyen-sau' && (
            <AdvancedReportsView
              tasks={tasks}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'quan-tri-he-thong' && (
            <SystemAdminView
              tasks={tasks}
              onTasksUpdated={(newTasks) => setTasks(newTasks)}
            />
          )}

          {currentTab === 'tro-ly-ai' && (
            <AIAssistantView
              tasks={tasks}
              onOpenTask={(task) => setSelectedTaskDetail(task)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTaskDetail}
        onClose={() => setSelectedTaskDetail(null)}
        onUpdateProgress={handleUpdateProgress}
        onUpdateStatus={handleUpdateStatus}
        onOpenEvaluation={() => {
          setSelectedTaskDetail(null);
          handleSelectTab('danh-gia');
        }}
        onUrgeTask={(task) => {
          setSelectedTaskDetail(null);
          setTaskToUrge(task);
        }}
        onOpenEditTask={(task) => {
          setSelectedTaskDetail(null);
          setTaskToEdit(task);
        }}
        onOpenFeedback={(task) => {
          setSelectedTaskDetail(null);
          setTaskToFeedback(task);
        }}
        currentUser={currentUser}
      />

      {/* Edit Task Content Modal */}
      {taskToEdit && (
        <EditTaskModal
          task={taskToEdit}
          onClose={() => setTaskToEdit(null)}
          onSaveTask={handleSaveEditedTask}
        />
      )}

      {/* Specialist Feedback & Progress Reporting Modal */}
      {taskToFeedback && currentUser && (
        <SpecialistFeedbackModal
          task={taskToFeedback}
          currentUser={currentUser}
          onClose={() => setTaskToFeedback(null)}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {/* Specialist Login Gatekeeper & Pending Tasks Briefing */}
      {showSpecialistPendingBriefing && currentUser && (
        <SpecialistPendingTasksModal
          currentUser={currentUser}
          tasks={tasks}
          onClose={() => setShowSpecialistPendingBriefing(false)}
          onOpenTaskDetail={(t) => setSelectedTaskDetail(t)}
          onOpenFeedback={(t) => setTaskToFeedback(t)}
        />
      )}

      {/* Requirement 4: Personal Tasks Modal */}
      {isPersonalTasksModalOpen && currentUser && (
        <PersonalTasksModal
          currentUser={currentUser}
          onClose={() => setIsPersonalTasksModalOpen(false)}
          onSyncToCentral={handleSyncPersonalTaskToCentral}
          nextOfficialTaskId={nextId}
        />
      )}

      <UrgeModal
        task={taskToUrge}
        onClose={() => setTaskToUrge(null)}
      />

      {showOfflineModal && (
        <OfflineHtmlModal
          tasks={tasks}
          onClose={() => setShowOfflineModal(false)}
        />
      )}

      {/* User Profile & Password Change Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          currentUser={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Switch Account Login Modal */}
      {isLoginModalOpen && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsLoginModalOpen(false)}
          isModal={true}
        />
      )}
    </div>
  );
}
