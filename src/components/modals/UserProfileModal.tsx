import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Save, 
  Check, 
  AlertCircle, 
  KeyRound,
  Eye,
  EyeOff,
  Briefcase
} from 'lucide-react';
import { UserAccount, ALL_VIEW_TABS } from '../../types';
import { databaseService } from '../../services/databaseService';

interface UserProfileModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserAccount) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  onClose,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'permissions'>('profile');

  // Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [position, setPosition] = useState(currentUser.position || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: 'Họ và tên không được để trống' });
      return;
    }

    try {
      const res = await databaseService.updateProfile(currentUser.id, {
        name: name.trim(),
        position: position.trim(),
        department: department.trim(),
        phone: phone.trim(),
        email: email.trim()
      });

      if (res.success && res.account) {
        onUserUpdated(res.account);
        setProfileMsg({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
        setTimeout(() => setProfileMsg(null), 3000);
      } else {
        setProfileMsg({ type: 'error', text: res.error || 'Cập nhật thất bại' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Lỗi lưu thông tin' });
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    try {
      const res = await databaseService.changePassword(currentUser.id, currentPassword, newPassword);
      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(null), 3000);
      } else {
        setPasswordMsg({ type: 'error', text: res.error || 'Mật khẩu hiện tại không đúng' });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Lỗi đổi mật khẩu' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-md">
              {currentUser.name.split(' ').pop()?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  {currentUser.role === 'admin' ? 'Quản trị hệ thống' : currentUser.role === 'leader' ? 'Lãnh đạo' : currentUser.role === 'specialist' ? 'Chuyên viên' : 'Kiểm thử'}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {currentUser.position} • {currentUser.department}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'password'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>2. Đổi mật khẩu</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Quyền hạn ({currentUser.permissions?.length || 0} chức năng)</span>
          </button>
        </div>

        {/* Tab 1: Profile Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="p-6 overflow-y-auto space-y-4 text-xs">
            {profileMsg && (
              <div className={`p-3 rounded-xl flex items-center gap-2 font-semibold ${
                profileMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {profileMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chức vụ / Chức danh
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đơn vị / Cơ quan công tác
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại liên hệ
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email công vụ (Tên đăng nhập)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800 font-semibold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông tin cá nhân</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Password Form */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="p-6 overflow-y-auto space-y-4 text-xs">
            {passwordMsg && (
              <div className={`p-3 rounded-xl flex items-center gap-2 font-semibold ${
                passwordMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {passwordMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật khẩu hiện tại <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu đang sử dụng..."
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Tối thiểu 6 ký tự..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Xác nhận lại mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Cập nhật mật khẩu mới</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Permissions Matrix Preview */}
        {activeTab === 'permissions' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800">
                Nhóm quyền: <span className="text-emerald-700 uppercase">{currentUser.role}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUser.role === 'admin' 
                  ? 'Quản trị viên có toàn quyền truy cập và phân bổ quyền cho mọi nhóm chức năng khác.'
                  : currentUser.role === 'specialist'
                    ? 'Chuyên viên được cấp quyền truy cập 8 chức năng chuẩn và xem nội dung nhiệm vụ của cá nhân.'
                    : 'Quyền hạn của tài khoản này được chỉ định bởi Quản trị viên hệ thống.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-600 uppercase">Danh sách chức năng được cấp phép:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_VIEW_TABS.map((tab) => {
                  const hasAccess = currentUser.role === 'admin' || (currentUser.permissions || []).includes(tab.id);
                  return (
                    <div 
                      key={tab.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        hasAccess 
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[11px]">{tab.label}</div>
                        <div className="text-[10px] text-slate-500">{tab.description}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasAccess ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {hasAccess ? 'Cho phép' : 'Khóa'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
