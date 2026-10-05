import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  FileSpreadsheet, 
  FileDown, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  User, 
  Award,
  Filter,
  TrendingUp,
  Download,
  Building2,
  Users,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';
import { Task, FIELDS, STAFFS, UserAccount } from '../../types';

interface AdvancedReportsViewProps {
  tasks: Task[];
  currentUser?: UserAccount | null;
}

export const AdvancedReportsView: React.FC<AdvancedReportsViewProps> = ({ tasks, currentUser }) => {
  const isSpecialist = currentUser?.role === 'specialist';

  // Requirement 1: If specialist, scope strictly to their own task content upon login (excluding Leadership and other Specialists)
  const scopedTasks = useMemo(() => {
    if (isSpecialist && currentUser?.name) {
      const uName = currentUser.name.toLowerCase();
      return tasks.filter(t => {
        const aName = (t.assignee || '').toLowerCase();
        const cName = (t.coordinatingSpecialist || '').toLowerCase();
        return aName.includes(uName) || uName.includes(aName) || cName.includes(uName);
      });
    }
    return tasks;
  }, [tasks, isSpecialist, currentUser]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('q3_q4_2026');
  const [selectedLeader, setSelectedLeader] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [activeReportSubTab, setActiveReportSubTab] = useState<'official' | 'by-field' | 'by-staff'>('official');

  // Filter tasks based on criteria
  const filteredTasks = useMemo(() => {
    return scopedTasks.filter(t => {
      if (!isSpecialist && selectedLeader !== 'all' && !t.assigner?.includes(selectedLeader) && t.department !== selectedLeader) return false;
      if (selectedField !== 'all' && t.field !== selectedField) return false;
      if (!isSpecialist && selectedStaff !== 'all' && !t.assignee?.includes(selectedStaff)) return false;
      return true;
    });
  }, [scopedTasks, isSpecialist, selectedLeader, selectedField, selectedStaff]);

  // Aggregate Metrics
  const total = filteredTasks.length;
  const completed = filteredTasks.filter(t => t.status === 'completed').length;
  const beforeDeadline = filteredTasks.filter(t => t.status === 'completed' && t.timingStatus === 'before_deadline').length;
  const onTime = filteredTasks.filter(t => t.status === 'completed' && t.timingStatus === 'on_time').length;
  const late = filteredTasks.filter(t => t.status === 'completed' && t.timingStatus === 'late').length;
  const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
  const overdue = filteredTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Average Rating
  const rated = filteredTasks.filter(t => t.evaluation && t.evaluation.score);
  const avgScore = rated.length > 0 
    ? (rated.reduce((sum, item) => sum + (item.evaluation?.score || 0), 0) / rated.length).toFixed(1)
    : 'N/A';

  // Aggregation by Field
  const fieldSummary = useMemo(() => {
    const activeFields = isSpecialist
      ? FIELDS.filter(f => filteredTasks.some(t => t.field === f))
      : FIELDS;

    return activeFields.map(field => {
      const fieldTasks = filteredTasks.filter(t => t.field === field);
      const fTotal = fieldTasks.length;
      const fCompleted = fieldTasks.filter(t => t.status === 'completed').length;
      const fInProg = fieldTasks.filter(t => t.status === 'in_progress').length;
      const fOverdue = fieldTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
      const fRated = fieldTasks.filter(t => t.evaluation && t.evaluation.score);
      const fAvg = fRated.length > 0 ? (fRated.reduce((s, it) => s + (it.evaluation?.score || 0), 0) / fRated.length).toFixed(1) : '-';
      const fRate = fTotal > 0 ? Math.round((fCompleted / fTotal) * 100) : 0;
      return {
        field,
        total: fTotal,
        completed: fCompleted,
        inProgress: fInProg,
        overdue: fOverdue,
        rate: fRate,
        avgScore: fAvg
      };
    });
  }, [filteredTasks, isSpecialist]);

  // Aggregation by Staff
  const staffSummary = useMemo(() => {
    const activeStaffs = isSpecialist && currentUser?.name
      ? STAFFS.filter(s => s.name.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(s.name.toLowerCase()))
      : STAFFS;

    return activeStaffs.map(staff => {
      const sTasks = filteredTasks.filter(t => t.assignee?.includes(staff.name));
      const sTotal = sTasks.length;
      const sCompleted = sTasks.filter(t => t.status === 'completed').length;
      const sInProg = sTasks.filter(t => t.status === 'in_progress').length;
      const sOverdue = sTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.timingStatus === 'overdue')).length;
      const sRated = sTasks.filter(t => t.evaluation && t.evaluation.score);
      const sAvg = sRated.length > 0 ? (sRated.reduce((s, it) => s + (it.evaluation?.score || 0), 0) / sRated.length).toFixed(1) : '-';
      const sRate = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;
      return {
        ...staff,
        total: sTotal,
        completed: sCompleted,
        inProgress: sInProg,
        overdue: sOverdue,
        rate: sRate,
        avgScore: sAvg
      };
    });
  }, [filteredTasks, isSpecialist, currentUser]);

  // Export Official Word Document Report
  const handleExportWordReport = () => {
    const reportHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Báo cáo tiến độ TRÀ GIÁP TASK V4</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #000; }
    h2, h3, h4 { text-align: center; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid black; padding: 6px; font-size: 11pt; }
    th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
    .text-center { text-align: center; }
  </style>
</head>
<body>
  <table style="border: none; margin-bottom: 20px;">
    <tr style="border: none;">
      <td style="border: none; width: 45%; text-align: center;">
        UBND XÃ TRÀ GIÁP<br>
        <strong>PHÒNG VĂN HÓA - XÃ HỘI</strong><br>
        Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /BC-VHXH
      </td>
      <td style="border: none; width: 55%; text-align: center;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
        <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
        <em>Trà Giáp, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm 2026</em>
      </td>
    </tr>
  </table>

  <h3>BÁO CÁO</h3>
  <h4>KẾT QUẢ THỰC HIỆN NHIỆM VỤ CÔNG VỤ ${isSpecialist ? `(CỦA CHUYÊN VIÊN ${currentUser?.name?.toUpperCase()})` : ''}</h4>
  <p style="text-align: center; font-style: italic; margin-top: 0;">(Theo Quy trình Bộ điều hành 6 Rõ - Hệ thống TRÀ GIÁP TASK V4)</p>

  <p><strong>I. TÌNH HÌNH TỔNG QUAN TIẾN ĐỘ GIAO VIỆC</strong></p>
  <p>Tổng số nhiệm vụ được giao theo dõi: <strong>${total} nhiệm vụ</strong>.</p>
  <ul>
    <li>Số nhiệm vụ đã hoàn thành nghiệm thu: <strong>${completed} nhiệm vụ</strong> (Đạt tỷ lệ: <strong>${completionRate}%</strong>).</li>
    <li>Số nhiệm vụ đang trong thời hạn triển khai: <strong>${inProgress} nhiệm vụ</strong>.</li>
    <li>Số nhiệm vụ chậm tiến độ / quá hạn: <strong>${overdue} nhiệm vụ</strong>.</li>
    <li>Điểm xếp loại chất lượng bình quân: <strong>${avgScore} / 10 Điểm</strong>.</li>
  </ul>

  <p><strong>II. DANH SÁCH CHI TIẾT CÁC NHIỆM VỤ VÀ KẾT QUẢ THỰC HIỆN</strong></p>
  <table>
    <thead>
      <tr>
        <th style="width: 35px;">STT</th>
        <th style="width: 75px;">Mã số</th>
        <th>Nội dung nhiệm vụ</th>
        <th style="width: 130px;">Chuyên viên tham mưu</th>
        <th style="width: 85px;">Hạn xong</th>
        <th style="width: 60px;">Tiến độ</th>
        <th style="width: 80px;">Trạng thái</th>
        <th>Đánh giá của Lãnh đạo</th>
      </tr>
    </thead>
    <tbody>
      ${filteredTasks.map((t, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center"><strong>${t.id}</strong></td>
          <td>${t.title}</td>
          <td class="text-center">${t.assignee}</td>
          <td class="text-center">${t.dueDate}</td>
          <td class="text-center">${t.progress}%</td>
          <td class="text-center">${t.status === 'completed' ? 'Hoàn thành' : t.status === 'overdue' ? 'Quá hạn' : 'Đang làm'}</td>
          <td>${t.evaluation ? `${t.evaluation.score}/10đ - ${t.evaluation.conclusion}` : 'Chưa đánh giá'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    const blob = new Blob(['\ufeff' + reportHtml], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bao_cao_${currentUser?.name || 'Tra_Giap'}_${new Date().toISOString().slice(0, 10)}.doc`;
    link.click();
  };

  // Export Comprehensive CSV
  const handleExportCSV = () => {
    const headers = ['STT,Mã nhiệm vụ,Nội dung,Lĩnh vực,Người giao,Chuyên viên tham mưu,Ngày giao,Hạn xong,Tiến độ %,Trạng thái,Thời hạn,Điểm,Nhận xét lãnh đạo'];
    const rows = filteredTasks.map((t, idx) => [
      idx + 1,
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.field}"`,
      `"${t.assigner}"`,
      `"${t.assignee}"`,
      `"${t.assignedDate}"`,
      `"${t.dueDate}"`,
      `${t.progress}%`,
      `"${t.status === 'completed' ? 'Hoàn thành' : t.status === 'overdue' ? 'Quá hạn' : 'Đang làm'}"`,
      `"${t.timingStatus === 'before_deadline' ? 'Trước hạn' : t.timingStatus === 'late' ? 'Trễ hạn' : t.timingStatus === 'overdue' ? 'Quá hạn' : 'Trong hạn'}"`,
      t.evaluation ? `${t.evaluation.score}/10` : 'Chưa chấm',
      `"${(t.evaluation?.leaderComments || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Bao_cao_tong_hop_${currentUser?.name || 'Tra_Giap'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Bộ điều hành 6 rõ • Tổng hợp dữ liệu & Báo cáo tiến độ</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Báo cáo và Tổng hợp điều hành {isSpecialist ? `(Cá nhân: ${currentUser?.name})` : ''}
          </h2>
          <p className="text-xs text-slate-500">
            {isSpecialist ? (
              <span className="text-emerald-700 font-semibold">
                * Báo cáo và số liệu tổng hợp được giới hạn hiển thị riêng cho đồng chí <strong>{currentUser?.name}</strong> (loại trừ thông tin Lãnh đạo và Chuyên viên khác).
              </span>
            ) : (
              'Tự động tổng hợp số liệu điều hành, đánh giá tiến độ thực hiện và xuất văn bản báo cáo theo thể thức chuẩn'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel (.csv)</span>
          </button>

          <button
            onClick={handleExportWordReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Xuất Báo cáo Word (.doc)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSpecialist ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-3`}>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Kỳ báo cáo
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold cursor-pointer"
            >
              <option value="q3_q4_2026">Quý III - Quý IV / 2026 (Hiện tại)</option>
              <option value="september_2026">Tháng 09 / 2026</option>
              <option value="october_2026">Tháng 10 / 2026</option>
              <option value="year_2026">Toàn năm 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Lĩnh vực phụ trách
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
            >
              <option value="all">-- Toàn bộ lĩnh vực --</option>
              {FIELDS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {!isSpecialist && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Lãnh đạo phụ trách
                </label>
                <select
                  value={selectedLeader}
                  onChange={(e) => setSelectedLeader(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="all">-- Toàn bộ lãnh đạo --</option>
                  <option value="Phạm Sơn Triều">Phạm Sơn Triều – Trưởng phòng</option>
                  <option value="Nguyễn Tấn Tình">Nguyễn Tấn Tình – Phó Trưởng phòng</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Chuyên viên tham mưu
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                >
                  <option value="all">-- Toàn bộ chuyên viên --</option>
                  {STAFFS.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Tổng nhiệm vụ lọc</div>
          <div className="text-3xl font-black text-slate-900 mt-1 tabular-nums">{total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Theo tiêu chí đã chọn</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 flex items-center justify-between">
            <span>Đã hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-1 tabular-nums">{completed}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Tỷ lệ xong: {completionRate}%</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs">
          <div className="text-xs font-semibold text-blue-700 flex items-center justify-between">
            <span>Đang thực hiện</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-700 mt-1 tabular-nums">{inProgress}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Trong thời hạn cho phép</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs">
          <div className="text-xs font-semibold text-amber-700 flex items-center justify-between">
            <span>Điểm đánh giá TB</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-1 tabular-nums">{avgScore}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Thang điểm 10</div>
        </div>
      </div>

      {/* Sub-Tabs for Reporting View */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveReportSubTab('official')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReportSubTab === 'official'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Văn bản báo cáo hành chính</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('by-field')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReportSubTab === 'by-field'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tổng hợp theo lĩnh vực</span>
        </button>

        <button
          onClick={() => setActiveReportSubTab('by-staff')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeReportSubTab === 'by-staff'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isSpecialist ? 'Báo cáo chuyên viên cá nhân' : 'Tổng hợp theo chuyên viên'}</span>
        </button>
      </div>

      {/* Sub-tab 1: Official Administrative Document */}
      {activeReportSubTab === 'official' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-700 gap-4">
              <div className="text-center sm:text-left">
                <div>ỦY BAN NHÂN DÂN XÃ TRÀ GIÁP</div>
                <div className="font-bold text-slate-900">PHÒNG VĂN HÓA - XÃ HỘI</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /BC-VHXH</div>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-bold text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="font-bold text-slate-900 underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</div>
                <div className="italic text-slate-500 text-[11px] mt-1">
                  Trà Giáp, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm 2026
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <h3 className="text-base sm:text-lg font-black uppercase text-slate-900">
                BÁO CÁO KẾT QUẢ ĐIỀU HÀNH TIẾN ĐỘ THỰC HIỆN NHIỆM VỤ CÔNG VỤ {isSpecialist ? `(CỦA CHUYÊN VIÊN ${currentUser?.name?.toUpperCase()})` : ''}
              </h3>
              <div className="text-xs italic text-slate-600 mt-1">
                (Theo dõi theo Bộ điều hành 6 Rõ: Rõ người, rõ việc, rõ tiến độ, rõ kết quả, rõ trách nhiệm, rõ thẩm quyền)
              </div>
            </div>
          </div>

          {/* Report Content Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="py-2.5 px-3 text-center w-10">STT</th>
                  <th className="py-2.5 px-3 w-28">Mã số</th>
                  <th className="py-2.5 px-4 min-w-[240px]">Nhiệm vụ</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Chuyên viên</th>
                  <th className="py-2.5 px-3 min-w-[100px]">Hạn xong</th>
                  <th className="py-2.5 px-3 text-center">Tiến độ</th>
                  <th className="py-2.5 px-3">Tình trạng</th>
                  <th className="py-2.5 px-4 min-w-[200px]">Kết luận lãnh đạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {t.id}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {t.title}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {t.assignee}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-semibold text-slate-700">
                      {t.dueDate}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 tabular-nums">
                      {t.progress}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : t.status === 'overdue' 
                            ? 'bg-rose-50 text-rose-700' 
                            : 'bg-blue-50 text-blue-800'
                      }`}>
                        {t.status === 'completed' ? 'Hoàn thành' : t.status === 'overdue' ? 'Quá hạn' : 'Đang làm'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                      {t.evaluation ? (
                        <div>
                          <strong className="text-emerald-800">{t.evaluation.score}/10đ</strong> - {t.evaluation.conclusion}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa đánh giá</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Breakdown by Field */}
      {activeReportSubTab === 'by-field' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              Bảng tổng hợp dữ liệu tiến độ theo lĩnh vực phụ trách ({fieldSummary.length} lĩnh vực)
            </h3>
            <span className="text-[11px] text-slate-500">Đồng bộ tự động từ cơ sở dữ liệu</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[200px]">Lĩnh vực phụ trách</th>
                  <th className="py-3 px-3 text-center">Tổng nhiệm vụ</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Hoàn thành</th>
                  <th className="py-3 px-3 text-center text-blue-700">Đang làm</th>
                  <th className="py-3 px-3 text-center text-rose-700">Quá hạn</th>
                  <th className="py-3 px-4 min-w-[140px]">Tỷ lệ hoàn thành</th>
                  <th className="py-3 px-3 text-center">Điểm TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fieldSummary.map((f, idx) => (
                  <tr key={f.field} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-center font-bold text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {f.field}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 tabular-nums">
                      {f.total}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700 tabular-nums">
                      {f.completed}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-blue-700 tabular-nums">
                      {f.inProgress}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-rose-700 tabular-nums">
                      {f.overdue}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${f.rate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 tabular-nums w-10 text-right">
                          {f.rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-700 tabular-nums">
                      {f.avgScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Breakdown by Staff */}
      {activeReportSubTab === 'by-staff' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              {isSpecialist ? `Bảng tổng hợp tiến độ chuyên viên: ${currentUser?.name}` : `Bảng tổng hợp dữ liệu tiến độ theo chuyên viên (${staffSummary.length} cán bộ)`}
            </h3>
            <span className="text-[11px] text-slate-500">Đánh giá theo nguyên tắc 6 Rõ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[180px]">Chuyên viên</th>
                  <th className="py-3 px-3">Chức vụ</th>
                  <th className="py-3 px-3 text-center">Tổng việc</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Hoàn thành</th>
                  <th className="py-3 px-3 text-center text-blue-700">Đang làm</th>
                  <th className="py-3 px-3 text-center text-rose-700">Quá hạn</th>
                  <th className="py-3 px-4 min-w-[140px]">Tỷ lệ hoàn thành</th>
                  <th className="py-3 px-3 text-center">Điểm TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffSummary.map((st, idx) => (
                  <tr key={st.name} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-center font-bold text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {st.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {st.role}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 tabular-nums">
                      {st.total}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700 tabular-nums">
                      {st.completed}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-blue-700 tabular-nums">
                      {st.inProgress}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-rose-700 tabular-nums">
                      {st.overdue}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${st.rate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 tabular-nums w-10 text-right">
                          {st.rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-700 tabular-nums">
                      {st.avgScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
