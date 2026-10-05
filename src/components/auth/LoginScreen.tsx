import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  LogIn, 
  Sparkles,
  UserCheck,
  Building2,
  Shield
} from 'lucide-react';
import { UserAccount } from '../../types';
import { databaseService, INITIAL_ACCOUNTS } from '../../services/databaseService';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onClose,
  isModal = false
}) => {
  const [email, setEmail] = useState('thanhnv53@danang.gov.vn');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setErrorMsg('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập / Email công vụ');
      return;
    }

    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu đăng nhập');
      return;
    }

    if (!captchaInput.trim()) {
      setErrorMsg('Vui lòng nhập mã xác thực CAPTCHA');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg('Mã xác thực CAPTCHA không chính xác. Vui lòng thử lại.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await databaseService.login(email.trim(), password, captchaInput, captchaCode);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Đăng nhập không thành công. Kiểm tra lại thông tin tài khoản.');
        generateCaptcha();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ');
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (acc: UserAccount) => {
    setEmail(acc.email);
    setPassword('password123');
    setCaptchaInput(captchaCode);
    setErrorMsg('');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200`}>
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto flex flex-col relative">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HỆ THỐNG ĐIỀU HÀNH 6 RÕ</span>
            </div>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            TRÀ GIÁP TASK V4
          </h2>
          <div className="text-xs text-emerald-300 font-semibold mt-0.5">
            PHÒNG VĂN HÓA - XÃ HỘI XÃ TRÀ GIÁP
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            Cổng xác thực danh tính điều hành tiến độ công vụ: Rõ người, rõ việc, rõ tiến độ, rõ kết quả, rõ trách nhiệm, rõ thẩm quyền
          </p>

          <div className="mt-3 text-[10px] text-slate-400 border-t border-white/10 pt-2">
            Bản quyền: Nguyễn Văn Thạnh • HỆ THỐNG ĐIỀU HÀNH TIẾN ĐỘ GIAO VIỆC PHÒNG VĂN HÓA - XÃ HỘI TRÀ GIÁP TASK V4
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên đăng nhập (Email công vụ chuyên viên) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Ví dụ: thanhnv53@danang.gov.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl focus:bg-white text-slate-900 font-semibold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Mật khẩu bảo mật <span className="text-rose-500">*</span></span>
                <span className="text-[11px] font-normal text-slate-400">Mặc định: password123</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl focus:bg-white text-slate-900 font-semibold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mã xác thực CAPTCHA <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Nhập 5 ký tự bên phải..."
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl uppercase font-mono tracking-widest font-bold text-slate-900"
                  />
                </div>

                <div className="relative flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-800 to-indigo-950 text-white rounded-xl select-none shrink-0 shadow-inner border border-slate-700">
                  <span className="font-mono text-base font-black tracking-widest text-emerald-400 line-through decoration-emerald-500/60 skew-x-3">
                    {captchaCode}
                  </span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="ml-2.5 p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Đổi mã CAPTCHA khác"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP VÀO HỆ THỐNG'}</span>
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Đăng nhập nhanh theo phân quyền Demo:</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill(INITIAL_ACCOUNTS[0])}
                className="p-2 text-left bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl transition-colors cursor-pointer"
              >
                <div className="font-bold text-emerald-900 flex items-center justify-between">
                  <span>Nguyễn Văn Thạnh</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">Admin</span>
                </div>
                <div className="text-[10px] text-emerald-700">Chuyên viên (Toàn quyền)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(INITIAL_ACCOUNTS[1])}
                className="p-2 text-left bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl transition-colors cursor-pointer"
              >
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>Phạm Sơn Triều</span>
                  <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono">Lãnh đạo</span>
                </div>
                <div className="text-[10px] text-blue-700">Trưởng phòng VH-XH</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(INITIAL_ACCOUNTS[3])}
                className="p-2 text-left bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 rounded-xl transition-colors cursor-pointer"
              >
                <div className="font-bold text-purple-900 flex items-center justify-between">
                  <span>Hồ Ngọc Thanh Sơn</span>
                  <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-mono">Chuyên viên</span>
                </div>
                <div className="text-[10px] text-purple-700">Chuyên viên Tư pháp (8 quyền)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(INITIAL_ACCOUNTS[7] || INITIAL_ACCOUNTS[6])}
                className="p-2 text-left bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl transition-colors cursor-pointer"
              >
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>Kiểm thử viên</span>
                  <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-mono">Tester</span>
                </div>
                <div className="text-[10px] text-amber-700">Thử nghiệm & Đánh giá</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
