import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_TASKS } from './src/data/mockData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const DB_FILE = path.resolve(__dirname, 'data/database.json');

// Specialist allowed functions as per Requirement 1:
// 1. Progress Tracking ('theo-doi')
// 2. Aggregate Statistics ('thong-ke-tong-hop')
// 3. Completed Tasks List ('nhiem-vu-hoan-thanh')
// 4. Progress Kanban ('kanban')
// 5. Statistics by Specialist ('thong-ke-can-bo')
// 6. Reports and Summaries ('bao-cao-chuyen-sau')
// 7. Work Calendar ('lich-cong-viec')
// 8. AI Assistant ('tro-ly-ai')
const SPECIALIST_PERMISSIONS = [
  'theo-doi',
  'thong-ke-tong-hop',
  'nhiem-vu-hoan-thanh',
  'kanban',
  'thong-ke-can-bo',
  'bao-cao-chuyen-sau',
  'lich-cong-viec',
  'tro-ly-ai'
];

// Default Accounts
const DEFAULT_ACCOUNTS = [
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
    field: 'Văn hóa - Thông tin, Y tế, Chế độ chính sách - bảo trợ XH',
    fields: ['Văn hóa - Thông tin', 'Y tế', 'Chế độ chính sách - bảo trợ XH'],
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
    field: 'Giáo dục Đào tạo, Dân tộc - Tôn giáo',
    fields: ['Giáo dục Đào tạo', 'Dân tộc - Tôn giáo'],
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
    permissions: SPECIALIST_PERMISSIONS,
    status: 'active',
    lastLogin: '2026-10-01 14:15:00'
  },
  {
    id: 'ACC-005',
    name: 'Nguyễn Đăng Huân',
    role: 'specialist',
    position: 'Chuyên viên Văn hóa - Thể thao - Truyền thanh',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Văn hóa - Thông tin',
    fields: ['Văn hóa - Thông tin'],
    email: 'huannd.tragiap@danang.gov.vn',
    phone: '0973.111.222',
    password: 'password123',
    permissions: SPECIALIST_PERMISSIONS,
    status: 'active'
  },
  {
    id: 'ACC-006',
    name: 'Hồ Thị Biên',
    role: 'specialist',
    position: 'Chuyên viên Y tế - Vệ sinh ATTP',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Y tế',
    fields: ['Y tế'],
    email: 'bienht.tragiap@danang.gov.vn',
    phone: '0964.333.444',
    password: 'password123',
    permissions: SPECIALIST_PERMISSIONS,
    status: 'active'
  },
  {
    id: 'ACC-007',
    name: 'Trương Văn Thái',
    role: 'specialist',
    position: 'Chuyên viên Lao động - Việc làm - Người có công',
    department: 'Phòng Văn hóa - Xã hội',
    field: 'Chế độ chính sách - bảo trợ XH, Dân tộc - Tôn giáo',
    fields: ['Chế độ chính sách - bảo trợ XH', 'Dân tộc - Tôn giáo'],
    email: 'thaitv.tragiap@danang.gov.vn',
    phone: '0964.555.666',
    password: 'password123',
    permissions: SPECIALIST_PERMISSIONS,
    status: 'active'
  },
  {
    id: 'ACC-008',
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

// Default DB Structure
const DEFAULT_DB = {
  systemSettings: {
    systemName: 'TRÀ GIÁP TASK V4',
    agencyName: 'PHÒNG VĂN HÓA - XÃ HỘI XÃ TRÀ GIÁP',
    copyright: 'Nguyễn Văn Thạnh • HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ GIAO VIỆC PHÒNG VĂN HÓA - XÃ HỘI TRÀ GIÁP TASK V4',
    warningDaysThreshold: 3,
    currentTerm: 'Nhiệm kỳ 2026 - 2031',
    maxTaskScore: 10
  },
  accounts: DEFAULT_ACCOUNTS,
  leaders: [
    { id: 'LD-01', name: 'Phạm Sơn Triều', title: 'Trưởng phòng', role: 'Lãnh đạo phụ trách chung', status: 'active' },
    { id: 'LD-02', name: 'Nguyễn Tấn Tình', title: 'Phó Trưởng phòng', role: 'Lãnh đạo phụ trách khối', status: 'active' }
  ],
  staffs: [
    { id: 'CB-01', name: 'Nguyễn Đăng Huân', role: 'Chuyên viên', specialty: 'Văn hóa - Thể thao - Truyền thanh', status: 'active' },
    { id: 'CB-02', name: 'Nguyễn Thị Kim Luyện', role: 'Chuyên viên', specialty: 'Chính sách xã hội - Giảm nghèo', status: 'active' },
    { id: 'CB-03', name: 'Trương Văn Thái', role: 'Chuyên viên', specialty: 'Lao động - Việc làm - Người có công', status: 'active' },
    { id: 'CB-04', name: 'Hồ Ngọc Thanh Sơn', role: 'Chuyên viên', specialty: 'Tư pháp - Chuẩn tiếp cận pháp luật', status: 'active' },
    { id: 'CB-05', name: 'Nguyễn Minh Luyến', role: 'Chuyên viên', specialty: 'Văn phòng - Thống kê tổng hợp', status: 'active' },
    { id: 'CB-06', name: 'Hồ Thị Biên', role: 'Chuyên viên', specialty: 'Y tế - Chăm sóc sức khỏe nhân dân', status: 'active' },
    { id: 'CB-07', name: 'Nguyễn Văn Thạnh', role: 'Chuyên viên', specialty: 'Cải cách hành chính - Chuyển đổi số', status: 'active' }
  ],
  fields: [
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
  ],
  auditLogs: [
    {
      id: 'LOG-001',
      timestamp: '2026-09-30 08:30:15',
      user: 'Phạm Sơn Triều – Trưởng phòng',
      action: 'KHỞI_TẠO_KỲ_ĐIỀU_HÀNH',
      target: 'Hệ thống TRÀ GIÁP TASK V4',
      details: 'Đồng bộ 18 nhiệm vụ trọng tâm quý III - IV/2026 theo mô hình 6 Rõ.'
    },
    {
      id: 'LOG-002',
      timestamp: '2026-09-30 09:15:20',
      user: 'Phạm Sơn Triều – Trưởng phòng',
      action: 'ĐÔN_ĐỐC_KHẨN',
      target: 'NV-2026-001',
      details: 'Phát phiếu đôn đốc cán bộ Hồ Ngọc Thanh Sơn hoàn thành hồ sơ tiếp cận pháp luật.'
    },
    {
      id: 'LOG-003',
      timestamp: '2026-09-30 10:00:00',
      user: 'Phạm Sơn Triều – Trưởng phòng',
      action: 'ĐÁNH_GIÁ_NGHIỆM_THU',
      target: 'NV-2026-011',
      details: 'Nghiệm thu nhiệm vụ Lễ khai giảng năm học mới: Đạt xuất sắc 10/10 điểm.'
    },
    {
      id: 'LOG-004',
      timestamp: '2026-10-01 14:20:00',
      user: 'Nguyễn Văn Thạnh – Chuyên viên',
      action: 'CẬP_NHẬT_TIẾN_ĐỘ',
      target: 'NV-2026-007',
      details: 'Cập nhật tiến độ Tổ công nghệ số cộng đồng VNeID lên 35%.'
    }
  ],
  tasks: INITIAL_TASKS
};

// Helper to read DB
function readDb() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    let modified = false;
    if (!parsed.tasks || parsed.tasks.length === 0) {
      parsed.tasks = INITIAL_TASKS;
      modified = true;
    }
    if (!parsed.accounts || parsed.accounts.length === 0) {
      parsed.accounts = DEFAULT_ACCOUNTS;
      modified = true;
    } else {
      // Ensure specialist permissions are in sync with Requirement 1
      parsed.accounts = parsed.accounts.map((acc: any) => {
        if (acc.role === 'specialist') {
          return { ...acc, permissions: SPECIALIST_PERMISSIONS };
        }
        return acc;
      });
      modified = true;
    }
    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return DEFAULT_DB;
  }
}

// Helper to write DB
function writeDb(data: any) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// Helper to append audit log
function addAuditLog(user: string, action: string, target: string, details: string) {
  const db = readDb();
  const newLog = {
    id: `LOG-${Date.now().toString().slice(-5)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    user,
    action,
    target,
    details
  };
  db.auditLogs = [newLog, ...(db.auditLogs || [])];
  writeDb(db);
  return newLog;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check & DB Status
app.get('/api/health', (req, res) => {
  const db = readDb();
  res.json({
    status: 'ok',
    system: 'TRÀ GIÁP TASK V4',
    agency: 'PHÒNG VĂN HÓA - XÃ HỘI XÃ TRÀ GIÁP',
    time: new Date().toISOString(),
    database: {
      status: 'active',
      location: DB_FILE,
      taskCount: (db.tasks || []).length,
      accountCount: (db.accounts || []).length,
      staffCount: (db.staffs || []).length,
      logCount: (db.auditLogs || []).length
    }
  });
});

// 2. Full Database Export
app.get('/api/database', (req, res) => {
  const db = readDb();
  res.json(db);
});

// 3. Backup Database File (Download JSON)
app.get('/api/backup', (req, res) => {
  const db = readDb();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=Tra_Giap_Task_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  res.send(JSON.stringify(db, null, 2));
});

// 4. Restore Database from JSON
app.post('/api/restore', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.tasks)) {
      return res.status(400).json({ success: false, error: 'Dữ liệu sao lưu không đúng định dạng (thiếu mảng nhiệm vụ tasks)' });
    }
    writeDb(payload);
    addAuditLog('Quản trị viên', 'PHỤC_HỒI_CSDL', 'Cơ sở dữ liệu', `Phục hồi toàn diện dữ liệu hệ thống (${payload.tasks.length} nhiệm vụ).`);
    res.json({ success: true, message: `Phục hồi cơ sở dữ liệu thành công (${payload.tasks.length} nhiệm vụ)` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Reset Database to Seed 18 Tasks & Default Accounts
app.post('/api/reset', (req, res) => {
  try {
    const db = readDb();
    db.tasks = INITIAL_TASKS;
    db.accounts = DEFAULT_ACCOUNTS;
    writeDb(db);
    addAuditLog('Quản trị viên', 'KHỞI_TẠO_LẠI', 'Cơ sở dữ liệu', 'Đã đặt lại toàn bộ cơ sở dữ liệu về 18 nhiệm vụ và danh sách tài khoản chuẩn.');
    res.json({ success: true, message: 'Đã đặt lại 18 nhiệm vụ tiêu chuẩn thành công', tasks: INITIAL_TASKS });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. ACCOUNTS & AUTHENTICATION APIs
// ==========================================

// GET /api/accounts
app.get('/api/accounts', (req, res) => {
  const db = readDb();
  res.json({ success: true, accounts: db.accounts || DEFAULT_ACCOUNTS });
});

// POST /api/accounts (Admin creates account)
app.post('/api/accounts', (req, res) => {
  const db = readDb();
  const { name, role, position, department, email, phone, password, permissions, fields, field } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, error: 'Vui lòng cung cấp đầy đủ: Họ tên, Email và Nhóm quyền' });
  }

  // Check email uniqueness
  const existing = (db.accounts || []).find((a: any) => a.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, error: 'Email này đã tồn tại trong hệ thống' });
  }

  const rolePerms = role === 'specialist' ? SPECIALIST_PERMISSIONS : (Array.isArray(permissions) ? permissions : ['theo-doi', 'kanban']);

  const selectedFields = Array.isArray(fields) && fields.length > 0 
    ? fields 
    : (field ? [field] : ['Văn hóa - Thông tin']);

  const newAccount = {
    id: `ACC-${Date.now().toString().slice(-4)}`,
    name,
    role,
    position: position || 'Chuyên viên',
    department: department || 'Phòng Văn hóa - Xã hội',
    fields: selectedFields,
    field: selectedFields.join(', '),
    email: email.trim().toLowerCase(),
    phone: phone || '',
    password: password || 'password123',
    permissions: rolePerms,
    status: 'active',
    lastLogin: undefined
  };

  db.accounts = [newAccount, ...(db.accounts || [])];
  writeDb(db);

  addAuditLog(
    'Quản trị hệ thống',
    'TẠO_TÀI_KHOẢN',
    newAccount.name,
    `Tạo tài khoản mới cho cán bộ: ${newAccount.name} (${newAccount.email}) - Quyền: ${newAccount.role} - Lĩnh vực: ${newAccount.field}.`
  );

  res.status(201).json({ success: true, account: newAccount });
});

// PUT /api/accounts/:id (Admin edits account)
app.put('/api/accounts/:id', (req, res) => {
  const db = readDb();
  const accId = req.params.id;
  const idx = (db.accounts || []).findIndex((a: any) => a.id === accId);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản' });
  }

  const old = db.accounts[idx];
  const updates = req.body;

  // If role is specialist, enforce specialist permissions
  if (updates.role === 'specialist' || (old.role === 'specialist' && !updates.role)) {
    updates.permissions = SPECIALIST_PERMISSIONS;
  }

  if (updates.fields && Array.isArray(updates.fields)) {
    updates.field = updates.fields.join(', ');
  } else if (updates.field && !updates.fields) {
    updates.fields = [updates.field];
  }

  db.accounts[idx] = {
    ...old,
    ...updates,
    id: old.id // immutable id
  };
  writeDb(db);

  addAuditLog(
    'Quản trị hệ thống',
    'CẬP_NHẬT_TÀI_KHOẢN',
    db.accounts[idx].name,
    `Chỉnh sửa thông tin & phân quyền tài khoản: ${db.accounts[idx].name} (${db.accounts[idx].email}).`
  );

  res.json({ success: true, account: db.accounts[idx] });
});

// DELETE /api/accounts/:id
app.delete('/api/accounts/:id', (req, res) => {
  const db = readDb();
  const accId = req.params.id;
  const acc = (db.accounts || []).find((a: any) => a.id === accId);

  if (!acc) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản cần xóa' });
  }

  db.accounts = (db.accounts || []).filter((a: any) => a.id !== accId);
  writeDb(db);

  addAuditLog(
    'Quản trị hệ thống',
    'XÓA_TÀI_KHOẢN',
    acc.name,
    `Đã xóa tài khoản cán bộ ${acc.name} (${acc.email}).`
  );

  res.json({ success: true, message: `Đã xóa tài khoản ${acc.name}` });
});

// POST /api/accounts/:id/reset-password
app.post('/api/accounts/:id/reset-password', (req, res) => {
  const db = readDb();
  const accId = req.params.id;
  const idx = (db.accounts || []).findIndex((a: any) => a.id === accId);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản' });
  }

  const defaultPass = req.body.defaultPassword || 'password123';
  db.accounts[idx].password = defaultPass;
  writeDb(db);

  addAuditLog(
    'Quản trị hệ thống',
    'ĐẶT_LẠI_MẬT_KHẨU',
    db.accounts[idx].name,
    `Đặt lại mật khẩu mặc định cho cán bộ ${db.accounts[idx].name}.`
  );

  res.json({ success: true, message: `Đã đặt lại mật khẩu cho tài khoản ${db.accounts[idx].name} về: ${defaultPass}` });
});

// POST /api/accounts/change-password (Self password change)
app.post('/api/accounts/change-password', (req, res) => {
  const db = readDb();
  const { accountId, currentPassword, newPassword } = req.body;

  const idx = (db.accounts || []).findIndex((a: any) => a.id === accountId);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản' });
  }

  const acc = db.accounts[idx];
  if (acc.password && acc.password !== currentPassword) {
    return res.status(400).json({ success: false, error: 'Mật khẩu hiện tại không chính xác' });
  }

  db.accounts[idx].password = newPassword;
  writeDb(db);

  addAuditLog(
    acc.name,
    'ĐỔI_MẬT_KHẨU',
    acc.name,
    'Người dùng đã đổi mật khẩu cá nhân thành công.'
  );

  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
});

// POST /api/accounts/update-profile (Self profile update)
app.post('/api/accounts/update-profile', (req, res) => {
  const db = readDb();
  const { accountId, name, position, department, phone, email } = req.body;

  const idx = (db.accounts || []).findIndex((a: any) => a.id === accountId);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản' });
  }

  db.accounts[idx] = {
    ...db.accounts[idx],
    name: name || db.accounts[idx].name,
    position: position || db.accounts[idx].position,
    department: department || db.accounts[idx].department,
    phone: phone !== undefined ? phone : db.accounts[idx].phone,
    email: email || db.accounts[idx].email
  };
  writeDb(db);

  addAuditLog(
    db.accounts[idx].name,
    'CẬP_NHẬT_HỒ_SƠ',
    db.accounts[idx].name,
    'Cập nhật thông tin hồ sơ cá nhân.'
  );

  res.json({ success: true, account: db.accounts[idx] });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const db = readDb();
  const { email, password, captcha, expectedCaptcha } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập Email và Mật khẩu' });
  }

  if (!captcha || !expectedCaptcha || captcha.trim().toLowerCase() !== expectedCaptcha.trim().toLowerCase()) {
    return res.status(400).json({ success: false, error: 'Mã xác thực CAPTCHA không chính xác hoặc đã hết hạn' });
  }

  const account = (db.accounts || []).find((a: any) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account) {
    return res.status(401).json({ success: false, error: 'Tài khoản không tồn tại trên hệ thống TRÀ GIÁP TASK' });
  }

  if (account.password && account.password !== password) {
    return res.status(401).json({ success: false, error: 'Mật khẩu không chính xác' });
  }

  if (account.status === 'inactive') {
    return res.status(403).json({ success: false, error: 'Tài khoản hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên.' });
  }

  // Update last login
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  account.lastLogin = now;
  writeDb(db);

  addAuditLog(
    account.name,
    'ĐĂNG_NHẬP_HỆ_THỐNG',
    'Cổng xác thực',
    `Đăng nhập thành công từ giao diện trực tuyến (${account.role}).`
  );

  const { password: _, ...userSafe } = account;
  if (userSafe.role === 'specialist') {
    userSafe.permissions = SPECIALIST_PERMISSIONS;
  }
  res.json({ success: true, user: userSafe });
});

// GET /api/fields
app.get('/api/fields', (req, res) => {
  const db = readDb();
  res.json({ success: true, fields: db.fields || [] });
});

// POST /api/fields
app.post('/api/fields', (req, res) => {
  const db = readDb();
  const { fields } = req.body;
  if (!Array.isArray(fields)) {
    return res.status(400).json({ success: false, error: 'Dữ liệu danh sách lĩnh vực không hợp lệ' });
  }
  db.fields = fields;
  writeDb(db);
  addAuditLog(
    'Quản trị hệ thống',
    'CẬP_NHẬT_LĨNH_VỰC',
    'Hệ thống',
    `Cập nhật danh sách ${fields.length} lĩnh vực phụ trách.`
  );
  res.json({ success: true, fields: db.fields });
});

// ==========================================
// 7. TASKS CRUD
// ==========================================

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
  const db = readDb();
  let tasks = db.tasks || [];
  const { search, status, field, assignee, assigner, timingStatus } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    tasks = tasks.filter((t: any) =>
      t.id?.toLowerCase().includes(q) ||
      t.title?.toLowerCase().includes(q) ||
      t.content?.toLowerCase().includes(q) ||
      t.assignee?.toLowerCase().includes(q) ||
      t.assigner?.toLowerCase().includes(q) ||
      t.field?.toLowerCase().includes(q)
    );
  }

  if (status && typeof status === 'string' && status !== 'all') {
    if (status === 'overdue') {
      tasks = tasks.filter((t: any) => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue'));
    } else {
      tasks = tasks.filter((t: any) => t.status === status);
    }
  }

  if (field && typeof field === 'string' && field !== 'all') {
    tasks = tasks.filter((t: any) => t.field === field);
  }

  if (assignee && typeof assignee === 'string' && assignee !== 'all') {
    tasks = tasks.filter((t: any) => t.assignee?.includes(assignee));
  }

  if (assigner && typeof assigner === 'string' && assigner !== 'all') {
    tasks = tasks.filter((t: any) => t.assigner?.includes(assigner));
  }

  if (timingStatus && typeof timingStatus === 'string' && timingStatus !== 'all') {
    tasks = tasks.filter((t: any) => t.timingStatus === timingStatus);
  }

  res.json({ success: true, count: tasks.length, tasks });
});

// GET /api/tasks/:id
app.get('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const task = (db.tasks || []).find((t: any) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy nhiệm vụ' });
  }
  res.json({ success: true, task });
});

// POST /api/tasks (Create new task)
app.post('/api/tasks', (req, res) => {
  const db = readDb();
  const { title, content, assigner, assignee, department, field, assignedDate, dueDate, priority, coDepartment, coordinatingSpecialist, attachments, notes } = req.body;

  if (!title || !dueDate || !assignee) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc (Tiêu đề, Hạn xong, Cán bộ tham mưu)' });
  }

  const nextNum = (db.tasks || []).length + 1;
  const taskId = req.body.id || `NV-2026-${nextNum < 100 ? (nextNum < 10 ? '00' + nextNum : '0' + nextNum) : nextNum}`;

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = dueDate < today;

  const newTask = {
    id: taskId,
    title,
    content: content || title,
    assigner: assigner || 'Phạm Sơn Triều – Trưởng phòng',
    assignee,
    department: department || 'Phạm Sơn Triều',
    field: field || 'Văn phòng',
    assignedDate: assignedDate || today,
    dueDate,
    progress: 0,
    status: isOverdue ? 'overdue' : 'in_progress',
    timingStatus: isOverdue ? 'overdue' : 'normal',
    priority: priority || 'normal',
    coordinatingSpecialist: coordinatingSpecialist || undefined,
    coDepartment: coDepartment || '',
    attachments: attachments || [],
    notes: notes || ''
  };

  db.tasks = [newTask, ...(db.tasks || [])];
  writeDb(db);

  addAuditLog(
    newTask.assigner.split('–')[0].trim(),
    'GIAO_VIỆC_MỚI',
    newTask.id,
    `Giao nhiệm vụ: "${newTask.title}" cho cán bộ ${newTask.assignee}. Hạn hoàn thành: ${newTask.dueDate}. Đính kèm: ${(newTask.attachments || []).length} tệp.`
  );

  res.status(201).json({ success: true, task: newTask });
});

// PUT /api/tasks/:id
app.put('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const taskId = req.params.id;
  const idx = (db.tasks || []).findIndex((t: any) => t.id === taskId);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy nhiệm vụ cần cập nhật' });
  }

  const oldTask = db.tasks[idx];
  const updates = req.body;

  let isDone = updates.progress !== undefined ? updates.progress >= 100 : oldTask.status === 'completed';
  let newStatus = updates.status || (isDone ? 'completed' : oldTask.status);
  let newTiming = oldTask.timingStatus;

  const currentDueDate = updates.dueDate || oldTask.dueDate;
  const today = new Date().toISOString().slice(0, 10);
  if (isDone) {
    newTiming = currentDueDate < today ? 'late' : 'before_deadline';
  } else {
    if (currentDueDate < today) {
      newTiming = 'overdue';
      newStatus = 'overdue';
    }
  }

  const updatedTask = {
    ...oldTask,
    ...updates,
    status: newStatus,
    timingStatus: newTiming,
    completedDate: isDone ? (updates.completedDate || oldTask.completedDate || today) : undefined
  };

  db.tasks[idx] = updatedTask;
  writeDb(db);

  const isContentEdited = updates.title || updates.content || updates.assignee || updates.dueDate;
  addAuditLog(
    updates.updatedBy || 'Hệ thống điều hành',
    isContentEdited ? 'ĐIỀU_CHỈNH_NHIỆM_VỤ' : 'CẬP_NHẬT_TIẾN_ĐỘ',
    taskId,
    isContentEdited 
      ? `Điều chỉnh thông tin nhiệm vụ "${updatedTask.title}". Cán bộ: ${updatedTask.assignee}, Hạn: ${updatedTask.dueDate}.`
      : `Cập nhật tiến độ nhiệm vụ "${updatedTask.title}": ${updatedTask.progress}%, Trạng thái: ${updatedTask.status}.`
  );

  res.json({ success: true, task: updatedTask });
});

// POST /api/tasks/:id/feedback
app.post('/api/tasks/:id/feedback', (req, res) => {
  const db = readDb();
  const taskId = req.params.id;
  const idx = (db.tasks || []).findIndex((t: any) => t.id === taskId);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy nhiệm vụ' });
  }

  const { sender, senderRole, type, title, content, progress, attachments, proposedDueDate, proposedCollaborators } = req.body;
  if (!content || !sender) {
    return res.status(400).json({ success: false, error: 'Vui lòng nhập họ tên người gửi và nội dung phản hồi' });
  }

  const newFeedback = {
    id: `FB-${Date.now().toString().slice(-6)}`,
    sender,
    senderRole: senderRole || 'Chuyên viên',
    type: type || 'general',
    title: title || '',
    content,
    progress: progress !== undefined ? Number(progress) : undefined,
    attachments: attachments || [],
    proposedDueDate: proposedDueDate || undefined,
    proposedCollaborators: proposedCollaborators || [],
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: 'pending'
  };

  const oldTask = db.tasks[idx];
  let updatedTask = { ...oldTask };
  updatedTask.feedbackList = [newFeedback, ...(oldTask.feedbackList || [])];

  if (progress !== undefined) {
    const pNum = Number(progress);
    const isDone = pNum >= 100;
    updatedTask.progress = pNum;
    if (isDone) {
      updatedTask.status = 'completed';
      const today = new Date().toISOString().slice(0, 10);
      updatedTask.timingStatus = updatedTask.dueDate < today ? 'late' : 'before_deadline';
      updatedTask.completedDate = updatedTask.completedDate || today;
    }
  }

  if (attachments && Array.isArray(attachments) && attachments.length > 0) {
    updatedTask.attachments = [...(updatedTask.attachments || []), ...attachments];
  }

  if (proposedCollaborators && proposedCollaborators.length > 0) {
    const collabStr = proposedCollaborators.join(', ');
    if (!updatedTask.coDepartment) {
      updatedTask.coDepartment = collabStr;
    }
  }

  db.tasks[idx] = updatedTask;
  writeDb(db);

  let actionType = 'PHẢN_HỒI_NHIỆM_VỤ';
  if (type === 'progress_report' || type === 'completion_report') actionType = 'BÁO_CÁO_TIẾN_ĐỘ';
  else if (type === 'deadline_adjustment') actionType = 'ĐỀ_XUẤT_GIA_HẠN';
  else if (type === 'collaborator_request') actionType = 'XIN_PHỐI_HỢP';

  addAuditLog(
    sender,
    actionType,
    taskId,
    `Cán bộ ${sender} gửi phản hồi [${type}]: "${content.slice(0, 80)}...". Tiến độ: ${updatedTask.progress}%.`
  );

  res.json({ success: true, task: updatedTask, feedback: newFeedback });
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const taskId = req.params.id;
  const task = (db.tasks || []).find((t: any) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy nhiệm vụ' });
  }

  db.tasks = db.tasks.filter((t: any) => t.id !== taskId);
  writeDb(db);

  addAuditLog('Quản trị viên', 'XÓA_NHIỆM_VỤ', taskId, `Xóa nhiệm vụ "${task.title}".`);
  res.json({ success: true, message: `Đã xóa nhiệm vụ ${taskId}` });
});

// POST /api/tasks/:id/evaluate
app.post('/api/tasks/:id/evaluate', (req, res) => {
  const db = readDb();
  const taskId = req.params.id;
  const idx = (db.tasks || []).findIndex((t: any) => t.id === taskId);

  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy nhiệm vụ để đánh giá' });
  }

  const evaluation = req.body;
  db.tasks[idx].evaluation = evaluation;
  writeDb(db);

  addAuditLog(
    evaluation.evaluator ? evaluation.evaluator.split('–')[0].trim() : 'Lãnh đạo',
    'ĐÁNH_GIÁ_NGHIỆM_THU',
    taskId,
    `Nghiệm thu đánh giá: ${evaluation.score}/10 điểm. Kết luận: ${evaluation.conclusion}.`
  );

  res.json({ success: true, task: db.tasks[idx] });
});

// POST /api/tasks/:id/urge
app.post('/api/tasks/:id/urge', (req, res) => {
  const db = readDb();
  const taskId = req.params.id;
  const task = (db.tasks || []).find((t: any) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy nhiệm vụ' });
  }

  const { urgeContent, sender } = req.body;
  addAuditLog(
    sender || 'Phạm Sơn Triều – Trưởng phòng',
    'ĐÔN_ĐỐC_KHẨN',
    taskId,
    urgeContent || `Phát lệnh đôn đốc khẩn tiến độ nhiệm vụ: ${task.title} (CB: ${task.assignee})`
  );

  res.json({ success: true, message: 'Đã phát lệnh đôn đốc thành công' });
});

// 8. SYSTEM SETTINGS
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.systemSettings || DEFAULT_DB.systemSettings);
});

app.put('/api/settings', (req, res) => {
  const db = readDb();
  db.systemSettings = { ...db.systemSettings, ...req.body };
  writeDb(db);
  addAuditLog('Quản trị viên', 'CẬP_NHẬT_CẤU_HÌNH', 'Thông số hệ thống', 'Thay đổi cấu hình thông số vận hành.');
  res.json({ success: true, settings: db.systemSettings });
});

// 9. AUDIT LOGS
app.get('/api/audit-logs', (req, res) => {
  const db = readDb();
  const { action, search, limit } = req.query;
  let logs = db.auditLogs || [];

  if (action && typeof action === 'string' && action !== 'all') {
    logs = logs.filter((l: any) => l.action?.includes(action));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    logs = logs.filter((l: any) =>
      l.details?.toLowerCase().includes(q) ||
      l.user?.toLowerCase().includes(q) ||
      l.target?.toLowerCase().includes(q)
    );
  }

  const max = limit ? parseInt(limit as string, 10) : 100;
  res.json(logs.slice(0, max));
});

app.post('/api/audit-logs', (req, res) => {
  const { user, action, target, details } = req.body;
  const log = addAuditLog(user || 'Hệ thống', action || 'THAO_TÁC', target || '', details || '');
  res.json({ success: true, log });
});

// 10. DATA AGGREGATION & REPORTING API
app.get('/api/reports/aggregate', (req, res) => {
  const db = readDb();
  const tasks = db.tasks || [];
  const { leader, field, assignee } = req.query;

  let filtered = tasks;
  if (leader && typeof leader === 'string' && leader !== 'all') {
    filtered = filtered.filter((t: any) => t.assigner?.includes(leader) || t.department?.includes(leader));
  }
  if (field && typeof field === 'string' && field !== 'all') {
    filtered = filtered.filter((t: any) => t.field === field);
  }
  if (assignee && typeof assignee === 'string' && assignee !== 'all') {
    filtered = filtered.filter((t: any) => t.assignee?.includes(assignee));
  }

  const total = filtered.length;
  const completed = filtered.filter((t: any) => t.status === 'completed').length;
  const beforeDeadline = filtered.filter((t: any) => t.status === 'completed' && t.timingStatus === 'before_deadline').length;
  const onTime = filtered.filter((t: any) => t.status === 'completed' && t.timingStatus === 'on_time').length;
  const late = filtered.filter((t: any) => t.status === 'completed' && t.timingStatus === 'late').length;
  const inProgress = filtered.filter((t: any) => t.status === 'in_progress').length;
  const overdue = filtered.filter((t: any) => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const rated = filtered.filter((t: any) => t.evaluation && t.evaluation.score);
  const avgScore = rated.length > 0
    ? (rated.reduce((sum: number, item: any) => sum + (item.evaluation?.score || 0), 0) / rated.length).toFixed(1)
    : 'N/A';

  const fieldList = db.fields || [];
  const fieldBreakdown = fieldList.map((fName: string) => {
    const fTasks = filtered.filter((t: any) => t.field === fName);
    const fTotal = fTasks.length;
    const fDone = fTasks.filter((t: any) => t.status === 'completed').length;
    const fInProg = fTasks.filter((t: any) => t.status === 'in_progress').length;
    const fOverdue = fTasks.filter((t: any) => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
    const fRated = fTasks.filter((t: any) => t.evaluation && t.evaluation.score);
    const fAvg = fRated.length > 0 ? (fRated.reduce((s: number, item: any) => s + item.evaluation.score, 0) / fRated.length).toFixed(1) : '-';
    return {
      field: fName,
      total: fTotal,
      completed: fDone,
      inProgress: fInProg,
      overdue: fOverdue,
      completionRate: fTotal > 0 ? Math.round((fDone / fTotal) * 100) : 0,
      avgScore: fAvg
    };
  });

  res.json({
    success: true,
    metrics: {
      total,
      completed,
      beforeDeadline,
      onTime,
      late,
      inProgress,
      overdue,
      completionRate,
      avgScore
    },
    fieldBreakdown,
    tasksCount: filtered.length
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRÀ GIÁP TASK V4 Server] Database active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
