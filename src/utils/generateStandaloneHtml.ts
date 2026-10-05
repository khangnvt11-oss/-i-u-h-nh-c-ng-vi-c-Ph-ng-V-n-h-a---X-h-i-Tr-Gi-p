import { Task } from '../types';

export function generateStandaloneHtml(tasks: Task[]): string {
  const jsonTasks = JSON.stringify(tasks, null, 2);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRÀ GIÁP TASK V4 - Hệ thống điều hành tiến độ giao việc UBND Xã Trà Giáp</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 9999px; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased">
  <div id="app" class="flex min-h-screen">
    <aside class="w-72 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0b0f19] text-slate-200 flex flex-col border-r border-slate-800 shrink-0">
      <div class="p-4 border-b border-slate-800/80 bg-slate-900/60">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-extrabold text-white shadow-lg border border-emerald-400/30">
            <span class="text-base font-black">TG4</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-black tracking-wider text-emerald-400">TRÀ GIÁP TASK V4</span>
              <span class="px-1 py-0.2 text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">6 RÕ</span>
            </div>
            <h1 class="text-xs font-semibold text-slate-300">UBND XÃ TRÀ GIÁP</h1>
            <p class="text-[11px] text-slate-400">Hệ thống điều hành tiến độ</p>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <button onclick="switchTab('tong-quan')" id="btn-tong-quan" class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-md">
          <span>1. Tổng quan</span>
          <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">18</span>
        </button>
        <button onclick="switchTab('theo-doi')" id="btn-theo-doi" class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
          <span>3. Theo dõi tiến độ</span>
        </button>
      </div>

      <div class="p-3.5 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400">
        <div class="text-emerald-400 font-bold">Nguyễn Văn Thạnh</div>
        <div class="text-[10px] text-slate-400 mt-0.5">Bản quyền: HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ GIAO VIỆC TRÀ GIÁP TASK V4</div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div class="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-1 text-center text-[11px] font-medium">
          Bản quyền của Nguyễn Văn Thạnh • HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ GIAO VIỆC TRÀ GIÁP TASK V4 – UBND XÃ TRÀ GIÁP
        </div>
        <div class="px-6 py-2.5 flex items-center justify-between gap-4">
          <h2 class="text-sm font-bold text-slate-800">Bản sao lưu ngoại tuyến Offline</h2>
        </div>
      </header>

      <main class="p-6 flex-1 overflow-y-auto" id="mainContent">
      </main>
    </div>
  </div>

  <script>
    const INITIAL_TASKS = ${jsonTasks};
    let currentTasks = [...INITIAL_TASKS];

    function renderTaskTracking() {
      return \`
        <div class="space-y-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200">
            <h2 class="text-base font-bold text-slate-900">Danh sách nhiệm vụ công vụ (\${currentTasks.length})</h2>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th class="p-3 text-center">STT</th>
                  <th class="p-3">Mã NV & Tiêu đề</th>
                  <th class="p-3">Người giao</th>
                  <th class="p-3">Cán bộ tham mưu</th>
                  <th class="p-3">Hạn xong</th>
                  <th class="p-3">Tiến độ %</th>
                  <th class="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                \${currentTasks.map((t, idx) => \`
                  <tr class="hover:bg-slate-50">
                    <td class="p-3 text-center font-bold text-slate-500">\${idx + 1}</td>
                    <td class="p-3">
                      <div class="font-mono text-[10px] font-bold text-slate-500">\${t.id}</div>
                      <div class="font-bold text-slate-900 mt-0.5">\${t.title}</div>
                    </td>
                    <td class="p-3 font-semibold text-slate-700">\${t.assigner.split('–')[0]}</td>
                    <td class="p-3 font-bold text-slate-800">\${t.assignee}</td>
                    <td class="p-3 font-semibold">\${t.dueDate}</td>
                    <td class="p-3 font-bold">\${t.progress}%</td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold \${t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                        \${t.status === 'completed' ? 'Hoàn thành' : 'Đang làm'}
                      </span>
                    </td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      \`;
    }

    function switchTab(tab) {
      document.getElementById('mainContent').innerHTML = renderTaskTracking();
    }

    document.addEventListener('DOMContentLoaded', () => {
      switchTab('tong-quan');
    });
  </script>
</body>
</html>`;
}
