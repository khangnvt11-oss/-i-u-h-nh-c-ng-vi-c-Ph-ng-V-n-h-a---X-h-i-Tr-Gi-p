import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  X, 
  PlusCircle, 
  CheckSquare, 
  BarChart3, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Tag, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  CheckCheck, 
  Lock, 
  AlertCircle,
  FileSpreadsheet,
  Building2,
  User,
  ChevronRight,
  TrendingUp,
  Save,
  RotateCcw,
  Upload,
  Paperclip,
  FileDown
} from 'lucide-react';
import { UserAccount, Task, TaskStatus, PersonalTask, TaskAttachment } from '../../types';
import { databaseService } from '../../services/databaseService';

interface PersonalTasksModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onSyncToCentral: (task: Task) => void;
  nextOfficialTaskId: string;
}

export const PersonalTasksModal: React.FC<PersonalTasksModalProps> = ({
  currentUser,
  onClose,
  onSyncToCentral,
  nextOfficialTaskId
}) => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'self_assign' | 'stats'>('tracking');
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>(() => 
    databaseService.loadPersonalTasks(currentUser.id)
  );

  // Available Areas of Responsibility
  const [fieldsList, setFieldsList] = useState<string[]>([]);
  useEffect(() => {
    databaseService.fetchFieldsFromApi().then(f => {
      if (f && f.length > 0) setFieldsList(f);
      else setFieldsList(['Văn hóa - Thông tin', 'Y tế - Dân số', 'Chế độ chính sách - bảo trợ XH', 'Giáo dục - Đào tạo', 'Tư pháp - Tiếp cận pháp luật', 'Cải cách hành chính', 'Chuyển đổi số']);
    });
  }, []);

  // Leaders for syncing assignment
  const [leaders, setLeaders] = useState<UserAccount[]>([]);
  useEffect(() => {
    databaseService.fetchAccountsFromApi().then(accs => {
      const lds = accs.filter(a => 
        a.name !== 'Nguyễn Văn Thạnh' && 
        (a.role === 'leader' || a.position?.toLowerCase().includes('trưởng') || a.position?.toLowerCase().includes('phó'))
      );
      setLeaders(lds);
    });
  }, []);

  // Specialists for Coordinating Specialist dropdown (populated with specialists from database)
  const [specialists, setSpecialists] = useState<UserAccount[]>([]);
  useEffect(() => {
    databaseService.fetchAccountsFromApi().then(accs => {
      if (accs && accs.length > 0) {
        const rawSpecs = accs.filter(a => 
          (a.role === 'specialist' || a.position?.toLowerCase().includes('chuyên viên')) &&
          !a.position?.toLowerCase().includes('trưởng') &&
          !a.position?.toLowerCase().includes('phó') &&
          a.name !== 'Phạm Sơn Triều' &&
          a.name !== 'Nguyễn Tấn Tình'
        );
        const map = new Map<string, UserAccount>();
        rawSpecs.forEach(s => {
          if (!map.has(s.name)) map.set(s.name, s);
        });
        setSpecialists(Array.from(map.values()));
      }
    });
  }, []);

  // Removal of duplicate leadership names from the dropdown menu in the "Escalate to General Management System" function
  const deduplicatedLeaders = useMemo(() => {
    const map = new Map<string, string>();
    map.set('Phạm Sơn Triều', 'Phạm Sơn Triều – Trưởng phòng');
    map.set('Nguyễn Tấn Tình', 'Nguyễn Tấn Tình – Phó Trưởng phòng');

    leaders.forEach(l => {
      if (
        l.name !== 'Nguyễn Văn Thạnh' && 
        (l.role === 'leader' || l.position?.toLowerCase().includes('trưởng') || l.position?.toLowerCase().includes('phó'))
      ) {
        if (!map.has(l.name)) {
          map.set(l.name, `${l.name} – ${l.position || 'Lãnh đạo'}`);
        }
      }
    });

    return Array.from(map.entries()).map(([name, label]) => ({ name, label }));
  }, [leaders]);

  // Reload tasks when current user changes
  useEffect(() => {
    setPersonalTasks(databaseService.loadPersonalTasks(currentUser.id));
  }, [currentUser.id]);

  // Form State for "Self-assignment of tasks" (omits Advisory Specialist and Task Assignor)
  const [editingPersonalTaskId, setEditingPersonalTaskId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formField, setFormField] = useState('');
  const [formAssignedDate, setFormAssignedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [formPriority, setFormPriority] = useState<'urgent' | 'high' | 'normal'>('high');
  const [formExpectedOutput, setFormExpectedOutput] = useState('');
  const [formCoDepartment, setFormCoDepartment] = useState('');
  const [formCoordinatingSpecialist, setFormCoordinatingSpecialist] = useState('');
  const [formReportEvidence, setFormReportEvidence] = useState('');
  const [formAttachments, setFormAttachments] = useState<TaskAttachment[]>([]);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formNotes, setFormNotes] = useState('');
  const [formSyncImmediately, setFormSyncImmediately] = useState(false);
  const [formTargetLeader, setFormTargetLeader] = useState('Phạm Sơn Triều – Trưởng phòng');

  useEffect(() => {
    if (fieldsList.length > 0 && !formField) {
      setFormField(fieldsList[0]);
    }
  }, [fieldsList, formField]);

  // Filter & Search in "Work tracking" (excludes All Advisory Specialists)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSync, setFilterSync] = useState<'all' | 'synced' | 'not_synced'>('all');

  // Sync confirmation modal
  const [syncTaskCandidate, setSyncTaskCandidate] = useState<PersonalTask | null>(null);
  const [selectedSyncLeader, setSelectedSyncLeader] = useState('Phạm Sơn Triều – Trưởng phòng');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const calculateTiming = (dueDate: string, isCompleted: boolean) => {
    const today = new Date().toISOString().slice(0, 10);
    if (isCompleted) {
      return dueDate < today ? 'late' as const : 'before_deadline' as const;
    }
    if (dueDate < today) return 'overdue' as const;
    const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 3) return 'approaching' as const;
    return 'normal' as const;
  };

  const getDaysRemainingText = (dueDate: string, isCompleted: boolean) => {
    const today = new Date().toISOString().slice(0, 10);
    if (isCompleted) return { label: 'Đã hoàn thành', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    const diffTime = new Date(dueDate).getTime() - new Date(today).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    if (diffDays < 0) {
      return { label: `Quá hạn ${Math.abs(diffDays)} ngày`, color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold' };
    }
    if (diffDays === 0) {
      return { label: 'Hạn chót hôm nay!', color: 'text-amber-700 bg-amber-50 border-amber-300 font-bold' };
    }
    if (diffDays <= 3) {
      return { label: `Còn ${diffDays} ngày (Gần hạn)`, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    return { label: `Còn ${diffDays} ngày`, color: 'text-blue-700 bg-blue-50 border-blue-200' };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newAtts: TaskAttachment[] = [];
    const oversized: string[] = [];

    files.forEach(f => {
      if (f.size > 15 * 1024 * 1024) {
        oversized.push(f.name);
      } else {
        newAtts.push({
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
      }
    });

    if (oversized.length > 0) {
      setFileUploadError(`Các tệp sau vượt quá 15MB: ${oversized.join(', ')}`);
    }
    if (newAtts.length > 0) {
      setFormAttachments(prev => [...prev, ...newAtts]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setFormAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDownloadDocument = (att: TaskAttachment | string) => {
    const name = typeof att === 'string' ? att : att.name;
    const blob = new Blob([`Tài liệu kết quả / minh chứng sản phẩm nhiệm vụ: ${name}\nChuyên viên thực hiện: ${currentUser.name}\nThời điểm xuất: ${new Date().toLocaleString('vi-VN')}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập trích yếu / tên nhiệm vụ công việc.');
      return;
    }

    const timing = calculateTiming(formDueDate, false);

    if (editingPersonalTaskId) {
      const updated = databaseService.updatePersonalTask(currentUser.id, editingPersonalTaskId, {
        title: formTitle.trim(),
        content: formContent.trim() || formTitle.trim(),
        field: formField || (fieldsList[0] || 'Văn hóa - Thông tin'),
        assignedDate: formAssignedDate,
        dueDate: formDueDate,
        priority: formPriority,
        expectedOutput: formExpectedOutput.trim(),
        coDepartment: formCoDepartment.trim(),
        coordinatingSpecialist: formCoordinatingSpecialist || undefined,
        reportEvidence: formReportEvidence.trim() || undefined,
        attachments: formAttachments.length > 0 ? formAttachments : undefined,
        notes: formNotes.trim(),
        timingStatus: timing
      });
      if (updated) {
        setPersonalTasks(databaseService.loadPersonalTasks(currentUser.id));
        showToast(`Đã cập nhật nhiệm vụ cá nhân "${formTitle.trim()}".`);
      }
      setEditingPersonalTaskId(null);
    } else {
      const newTask = databaseService.createPersonalTask(currentUser.id, {
        userId: currentUser.id,
        title: formTitle.trim(),
        content: formContent.trim() || formTitle.trim(),
        field: formField || (fieldsList[0] || 'Văn hóa - Thông tin'),
        assignedDate: formAssignedDate,
        dueDate: formDueDate,
        priority: formPriority,
        expectedOutput: formExpectedOutput.trim(),
        coDepartment: formCoDepartment.trim(),
        coordinatingSpecialist: formCoordinatingSpecialist || undefined,
        reportEvidence: formReportEvidence.trim() || undefined,
        attachments: formAttachments.length > 0 ? formAttachments : undefined,
        notes: formNotes.trim(),
        progress: 0,
        status: 'in_progress',
        timingStatus: timing,
        isSyncedToOfficial: false
      });

      setPersonalTasks(databaseService.loadPersonalTasks(currentUser.id));
      showToast(`Đã thêm nhiệm vụ cá nhân: "${newTask.title}".`);

      if (formSyncImmediately) {
        handleExecuteSync(newTask, formTargetLeader);
      }
    }

    resetForm();
    setActiveTab('tracking');
  };

  const resetForm = () => {
    setEditingPersonalTaskId(null);
    setFormTitle('');
    setFormContent('');
    setFormPriority('high');
    setFormExpectedOutput('');
    setFormCoDepartment('');
    setFormCoordinatingSpecialist('');
    setFormReportEvidence('');
    setFormAttachments([]);
    setFileUploadError(null);
    setFormNotes('');
    setFormSyncImmediately(false);
    setFormAssignedDate(new Date().toISOString().slice(0, 10));
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setFormDueDate(d.toISOString().slice(0, 10));
  };

  const handleEditClick = (task: PersonalTask) => {
    setEditingPersonalTaskId(task.id);
    setFormTitle(task.title);
    setFormContent(task.content || '');
    setFormField(task.field);
    setFormAssignedDate(task.assignedDate);
    setFormDueDate(task.dueDate);
    setFormPriority(task.priority);
    setFormExpectedOutput(task.expectedOutput || '');
    setFormCoDepartment(task.coDepartment || '');
    setFormCoordinatingSpecialist(task.coordinatingSpecialist || '');
    setFormReportEvidence(task.reportEvidence || '');
    setFormAttachments((task.attachments || []).map(a => typeof a === 'string' ? { name: a } : a));
    setFileUploadError(null);
    setFormNotes(task.notes || '');
    setActiveTab('self_assign');
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    if (window.confirm(`Đồng chí có chắc chắn muốn xóa nhiệm vụ cá nhân "${title}" khỏi sổ tay?`)) {
      databaseService.deletePersonalTask(currentUser.id, taskId);
      setPersonalTasks(databaseService.loadPersonalTasks(currentUser.id));
      showToast('Đã xóa nhiệm vụ khỏi sổ tay cá nhân.', 'info');
    }
  };

  const handleUpdateProgress = (taskId: string, newProgress: number) => {
    const isDone = newProgress >= 100;
    const task = personalTasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = isDone ? 'completed' : 'in_progress';
    const newTiming = calculateTiming(task.dueDate, isDone);

    databaseService.updatePersonalTask(currentUser.id, taskId, {
      progress: newProgress,
      status: newStatus,
      timingStatus: newTiming
    });
    setPersonalTasks(databaseService.loadPersonalTasks(currentUser.id));
    showToast(`Cập nhật tiến độ: ${newProgress}%`);
  };

  // Requirement 4: Transfer data to central system with full details during synchronization
  const handleExecuteSync = (task: PersonalTask, leaderName: string) => {
    const officialId = nextOfficialTaskId;
    const newOfficialTask: Task = {
      id: officialId,
      title: task.title,
      content: task.content || task.title,
      assigner: leaderName || 'Phạm Sơn Triều – Trưởng phòng',
      assignee: currentUser.name,
      department: currentUser.department || 'Phòng Văn hóa - Xã hội',
      field: task.field || 'Văn hóa - Thông tin',
      assignedDate: task.assignedDate,
      dueDate: task.dueDate,
      priority: task.priority,
      progress: task.progress,
      status: task.status,
      timingStatus: task.timingStatus,
      coordinatingSpecialist: task.coordinatingSpecialist,
      coDepartment: task.coordinatingSpecialist 
        ? `${task.coordinatingSpecialist}${task.coDepartment ? ' • ' + task.coDepartment : ''}`
        : task.coDepartment || 'Phòng Văn hóa - Xã hội',
      notes: (task.notes ? `${task.notes} • ` : '') + (task.reportEvidence ? `[Minh chứng: ${task.reportEvidence}] • ` : '') + `[Chuyển từ Sổ tay cá nhân của ${currentUser.name}]`,
      attachments: task.attachments && task.attachments.length > 0 ? task.attachments : undefined,
      feedbackList: task.reportEvidence || (task.attachments && task.attachments.length > 0) ? [
        {
          id: `FB-${Date.now()}`,
          sender: currentUser.name,
          type: 'progress_report',
          title: 'Báo cáo kết quả và tài liệu chuyển từ Sổ tay cá nhân',
          content: task.reportEvidence || 'Báo cáo tiến độ và minh chứng tài liệu từ sổ tay cá nhân.',
          progress: task.progress,
          attachments: (task.attachments || []).map(a => typeof a === 'string' ? { name: a } : a),
          createdAt: new Date().toISOString()
        }
      ] : undefined
    };

    onSyncToCentral(newOfficialTask);
    databaseService.markPersonalTaskSynced(currentUser.id, task.id, officialId);
    setPersonalTasks(databaseService.loadPersonalTasks(currentUser.id));
    setSyncTaskCandidate(null);
    showToast(`Đã đồng bộ thành công lên hệ thống chung! Mã nhiệm vụ chính thức: ${officialId}.`);
  };

  const filteredPersonalTasks = useMemo(() => {
    return personalTasks.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = t.title.toLowerCase().includes(q) || 
                      t.content.toLowerCase().includes(q) ||
                      t.field.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterField !== 'all' && t.field !== filterField) return false;
      if (filterStatus !== 'all') {
        if (filterStatus === 'completed' && t.status !== 'completed') return false;
        if (filterStatus === 'in_progress' && (t.status === 'completed' || t.timingStatus === 'overdue')) return false;
        if (filterStatus === 'overdue' && t.timingStatus !== 'overdue') return false;
      }
      if (filterSync === 'synced' && !t.isSyncedToOfficial) return false;
      if (filterSync === 'not_synced' && t.isSyncedToOfficial) return false;
      return true;
    });
  }, [personalTasks, searchQuery, filterField, filterStatus, filterSync]);

  const stats = useMemo(() => {
    const total = personalTasks.length;
    const completed = personalTasks.filter(t => t.status === 'completed').length;
    const overdue = personalTasks.filter(t => t.status !== 'completed' && (t.status === 'overdue' || t.timingStatus === 'overdue')).length;
    const approaching = personalTasks.filter(t => t.status !== 'completed' && t.timingStatus === 'approaching').length;
    const onTime = personalTasks.filter(t => t.status === 'completed' && (t.timingStatus === 'on_time' || t.timingStatus === 'before_deadline')).length;
    const inProgress = personalTasks.filter(t => t.status !== 'completed' && t.timingStatus !== 'overdue').length;
    const synced = personalTasks.filter(t => t.isSyncedToOfficial).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byField: Record<string, { total: number; completed: number }> = {};
    personalTasks.forEach(t => {
      const f = t.field || 'Chưa phân loại';
      if (!byField[f]) byField[f] = { total: 0, completed: 0 };
      byField[f].total += 1;
      if (t.status === 'completed') byField[f].completed += 1;
    });

    const urgent = personalTasks.filter(t => t.priority === 'urgent').length;
    const high = personalTasks.filter(t => t.priority === 'high').length;
    const normal = personalTasks.filter(t => t.priority === 'normal').length;

    return { total, completed, overdue, approaching, onTime, inProgress, synced, rate, byField, urgent, high, normal };
  }, [personalTasks]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  SỔ TAY NHIỆM VỤ CÁ NHÂN
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Riêng tư • {currentUser.name}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tự giao việc, theo dõi tiến độ công việc cá nhân và chuyển dữ liệu đồng bộ lên hệ thống điều hành chung
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'tracking'
                  ? 'bg-white text-indigo-700 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>1. Theo dõi công việc ({personalTasks.length})</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setActiveTab('self_assign');
              }}
              className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'self_assign'
                  ? 'bg-white text-indigo-700 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>2. Tự giao nhiệm vụ</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'stats'
                  ? 'bg-white text-indigo-700 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>3. Thống kê tổng hợp</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 pb-2 hidden md:block">
            <span>Dữ liệu cá nhân riêng tư của <strong>{currentUser.name}</strong></span>
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className={`mx-4 sm:mx-6 mt-3 p-3 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: WORK TRACKING */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              {/* Quick Summary Pill Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Tổng số việc</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-blue-600">Đang làm</div>
                  <div className="text-xl font-black text-blue-700 mt-0.5">{stats.inProgress}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-rose-600">Quá hạn</div>
                  <div className="text-xl font-black text-rose-700 mt-0.5">{stats.overdue}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-emerald-600">Đã xong ({stats.rate}%)</div>
                  <div className="text-xl font-black text-emerald-700 mt-0.5">{stats.completed}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-xs bg-indigo-50/40 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-indigo-700">Đã chuyển HT chung</div>
                  <div className="text-xl font-black text-indigo-800 mt-0.5">{stats.synced} <span className="text-xs font-normal text-indigo-600">/ {stats.total}</span></div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo trích yếu, lĩnh vực..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 text-slate-800"
                    />
                  </div>

                  <select
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                  >
                    <option value="all">-- Tất cả lĩnh vực --</option>
                    {fieldsList.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                  >
                    <option value="all">-- Tất cả trạng thái --</option>
                    <option value="in_progress">Đang thực hiện ({stats.inProgress})</option>
                    <option value="completed">Đã hoàn thành ({stats.completed})</option>
                    <option value="overdue">Quá hạn ({stats.overdue})</option>
                  </select>

                  <select
                    value={filterSync}
                    onChange={(e) => setFilterSync(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 font-semibold cursor-pointer"
                  >
                    <option value="all">-- Tình trạng đồng bộ --</option>
                    <option value="not_synced">Chưa chuyển hệ thống ({stats.total - stats.synced})</option>
                    <option value="synced">Đã chuyển hệ thống ({stats.synced})</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('self_assign');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Tự giao việc</span>
                </button>
              </div>

              {/* Task Cards & Table */}
              {filteredPersonalTasks.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">Chưa có nhiệm vụ cá nhân nào</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Đồng chí có thể tự lên kế hoạch công việc, theo dõi tiến độ và chủ động chuyển dữ liệu lên hệ thống điều hành chung khi cần.
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('self_assign');
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Tự giao nhiệm vụ đầu tiên</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPersonalTasks.map((task) => {
                    const timing = getDaysRemainingText(task.dueDate, task.status === 'completed');
                    return (
                      <div 
                        key={task.id}
                        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md ${
                          task.status === 'completed'
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : task.timingStatus === 'overdue'
                              ? 'border-rose-300 bg-rose-50/10'
                              : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {task.id}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {task.field}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${timing.color}`}>
                                {timing.label}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                task.priority === 'urgent' 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : task.priority === 'high'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                              }`}>
                                {task.priority === 'urgent' ? 'Hỏa tốc' : task.priority === 'high' ? 'Ưu tiên cao' : 'Bình thường'}
                              </span>

                              {task.isSyncedToOfficial ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Đã chuyển HT chung ({task.syncedOfficialTaskId})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                  <span>Chỉ lưu sổ tay cá nhân</span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                              {task.title}
                            </h4>
                            {task.content && task.content !== task.title && (
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {task.content}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Bắt đầu: {task.assignedDate}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Hạn: <strong className="text-slate-800">{task.dueDate}</strong></span>
                              </span>
                              {task.coordinatingSpecialist && (
                                <span className="flex items-center gap-1 text-indigo-700 font-semibold truncate max-w-xs">
                                  <User className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Phối hợp: <strong className="text-slate-900">{task.coordinatingSpecialist}</strong></span>
                                </span>
                              )}
                              {task.expectedOutput && (
                                <span className="flex items-center gap-1 text-slate-700 font-semibold truncate max-w-xs">
                                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Sản phẩm: {task.expectedOutput}</span>
                                </span>
                              )}
                            </div>

                            {task.reportEvidence && (
                              <div className="mt-2.5 p-2.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-emerald-900 mb-0.5">Báo cáo kết quả / Minh chứng:</div>
                                  <div className="text-emerald-900/90 leading-relaxed font-normal whitespace-pre-wrap">{task.reportEvidence}</div>
                                </div>
                              </div>
                            )}

                            {task.attachments && task.attachments.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mr-1">
                                  <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Hồ sơ minh chứng ({task.attachments.length}):</span>
                                </span>
                                {task.attachments.map((att, attIdx) => {
                                  const name = typeof att === 'string' ? att : att.name;
                                  const sizeStr = typeof att === 'string' || !att.size ? '' : ` (${(att.size / 1024).toFixed(0)} KB)`;
                                  return (
                                    <button
                                      key={attIdx}
                                      type="button"
                                      onClick={() => handleDownloadDocument(att)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-colors shadow-2xs cursor-pointer"
                                      title="Tải về tài liệu kết quả"
                                    >
                                      <FileDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                      <span className="truncate max-w-[150px]">{name}</span>
                                      <span className="text-[10px] text-slate-400">{sizeStr}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Right Controls: Progress Slider & Transfer Button */}
                          <div className="lg:w-80 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-2.5">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-500 font-medium">Tiến độ cá nhân:</span>
                                <span className="font-bold text-slate-900">{task.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1.5">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    task.progress >= 100 
                                      ? 'bg-emerald-500' 
                                      : task.progress >= 50 
                                        ? 'bg-indigo-600' 
                                        : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>

                              <div className="flex items-center gap-1 text-[10px]">
                                {[0, 25, 50, 75, 100].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleUpdateProgress(task.id, val)}
                                    className={`flex-1 py-0.5 rounded font-bold transition-all cursor-pointer ${
                                      task.progress === val
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {val}%
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                              {!task.isSyncedToOfficial ? (
                                <button
                                  type="button"
                                  onClick={() => setSyncTaskCandidate(task)}
                                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                                  title="Chuyển dữ liệu lên hệ thống điều hành chung"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Chuyển lên hệ thống chung</span>
                                </button>
                              ) : (
                                <div className="flex-1 text-center py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                                  ✓ Đã đồng bộ ({task.syncedOfficialTaskId})
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleEditClick(task)}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
                                title="Chỉnh sửa nội dung"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id, task.title)}
                                className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-slate-500 hover:text-rose-600 cursor-pointer"
                                title="Xóa khỏi sổ tay"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SELF ASSIGNMENT */}
          {activeTab === 'self_assign' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs max-w-3xl mx-auto">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {editingPersonalTaskId ? 'Chỉnh sửa nhiệm vụ cá nhân' : 'Khởi tạo nhiệm vụ tự giao vào Sổ tay cá nhân'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Áp dụng đầy đủ các trường thông tin chuẩn hóa theo nguyên tắc 6 Rõ (lược bỏ Chuyên viên tham mưu và Người giao việc)
                  </p>
                </div>
                {editingPersonalTaskId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hủy chỉnh sửa</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1. Tiêu đề / Trích yếu nhiệm vụ công việc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Rà soát danh sách đối tượng người có công nhận quà Tết 2026..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. Nội dung chi tiết nhiệm vụ và yêu cầu cụ thể
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ghi rõ các bước thực hiện, hồ sơ minh chứng cần thu thập, phương án triển khai..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl focus:bg-white text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      3. Lĩnh vực phụ trách <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formField}
                      onChange={(e) => setFormField(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      {fieldsList.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      4. Mức độ ưu tiên
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="urgent">Hỏa tốc / Khẩn cấp</option>
                      <option value="high">Ưu tiên cao</option>
                      <option value="normal">Bình thường</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      5. Ngày bắt đầu / Ngày tự giao
                    </label>
                    <input
                      type="date"
                      value={formAssignedDate}
                      onChange={(e) => setFormAssignedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      6. Hạn hoàn thành <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      7. Sản phẩm dự kiến bàn giao
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Báo cáo, Kế hoạch, Tờ trình phê duyệt..."
                      value={formExpectedOutput}
                      onChange={(e) => setFormExpectedOutput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span>8. Chuyên viên phối hợp</span>
                      <span className="text-[10px] text-indigo-600 font-semibold">(CSDL Chuyên viên)</span>
                    </label>
                    <select
                      value={formCoordinatingSpecialist}
                      onChange={(e) => setFormCoordinatingSpecialist(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="">-- Không có / Tự thực hiện --</option>
                      {specialists.filter(s => s.name !== currentUser.name).map(s => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    9. Đơn vị / Cơ quan phối hợp
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Công an xã, Trạm Y tế, VP.HĐND-UBND, Địa chính..."
                    value={formCoDepartment}
                    onChange={(e) => setFormCoDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-800"
                  />
                </div>

                {/* Requirement 1: Fields for reporting implementation results/product evidence and uploading result documents */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span>10. Báo cáo kết quả thực hiện / Minh chứng sản phẩm</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Kết quả & minh chứng</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả cụ thể kết quả đã triển khai, sản phẩm đạt được, số liệu minh chứng, đường link hoặc tóm tắt nội dung hoàn thành..."
                      value={formReportEvidence}
                      onChange={(e) => setFormReportEvidence(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-none text-xs text-slate-800 leading-relaxed font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span>11. Tải lên tài liệu kết quả / hồ sơ minh chứng (PDF, Word, Excel, Hình ảnh...)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Tối đa 15MB/tệp</span>
                    </label>
                    
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Chọn tệp tài liệu kết quả</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formAttachments.length === 0 ? 'Chưa đính kèm tài liệu nào' : `Đã đính kèm ${formAttachments.length} tài liệu kết quả`}
                      </span>
                    </div>

                    {fileUploadError && (
                      <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{fileUploadError}</span>
                      </div>
                    )}

                    {formAttachments.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {formAttachments.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-xl text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="font-semibold text-slate-800 truncate">{att.name}</span>
                              {att.size && (
                                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                  ({(att.size / 1024).toFixed(0)} KB)
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Xóa tài liệu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    12. Ghi chú cá nhân
                  </label>
                  <input
                    type="text"
                    placeholder="Ghi chú nhắc nhở bản thân hoặc nguồn gốc chỉ đạo..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-800"
                  />
                </div>

                {!editingPersonalTaskId && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSyncImmediately}
                        onChange={(e) => setFormSyncImmediately(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-indigo-900">
                        Đồng thời chuyển ngay lên hệ thống nhiệm vụ điều hành chung (Đồng bộ trực tiếp)
                      </span>
                    </label>

                    {formSyncImmediately && (
                      <div className="mt-2.5 pt-2.5 border-t border-indigo-200/60">
                        <label className="block text-[11px] font-bold text-indigo-800 mb-1">
                          Lãnh đạo phụ trách theo dõi:
                        </label>
                        <select
                          value={formTargetLeader}
                          onChange={(e) => setFormTargetLeader(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-300 rounded-lg text-slate-900 font-semibold cursor-pointer"
                        >
                          {deduplicatedLeaders.map(l => (
                            <option key={l.name} value={l.label}>
                              {l.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tracking')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Xem danh sách
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingPersonalTaskId ? 'Cập nhật nhiệm vụ' : 'Lưu vào Sổ tay cá nhân'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: AGGREGATE STATISTICS */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs mb-2 text-indigo-200">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Báo cáo hiệu suất công vụ cá nhân</span>
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Thống kê tiến độ nhiệm vụ: {currentUser.name}
                    </h3>
                    <p className="text-xs text-indigo-200/90 mt-1 max-w-xl leading-relaxed">
                      Phân tích tổng hợp số lượng việc tự đảm nhận, tỷ lệ hoàn thành đúng hạn và khối lượng công tác đã chuyển lên hệ thống điều hành chung.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 min-w-[160px]">
                    <div className="text-xs text-indigo-200 font-medium">Tỷ lệ hoàn thành</div>
                    <div className="text-4xl font-black mt-1 text-white">{stats.rate}%</div>
                    <div className="text-[10px] text-emerald-300 font-semibold mt-1">
                      {stats.completed} / {stats.total} nhiệm vụ xong
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold">Tổng số nhiệm vụ</span>
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                  <p className="text-[10px] text-slate-400 mt-1">100% việc trong sổ tay cá nhân</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-blue-600 mb-1">
                    <span className="text-xs font-semibold">Đang giải quyết</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-blue-700">{stats.inProgress}</div>
                  <p className="text-[10px] text-slate-400 mt-1">{stats.approaching} việc sắp đến hạn chót</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-rose-600 mb-1">
                    <span className="text-xs font-semibold">Quá hạn chưa xong</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-black text-rose-700">{stats.overdue}</div>
                  <p className="text-[10px] text-slate-400 mt-1">Cần tập trung xử lý gấp</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-600 mb-1">
                    <span className="text-xs font-semibold">Đã chuyển HT chung</span>
                    <Send className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700">{stats.synced}</div>
                  <p className="text-[10px] text-slate-400 mt-1">Đã bàn giao Lãnh đạo nghiệm thu</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    <span>Cơ cấu theo Lĩnh vực phụ trách</span>
                  </h4>

                  {Object.keys(stats.byField).length === 0 ? (
                    <div className="text-xs text-slate-400 py-6 text-center">Chưa có dữ liệu lĩnh vực</div>
                  ) : (
                    <div className="space-y-2.5">
                      {Object.entries(stats.byField).map(([field, data]) => {
                        const pct = Math.round((data.total / stats.total) * 100);
                        return (
                          <div key={field}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-800">{field}</span>
                              <span className="text-slate-500 font-mono">
                                <strong>{data.completed}</strong>/{data.total} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Cơ cấu theo Mức độ ưu tiên</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-900">Hỏa tốc / Khẩn cấp</div>
                        <div className="text-[10px] text-rose-600">Đòi hỏi xử lý tức thời</div>
                      </div>
                      <div className="text-xl font-black text-rose-700">{stats.urgent}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-900">Ưu tiên cao</div>
                        <div className="text-[10px] text-amber-600">Hạn định trong tuần</div>
                      </div>
                      <div className="text-xl font-black text-amber-700">{stats.high}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Bình thường</div>
                        <div className="text-[10px] text-slate-500">Kế hoạch công tác định kỳ</div>
                      </div>
                      <div className="text-xl font-black text-slate-700">{stats.normal}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Sổ tay cá nhân chỉ lưu trên tài khoản của đồng chí <strong>{currentUser.name}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng sổ tay
          </button>
        </div>
      </div>

      {/* Sync Confirmation Modal */}
      {syncTaskCandidate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-indigo-700 mb-2">
              <Send className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Chuyển dữ liệu lên hệ thống điều hành chung
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Nhiệm vụ <strong>"{syncTaskCandidate.title}"</strong> sẽ được đồng bộ chính thức vào hệ thống điều hành giao việc chung của đơn vị với mã mới <strong>{nextOfficialTaskId}</strong>.
            </p>

            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-4">
              <div>
                <span className="text-slate-500">Chuyên viên phụ trách:</span>{' '}
                <strong className="text-slate-900">{currentUser.name}</strong>
              </div>
              <div>
                <span className="text-slate-500">Lĩnh vực:</span>{' '}
                <span className="font-semibold text-slate-800">{syncTaskCandidate.field}</span>
              </div>
              <div>
                <span className="text-slate-500">Hạn hoàn thành:</span>{' '}
                <span className="font-semibold text-slate-800">{syncTaskCandidate.dueDate}</span>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Chọn Lãnh đạo giao việc / Phụ trách duyệt:
                </label>
                <select
                  value={selectedSyncLeader}
                  onChange={(e) => setSelectedSyncLeader(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold cursor-pointer"
                >
                  {deduplicatedLeaders.map(l => (
                    <option key={l.name} value={l.label}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSyncTaskCandidate(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSync(syncTaskCandidate, selectedSyncLeader)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Xác nhận đồng bộ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
