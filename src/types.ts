export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'overdue';

export type TimingStatus = 'before_deadline' | 'on_time' | 'late' | 'overdue' | 'approaching' | 'normal';

export interface TaskEvaluation {
  completionLevel: string; // 'Hoàn thành xuất sắc' | 'Hoàn thành tốt' | 'Hoàn thành' | 'Chưa hoàn thành'
  quality: string; // 'Xuất sắc' | 'Tốt' | 'Đạt yêu cầu' | 'Cần chỉnh sửa'
  progressScore: string; // 'Trước hạn' | 'Đúng hạn' | 'Trễ hạn'
  score: number; // 1 - 10
  leaderComments: string;
  conclusion: string;
  evaluatedAt: string;
  evaluator: string;
}

export interface TaskAttachment {
  name: string;
  size?: number; // size in bytes
  type?: string;
  url?: string;
  uploadedAt?: string;
}

export type FeedbackType = 
  | 'progress_report'        // Báo cáo hoàn thành / tiến độ
  | 'collaborator_request'   // Xin bổ sung người phối hợp
  | 'deadline_adjustment'    // Đề xuất điều chỉnh thời hạn
  | 'issue_report'           // Báo cáo vướng mắc, khó khăn
  | 'general';               // Ý kiến phản hồi khác

export interface TaskFeedback {
  id: string;
  sender: string; // Tên chuyên viên / cán bộ
  senderRole?: string;
  type: FeedbackType;
  title?: string;
  content: string; // Nội dung phản hồi / báo cáo chi tiết
  progress?: number; // % tiến độ cập nhật
  attachments?: TaskAttachment[]; // Tệp đính kèm kết quả / minh chứng
  proposedDueDate?: string; // Hạn đề xuất mới
  proposedCollaborators?: string[]; // Cán bộ xin phối hợp
  createdAt: string;
  leaderResponse?: string; // Ý kiến của Lãnh đạo
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Task {
  id: string; // e.g. NV-2026-001
  title: string;
  content: string;
  assigner: string; // Người giao
  assignee: string; // Chuyên viên tham mưu
  department: string; // Lãnh đạo phụ trách
  field: string; // Lĩnh vực
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  completedDate?: string;
  progress: number; // 0 - 100
  status: TaskStatus;
  timingStatus: TimingStatus;
  priority: 'urgent' | 'high' | 'normal';
  evaluation?: TaskEvaluation;
  attachments?: (string | TaskAttachment)[];
  coDepartment?: string; // Chuyên viên / Đơn vị phối hợp
  coordinatingSpecialist?: string; // Chuyên viên phối hợp
  notes?: string;
  feedbackList?: TaskFeedback[];
}

export type ViewTab =
  | 'tong-quan'
  | 'giao-viec'
  | 'theo-doi'
  | 'kanban'
  | 'danh-gia'
  | 'lich-cong-viec'
  | 'nhiem-vu-hoan-thanh'
  | 'thong-ke-tong-hop'
  | 'thong-ke-don-vi'
  | 'thong-ke-can-bo'
  | 'bao-cao-chuyen-sau'
  | 'quan-tri-he-thong'
  | 'tro-ly-ai';

export type UserRole = 'admin' | 'leader' | 'specialist' | 'tester';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  position: string; // Chức danh: Trưởng phòng, Phó Trưởng phòng, Chuyên viên...
  department: string; // Đơn vị: Phòng VH-XH...
  field?: string; // Lĩnh vực phụ trách (chuỗi hiển thị)
  fields?: string[]; // Danh sách nhiều lĩnh vực phụ trách được phân công (Requirement 2)
  email: string;
  phone: string;
  password?: string;
  permissions: ViewTab[];
  status: 'active' | 'inactive';
  lastLogin?: string;
  avatar?: string;
}

export interface PersonalTask {
  id: string;
  userId: string; // Khóa theo ID người dùng, tuyệt đối riêng tư
  title: string;
  content: string;
  field: string;
  assignedDate: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'normal';
  expectedOutput?: string;
  coDepartment?: string;
  coordinatingSpecialist?: string;
  reportEvidence?: string;
  attachments?: (string | TaskAttachment)[];
  notes?: string;
  progress: number;
  status: TaskStatus;
  timingStatus: 'normal' | 'approaching' | 'overdue' | 'before_deadline' | 'on_time' | 'late';
  createdAt: string;
  isSyncedToOfficial?: boolean;
  syncedOfficialTaskId?: string;
  syncedAt?: string;
}

export const ALL_VIEW_TABS: { id: ViewTab; label: string; description: string }[] = [
  { id: 'tong-quan', label: '1. Tổng quan', description: 'Bảng điều khiển và cơ cấu trạng thái 6 rõ' },
  { id: 'giao-viec', label: '2. Giao nhiệm vụ', description: 'Khởi tạo và ban hành nhiệm vụ mới' },
  { id: 'theo-doi', label: '3. Theo dõi tiến độ', description: 'Bảng theo dõi và cập nhật tiến độ công vụ' },
  { id: 'kanban', label: '4. Kanban tiến độ', description: 'Quy trình theo dõi theo các cột trạng thái' },
  { id: 'danh-gia', label: '5. Đánh giá nhiệm vụ', description: 'Nghiệm thu, chấm điểm chất lượng nhiệm vụ' },
  { id: 'lich-cong-viec', label: '6. Lịch công việc', description: 'Lịch tiến độ trực quan theo hạn hoàn thành' },
  { id: 'nhiem-vu-hoan-thanh', label: '7. DS nhiệm vụ hoàn thành', description: 'Danh sách và hồ sơ nhiệm vụ đã xong' },
  { id: 'thong-ke-tong-hop', label: '8. Thống kê tổng hợp', description: 'Báo cáo thống kê toàn diện theo lĩnh vực' },
  { id: 'thong-ke-don-vi', label: '9. Thống kê theo lãnh đạo', description: 'Thống kê theo lãnh đạo phụ trách' },
  { id: 'thong-ke-can-bo', label: '10. Thống kê theo chuyên viên', description: 'Thống kê chi tiết từng chuyên viên tham mưu' },
  { id: 'bao-cao-chuyen-sau', label: '11. Báo cáo & Tổng hợp', description: 'Tổng hợp đa chiều và xuất văn bản Word/Excel' },
  { id: 'quan-tri-he-thong', label: '12. Quản trị hệ thống', description: 'Quản lý tài khoản, phân quyền, tham số và CSDL' },
  { id: 'tro-ly-ai', label: '13. Trợ lý AI', description: 'Trợ lý AI hỗ trợ soạn thảo văn bản và đôn đốc' }
];

// Requirement 1: Specialist permissions are restricted to EXACTLY these 8 functions:
// 1. Progress Tracking ('theo-doi')
// 2. Aggregate Statistics ('thong-ke-tong-hop')
// 3. Completed Tasks List ('nhiem-vu-hoan-thanh')
// 4. Progress Kanban ('kanban')
// 5. Statistics by Specialist ('thong-ke-can-bo')
// 6. Reports and Summaries ('bao-cao-chuyen-sau')
// 7. Work Calendar ('lich-cong-viec')
// 8. AI Assistant ('tro-ly-ai')
export const ROLE_PRESET_PERMISSIONS: Record<UserRole, ViewTab[]> = {
  admin: [
    'tong-quan', 'giao-viec', 'theo-doi', 'kanban', 'danh-gia', 'lich-cong-viec',
    'nhiem-vu-hoan-thanh', 'thong-ke-tong-hop', 'thong-ke-don-vi', 'thong-ke-can-bo',
    'bao-cao-chuyen-sau', 'quan-tri-he-thong', 'tro-ly-ai'
  ],
  leader: [
    'tong-quan', 'giao-viec', 'theo-doi', 'kanban', 'danh-gia', 'lich-cong-viec',
    'nhiem-vu-hoan-thanh', 'thong-ke-tong-hop', 'thong-ke-don-vi', 'thong-ke-can-bo',
    'bao-cao-chuyen-sau', 'tro-ly-ai'
  ],
  specialist: [
    'theo-doi',
    'thong-ke-tong-hop',
    'nhiem-vu-hoan-thanh',
    'kanban',
    'thong-ke-can-bo',
    'bao-cao-chuyen-sau',
    'lich-cong-viec',
    'tro-ly-ai'
  ],
  tester: [
    'tong-quan', 'theo-doi', 'kanban', 'danh-gia', 'thong-ke-tong-hop',
    'bao-cao-chuyen-sau', 'tro-ly-ai'
  ]
};

export const DEPARTMENTS = [
  'Phạm Sơn Triều',
  'Nguyễn Tấn Tình'
];

export const FIELDS = [
  'Nội vụ',
  'Giáo dục Đào tạo',
  'Chế độ chính sách - bảo trợ XH',
  'Y tế',
  'Văn hóa - Thông tin',
  'Dân tộc - Tôn giáo',
  'Khoa học công nghệ - CĐS',
  'Văn thư - Lưu trữ',
  'Đầu tư xây dựng',
  'Văn phòng'
];

export const STAFFS = [
  { name: 'Nguyễn Đăng Huân', department: 'Phạm Sơn Triều', role: 'Chuyên viên' },
  { name: 'Nguyễn Thị Kim Luyện', department: 'Phạm Sơn Triều', role: 'Chuyên viên' },
  { name: 'Trương Văn Thái', department: 'Nguyễn Tấn Tình', role: 'Chuyên viên' },
  { name: 'Hồ Ngọc Thanh Sơn', department: 'Phạm Sơn Triều', role: 'Chuyên viên' },
  { name: 'Nguyễn Minh Luyến', department: 'Phạm Sơn Triều', role: 'Chuyên viên' },
  { name: 'Hồ Thị Biên', department: 'Phạm Sơn Triều', role: 'Chuyên viên' },
  { name: 'Nguyễn Văn Thạnh', department: 'Nguyễn Tấn Tình', role: 'Chuyên viên' }
];
