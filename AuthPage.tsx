import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function AuthPage() {
  const app = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      app.showToast(app.lang === 'vi' ? 'Vui lòng nhập đủ thông tin!' : 'Please fill in all fields!', 'error');
      return;
    }
    const success = app.login(username.trim(), password);
    if (success) {
      app.navigate('home');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !email.trim()) {
      app.showToast(app.lang === 'vi' ? 'Vui lòng nhập đủ thông tin!' : 'Please fill in all fields!', 'error');
      return;
    }
    if (password !== confirmPassword) {
      app.showToast(app.t('auth.password_mismatch'), 'error');
      return;
    }
    if (password.length < 4) {
      app.showToast(app.lang === 'vi' ? 'Mật khẩu phải từ 4 ký tự!' : 'Password must be at least 4 characters!', 'error');
      return;
    }
    const success = app.register(username.trim(), password, email.trim());
    if (success) {
      app.navigate('home');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-float">🎮</div>
          <h1 className="font-heading text-3xl font-black gradient-text mb-1">KNOX SHOP</h1>
          <p className="text-text-muted text-sm">
            {isLogin ? app.t('auth.login') : app.t('auth.register')}
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex mb-6 bg-bg-primary rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-all ${
                isLogin ? 'btn-neon text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {app.t('auth.login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-all ${
                !isLogin ? 'btn-neon text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {app.t('auth.register')}
            </button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">
                {app.t('auth.username')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={app.t('auth.username')}
                  className="input-gaming w-full pl-10 pr-4 py-3 rounded-lg text-sm text-text-primary"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email (register only) */}
            {!isLogin && (
              <div>
                <label className="text-text-secondary text-sm mb-1.5 block">
                  {app.t('auth.email')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={app.t('auth.email')}
                    className="input-gaming w-full pl-10 pr-4 py-3 rounded-lg text-sm text-text-primary"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-text-secondary text-sm mb-1.5 block">
                {app.t('auth.password')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={app.t('auth.password')}
                  className="input-gaming w-full pl-10 pr-12 py-3 rounded-lg text-sm text-text-primary"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {!isLogin && (
              <div>
                <label className="text-text-secondary text-sm mb-1.5 block">
                  {app.t('auth.confirm_password')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={app.t('auth.confirm_password')}
                    className="input-gaming w-full pl-10 pr-4 py-3 rounded-lg text-sm text-text-primary"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-neon w-full py-3 rounded-lg text-white font-bold text-sm"
            >
              {isLogin ? '🔐 ' + app.t('auth.login') : '✨ ' + app.t('auth.register')}
            </button>
          </form>

          {/* Switch */}
          <div className="text-center mt-5">
            <span className="text-text-muted text-sm">
              {isLogin ? app.t('auth.no_account') : app.t('auth.has_account')}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent-cyan text-sm font-bold ml-2 hover:underline"
            >
              {isLogin ? app.t('auth.register') : app.t('auth.login')}
            </button>
          </div>
        </div>

        {/* Decorative */}
        <div className="text-center mt-6 text-text-muted text-xs">
          <p>🔒 {app.lang === 'vi' ? 'Bảo mật bằng mật khẩu mã hóa' : 'Secured with encrypted passwords'}</p>
        </div>
      </div>
    </div>
  );
}
