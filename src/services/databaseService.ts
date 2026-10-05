import { Task, TaskEvaluation, UserAccount, TaskFeedback, FIELDS, PersonalTask } from '../types';
import { INITIAL_TASKS } from '../data/mockData';

const STORAGE_KEY_TASKS = 'tra_giap_tasks_v4';
const STORAGE_KEY_LOGS = 'tra_giap_audit_logs_v4';
const STORAGE_KEY_SETTINGS = 'tra_giap_settings_v4';
const STORAGE_KEY_ACCOUNTS = 'tra_giap_accounts_v4';
const STORAGE_KEY_CURRENT_USER = 'tra_giap_current_user_v4';
const STORAGE_KEY_FIELDS = 'tra_giap_fields_v4';
const STORAGE_KEY_PERSONAL_TASKS_PREFIX = 'tra_giap_personal_tasks_';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
}

export interface SystemSettings {
  systemName: string;
  agencyName: string;
  copyright: string;
  warningDaysThreshold: number;
  currentTerm: string;
  maxTaskScore: number;
}

export interface AggregateReportResponse {
  metrics: {
    total: number;
    completed: number;
    beforeDeadline: number;
    onTime: number;
    late: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
    avgScore: string;
  };
  fieldBreakdown: Array<{
    field: string;
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
    avgScore: string;
  }>;
  tasksCount: number;
}

const DEFAULT_SETTINGS: SystemSettings = {
  systemName: 'TRÀ GIÁP TASK V4',
  agencyName: 'PHÒNG VĂN HÓA - XÃ HỘI XÃ TRÀ GIÁP',
  copyright: 'Nguyễn Văn Thạnh • HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ GIAO VIỆC PHÒNG VĂN HÓA - XÃ HỘI TRÀ GIÁP TASK V4',
  warningDaysThreshold: 3,
  currentTerm: 'Nhiệm kỳ 2026 - 2031',
  maxTaskScore: 10
};

// Specialist allowed functions:
// 1. Progress Tracking ('theo-doi')
// 2. Aggregate Statistics ('thong-ke-tong-hop')
// 3. Completed Tasks List ('nhiem-vu-hoan-thanh')
// 4. Progress Kanban ('kanban')
// 5. Statistics by Specialist ('thong-ke-can-bo')
// 6. Reports and Summaries ('bao-cao-chuyen-sau')
// 7. Work Calendar ('lich-cong-viec')
// 8. AI Assistant ('tro-ly-ai')
const SPECIALIST_PERMS: any[] = [
  'theo-doi',
  'thong-ke-tong-hop',
  'nhiem-vu-hoan-thanh',
  'kanban',
  'thong-ke-can-bo',
  'bao-cao-chuyen-sau',
  'lich-cong-viec',
  'tro-ly-ai'
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'ACC-001',
    name: 'Nguyễn Văn Thạnh',
    role: 'admin',
    position: 'Chuyên viên',
    department: 'PHÒNG VĂN HÓA - XÃ HỘI XÃ TRÀ GIÁP',
    field: 'Cải cách hành chính, Chuyển đổi số, Văn phòng',
    fields: ['Cải cách hành chính', 'Chuyển đổi số', 'Văn phòng'],
    email: 'thanhnv53@danang.gov.vn',
    phone: '0962770707',
    password: 'password123',
    permissions: [
      'tong-quan', 'giao-viec', 'theo-doi', 'kanban', 'danh-gia', 'lich-cong-viec',
      'nhiem-vu-hoan-thanh', 'thong-ke-tong-hop', 'thong-ke-don-vi', 'thong-ke-can-bo',
      'bao-cao-chuyen-sau', 'quan-tri-he-thong', 'tro-ly-ai'
    ],
    status: 'active',
    lastLogin: '2026-10-02 08:00:00'
  },
  {
    id: 'ACC-002',
    name: 'Phạm Sơn Triều',
    role: 'leader',
    position: 'Trưởng phòng',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Văn hóa - Thông tin, Y tế - Dân số, Chế độ chính sách - bảo trợ XH',
    fields: ['Văn hóa - Thông tin', 'Y tế - Dân số', 'Chế độ chính sách - bảo trợ XH'],
    email: 'trieups.tragiap@danang.gov.vn',
    phone: '0905.123.456',
    password: 'password123',
    permissions: [
      'tong-quan', 'giao-viec', 'theo-doi', 'kanban', 'danh-gia', 'lich-cong-viec',
      'nhiem-vu-hoan-thanh', 'thong-ke-tong-hop', 'thong-ke-don-vi', 'thong-ke-can-bo',
      'bao-cao-chuyen-sau', 'tro-ly-ai'
    ],
    status: 'active',
    lastLogin: '2026-10-01 16:30:00'
  },
  {
    id: 'ACC-003',
    name: 'Nguyễn Tấn Tình',
    role: 'leader',
    position: 'Phó Trưởng phòng',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Giáo dục - Đào tạo, Lao động - TB&XH, Gia đình & Trẻ em',
    fields: ['Giáo dục - Đào tạo', 'Lao động - TB&XH', 'Gia đình & Trẻ em'],
    email: 'tinhnt.tragiap@danang.gov.vn',
    phone: '0905.789.123',
    password: 'password123',
    permissions: [
      'tong-quan', 'giao-viec', 'theo-doi', 'kanban', 'danh-gia', 'lich-cong-viec',
      'nhiem-vu-hoan-thanh', 'thong-ke-tong-hop', 'thong-ke-don-vi', 'thong-ke-can-bo',
      'bao-cao-chuyen-sau', 'tro-ly-ai'
    ],
    status: 'active'
  },
  {
    id: 'ACC-004',
    name: 'Hồ Ngọc Thanh Sơn',
    role: 'specialist',
    position: 'Chuyên viên Tư pháp - Chuẩn tiếp cận pháp luật',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Tư pháp - Chuẩn tiếp cận pháp luật, Văn phòng',
    fields: ['Tư pháp - Chuẩn tiếp cận pháp luật', 'Văn phòng'],
    email: 'sonhnt.tragiap@danang.gov.vn',
    phone: '0982.345.678',
    password: 'password123',
    permissions: SPECIALIST_PERMS,
    status: 'active',
    lastLogin: '2026-10-01 14:15:00'
  },
  {
    id: 'ACC-005',
    name: 'Nguyễn Đăng Huân',
    role: 'specialist',
    position: 'Chuyên viên Văn hóa - Thể thao - Truyền thanh',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Văn hóa - Thông tin, Thể thao',
    fields: ['Văn hóa - Thông tin', 'Thể thao'],
    email: 'huannd.tragiap@danang.gov.vn',
    phone: '0973.111.222',
    password: 'password123',
    permissions: SPECIALIST_PERMS,
    status: 'active'
  },
  {
    id: 'ACC-006',
    name: 'Hồ Thị Biên',
    role: 'specialist',
    position: 'Chuyên viên Y tế - Vệ sinh ATTP',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Y tế, Chăm sóc sức khỏe nhân dân',
    fields: ['Y tế', 'Chăm sóc sức khỏe nhân dân'],
    email: 'bienht.tragiap@danang.gov.vn',
    phone: '0964.333.444',
    password: 'password123',
    permissions: SPECIALIST_PERMS,
    status: 'active'
  },
  {
    id: 'ACC-007',
    name: 'Trương Văn Thái',
    role: 'specialist',
    position: 'Chuyên viên Lao động - Việc làm - Người có công',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Chế độ chính sách - bảo trợ XH, Lao động - Việc làm - Người có công',
    fields: ['Chế độ chính sách - bảo trợ XH', 'Lao động - Việc làm - Người có công'],
    email: 'thaitv.tragiap@danang.gov.vn',
    phone: '0964.555.666',
    password: 'password123',
    permissions: SPECIALIST_PERMS,
    status: 'active'
  },
  {
    id: 'ACC-008',
    name: 'Nguyễn Thị Kim Luyện',
    role: 'specialist',
    position: 'Chuyên viên Chính sách xã hội - Giảm nghèo',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Chế độ chính sách - bảo trợ XH, Giảm nghèo',
    fields: ['Chế độ chính sách - bảo trợ XH', 'Giảm nghèo'],
    email: 'luyenntk.tragiap@danang.gov.vn',
    phone: '0964.777.888',
    password: 'password123',
    permissions: SPECIALIST_PERMS,
    status: 'active'
  },
  {
    id: 'ACC-009',
    name: 'Kiểm thử viên Hệ thống',
    role: 'tester',
    position: 'Kiểm thử viên Q&A',
    department: 'Tổ công nghệ thông tin',
    field: 'Khoa học công nghệ - CĐS',
    fields: ['Khoa học công nghệ - CĐS'],
    email: 'kiemthu.tragiap@danang.gov.vn',
    phone: '0935.789.012',
    password: 'password123',
    permissions: [
      'tong-quan', 'theo-doi', 'kanban', 'danh-gia', 'thong-ke-tong-hop',
      'bao-cao-chuyen-sau', 'tro-ly-ai'
    ],
    status: 'active'
  }
];

export const databaseService = {
  loadCurrentUser(): UserAccount | null {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read current user', e);
    }
    return null;
  },

  saveCurrentUser(user: UserAccount | null): void {
    try {
      if (user) {
        sessionStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch (e) {
      console.warn('Could not save current user', e);
    }
  },

  loadAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Update specialist permissions if outdated
          const updated = parsed.map((acc: UserAccount) => {
            if (acc.role === 'specialist') {
              return { ...acc, permissions: SPECIALIST_PERMS };
            }
            return acc;
          });
          return updated;
        }
      }
    } catch (e) {
      console.warn('Could not read accounts from storage', e);
    }
    this.saveAccounts(INITIAL_ACCOUNTS);
    return INITIAL_ACCOUNTS;
  },

  saveAccounts(accounts: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Could not save accounts', e);
    }
  },

  async fetchAccountsFromApi(): Promise<UserAccount[]> {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        if (data.accounts && Array.isArray(data.accounts)) {
          // Ensure specialist permissions adhere strictly to Requirement 1
          const normalized = data.accounts.map((acc: UserAccount) => {
            if (acc.role === 'specialist') {
              return { ...acc, permissions: SPECIALIST_PERMS };
            }
            return acc;
          });
          this.saveAccounts(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Could not fetch accounts from API, falling back to local', e);
    }
    return this.loadAccounts();
  },

  async createAccount(accountData: Omit<UserAccount, 'id'>): Promise<{ success: boolean; account?: UserAccount; error?: string }> {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const current = this.loadAccounts();
        const updated = [data.account, ...current];
        this.saveAccounts(updated);
        return { success: true, account: data.account };
      }
      return { success: false, error: data.error || 'Lỗi thêm tài khoản' };
    } catch (e: any) {
      const newAcc: UserAccount = {
        ...accountData,
        id: `ACC-${Date.now().toString().slice(-4)}`
      };
      const current = this.loadAccounts();
      const updated = [newAcc, ...current];
      this.saveAccounts(updated);
      this.addAuditLog('Quản trị hệ thống', 'TẠO_TÀI_KHOẢN', newAcc.name, `Tạo tài khoản: ${newAcc.name}`);
      return { success: true, account: newAcc };
    }
  },

  async updateAccount(accountId: string, updates: Partial<UserAccount>): Promise<{ success: boolean; account?: UserAccount; error?: string }> {
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(accountId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const current = this.loadAccounts();
        const updated = current.map(a => a.id === accountId ? { ...a, ...data.account } : a);
        this.saveAccounts(updated);

        const currentLoggedIn = this.loadCurrentUser();
        if (currentLoggedIn && currentLoggedIn.id === accountId) {
          this.saveCurrentUser({ ...currentLoggedIn, ...data.account });
        }
        return { success: true, account: data.account };
      }
      return { success: false, error: data.error || 'Lỗi cập nhật tài khoản' };
    } catch (e: any) {
      const current = this.loadAccounts();
      const updated = current.map(a => a.id === accountId ? { ...a, ...updates } : a);
      this.saveAccounts(updated);
      return { success: true };
    }
  },

  async deleteAccount(accountId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(accountId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const current = this.loadAccounts();
        this.saveAccounts(current.filter(a => a.id !== accountId));
        return true;
      }
    } catch (e) {
      console.warn('API delete account failed', e);
    }
    const current = this.loadAccounts();
    this.saveAccounts(current.filter(a => a.id !== accountId));
    return true;
  },

  async resetPassword(accountId: string, defaultPassword?: string): Promise<{ success: boolean; message: string }> {
    const defPass = defaultPassword || 'password123';
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(accountId)}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultPassword: defPass })
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message };
      }
    } catch (e) {}
    const current = this.loadAccounts();
    const updated = current.map(a => a.id === accountId ? { ...a, password: defPass } : a);
    this.saveAccounts(updated);
    this.addAuditLog('Quản trị hệ thống', 'ĐẶT_LẠI_MẬT_KHẨU', accountId, `Đặt lại mật khẩu mặc định: ${defPass}`);
    return { success: true, message: `Đã đặt lại mật khẩu về mặc định: ${defPass}` };
  },

  async changePassword(accountId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/accounts/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Lỗi đổi mật khẩu' };
      }
      return { success: true };
    } catch (e: any) {
      const accounts = this.loadAccounts();
      const acc = accounts.find(a => a.id === accountId);
      if (acc && acc.password && acc.password !== currentPassword) {
        return { success: false, error: 'Mật khẩu hiện tại không chính xác' };
      }
      const updated = accounts.map(a => a.id === accountId ? { ...a, password: newPassword } : a);
      this.saveAccounts(updated);
      return { success: true };
    }
  },

  async updateProfile(accountId: string, profile: { name: string; position: string; department: string; phone: string; email: string }): Promise<{ success: boolean; account?: UserAccount; error?: string }> {
    try {
      const res = await fetch('/api/accounts/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, ...profile })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const current = this.loadAccounts();
        const updated = current.map(a => a.id === accountId ? { ...a, ...data.account } : a);
        this.saveAccounts(updated);

        const currentLoggedIn = this.loadCurrentUser();
        if (currentLoggedIn && currentLoggedIn.id === accountId) {
          this.saveCurrentUser({ ...currentLoggedIn, ...data.account });
        }
        return { success: true, account: data.account };
      }
      return { success: false, error: data.error || 'Lỗi cập nhật hồ sơ' };
    } catch (e: any) {
      const current = this.loadAccounts();
      const updated = current.map(a => a.id === accountId ? { ...a, ...profile } : a);
      this.saveAccounts(updated);
      const acc = updated.find(a => a.id === accountId);
      if (acc) this.saveCurrentUser(acc);
      return { success: true, account: acc };
    }
  },

  async login(email: string, password: string, captcha: string, expectedCaptcha: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    if (!captcha || !expectedCaptcha || captcha.trim().toLowerCase() !== expectedCaptcha.trim().toLowerCase()) {
      return { success: false, error: 'Mã xác thực CAPTCHA không chính xác hoặc đã hết hạn' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captcha, expectedCaptcha })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        let user = data.user;
        if (user.role === 'specialist') {
          user = { ...user, permissions: SPECIALIST_PERMS };
        }
        this.saveCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, error: data.error || 'Đăng nhập không thành công' };
    } catch (e) {
      const accounts = this.loadAccounts();
      const account = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!account) {
        return { success: false, error: 'Tài khoản không tồn tại trên hệ thống TRÀ GIÁP TASK' };
      }
      if (account.password && account.password !== password) {
        return { success: false, error: 'Mật khẩu không chính xác' };
      }
      if (account.status === 'inactive') {
        return { success: false, error: 'Tài khoản hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên.' };
      }
      const { password: _, ...userSafe } = account;
      let finalUser = userSafe as UserAccount;
      if (finalUser.role === 'specialist') {
        finalUser = { ...finalUser, permissions: SPECIALIST_PERMS };
      }
      this.saveCurrentUser(finalUser);
      this.addAuditLog(finalUser.name, 'ĐĂNG_NHẬP_HỆ_THỐNG', 'Cổng xác thực', `Đăng nhập thành công (${finalUser.role}).`);
      return { success: true, user: finalUser };
    }
  },

  loadTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TASKS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read tasks from localStorage', e);
    }
    this.saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Could not save tasks to localStorage', e);
    }
  },

  loadFields(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_FIELDS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read fields from localStorage', e);
    }
    this.saveFields(FIELDS);
    return FIELDS;
  },

  saveFields(fields: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(fields));
    } catch (e) {
      console.warn('Could not save fields to localStorage', e);
    }
  },

  async fetchFieldsFromApi(): Promise<string[]> {
    try {
      const res = await fetch('/api/fields');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.fields)) {
          this.saveFields(data.fields);
          return data.fields;
        }
      }
    } catch (e) {
      console.warn('API fetch fields failed, falling back to local storage', e);
    }
    return this.loadFields();
  },

  async saveFieldsToApi(fields: string[]): Promise<string[]> {
    this.saveFields(fields);
    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.fields)) {
          return data.fields;
        }
      }
    } catch (e) {
      console.warn('API save fields failed', e);
    }
    return fields;
  },

  async fetchTasksFromApi(filters?: { search?: string; status?: string; field?: string; assignee?: string }): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.field && filters.field !== 'all') params.append('field', filters.field);
      if (filters?.assignee && filters.assignee !== 'all') params.append('assignee', filters.assignee);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tasks)) {
          this.saveTasks(data.tasks);
          return data.tasks;
        }
      }
    } catch (e) {
      console.warn('API fetch tasks failed, falling back to local database cache', e);
    }
    return this.loadTasks();
  },

  async createTask(newTask: Task): Promise<Task> {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.task) return data.task;
      }
    } catch (e) {
      console.warn('API create task failed, will save locally', e);
    }
    return newTask;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        return data.task;
      }
    } catch (e) {
      console.warn('API update task failed', e);
    }
    return null;
  },

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      console.warn('API delete task failed', e);
      return false;
    }
  },

  async evaluateTask(taskId: string, evaluation: TaskEvaluation): Promise<Task | null> {
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluation)
      });
      if (res.ok) {
        const data = await res.json();
        return data.task;
      }
    } catch (e) {
      console.warn('API evaluate task failed', e);
    }
    return null;
  },

  async urgeTask(taskId: string, urgeContent: string, sender?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/urge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urgeContent, sender })
      });
      return res.ok;
    } catch (e) {
      console.warn('API urge task failed', e);
      return false;
    }
  },

  async submitTaskFeedback(taskId: string, feedbackData: Partial<TaskFeedback>): Promise<{ success: boolean; task?: Task; feedback?: TaskFeedback; error?: string }> {
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const currentTasks = this.loadTasks();
        const updated = currentTasks.map(t => t.id === taskId ? data.task : t);
        this.saveTasks(updated);
        return { success: true, task: data.task, feedback: data.feedback };
      }
      return { success: false, error: data.error || 'Lỗi gửi phản hồi' };
    } catch (e: any) {
      console.warn('API submit task feedback failed', e);
      return { success: false, error: e.message || 'Lỗi kết nối' };
    }
  },

  loadAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_LOGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read audit logs', e);
    }
    return [
      {
        id: 'LOG-001',
        timestamp: '2026-09-30 08:30:00',
        user: 'Phạm Sơn Triều – Trưởng phòng',
        action: 'KHỞI_TẠO_KỲ_ĐIỀU_HÀNH',
        target: 'Hệ thống TRÀ GIÁP TASK V4',
        details: 'Đồng bộ 18 nhiệm vụ chuyên môn theo nguyên tắc 6 Rõ.'
      },
      {
        id: 'LOG-002',
        timestamp: '2026-09-30 09:15:00',
        user: 'Phạm Sơn Triều – Trưởng phòng',
        action: 'ĐÔN_ĐỐC_TIẾN_ĐỘ',
        target: 'NV-2026-001',
        details: 'Phát lệnh đôn đốc khẩn chuyên viên Hồ Ngọc Thanh Sơn hoàn thành hồ sơ tiếp cận pháp luật.'
      },
      {
        id: 'LOG-003',
        timestamp: '2026-09-30 10:20:00',
        user: 'Phạm Sơn Triều – Trưởng phòng',
        action: 'ĐÁNH_GIÁ_NGHIỆM_THU',
        target: 'NV-2026-011',
        details: 'Đánh giá nghiệm thu nhiệm vụ Lễ khai giảng năm học mới: Xuất sắc 10/10 điểm.'
      },
      {
        id: 'LOG-004',
        timestamp: '2026-10-01 14:00:00',
        user: 'Nguyễn Văn Thạnh – Chuyên viên',
        action: 'CẬP_NHẬT_TIẾN_ĐỘ',
        target: 'NV-2026-007',
        details: 'Cập nhật tiến độ Tổ công nghệ số cộng đồng VNeID lên 35%.'
      }
    ];
  },

  async fetchAuditLogsFromApi(action?: string, search?: string): Promise<AuditLog[]> {
    try {
      const params = new URLSearchParams();
      if (action && action !== 'all') params.append('action', action);
      if (search) params.append('search', search);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const logs = await res.json();
        if (Array.isArray(logs)) {
          localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
          return logs;
        }
      }
    } catch (e) {
      console.warn('API fetch audit logs failed, falling back to local', e);
    }
    return this.loadAuditLogs();
  },

  addAuditLog(user: string, action: string, target: string, details: string): AuditLog {
    const logs = this.loadAuditLogs();
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user,
      action,
      target,
      details
    };
    const updated = [newLog, ...logs];
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save audit log', e);
    }

    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(() => {});

    return newLog;
  },

  loadSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Could not read settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  async fetchSettingsFromApi(): Promise<SystemSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const settings = await res.json();
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
        return settings;
      }
    } catch (e) {
      console.warn('Could not fetch settings from API', e);
    }
    return this.loadSettings();
  },

  async saveSettings(settings: SystemSettings): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      this.addAuditLog('Quản trị viên', 'CẬP_NHẬT_CẤU_HÌNH', 'Thông số hệ thống', 'Thay đổi cấu hình hệ thống.');

      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  },

  async fetchAggregateReport(params?: { period?: string; leader?: string; field?: string; assignee?: string }): Promise<AggregateReportResponse | null> {
    try {
      const query = new URLSearchParams();
      if (params?.leader && params.leader !== 'all') query.append('leader', params.leader);
      if (params?.field && params.field !== 'all') query.append('field', params.field);
      if (params?.assignee && params.assignee !== 'all') query.append('assignee', params.assignee);

      const res = await fetch(`/api/reports/aggregate?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch aggregate report from API', e);
    }
    return null;
  },

  async checkDbHealth(): Promise<{ status: string; taskCount: number; accountCount?: number; staffCount: number; logCount: number } | null> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return {
          status: data.database?.status || 'active',
          taskCount: data.database?.taskCount || 0,
          accountCount: data.database?.accountCount || 0,
          staffCount: data.database?.staffCount || 0,
          logCount: data.database?.logCount || 0
        };
      }
    } catch (e) {
      console.warn('Could not check DB health', e);
    }
    return null;
  },

  exportDatabase(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '4.0.0',
      systemSettings: this.loadSettings(),
      accounts: this.loadAccounts(),
      tasks: this.loadTasks(),
      auditLogs: this.loadAuditLogs()
    };
    return JSON.stringify(backup, null, 2);
  },

  async restoreDatabase(jsonString: string): Promise<{ success: boolean; message: string; taskCount: number }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.tasks)) {
        return { success: false, message: 'Tệp sao lưu không đúng định dạng (thiếu mảng nhiệm vụ tasks)', taskCount: 0 };
      }

      this.saveTasks(parsed.tasks);
      if (parsed.accounts && Array.isArray(parsed.accounts)) {
        this.saveAccounts(parsed.accounts);
      }
      if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
        localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(parsed.auditLogs));
      }
      if (parsed.systemSettings) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(parsed.systemSettings));
      }

      try {
        await fetch('/api/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonString
        });
      } catch (e) {}

      this.addAuditLog('Quản trị viên', 'PHỤC_HỒI_CSDL', 'Cơ sở dữ liệu', `Phục hồi thành công ${parsed.tasks.length} nhiệm vụ từ tệp sao lưu.`);
      return { success: true, message: `Phục hồi thành công ${parsed.tasks.length} nhiệm vụ vào cơ sở dữ liệu`, taskCount: parsed.tasks.length };
    } catch (e: any) {
      return { success: false, message: `Lỗi đọc tệp sao lưu: ${e.message}`, taskCount: 0 };
    }
  },

  async resetToSeed(): Promise<Task[]> {
    this.saveTasks(INITIAL_TASKS);
    this.saveAccounts(INITIAL_ACCOUNTS);
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (e) {}
    this.addAuditLog('Quản trị viên', 'KHỞI_TẠO_LẠI', 'Cơ sở dữ liệu', 'Đã đặt lại toàn bộ cơ sở dữ liệu về 18 nhiệm vụ và danh sách tài khoản chuẩn ban đầu.');
    return INITIAL_TASKS;
  },

  // ========================================================
  // REQUIREMENT 4: PERSONAL TASKS (Nhiệm vụ cá nhân riêng tư)
  // ========================================================
  loadPersonalTasks(userId: string): PersonalTask[] {
    if (!userId) return [];
    try {
      const key = `${STORAGE_KEY_PERSONAL_TASKS_PREFIX}${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading personal tasks', e);
    }
    return [];
  },

  savePersonalTasks(userId: string, tasks: PersonalTask[]): void {
    if (!userId) return;
    try {
      const key = `${STORAGE_KEY_PERSONAL_TASKS_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving personal tasks', e);
    }
  },

  createPersonalTask(userId: string, taskData: Omit<PersonalTask, 'id' | 'createdAt'>): PersonalTask {
    const current = this.loadPersonalTasks(userId);
    const newNum = current.length + 1;
    const padded = newNum < 10 ? `00${newNum}` : newNum < 100 ? `0${newNum}` : `${newNum}`;
    const newTask: PersonalTask = {
      ...taskData,
      id: `CN-${padded}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...current];
    this.savePersonalTasks(userId, updated);
    return newTask;
  },

  updatePersonalTask(userId: string, taskId: string, updates: Partial<PersonalTask>): PersonalTask | null {
    const current = this.loadPersonalTasks(userId);
    const idx = current.findIndex(t => t.id === taskId);
    if (idx === -1) return null;
    current[idx] = { ...current[idx], ...updates };
    this.savePersonalTasks(userId, current);
    return current[idx];
  },

  deletePersonalTask(userId: string, taskId: string): boolean {
    const current = this.loadPersonalTasks(userId);
    const updated = current.filter(t => t.id !== taskId);
    this.savePersonalTasks(userId, updated);
    return true;
  },

  markPersonalTaskSynced(userId: string, taskId: string, officialTaskId: string): void {
    const current = this.loadPersonalTasks(userId);
    const idx = current.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      current[idx].isSyncedToOfficial = true;
      current[idx].syncedOfficialTaskId = officialTaskId;
      current[idx].syncedAt = new Date().toISOString();
      this.savePersonalTasks(userId, current);
    }
  }
};
