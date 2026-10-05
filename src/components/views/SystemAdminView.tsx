import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings, 
  Database, 
  History, 
  Users, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Check, 
  AlertTriangle, 
  UserPlus, 
  FileText, 
  Clock, 
  Sparkles, 
  Server, 
  Trash2, 
  RefreshCw, 
  Search, 
  Eye, 
  FileCode, 
  CheckCircle2, 
  Copy,
  KeyRound,
  Edit3,
  ShieldCheck,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Lock,
  Layers,
  CheckSquare,
  Square,
  Plus,
  ChevronDown,
  X
} from 'lucide-react';
import { Task, UserAccount, UserRole, ViewTab, ALL_VIEW_TABS, ROLE_PRESET_PERMISSIONS } from '../../types';
import { databaseService, AuditLog, SystemSettings } from '../../services/databaseService';

interface SystemAdminViewProps {
  tasks: Task[];
  onTasksUpdated: (newTasks: Task[]) => void;
}

export const SystemAdminView: React.FC<SystemAdminViewProps> = ({
  tasks,
  onTasksUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'fields' | 'settings' | 'logs' | 'database'>('accounts');

  // Accounts & Permissions State
  const [accounts, setAccounts] = useState<UserAccount[]>(() => databaseService.loadAccounts());
  const [accountSearch, setAccountSearch] = useState('');
  const [accountFilterRole, setAccountFilterRole] = useState<string>('all');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Areas of Responsibility State
  const [fieldsList, setFieldsList] = useState<string[]>(() => databaseService.loadFields());
  const [fieldSearch, setFieldSearch] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editingFieldText, setEditingFieldText] = useState('');
  const [fieldMessage, setFieldMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('specialist');
  const [formPosition, setFormPosition] = useState('Chuyên viên');
  const [formDepartment, setFormDepartment] = useState('Phòng Văn hóa - Xã hội');
  // Requirement 2: Ability to select multiple Areas of Responsibility
  const [formFields, setFormFields] = useState<string[]>(['Văn hóa - Thông tin']);
  const [isFieldsDropdownOpen, setIsFieldsDropdownOpen] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDefaultPassword, setFormDefaultPassword] = useState('password123');
  const [formPermissions, setFormPermissions] = useState<ViewTab[]>(ROLE_PRESET_PERMISSIONS.specialist);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [accountActionMessage, setAccountActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>(() => databaseService.loadSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>(() => databaseService.loadAuditLogs());
  const [filterAction, setFilterAction] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  // Database operations state
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dbHealth, setDbHealth] = useState<{ status: string; taskCount: number; accountCount?: number; staffCount: number; logCount: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawJsonModalOpen, setRawJsonModalOpen] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const refreshDbStatus = async () => {
    setIsRefreshing(true);
    try {
      const health = await databaseService.checkDbHealth();
      if (health) setDbHealth(health);

      const serverAccounts = await databaseService.fetchAccountsFromApi();
      if (serverAccounts) setAccounts(serverAccounts);

      const serverLogs = await databaseService.fetchAuditLogsFromApi();
      if (serverLogs) setLogs(serverLogs);

      const serverSettings = await databaseService.fetchSettingsFromApi();
      if (serverSettings) setSettings(serverSettings);

      const serverFields = await databaseService.fetchFieldsFromApi();
      if (serverFields) setFieldsList(serverFields);
    } catch (e) {
      console.warn('Refresh DB status warning:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshDbStatus();
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setFormRole(newRole);
    setFormPermissions(ROLE_PRESET_PERMISSIONS[newRole] || []);
    // Preset common fields for role if none selected
    if (formFields.length === 0) {
      if (newRole === 'leader') {
        setFormFields(['Văn hóa - Thông tin', 'Y tế', 'Chế độ chính sách - bảo trợ XH']);
      } else {
        setFormFields([fieldsList[0] || 'Văn hóa - Thông tin']);
      }
    }
  };

  const handleTogglePermission = (tabId: ViewTab) => {
    if (formRole === 'admin') return;

    if (formPermissions.includes(tabId)) {
      setFormPermissions(formPermissions.filter(p => p !== tabId));
    } else {
      setFormPermissions([...formPermissions, tabId]);
    }
  };

  // Requirement 2: Multiple Areas of Responsibility toggle
  const handleToggleFormField = (fName: string) => {
    if (formFields.includes(fName)) {
      if (formFields.length > 1) {
        setFormFields(formFields.filter(f => f !== fName));
      } else {
        alert('Phải chọn ít nhất 1 Lĩnh vực phụ trách cho cán bộ.');
      }
    } else {
      setFormFields([...formFields, fName]);
    }
  };

  const handleSelectAllFields = () => {
    setFormFields([...fieldsList]);
  };

  const handleClearAllFields = () => {
    if (fieldsList.length > 0) {
      setFormFields([fieldsList[0]]);
    }
  };

  // Fields CRUD Operations
  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFieldName.trim();
    if (!trimmed) return;
    if (fieldsList.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
      setFieldMessage({ type: 'error', text: `Lĩnh vực phụ trách "${trimmed}" đã tồn tại trên hệ thống!` });
      return;
    }
    const updated = [...fieldsList, trimmed];
    setFieldsList(updated);
    setNewFieldName('');
    await databaseService.saveFieldsToApi(updated);
    setFieldMessage({ type: 'success', text: `Đã thêm thành công lĩnh vực phụ trách mới: "${trimmed}"` });
    setTimeout(() => setFieldMessage(null), 3000);
  };

  const handleStartEditField = (index: number) => {
    setEditingFieldIndex(index);
    setEditingFieldText(fieldsList[index]);
  };

  const handleSaveEditField = async () => {
    if (editingFieldIndex === null) return;
    const oldName = fieldsList[editingFieldIndex];
    const trimmed = editingFieldText.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() !== oldName.toLowerCase() && fieldsList.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
      setFieldMessage({ type: 'error', text: `Lĩnh vực phụ trách "${trimmed}" đã tồn tại trên hệ thống!` });
      return;
    }
    const updated = [...fieldsList];
    updated[editingFieldIndex] = trimmed;
    setFieldsList(updated);
    setEditingFieldIndex(null);
    await databaseService.saveFieldsToApi(updated);
    setFieldMessage({ type: 'success', text: `Đã cập nhật tên lĩnh vực: "${oldName}" ➔ "${trimmed}"` });
    setTimeout(() => setFieldMessage(null), 3000);
  };

  const handleDeleteField = async (fieldName: string) => {
    const tasksInField = tasks.filter(t => t.field === fieldName).length;
    const accountsInField = accounts.filter(a => a.fields?.includes(fieldName) || a.field?.includes(fieldName)).length;
    const warning = (tasksInField > 0 || accountsInField > 0) 
      ? `\n(Lưu ý: Có ${tasksInField} nhiệm vụ và ${accountsInField} tài khoản đang gắn với lĩnh vực này)` 
      : '';
    if (!window.confirm(`Đồng chí có chắc chắn muốn xóa lĩnh vực phụ trách "${fieldName}"?${warning}`)) {
      return;
    }
    const updated = fieldsList.filter(f => f !== fieldName);
    setFieldsList(updated);
    await databaseService.saveFieldsToApi(updated);
    setFieldMessage({ type: 'success', text: `Đã xóa lĩnh vực phụ trách "${fieldName}".` });
    setTimeout(() => setFieldMessage(null), 3000);
  };

  const handleResetDefaultFields = async () => {
    if (!window.confirm('Khôi phục danh sách lĩnh vực về 10 lĩnh vực chuẩn ban đầu của Phòng VHXH?')) return;
    const defaultFields = [
      'Nội vụ',
      'Giáo dục Đào tạo',
      'Chế độ chính sách - bảo trợ XH',
      'Y tế',
      'Văn hóa - Thông tin',
      'Dân tộc - Tôn giáo',
      'Khoa học công nghệ - CĐS',
      'Văn phòng',
      'Đầu tư xây dựng',
      'Văn thư - Lưu trữ'
    ];
    setFieldsList(defaultFields);
    await databaseService.saveFieldsToApi(defaultFields);
    setFieldMessage({ type: 'success', text: 'Đã khôi phục 10 lĩnh vực phụ trách mặc định của Phòng VHXH.' });
    setTimeout(() => setFieldMessage(null), 3000);
  };

  // Open modal to add new account (Requirement 2 & Requirement 1)
  const handleOpenAddModal = () => {
    setEditingAccountId(null);
    setFormName('');
    setFormRole('specialist');
    setFormPosition('Chuyên viên');
    setFormDepartment('Phòng Văn hóa - Xã hội');
    setFormFields([fieldsList[0] || 'Văn hóa - Thông tin']);
    setIsFieldsDropdownOpen(false);
    setFormEmail('');
    setFormPhone('');
    setFormDefaultPassword('password123');
    // Enforce Requirement 1: Specialist gets the 8 functions
    setFormPermissions(ROLE_PRESET_PERMISSIONS.specialist);
    setFormStatus('active');
    setAccountActionMessage(null);
    setIsAccountModalOpen(true);
  };

  // Open modal to edit existing account
  const handleOpenEditModal = (acc: UserAccount) => {
    setEditingAccountId(acc.id);
    setFormName(acc.name);
    setFormRole(acc.role);
    setFormPosition(acc.position || 'Chuyên viên');
    setFormDepartment(acc.department || 'Phòng Văn hóa - Xã hội');
    
    // Extract multiple fields
    if (acc.fields && Array.isArray(acc.fields) && acc.fields.length > 0) {
      setFormFields(acc.fields);
    } else if (acc.field) {
      const parsed = acc.field.split(',').map(s => s.trim()).filter(Boolean);
      setFormFields(parsed.length > 0 ? parsed : [fieldsList[0] || 'Văn hóa - Thông tin']);
    } else {
      setFormFields([fieldsList[0] || 'Văn hóa - Thông tin']);
    }

    setIsFieldsDropdownOpen(false);
    setFormEmail(acc.email);
    setFormPhone(acc.phone || '');
    setFormDefaultPassword(acc.password || 'password123');
    setFormPermissions(acc.role === 'specialist' ? ROLE_PRESET_PERMISSIONS.specialist : (acc.permissions || ROLE_PRESET_PERMISSIONS[acc.role] || []));
    setFormStatus(acc.status || 'active');
    setAccountActionMessage(null);
    setIsAccountModalOpen(true);
  };

  // Save Account
  const handleSaveAccountForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountActionMessage(null);

    if (!formName.trim() || !formEmail.trim()) {
      setAccountActionMessage({ type: 'error', text: 'Vui lòng điền họ tên và email công vụ' });
      return;
    }

    const selectedFieldsString = formFields.join(', ');
    const finalPermissions = formRole === 'admin' 
      ? ROLE_PRESET_PERMISSIONS.admin 
      : formRole === 'specialist'
        ? ROLE_PRESET_PERMISSIONS.specialist
        : formPermissions;

    try {
      if (editingAccountId) {
        const res = await databaseService.updateAccount(editingAccountId, {
          name: formName.trim(),
          role: formRole,
          position: formPosition.trim(),
          department: formDepartment.trim(),
          fields: formFields,
          field: selectedFieldsString,
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          password: formDefaultPassword.trim() || 'password123',
          permissions: finalPermissions,
          status: formStatus
        });

        if (res.success) {
          const updated = await databaseService.fetchAccountsFromApi();
          setAccounts(updated);
          setIsAccountModalOpen(false);
          setAccountActionMessage({ type: 'success', text: `Đã cập nhật thông tin và phân quyền cho cán bộ ${formName}!` });
          setTimeout(() => setAccountActionMessage(null), 3500);
        } else {
          setAccountActionMessage({ type: 'error', text: res.error || 'Cập nhật thất bại' });
        }
      } else {
        const res = await databaseService.createAccount({
          name: formName.trim(),
          role: formRole,
          position: formPosition.trim(),
          department: formDepartment.trim(),
          fields: formFields,
          field: selectedFieldsString,
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          password: formDefaultPassword.trim() || 'password123',
          permissions: finalPermissions,
          status: formStatus
        });

        if (res.success) {
          const updated = await databaseService.fetchAccountsFromApi();
          setAccounts(updated);
          setIsAccountModalOpen(false);
          setAccountActionMessage({ type: 'success', text: `Tạo tài khoản mới thành công cho cán bộ ${formName}!` });
          setTimeout(() => setAccountActionMessage(null), 3500);
        } else {
          setAccountActionMessage({ type: 'error', text: res.error || 'Thêm tài khoản thất bại' });
        }
      }
    } catch (err: any) {
      setAccountActionMessage({ type: 'error', text: err.message || 'Lỗi xử lý tài khoản' });
    }
  };

  const handleResetPassword = async (acc: UserAccount) => {
    const confirmReset = window.confirm(
      `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản "${acc.name}" (${acc.email})?\nMật khẩu mặc định sẽ được đặt thành: password123`
    );
    if (!confirmReset) return;

    try {
      const res = await databaseService.resetPassword(acc.id, 'password123');
      const updated = await databaseService.fetchAccountsFromApi();
      setAccounts(updated);
      setAccountActionMessage({ type: 'success', text: res.message });
      setTimeout(() => setAccountActionMessage(null), 4000);
    } catch (e: any) {
      setAccountActionMessage({ type: 'error', text: e.message || 'Lỗi đặt lại mật khẩu' });
    }
  };

  const handleToggleAccountStatus = async (acc: UserAccount) => {
    const newStatus: 'active' | 'inactive' = acc.status === 'active' ? 'inactive' : 'active';
    await databaseService.updateAccount(acc.id, { status: newStatus });
    const updated = await databaseService.fetchAccountsFromApi();
    setAccounts(updated);
  };

  const handleDeleteAccount = async (acc: UserAccount) => {
    if (acc.id === 'ACC-001') {
      alert('Không thể xóa tài khoản Quản trị hệ thống gốc Nguyễn Văn Thạnh!');
      return;
    }
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của cán bộ "${acc.name}" (${acc.email})?`);
    if (!confirmDelete) return;

    await databaseService.deleteAccount(acc.id);
    const updated = await databaseService.fetchAccountsFromApi();
    setAccounts(updated);
    setAccountActionMessage({ type: 'success', text: `Đã xóa tài khoản cán bộ ${acc.name}.` });
    setTimeout(() => setAccountActionMessage(null), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await databaseService.saveSettings(settings);
    setSaveSuccess(true);
    const updatedLogs = await databaseService.fetchAuditLogsFromApi();
    setLogs(updatedLogs);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = databaseService.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Backup_CSDL_Tra_Giap_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    databaseService.addAuditLog('Quản trị viên', 'SAO_LƯU_CSDL', 'Cơ sở dữ liệu', 'Xuất bản sao lưu cơ sở dữ liệu định dạng JSON.');
    setLogs(databaseService.loadAuditLogs());
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await databaseService.restoreDatabase(content);
      if (res.success) {
        setImportStatus({ type: 'success', message: res.message });
        const reloaded = await databaseService.fetchTasksFromApi();
        onTasksUpdated(reloaded);
        refreshDbStatus();
      } else {
        setImportStatus({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDatabase = async () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ cơ sở dữ liệu về 18 nhiệm vụ tiêu chuẩn năm 2026. Bạn có chắc chắn muốn thực hiện?')) {
      const resetTasks = await databaseService.resetToSeed();
      onTasksUpdated(resetTasks);
      await refreshDbStatus();
      setImportStatus({ type: 'success', message: 'Đã hoàn tất đặt lại cơ sở dữ liệu về 18 nhiệm vụ và tài khoản chuẩn.' });
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    if (accountFilterRole !== 'all' && acc.role !== accountFilterRole) return false;
    if (accountSearch.trim()) {
      const q = accountSearch.toLowerCase();
      return (
        acc.name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        (acc.phone && acc.phone.includes(q)) ||
        acc.position.toLowerCase().includes(q) ||
        acc.department.toLowerCase().includes(q) ||
        (acc.field && acc.field.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'all' && !log.action.includes(filterAction)) return false;
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold backdrop-blur-xs mb-2">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trung tâm Quản trị Hệ thống, Tài khoản & Cơ sở dữ liệu Cấp Xã</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            QUẢN TRỊ HỆ THỐNG & DỮ LIỆU ĐIỀU HÀNH
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Quản lý tài khoản cán bộ, phân quyền nhóm chức năng, tham số vận hành, nhật ký kiểm toán và CSDL JSON
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Cơ sở dữ liệu JSON</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Đang kết nối ({accounts.length} tài khoản • {tasks.length} việc)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Vị trí: /data/database.json</div>
          </div>

          <button
            onClick={refreshDbStatus}
            disabled={isRefreshing}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            title="Làm mới trạng thái kết nối"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {accountActionMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border animate-in fade-in ${
          accountActionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {accountActionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{accountActionMessage.text}</span>
          </div>
          <button 
            onClick={() => setAccountActionMessage(null)}
            className="text-xs font-bold px-2 py-0.5 hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'accounts' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Quản lý tài khoản & Phân quyền ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fields')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'fields' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Lĩnh vực phụ trách ({fieldsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>3. Cấu hình thông số & Bản quyền</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logs' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>4. Nhật ký kiểm toán ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'database' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>5. Sao lưu & Phục hồi CSDL</span>
        </button>
      </div>

      {/* Tab 1: Quản lý tài khoản & Phân quyền */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Tổng tài khoản</div>
              <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{accounts.length}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Tất cả các nhóm quyền</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
              <div className="text-xs font-semibold text-emerald-700 flex items-center justify-between">
                <span>Quản trị hệ thống</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
                {accounts.filter(a => a.role === 'admin').length}
              </div>
              <div className="text-[10px] text-emerald-600/80 mt-0.5">Toàn quyền hệ thống</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs">
              <div className="text-xs font-semibold text-blue-700 flex items-center justify-between">
                <span>Lãnh đạo phụ trách</span>
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">
                {accounts.filter(a => a.role === 'leader').length}
              </div>
              <div className="text-[10px] text-blue-600/80 mt-0.5">Giao việc & nghiệm thu</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-purple-200/80 shadow-xs">
              <div className="text-xs font-semibold text-purple-700 flex items-center justify-between">
                <span>Chuyên viên / Cán bộ</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700 mt-1 tabular-nums">
                {accounts.filter(a => a.role === 'specialist').length}
              </div>
              <div className="text-[10px] text-purple-600/80 mt-0.5">
                8 Chức năng cho phép
              </div>
            </div>
          </div>

          {/* Account Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Danh sách tài khoản & Phân quyền cán bộ ({filteredAccounts.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân quyền theo nhóm: Chuyên viên giới hạn 8 chức năng và xem nhiệm vụ của chính mình
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email, SĐT, lĩnh vực..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <select
                  value={accountFilterRole}
                  onChange={(e) => setAccountFilterRole(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="all">-- Tất cả nhóm quyền --</option>
                  <option value="admin">Quản trị hệ thống (Admin)</option>
                  <option value="leader">Lãnh đạo (Leader)</option>
                  <option value="specialist">Chuyên viên / Cán bộ</option>
                  <option value="tester">Kiểm thử viên (Tester)</option>
                </select>

                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm cán bộ & Phân quyền</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4 min-w-[170px]">Cán bộ & Chức vụ</th>
                    <th className="py-3 px-4 min-w-[200px]">Lĩnh vực phụ trách</th>
                    <th className="py-3 px-4 min-w-[160px]">Đơn vị công tác</th>
                    <th className="py-3 px-4 min-w-[180px]">Email & Số điện thoại</th>
                    <th className="py-3 px-3 text-center">Nhóm quyền</th>
                    <th className="py-3 px-3 text-center">Chức năng</th>
                    <th className="py-3 px-3 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center w-36">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.map((acc, idx) => {
                    const roleBadge = acc.role === 'admin'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : acc.role === 'leader'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : acc.role === 'specialist'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200';

                    const roleLabel = acc.role === 'admin'
                      ? 'Quản trị hệ thống'
                      : acc.role === 'leader'
                        ? 'Lãnh đạo'
                        : acc.role === 'specialist'
                          ? 'Chuyên viên'
                          : 'Kiểm thử';

                    const permCount = acc.role === 'admin' ? 13 : (acc.permissions || []).length;
                    const fieldsArr = acc.fields && acc.fields.length > 0 ? acc.fields : (acc.field ? acc.field.split(', ') : ['Chung']);

                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 text-center font-bold text-slate-400 tabular-nums">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{acc.name}</div>
                          <div className="text-[11px] text-slate-500">{acc.position}</div>
                        </td>

                        {/* Multi-fields displayed as badges */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {fieldsArr.map((f, fIdx) => (
                              <span 
                                key={fIdx}
                                className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          {acc.department}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{acc.email}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{acc.phone || 'Chưa cập nhật'}</div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge}`}>
                            {roleLabel}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] tabular-nums">
                            {permCount}/13 mục
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleAccountStatus(acc)}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                              acc.status === 'active'
                                ? 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                : 'text-slate-600 bg-slate-100 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {acc.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(acc)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin, lĩnh vực & phân quyền"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleResetPassword(acc)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Đặt lại mật khẩu mặc định (password123)"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {acc.id !== 'ACC-001' && (
                              <button
                                onClick={() => handleDeleteAccount(acc)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        </div>
      )}

      {/* Tab 2: Quản lý Lĩnh vực phụ trách */}
      {activeTab === 'fields' && (
        <div className="space-y-6">
          {fieldMessage && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border animate-in fade-in ${
              fieldMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {fieldMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <span>{fieldMessage.text}</span>
              </div>
              <button 
                onClick={() => setFieldMessage(null)}
                className="text-xs font-bold px-2 py-0.5 hover:underline"
              >
                ✕
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Quản lý Lĩnh vực phụ trách (Areas of Responsibility)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thiết lập danh mục các lĩnh vực công tác, chuyên môn phụ trách để phục vụ phân công nhiệm vụ, thống kê và báo cáo điều hành.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetDefaultFields}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                title="Khôi phục danh mục 10 lĩnh vực chuẩn mặc định"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Đặt lại 10 lĩnh vực chuẩn</span>
              </button>
            </div>

            <form onSubmit={handleAddField} className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  required
                  placeholder="Nhập tên lĩnh vực phụ trách mới (ví dụ: Bảo hiểm xã hội, Văn thư - Lưu trữ, Xúc tiến đầu tư...)"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm lĩnh vực</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-700">
                Danh sách hiện có: <span className="text-emerald-700">{fieldsList.length} lĩnh vực</span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm lĩnh vực..."
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4 min-w-[240px]">Tên lĩnh vực phụ trách</th>
                    <th className="py-3 px-3 text-center">Số nhiệm vụ liên quan</th>
                    <th className="py-3 px-3 text-center">Cán bộ đảm nhiệm</th>
                    <th className="py-3 px-4 text-center w-36">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fieldsList
                    .filter(f => !fieldSearch || f.toLowerCase().includes(fieldSearch.toLowerCase()))
                    .map((fieldItem, idx) => {
                      const isEditing = editingFieldIndex === idx;
                      const taskCount = tasks.filter(t => t.field === fieldItem).length;
                      const userCount = accounts.filter(a => a.fields?.includes(fieldItem) || a.field?.includes(fieldItem)).length;

                      return (
                        <tr key={fieldItem} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>

                          <td className="py-3 px-4">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingFieldText}
                                  onChange={(e) => setEditingFieldText(e.target.value)}
                                  className="px-2.5 py-1 text-xs bg-white border border-emerald-500 rounded-lg font-bold text-slate-900 w-full"
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveEditField}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFieldIndex(null)}
                                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-medium shrink-0 cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">{fieldItem}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs tabular-nums">
                              {taskCount} việc
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full text-xs tabular-nums">
                              {userCount} cán bộ
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {!isEditing && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditField(idx)}
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Chỉnh sửa tên lĩnh vực"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteField(fieldItem)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Xóa lĩnh vực phụ trách"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Thêm mới / Chỉnh sửa tài khoản & Phân quyền (Requirement 2 & Requirement 1) */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  {editingAccountId ? 'Chỉnh sửa tài khoản & Phân quyền' : 'Thêm mới tài khoản cán bộ & Phân quyền'}
                </h3>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccountForm} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên cán bộ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Văn An"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhóm quyền hệ thống <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-900 font-bold cursor-pointer"
                  >
                    <option value="specialist">Chuyên viên / Cán bộ (8 Chức năng giới hạn)</option>
                    <option value="leader">Lãnh đạo (Chỉ đạo & Nghiệm thu)</option>
                    <option value="admin">Quản trị hệ thống (Toàn quyền)</option>
                    <option value="tester">Kiểm thử viên (Tester)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chức danh / Chức vụ
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chuyên viên Văn hóa..."
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đơn vị / Cơ quan công tác
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Requirement 2: Ability to select multiple "Areas of Responsibility" from a dropdown menu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>
                    Lĩnh vực phụ trách (Chọn nhiều lĩnh vực từ menu dropdown) <span className="text-rose-500">*</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllFields}
                      className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleClearAllFields}
                      className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </label>

                {/* Dropdown trigger */}
                <div className="relative">
                  <div
                    onClick={() => setIsFieldsDropdownOpen(!isFieldsDropdownOpen)}
                    className="w-full min-h-[38px] p-2 bg-emerald-50/50 border border-emerald-300 hover:border-emerald-500 rounded-xl cursor-pointer flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {formFields.length === 0 ? (
                        <span className="text-slate-400 text-xs">Bấm để chọn các lĩnh vực phụ trách...</span>
                      ) : (
                        formFields.map(f => (
                          <span
                            key={f}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-semibold text-[11px] shadow-2xs"
                          >
                            <span>{f}</span>
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFormField(f);
                              }}
                              className="hover:text-rose-200 cursor-pointer ml-0.5"
                            >
                              ✕
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isFieldsDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown menu with checkboxes */}
                  {isFieldsDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 max-h-52 overflow-y-auto animate-in fade-in duration-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 mb-1">
                        Danh sách lĩnh vực phụ trách ({fieldsList.length}):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {fieldsList.map(fName => {
                          const isChecked = formFields.includes(fName);
                          return (
                            <div
                              key={fName}
                              onClick={() => handleToggleFormField(fName)}
                              className={`p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                                isChecked 
                                  ? 'bg-emerald-50 text-emerald-900 font-bold' 
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate text-xs">{fName}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-2 mt-1 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsFieldsDropdownOpen(false)}
                          className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          Xong ({formFields.length} lĩnh vực đã chọn)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Đã chọn <strong>{formFields.length}</strong> lĩnh vực phụ trách cho cán bộ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email công vụ (Tên đăng nhập) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="thanhnv53@danang.gov.vn"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="0912.xxx.xxx"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu đăng nhập (Mặc định)
                  </label>
                  <input
                    type="text"
                    value={formDefaultPassword}
                    onChange={(e) => setFormDefaultPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trạng thái tài khoản
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 cursor-pointer"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Tạm khóa</option>
                  </select>
                </div>
              </div>

              {/* Requirement 1: Specialist permissions are strictly the 8 functions */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Phân quyền chức năng ({formRole === 'admin' ? 13 : formPermissions.length}/13 chức năng):
                  </label>
                  {formRole === 'specialist' && (
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Nhóm Chuyên viên: Chuẩn 8 chức năng & Chỉ hiển thị nhiệm vụ cá nhân
                    </span>
                  )}
                  {formRole === 'admin' && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Quản trị hệ thống: Toàn quyền tất cả chức năng
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {ALL_VIEW_TABS.map((tab) => {
                    const isChecked = formRole === 'admin' || formPermissions.includes(tab.id);
                    return (
                      <div
                        key={tab.id}
                        onClick={() => handleTogglePermission(tab.id)}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] truncate">{tab.label}</div>
                          <div className="text-[10px] text-slate-500 truncate">{tab.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAccountId ? 'Cập nhật tài khoản' : 'Khởi tạo tài khoản'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Cấu hình thông số */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-base font-bold text-slate-900">
              Cấu hình thông số hoạt động và bản quyền cơ quan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các thông số này được đồng bộ xuyên suốt toàn bộ giao diện, phiếu giao việc, mẫu báo cáo và in ấn
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên hệ thống
                </label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên đơn vị / Cơ quan ban hành
                </label>
                <input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-900 font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Chuỗi bản quyền & Định danh tác giả
              </label>
              <input
                type="text"
                value={settings.copyright}
                onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-900 font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngưỡng cảnh báo sắp đến hạn (Ngày)
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={settings.warningDaysThreshold}
                  onChange={(e) => setSettings({ ...settings, warningDaysThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kỳ công tác / Nhiệm kỳ
                </label>
                <input
                  type="text"
                  value={settings.currentTerm}
                  onChange={(e) => setSettings({ ...settings, currentTerm: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Thang điểm đánh giá tối đa
                </label>
                <input
                  type="number"
                  value={settings.maxTaskScore}
                  onChange={(e) => setSettings({ ...settings, maxTaskScore: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-900 font-bold"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Đã lưu cấu hình thông số vào cơ sở dữ liệu thành công!
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông số cấu hình</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Nhật ký kiểm toán */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Nhật ký kiểm toán & Lịch sử điều hành tiến độ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lưu vết tự động mọi hành vi: Giao việc, đôn đốc, cập nhật tiến độ, đánh giá nghiệm thu
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Lọc nhật ký..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                <option value="all">-- Tất cả loại hành động --</option>
                <option value="KHỞI_TẠO">Khởi tạo</option>
                <option value="TẠO_TÀI_KHOẢN">Tạo tài khoản</option>
                <option value="CẬP_NHẬT_TÀI_KHOẢN">Cập nhật tài khoản</option>
                <option value="ĐẶT_LẠI_MẬT_KHẨU">Đặt lại mật khẩu</option>
                <option value="ĐĂNG_NHẬP">Đăng nhập</option>
                <option value="GIAO_VIỆC">Giao việc mới</option>
                <option value="ĐÔN_ĐỐC">Đôn đốc</option>
                <option value="ĐÁNH_GIÁ">Đánh giá nghiệm thu</option>
                <option value="CẬP_NHẬT">Cập nhật tiến độ</option>
                <option value="SAO_LƯU">Sao lưu dữ liệu</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-36">Mã & Thời gian</th>
                  <th className="py-3 px-3 min-w-[140px]">Người thực hiện</th>
                  <th className="py-3 px-3 min-w-[130px]">Loại thao tác</th>
                  <th className="py-3 px-3 min-w-[110px]">Đối tượng</th>
                  <th className="py-3 px-4 min-w-[280px]">Nội dung chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] font-bold text-slate-500">{log.id}</div>
                      <div className="text-[10px] text-slate-400 tabular-nums">{log.timestamp}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {log.user}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-800">
                      {log.target}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Sao lưu & Phục hồi CSDL */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {importStatus && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              importStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              <span>{importStatus.message}</span>
              <button 
                onClick={() => setImportStatus(null)}
                className="text-xs font-bold px-2 py-0.5 hover:underline"
              >
                ✕
              </button>
            </div>
          )}

          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] text-slate-400">Động cơ lưu trữ</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">JSON Persistent DB</div>
              <div className="text-[10px] text-slate-500">Atomic read/write disk</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Vị trí tệp CSDL</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5 font-mono text-xs">/data/database.json</div>
              <div className="text-[10px] text-slate-500">Đồng bộ tự động</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Tổng dung lượng bản ghi</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{tasks.length} nhiệm vụ công vụ</div>
              <div className="text-[10px] text-slate-500">{accounts.length} tài khoản • {logs.length} kiểm toán</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Trạng thái đồng bộ</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Hoạt động bình thường</span>
              </div>
              <button
                onClick={() => setRawJsonModalOpen(true)}
                className="text-[10px] text-indigo-300 hover:text-indigo-200 underline mt-0.5 cursor-pointer"
              >
                Xem dữ liệu thô (JSON Inspector)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Xuất bản sao lưu CSDL (JSON)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tải về tệp sao lưu hoàn chỉnh bao gồm toàn bộ nhiệm vụ, tài khoản, phân quyền, đánh giá, thông số và nhật ký kiểm toán.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file Backup CSDL</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Phục hồi CSDL từ tệp sao lưu</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Nạp lại dữ liệu từ tệp sao lưu đã lưu trước đó. Cơ sở dữ liệu sẽ được phục hồi tức thì.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <label className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp sao lưu (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-rose-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-rose-900">Đặt lại về 18 nhiệm vụ & tài khoản chuẩn</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Khôi phục hệ thống về trạng thái 18 nhiệm vụ mẫu ban đầu và danh sách tài khoản phân quyền chuẩn năm 2026.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={handleResetDatabase}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Khôi phục CSDL ban đầu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Inspector Modal */}
      {rawJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl text-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Database JSON Inspector (/data/database.json)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const fullDb = databaseService.exportDatabase();
                    navigator.clipboard.writeText(fullDb);
                    setCopiedRaw(true);
                    setTimeout(() => setCopiedRaw(false), 2000);
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRaw ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
                </button>
                <button
                  onClick={() => setRawJsonModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto font-mono text-[11px] leading-relaxed bg-slate-950 text-emerald-300">
              <pre>{databaseService.exportDatabase()}</pre>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-400 flex items-center justify-between">
              <span>Đang đọc trực tiếp từ bộ nhớ dữ liệu tích hợp (/data/database.json)</span>
              <button
                onClick={() => setRawJsonModalOpen(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
