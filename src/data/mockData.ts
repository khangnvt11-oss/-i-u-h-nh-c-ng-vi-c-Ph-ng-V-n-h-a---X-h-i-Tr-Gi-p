import { Task } from '../types';

export const INITIAL_TASKS: Task[] = [
  // 1. Quá hạn 1 (Chưa xong - Đang làm nhưng trễ hạn)
  {
    id: 'NV-2026-001',
    title: 'Rà soát và tổng hợp hồ sơ đề nghị công nhận xã đạt chuẩn tiếp cận pháp luật năm 2026',
    content: 'Tổ chức thẩm định từng tiêu chí chuẩn tiếp cận pháp luật; hoàn thiện hồ sơ minh chứng, biểu mẫu báo cáo gửi Phòng Tư pháp huyện thẩm tra trước ngày 20/09/2026.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Hồ Ngọc Thanh Sơn',
    department: 'Phạm Sơn Triều',
    field: 'Văn phòng',
    assignedDate: '2026-08-25',
    dueDate: '2026-09-20',
    progress: 60,
    status: 'overdue',
    timingStatus: 'overdue',
    priority: 'urgent',
    coDepartment: 'Công an xã, Tư pháp - Hộ tịch',
    attachments: [
      { name: 'Ke_hoach_05_UBND.pdf', size: 1240000, type: 'application/pdf' },
      { name: 'Bieu_mau_tiep_can_phap_luat.xlsx', size: 450000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    ],
    feedbackList: [
      {
        id: 'FB-865017',
        sender: 'Hồ Ngọc Thanh Sơn',
        senderRole: 'Chuyên viên',
        type: 'progress_report',
        title: 'Báo cáo tiến độ thẩm định',
        content: 'Đã hoàn thành thẩm định 4/5 tiêu chí tiếp cận pháp luật, đang chuẩn bị hồ sơ minh chứng hoàn thiện.',
        progress: 60,
        attachments: [
          { name: 'Bao_cao_tien_do_tuan_4.docx', size: 245000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
        ],
        createdAt: '2026-10-02 12:07:45',
        status: 'pending'
      }
    ]
  },
  // 2. Quá hạn 2 (Chưa xong - Đang làm nhưng trễ hạn)
  {
    id: 'NV-2026-002',
    title: 'Tham mưu kế hoạch kiểm tra liên ngành vệ sinh ATTP tại các cơ sở kinh doanh ăn uống trường học',
    content: 'Xây dựng lịch kiểm tra đột xuất đối với bếp ăn bán trú trường Mầm non và Tiểu học xã Trà Giáp; xử lý nghiêm các trường hợp nguyên liệu không rõ nguồn gốc.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Hồ Thị Biên',
    department: 'Nguyễn Tấn Tình',
    field: 'Y tế',
    assignedDate: '2026-09-02',
    dueDate: '2026-09-25',
    progress: 30,
    status: 'overdue',
    timingStatus: 'overdue',
    priority: 'urgent',
    coDepartment: 'Phòng VH-XH',
    attachments: [
      { name: 'To_trinh_kiem_tra_ATTP.docx', size: 320000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    ]
  },
  // 3. Đang thực hiện - Gần đến hạn 1 (Hạn 02/10/2026)
  {
    id: 'NV-2026-003',
    title: 'Tham mưu chi trả trợ cấp ưu đãi người có công và bảo trợ xã hội tháng 10/2026',
    content: 'Lập danh sách đối tượng thụ hưởng, đối soát với bưu điện văn hóa xã và Kho bạc Nhà nước đảm bảo chi trả đúng đối tượng, đúng thời gian quy định.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Trương Văn Thái',
    department: 'Nguyễn Tấn Tình',
    field: 'Chế độ chính sách - bảo trợ XH',
    assignedDate: '2026-09-18',
    dueDate: '2026-10-02',
    progress: 80,
    status: 'in_progress',
    timingStatus: 'approaching',
    priority: 'urgent',
    coDepartment: 'Tài chính - Kế toán',
    attachments: [
      { name: 'Danh_sach_chi_tra_thang10.xlsx', size: 580000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    ]
  },
  // 4. Đang thực hiện - Gần đến hạn 2 (Hạn 05/10/2026)
  {
    id: 'NV-2026-004',
    title: 'Xây dựng phương án tổ chức Ngày hội Đại đoàn kết toàn dân tộc năm 2026 tại các thôn nóc',
    content: 'Phối hợp Ủy ban MTTQ Việt Nam xã Trà Giáp thống nhất nội dung phần lễ và phần hội mang đậm bản sắc văn hóa đồng bào Cor; dự trù kinh phí tổ chức.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Nguyễn Đăng Huân',
    department: 'Nguyễn Tấn Tình',
    field: 'Văn hóa - Thông tin',
    assignedDate: '2026-09-15',
    dueDate: '2026-10-05',
    progress: 60,
    status: 'in_progress',
    timingStatus: 'approaching',
    priority: 'high',
    coDepartment: 'Ủy ban MTTQ xã',
    attachments: [
      { name: 'Phuong_an_Dai_doan_ket.docx', size: 410000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    ]
  },
  // 5. Đang thực hiện - Gần đến hạn 3 (Hạn 08/10/2026)
  {
    id: 'NV-2026-005',
    title: 'Chiến dịch tiêm chủng mở rộng và phòng chống dịch sốt xuất huyết vùng đồng bào dân tộc thiểu số',
    content: 'Tổ chức các điểm tiêm chủng lưu động tại các thôn vùng xa; phát tờ rơi tuyên truyền bằng tiếng Cor và tiếng Kinh về diệt lăng quăng bọ gậy.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Hồ Thị Biên',
    department: 'Phạm Sơn Triều',
    field: 'Y tế',
    assignedDate: '2026-09-20',
    dueDate: '2026-10-08',
    progress: 50,
    status: 'in_progress',
    timingStatus: 'approaching',
    priority: 'high',
    attachments: [
      { name: 'Ke_hoach_tiem_chung_Q4.pdf', size: 980000, type: 'application/pdf' }
    ]
  },
  // 6. Đang thực hiện - Bình thường 1 (Hạn 15/10/2026)
  {
    id: 'NV-2026-006',
    title: 'Khảo sát tình hình xóa mù chữ và phổ cập giáo dục trung học cơ sở trên địa bàn xã Trà Giáp',
    content: 'Phối hợp các trường đóng trên địa bàn lập danh sách học sinh có nguy cơ bỏ học đầu năm học mới; đề xuất chính sách hỗ trợ kịp thời.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Hồ Ngọc Thanh Sơn',
    department: 'Phạm Sơn Triều',
    field: 'Giáo dục Đào tạo',
    assignedDate: '2026-09-22',
    dueDate: '2026-10-15',
    progress: 40,
    status: 'in_progress',
    timingStatus: 'normal',
    priority: 'normal',
    coDepartment: 'Trường THCS Trà Giáp'
  },
  // 7. Đang thực hiện - Bình thường 2 (Hạn 18/10/2026)
  {
    id: 'NV-2026-007',
    title: 'Triển khai Tổ công nghệ số cộng đồng hướng dẫn người dân kích hoạt tài khoản VNeID mức 2',
    content: 'Ra quân hỗ trợ trực tiếp tại Nhà sinh hoạt cộng đồng 4 thôn; hướng dẫn bà con tích hợp thẻ BHYT và giấy phép lái xe lên ứng dụng số.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Nguyễn Văn Thạnh',
    department: 'Phạm Sơn Triều',
    field: 'Khoa học công nghệ - CĐS',
    assignedDate: '2026-09-21',
    dueDate: '2026-10-18',
    progress: 35,
    status: 'in_progress',
    timingStatus: 'normal',
    priority: 'normal',
    coDepartment: 'Đoàn Thanh niên xã'
  },
  // 8. Đang thực hiện - Bình thường 3 (Hạn 20/10/2026)
  {
    id: 'NV-2026-008',
    title: 'Rà soát danh sách hộ nghèo, hộ cận nghèo vùng đồng bào DTTS được hỗ trợ nhà ở theo CTMTQG 1719',
    content: 'Xác minh thực tế hiện trạng nhà ở dột nát, xuống cấp; lập biên bản thẩm tra từng hộ dân để trình UBND huyện phê duyệt hỗ trợ xây mới.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Trương Văn Thái',
    department: 'Nguyễn Tấn Tình',
    field: 'Dân tộc - Tôn giáo',
    assignedDate: '2026-09-23',
    dueDate: '2026-10-20',
    progress: 25,
    status: 'in_progress',
    timingStatus: 'normal',
    priority: 'high',
    coDepartment: 'Địa chính - Xây dựng'
  },
  // 9. Đang thực hiện - Bình thường 4 (Hạn 25/10/2026)
  {
    id: 'NV-2026-009',
    title: 'Biên tập bản tin phát thanh định kỳ tuyên truyền chính sách pháp luật quý IV/2026',
    content: 'Sản xuất các bản tin thời lượng 15 phút phát trên hệ thống truyền thanh cơ sở về phòng cháy chữa cháy rừng mùa khô và chính sách bảo hiểm tự nguyện.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Nguyễn Đăng Huân',
    department: 'Phạm Sơn Triều',
    field: 'Văn hóa - Thông tin',
    assignedDate: '2026-09-24',
    dueDate: '2026-10-25',
    progress: 20,
    status: 'in_progress',
    timingStatus: 'normal',
    priority: 'normal'
  },
  // 10. Đang thực hiện - Bình thường 5 (Hạn 30/10/2026)
  {
    id: 'NV-2026-010',
    title: 'Số hóa hồ sơ cán bộ, công chức và chuẩn hóa cơ sở dữ liệu quốc gia về CBCCVC xã Trà Giáp',
    content: 'Đối chiếu thông tin cá nhân, quá trình công tác, văn bằng chứng chỉ của 22 cán bộ xã cập nhật đồng bộ lên hệ thống điều hành điện tử tỉnh.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Nguyễn Văn Thạnh',
    department: 'Nguyễn Tấn Tình',
    field: 'Khoa học công nghệ - CĐS',
    assignedDate: '2026-09-25',
    dueDate: '2026-10-30',
    progress: 15,
    status: 'in_progress',
    timingStatus: 'normal',
    priority: 'normal'
  },
  // 11. Hoàn thành TRƯỚC HẠN 1
  {
    id: 'NV-2026-011',
    title: 'Tổ chức Lễ khai giảng năm học mới 2026 - 2027 an toàn, tiết kiệm và trao quà cho học sinh nghèo',
    content: 'Chỉ đạo các trường tổ chức phần lễ trang trọng, phối hợp các nhà hảo tâm trao 120 suất quà tiếp bước đến trường cho học sinh đồng bào Cor.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Hồ Ngọc Thanh Sơn',
    department: 'Phạm Sơn Triều',
    field: 'Giáo dục Đào tạo',
    assignedDate: '2026-08-20',
    dueDate: '2026-09-05',
    completedDate: '2026-09-03',
    progress: 100,
    status: 'completed',
    timingStatus: 'before_deadline',
    priority: 'high',
    evaluation: {
      completionLevel: 'Hoàn thành xuất sắc',
      quality: 'Xuất sắc',
      progressScore: 'Trước hạn',
      score: 10,
      leaderComments: 'Tổ chức chu đáo, phối hợp chặt chẽ với ban giám hiệu các trường; công tác an sinh xã hội cho học sinh vùng khó khăn rất kịp thời.',
      conclusion: 'Đạt xuất sắc nhiệm vụ được giao',
      evaluatedAt: '2026-09-06',
      evaluator: 'Phạm Sơn Triều – Trưởng phòng'
    },
    attachments: [
      { name: 'Bao_cao_tong_ket_khai_giang.pdf', size: 1420000, type: 'application/pdf' }
    ]
  },
  // 12. Hoàn thành TRƯỚC HẠN 2
  {
    id: 'NV-2026-012',
    title: 'Chiến dịch bổ sung Vitamin A liều cao đợt 2 cho trẻ em từ 6 đến 35 tháng tuổi',
    content: 'Tổ chức cho trẻ uống Vitamin A tại 4 điểm nóc thôn; tỷ lệ đạt trên 98,5% so với kế hoạch đề ra, không để xảy ra trường hợp tai biến.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Hồ Thị Biên',
    department: 'Phạm Sơn Triều',
    field: 'Y tế',
    assignedDate: '2026-08-15',
    dueDate: '2026-09-10',
    completedDate: '2026-09-08',
    progress: 100,
    status: 'completed',
    timingStatus: 'before_deadline',
    priority: 'normal',
    evaluation: {
      completionLevel: 'Hoàn thành xuất sắc',
      quality: 'Xuất sắc',
      progressScore: 'Trước hạn',
      score: 10,
      leaderComments: 'Cán bộ trạm bám sát địa bàn, trèo đèo lội suối vào tận các nóc xa để phục vụ bà con. Đánh giá rất cao tinh thần trách nhiệm.',
      conclusion: 'Hoàn thành vượt chỉ tiêu đề ra',
      evaluatedAt: '2026-09-11',
      evaluator: 'Phạm Sơn Triều – Trưởng phòng'
    }
  },
  // 13. Hoàn thành TRƯỚC HẠN 3
  {
    id: 'NV-2026-013',
    title: 'Phát động Giải bóng đá thanh niên xã Trà Giáp chào mừng Quốc khánh 02/9',
    content: 'Xây dựng điều lệ giải đấu, vận động 6 đội bóng thôn nóc tham gia thi đấu; đảm bảo trật tự an ninh và tạo không khí vui tươi phấn khởi.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Nguyễn Đăng Huân',
    department: 'Phạm Sơn Triều',
    field: 'Văn hóa - Thông tin',
    assignedDate: '2026-08-10',
    dueDate: '2026-09-02',
    completedDate: '2026-08-30',
    progress: 100,
    status: 'completed',
    timingStatus: 'before_deadline',
    priority: 'normal',
    evaluation: {
      completionLevel: 'Hoàn thành tốt',
      quality: 'Tốt',
      progressScore: 'Trước hạn',
      score: 9,
      leaderComments: 'Giải đấu diễn ra sôi nổi, an toàn, thu hút đông đảo nhân dân đến xem và cổ vũ nhiệt tình.',
      conclusion: 'Hoàn thành tốt nhiệm vụ',
      evaluatedAt: '2026-09-03',
      evaluator: 'Phạm Sơn Triều – Trưởng phòng'
    }
  },
  // 14. Hoàn thành TRƯỚC HẠN 4
  {
    id: 'NV-2026-014',
    title: 'Cấp phát gạo cứu đói giáp hạt đợt 3 năm 2026 cho các hộ đặc biệt khó khăn',
    content: 'Tiếp nhận nguồn hỗ trợ từ dự trữ quốc gia, phân bổ 15 tấn gạo đúng định mức cho 180 hộ dân có hoàn cảnh neo đơn, mất sức lao động.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Nguyễn Thị Kim Luyện',
    department: 'Phạm Sơn Triều',
    field: 'Chế độ chính sách - bảo trợ XH',
    assignedDate: '2026-08-22',
    dueDate: '2026-09-12',
    completedDate: '2026-09-09',
    progress: 100,
    status: 'completed',
    timingStatus: 'before_deadline',
    priority: 'high',
    evaluation: {
      completionLevel: 'Hoàn thành xuất sắc',
      quality: 'Xuất sắc',
      progressScore: 'Trước hạn',
      score: 9,
      leaderComments: 'Phát gạo công khai, minh bạch, có ký nhận đầy đủ, không để phát sinh khiếu nại thắc mắc.',
      conclusion: 'Đảm bảo chính sách an sinh xã hội',
      evaluatedAt: '2026-09-13',
      evaluator: 'Phạm Sơn Triều – Trưởng phòng'
    }
  },
  // 15. Hoàn thành TRƯỚC HẠN 5
  {
    id: 'NV-2026-015',
    title: 'Tổ chức tập huấn sử dụng dịch vụ công trực tuyến một phần và toàn trình cho công chức xã',
    content: 'Mời báo cáo viên Sở TT&TT hướng dẫn xử lý hồ sơ trên Hệ thống thông tin giải quyết thủ tục hành chính; giải quyết điểm nghẽn tiếp nhận.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Nguyễn Văn Thạnh',
    department: 'Phạm Sơn Triều',
    field: 'Khoa học công nghệ - CĐS',
    assignedDate: '2026-08-18',
    dueDate: '2026-09-15',
    completedDate: '2026-09-11',
    progress: 100,
    status: 'completed',
    timingStatus: 'before_deadline',
    priority: 'normal',
    evaluation: {
      completionLevel: 'Hoàn thành tốt',
      quality: 'Tốt',
      progressScore: 'Trước hạn',
      score: 9,
      leaderComments: 'Buổi tập huấn thực chất, 100% cán bộ bộ phận Một cửa đã thao tác thành thạo quy trình ký số.',
      conclusion: 'Nâng cao kỹ năng số cho cán bộ',
      evaluatedAt: '2026-09-16',
      evaluator: 'Phạm Sơn Triều – Trưởng phòng'
    }
  },
  // 16. Hoàn thành TRƯỚC HẠN 6
  {
    id: 'NV-2026-016',
    title: 'Khảo sát nhu cầu học nghề và tạo việc làm cho lao động thanh niên nông thôn xã Trà Giáp',
    content: 'Phát phiếu khảo sát 150 thanh niên; tổng hợp nhu cầu học nghề sửa chữa máy nông cụ, trồng nấm linh chi và chăn nuôi heo cỏ địa phương.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Trương Văn Thái',
    department: 'Phạm Sơn Triều',
    field: 'Chế độ chính sách - bảo trợ XH',
    assignedDate: '2026-08-12',
    dueDate: '2026-09-18',
    completedDate: '2026-09-14',
    progress: 100,
    status: 'completed',
    timingStatus: 'before_deadline',
    priority: 'normal',
    evaluation: {
      completionLevel: 'Hoàn thành tốt',
      quality: 'Tốt',
      progressScore: 'Trước hạn',
      score: 8,
      leaderComments: 'Số liệu tổng hợp rõ ràng, là cơ sở để liên kết mở lớp đào tạo nghề quý IV.',
      conclusion: 'Đạt yêu cầu kế hoạch',
      evaluatedAt: '2026-09-19',
      evaluator: 'Phạm Sơn Triều – Trưởng phòng'
    }
  },
  // 17. Hoàn thành TRỄ HẠN 1
  {
    id: 'NV-2026-017',
    title: 'Báo cáo thống kê tình hình sinh đẻ và mất cân bằng giới tính khi sinh 9 tháng đầu năm',
    content: 'Tổng hợp số liệu từ các cộng tác viên dân số thôn bản; phân tích nguyên nhân sinh con thứ 3 và đề xuất giải pháp truyền thông.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Hồ Thị Biên',
    department: 'Phạm Sơn Triều',
    field: 'Y tế',
    assignedDate: '2026-08-10',
    dueDate: '2026-09-08',
    completedDate: '2026-09-16',
    progress: 100,
    status: 'completed',
    timingStatus: 'late',
    priority: 'normal',
    evaluation: {
      completionLevel: 'Hoàn thành',
      quality: 'Đạt yêu cầu',
      progressScore: 'Trễ hạn',
      score: 7,
      leaderComments: 'Nội dung số liệu đầy đủ nhưng nộp báo cáo chậm 8 ngày so với hạn giao do cộng tác viên cơ sở gửi dữ liệu trễ. Cần rút kinh nghiệm khâu đôn đốc.',
      conclusion: 'Nghiệm thu nhưng phê bình tiến độ',
      evaluatedAt: '2026-09-18',
      evaluator: 'Phạm Sơn Triều – Trưởng phòng'
    }
  },
  // 18. Hoàn thành TRỄ HẠN 2
  {
    id: 'NV-2026-018',
    title: 'Kiểm tra công tác bảo tồn không gian văn hóa cồng chiêng và đàn nước truyền thống của người Cor',
    content: 'Thành lập đoàn khảo sát hiện vật cồng chiêng cổ tại các nóc già làng; lập hồ sơ đề nghị xếp hạng di sản văn hóa phi vật thể địa phương.',
    assigner: 'Phạm Sơn Triều – Trưởng phòng',
    assignee: 'Nguyễn Đăng Huân',
    department: 'Phạm Sơn Triều',
    field: 'Văn hóa - Thông tin',
    assignedDate: '2026-08-05',
    dueDate: '2026-09-15',
    completedDate: '2026-09-22',
    progress: 100,
    status: 'completed',
    timingStatus: 'late',
    priority: 'normal',
    evaluation: {
      completionLevel: 'Hoàn thành tốt',
      quality: 'Tốt',
      progressScore: 'Trễ hạn',
      score: 7,
      leaderComments: 'Hồ sơ minh chứng khảo sát rất công phu và giàu giá trị văn hóa; tuy nhiên chậm tiến độ 7 ngày so với chỉ đạo ban đầu.',
      conclusion: 'Hoàn thành, nhắc nhở tiến độ',
      evaluatedAt: '2026-09-23',
      evaluator: 'Phạm Sơn Triều – Trưởng phòng'
    }
  }
];
