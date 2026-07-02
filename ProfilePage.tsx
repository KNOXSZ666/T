import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { VIP_LEVELS, formatPrice, formatDate } from '@/data/constants';

export default function ProfilePage() {
  const app = useApp();
  const [tab, setTab] = useState<'info' | 'orders' | 'deposits' | 'history' | 'password'>('info');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!app.currentUser) {
    app.navigate('login');
    return null;
  }

  const user = app.currentUser;
  const vipInfo = VIP_LEVELS[user.vipLevel] || VIP_LEVELS[0];
  const nextVip = VIP_LEVELS[user.vipLevel + 1];
  const vipProgress = nextVip
    ? Math.min(((user.totalDeposited - vipInfo.minDeposit) / (nextVip.minDeposit - vipInfo.minDeposit)) * 100, 100)
    : 100;

  const orders = app.getOrdersByUser();
  const deposits = app.getDepositsByUser();
  const loginHistory = app.getLoginHistoryByUser();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      app.showToast(app.lang === 'vi' ? 'Vui lòng nhập đủ thông tin!' : 'Please fill in all fields!', 'error');
      return;
    }
    if (newPassword.length < 4) {
      app.showToast(app.lang === 'vi' ? 'Mật khẩu phải từ 4 ký tự!' : 'Password must be at least 4 characters!', 'error');
      return;
    }
    const success = app.changePassword(oldPassword, newPassword);
    if (success) {
      setOldPassword('');
      setNewPassword('');
    } else {
      app.showToast(app.lang === 'vi' ? 'Mật khẩu cũ không đúng!' : 'Wrong old password!', 'error');
    }
  };

  const tabs = [
    { key: 'info' as const, icon: '👤', label: app.t('profile.title') },
    { key: 'orders' as const, icon: '🛒', label: app.t('profile.orders') },
    { key: 'deposits' as const, icon: '💰', label: app.t('profile.deposits') },
    { key: 'history' as const, icon: '📋', label: app.t('profile.login_history') },
    { key: 'password' as const, icon: '🔑', label: app.t('profile.change_password') },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fade-in">
      {/* User Card */}
      <div className="glass rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: `linear-gradient(135deg, ${vipInfo.color}30, ${vipInfo.color}10)`, border: `2px solid ${vipInfo.color}50` }}
          >
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-lg text-text-primary truncate">{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: `linear-gradient(135deg, ${vipInfo.color}, ${vipInfo.color}CC)` }}
              >
                {vipInfo.icon} VIP {vipInfo.level} - {app.lang === 'vi' ? vipInfo.nameVi : vipInfo.name}
              </span>
              {app.isAdmin && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-red text-white">
                  ADMIN
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-accent-cyan font-heading font-bold text-lg">{formatPrice(user.balance)}</div>
            <div className="text-text-muted text-xs">{app.t('profile.balance')}</div>
          </div>
        </div>

        {/* VIP Progress */}
        {nextVip && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1">
              <span>{vipInfo.icon} VIP {vipInfo.level}</span>
              <span>{nextVip.icon} VIP {nextVip.level} ({formatPrice(nextVip.minDeposit)})</span>
            </div>
            <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${vipProgress}%`,
                  background: `linear-gradient(90deg, ${vipInfo.color}, ${nextVip.color})`,
                }}
              />
            </div>
            <p className="text-text-muted text-xs mt-1 text-center">
              {app.lang === 'vi' ? 'Đã nạp' : 'Deposited'}: {formatPrice(user.totalDeposited)} • {app.lang === 'vi' ? 'Giảm giá' : 'Discount'}: {vipInfo.discount}%
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              tab === t.key ? 'tab-active' : 'bg-bg-tertiary text-text-secondary hover:bg-bg-card'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {tab === 'info' && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-5">
              <h3 className="font-bold text-text-primary mb-4">{app.t('profile.title')}</h3>
              <div className="space-y-3">
                {[
                  { label: app.t('auth.username'), value: user.username },
                  { label: app.t('auth.email'), value: user.email },
                  { label: app.t('profile.balance'), value: formatPrice(user.balance), highlight: true },
                  { label: app.t('profile.vip'), value: `VIP ${vipInfo.level} - ${app.lang === 'vi' ? vipInfo.nameVi : vipInfo.name} (${vipInfo.discount}% off)` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-text-muted text-sm">{item.label}</span>
                    <span className={`text-sm font-medium ${item.highlight ? 'text-accent-cyan' : 'text-text-primary'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <EmptyState icon="🛒" text={app.t('common.no_data')} />
            ) : (
              orders.reverse().map(order => (
                <div key={order.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-xs">#{order.id.slice(0, 8)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'completed' ? 'bg-accent-green/20 text-accent-green' :
                      order.status === 'pending' ? 'bg-accent-yellow/20 text-accent-yellow' :
                      'bg-accent-red/20 text-accent-red'
                    }`}>
                      {order.status === 'completed' ? app.t('common.complete') : order.status === 'pending' ? app.t('common.pending') : 'Cancelled'}
                    </span>
                  </div>
                  <div className="space-y-1 mb-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-text-secondary">{item.productName} x{item.quantity}</span>
                        <span className="text-text-primary">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-text-muted text-xs">{formatDate(order.createdAt)}</span>
                    <span className="text-accent-cyan font-bold text-sm">{formatPrice(order.total)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="text-accent-green text-xs mt-1">
                      {app.lang === 'vi' ? 'Đã giảm' : 'Discount'}: -{order.discount}%
                      {order.voucherCode && ` (${order.voucherCode})`}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'deposits' && (
          <div className="space-y-3">
            {deposits.length === 0 ? (
              <EmptyState icon="💰" text={app.t('common.no_data')} />
            ) : (
              deposits.reverse().map(deposit => (
                <div key={deposit.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-accent-cyan font-bold">{formatPrice(deposit.amount)}</span>
                      <span className="text-text-muted text-xs ml-2">via {deposit.method}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      deposit.status === 'completed' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-yellow/20 text-accent-yellow'
                    }`}>
                      {deposit.status === 'completed' ? app.t('common.complete') : app.t('common.pending')}
                    </span>
                  </div>
                  <div className="text-text-muted text-xs mt-1">{formatDate(deposit.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-3">
            {loginHistory.length === 0 ? (
              <EmptyState icon="📋" text={app.t('common.no_data')} />
            ) : (
              loginHistory.reverse().slice(0, 20).map(entry => (
                <div key={entry.id} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-accent-green">🔓</span>
                    <div>
                      <div className="text-text-primary text-sm font-medium">{entry.username}</div>
                      <div className="text-text-muted text-xs">{formatDate(entry.createdAt)}</div>
                      <div className="text-text-muted text-[10px] truncate max-w-[250px]">{entry.device}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'password' && (
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold text-text-primary mb-4">{app.t('profile.change_password')}</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-text-secondary text-sm mb-1.5 block">{app.t('profile.old_password')}</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="input-gaming w-full px-4 py-3 rounded-lg text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1.5 block">{app.t('profile.new_password')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input-gaming w-full px-4 py-3 rounded-lg text-sm text-text-primary"
                />
              </div>
              <button type="submit" className="btn-neon w-full py-3 rounded-lg text-white font-bold text-sm">
                {app.t('profile.change_password')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-12 text-text-muted">
      <div className="text-4xl mb-3">{icon}</div>
      <p>{text}</p>
    </div>
  );
}
