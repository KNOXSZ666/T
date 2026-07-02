import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { VIP_LEVELS, formatPrice, formatDate, DEPOSIT_AMOUNTS } from '@/data/constants';

// ========== CART PAGE ==========
export function CartPage() {
  const app = useApp();
  const [voucherCode, setVoucherCode] = useState('');

  if (!app.currentUser) {
    app.navigate('login');
    return null;
  }

  const subtotal = app.getCartTotal();
  const vipLevel = app.currentUser.vipLevel;
  const vipDiscountPercent = VIP_LEVELS[vipLevel]?.discount || 0;
  const voucherDiscountPercent = app.appliedVoucher?.discount || 0;
  const totalDiscountPercent = Math.min(vipDiscountPercent + voucherDiscountPercent, 100);
  const discountAmount = Math.floor(subtotal * totalDiscountPercent / 100);
  const total = subtotal - discountAmount;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold gradient-text mb-6">🛒 {app.t('cart.title')}</h1>

      {app.cart.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <div className="text-6xl mb-4 animate-float">🛒</div>
          <p className="text-lg mb-4">{app.t('cart.empty')}</p>
          <button onClick={() => app.navigate('home')} className="btn-neon text-white px-6 py-3 rounded-lg font-bold">
            {app.lang === 'vi' ? 'Tiếp tục mua sắm' : 'Continue Shopping'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cart Items */}
          {app.cart.map(item => (
            <div key={item.product.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-bg-primary flex items-center justify-center text-2xl shrink-0">
                {item.product.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-text-primary font-medium text-sm truncate">
                  {app.lang === 'vi' ? item.product.name : item.product.nameEn}
                </h3>
                <p className="text-accent-cyan font-bold text-sm">{formatPrice(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => app.updateCartQuantity(item.product.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-bg-primary text-text-primary flex items-center justify-center text-sm hover:bg-bg-tertiary"
                >
                  −
                </button>
                <span className="text-text-primary font-bold text-sm w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => app.updateCartQuantity(item.product.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-bg-primary text-text-primary flex items-center justify-center text-sm hover:bg-bg-tertiary"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => app.removeFromCart(item.product.id)}
                className="text-accent-red text-sm hover:underline shrink-0"
              >
                {app.t('cart.remove')}
              </button>
            </div>
          ))}

          {/* Voucher */}
          <div className="glass rounded-xl p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                placeholder={app.t('cart.voucher')}
                className="input-gaming flex-1 px-4 py-2.5 rounded-lg text-sm text-text-primary"
              />
              <button
                onClick={() => {
                  if (app.applyVoucher(voucherCode)) setVoucherCode('');
                }}
                className="btn-neon text-white px-4 py-2.5 rounded-lg text-sm font-bold"
              >
                {app.t('cart.apply')}
              </button>
            </div>
            {app.appliedVoucher && (
              <div className="mt-2 flex items-center justify-between bg-accent-green/10 rounded-lg p-2">
                <span className="text-accent-green text-xs font-bold">
                  🎟️ {app.appliedVoucher.code} (-{app.appliedVoucher.discount}%)
                </span>
                <button onClick={app.removeVoucher} className="text-accent-red text-xs">✕</button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="glass rounded-xl p-5">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">{app.lang === 'vi' ? 'Tạm tính' : 'Subtotal'}</span>
                <span className="text-text-primary">{formatPrice(subtotal)}</span>
              </div>
              {vipDiscountPercent > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-accent-yellow">{app.t('cart.vip_discount')} (-{vipDiscountPercent}%)</span>
                  <span className="text-accent-yellow">-{formatPrice(Math.floor(subtotal * vipDiscountPercent / 100))}</span>
                </div>
              )}
              {voucherDiscountPercent > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-accent-green">{app.t('cart.discount')} (-{voucherDiscountPercent}%)</span>
                  <span className="text-accent-green">-{formatPrice(Math.floor(subtotal * voucherDiscountPercent / 100))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span className="text-text-primary">{app.t('cart.total')}</span>
                <span className="text-accent-cyan">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="text-text-muted text-xs mb-4">
              {app.t('profile.balance')}: <span className="text-accent-cyan font-bold">{formatPrice(app.currentUser.balance)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={app.clearCart}
                className="flex-1 bg-accent-red/20 text-accent-red py-3 rounded-lg font-bold text-sm hover:bg-accent-red/30 transition-all"
              >
                {app.t('common.cancel')}
              </button>
              <button
                onClick={() => app.placeOrder()}
                className="btn-neon flex-1 text-white py-3 rounded-lg font-bold text-sm"
              >
                {app.t('cart.checkout')} ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== DEPOSIT PAGE ==========
export function DepositPage() {
  const app = useApp();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('momo');
  const [customAmount, setCustomAmount] = useState('');

  if (!app.currentUser) {
    app.navigate('login');
    return null;
  }

  const deposits = app.getDepositsByUser();

  const methods = [
    { id: 'momo', name: app.t('deposit.momo'), icon: '📱' },
    { id: 'bank', name: app.t('deposit.bank'), icon: '🏦' },
    { id: 'card', name: app.t('deposit.card'), icon: '📞' },
  ];

  const handleDeposit = () => {
    const depositAmount = amount || Number(customAmount);
    if (!depositAmount || depositAmount < 10000) {
      app.showToast(app.lang === 'vi' ? 'Số tiền tối thiểu 10,000đ!' : 'Minimum amount is 10,000đ!', 'error');
      return;
    }
    app.createDeposit(depositAmount, methods.find(m => m.id === method)?.name || method);
    setAmount(0);
    setCustomAmount('');
  };

  const bankInfo = {
    bank: 'MB Bank',
    account: 'NGUYEN MINH',
    number: '0123456789',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold gradient-text mb-6">💰 {app.t('deposit.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Form */}
        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold text-text-primary mb-4">{app.t('deposit.amount')}</h3>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {DEPOSIT_AMOUNTS.map(a => (
                <button
                  key={a}
                  onClick={() => { setAmount(a); setCustomAmount(''); }}
                  className={`py-3 rounded-lg text-sm font-bold transition-all ${
                    amount === a
                      ? 'btn-neon text-white'
                      : 'bg-bg-primary text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  {(a / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <input
              type="number"
              value={customAmount}
              onChange={e => { setCustomAmount(e.target.value); setAmount(0); }}
              placeholder={app.lang === 'vi' ? 'Hoặc nhập số tiền khác...' : 'Or enter custom amount...'}
              className="input-gaming w-full px-4 py-3 rounded-lg text-sm text-text-primary mb-4"
            />

            <h3 className="font-bold text-text-primary mb-3">{app.t('deposit.method')}</h3>
            <div className="space-y-2">
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    method === m.id
                      ? 'tab-active'
                      : 'bg-bg-primary text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-sm font-medium">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Info */}
          {method === 'bank' && (
            <div className="glass rounded-xl p-5">
              <h3 className="font-bold text-text-primary mb-3">🏦 {app.lang === 'vi' ? 'Thông tin chuyển khoản' : 'Bank Transfer Info'}</h3>
              <div className="space-y-2">
                {[
                  { label: 'Ngân hàng', value: bankInfo.bank },
                  { label: 'Chủ TK', value: bankInfo.account },
                  { label: 'Số TK', value: bankInfo.number },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary text-sm font-mono">{item.value}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.value);
                          app.showToast(app.t('common.copied'), 'success');
                        }}
                        className="text-accent-cyan text-xs hover:underline"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleDeposit}
            className="btn-neon w-full py-3 rounded-lg text-white font-bold text-sm"
          >
            {app.t('deposit.confirm')} 💰
          </button>
        </div>

        {/* Deposit History */}
        <div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold text-text-primary mb-3">{app.t('deposit.history')}</h3>
            {deposits.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <div className="text-3xl mb-2">💰</div>
                <p>{app.t('common.no_data')}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {deposits.reverse().map(d => (
                  <div key={d.id} className="bg-bg-primary rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-accent-cyan font-bold text-sm">+{formatPrice(d.amount)}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        d.status === 'completed' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-yellow/20 text-accent-yellow'
                      }`}>
                        {d.status === 'completed' ? app.t('common.complete') : app.t('common.pending')}
                      </span>
                    </div>
                    <div className="text-text-muted text-xs mt-1">{d.method} • {formatDate(d.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== ABOUT PAGE ==========
export function AboutPage() {
  const app = useApp();

  const features = [
    { icon: '🎮', title: app.lang === 'vi' ? 'Mod Game Chất Lượng' : 'Quality Game Mods', desc: app.lang === 'vi' ? 'Các bản mod được test kỹ lưỡng, cập nhật liên tục' : 'Thoroughly tested mods, continuously updated' },
    { icon: '🔒', title: app.lang === 'vi' ? 'An Toàn & Bảo Mật' : 'Safe & Secure', desc: app.lang === 'vi' ? 'Không chứa mã độc, an toàn cho thiết bị của bạn' : 'No malware, safe for your device' },
    { icon: '⚡', title: app.lang === 'vi' ? 'Giao Hàng Nhanh' : 'Fast Delivery', desc: app.lang === 'vi' ? 'Nhận sản phẩm ngay sau khi thanh toán' : 'Get products instantly after payment' },
    { icon: '🎧', title: app.lang === 'vi' ? 'Hỗ Trợ 24/7' : '24/7 Support', desc: app.lang === 'vi' ? 'Đội ngũ hỗ trợ sẵn sàng giải đáp mọi thắc mắc' : 'Support team ready to help anytime' },
    { icon: '👑', title: app.lang === 'vi' ? 'Hệ Thống VIP' : 'VIP System', desc: app.lang === 'vi' ? '5 cấp VIP với ưu đãi giảm giá lên đến 25%' : '5 VIP levels with up to 25% discount' },
    { icon: '🎟️', title: app.lang === 'vi' ? 'Voucher & Khuyến Mãi' : 'Vouchers & Promos', desc: app.lang === 'vi' ? 'Nhiều mã giảm giá và chương trình khuyến mãi' : 'Multiple discount codes and promotions' },
  ];

  const contacts = [
    { icon: '📱', label: 'Zalo', value: '0912345678' },
    { icon: '💬', label: 'Telegram', value: '@knoxshop' },
    { icon: '📘', label: 'Facebook', value: 'KNOX Shop' },
    { icon: '📧', label: 'Email', value: 'support@knox.vn' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4 animate-float">🎮</div>
        <h1 className="font-heading text-3xl sm:text-4xl font-black gradient-text mb-3">KNOX SHOP</h1>
        <p className="text-text-secondary max-w-lg mx-auto">{app.t('about.desc')}</p>
      </div>

      {/* Features */}
      <section className="mb-10">
        <h2 className="font-heading text-xl font-bold text-text-primary mb-4 text-center">
          {app.t('about.features')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass rounded-xl p-5 card-hover text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-text-primary text-sm mb-1">{f.title}</h3>
              <p className="text-text-muted text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-10">
        <h2 className="font-heading text-xl font-bold text-text-primary mb-4 text-center">
          {app.t('about.contact')}
        </h2>
        <div className="glass rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-bg-primary rounded-lg">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <div className="text-text-muted text-xs">{c.label}</div>
                  <div className="text-text-primary text-sm font-medium">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section>
        <h2 className="font-heading text-xl font-bold text-text-primary mb-4 text-center">
          {app.lang === 'vi' ? '📋 Chính sách' : '📋 Policies'}
        </h2>
        <div className="glass rounded-xl p-5 space-y-3">
          {[
            { icon: '✅', text: app.lang === 'vi' ? 'Bảo hành sản phẩm trọn đời' : 'Lifetime product warranty' },
            { icon: '🔄', text: app.lang === 'vi' ? 'Đổi trả miễn phí nếu lỗi' : 'Free replacement if defective' },
            { icon: '🛡️', text: app.lang === 'vi' ? 'Cam kết hoàn tiền 100%' : '100% money-back guarantee' },
            { icon: '📞', text: app.lang === 'vi' ? 'Hỗ trợ sau bán hàng tận tâm' : 'Dedicated after-sales support' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-text-secondary text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ========== TICKET PAGE ==========
export function TicketPage() {
  const app = useApp();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  if (!app.currentUser) {
    app.navigate('login');
    return null;
  }

  const tickets = app.getTicketsByUser();

  const handleCreate = () => {
    if (!subject.trim() || !message.trim()) return;
    app.createTicket(subject.trim(), message.trim());
    setSubject('');
    setMessage('');
    setShowForm(false);
  };

  const statusColors: Record<string, string> = {
    open: 'bg-accent-green/20 text-accent-green',
    in_progress: 'bg-accent-yellow/20 text-accent-yellow',
    resolved: 'bg-accent-cyan/20 text-accent-cyan',
    closed: 'bg-text-muted/20 text-text-muted',
  };

  const statusLabels: Record<string, string> = {
    open: app.t('ticket.status.open'),
    in_progress: app.t('ticket.status.in_progress'),
    resolved: app.t('ticket.status.resolved'),
    closed: app.t('ticket.status.closed'),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold gradient-text">🎧 {app.t('ticket.title')}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-neon text-white text-sm px-4 py-2 rounded-lg font-bold"
        >
          {showForm ? '✕' : '+ ' + app.t('ticket.create')}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-5 mb-6 space-y-3 animate-slide-up">
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={app.t('ticket.subject')}
            className="input-gaming w-full px-4 py-3 rounded-lg text-sm text-text-primary"
          />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={app.t('ticket.message')}
            rows={4}
            className="input-gaming w-full px-4 py-3 rounded-lg text-sm text-text-primary resize-none"
          />
          <button onClick={handleCreate} className="btn-neon text-white px-6 py-2.5 rounded-lg text-sm font-bold">
            {app.t('ticket.send')} 📨
          </button>
        </div>
      )}

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <div className="text-4xl mb-3">🎫</div>
            <p>{app.t('common.no_data')}</p>
          </div>
        ) : (
          tickets.slice().reverse().map(ticket => (
            <div key={ticket.id} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-text-primary font-bold text-sm">{ticket.subject}</h3>
                  <span className="text-text-muted text-xs">{formatDate(ticket.createdAt)}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[ticket.status]}`}>
                  {statusLabels[ticket.status]}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {ticket.messages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-lg ${msg.isAdmin ? 'bg-accent-purple/10 ml-6' : 'bg-bg-primary mr-6'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-text-primary text-xs font-bold">{msg.sender}</span>
                      {msg.isAdmin && <span className="text-accent-purple text-[10px] font-bold">ADMIN</span>}
                    </div>
                    <p className="text-text-secondary text-xs">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply */}
              {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                <div className="flex gap-2">
                  <input
                    value={replyTexts[ticket.id] || ''}
                    onChange={e => setReplyTexts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    placeholder={app.t('ticket.reply') + '...'}
                    className="input-gaming flex-1 px-3 py-2 rounded-lg text-xs text-text-primary"
                  />
                  <button
                    onClick={() => {
                      const text = replyTexts[ticket.id];
                      if (text?.trim()) {
                        app.replyTicket(ticket.id, text.trim());
                        setReplyTexts(prev => ({ ...prev, [ticket.id]: '' }));
                      }
                    }}
                    className="btn-neon text-white px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    {app.t('ticket.send')}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ========== NOTIFICATION PAGE ==========
export function NotificationPage() {
  const app = useApp();

  if (!app.currentUser) {
    app.navigate('login');
    return null;
  }

  const notifications = app.getNotificationsByUser();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold gradient-text">🔔 {app.t('notif.title')}</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={app.markAllNotificationsRead}
            className="text-accent-cyan text-xs hover:underline"
          >
            {app.t('notif.mark_read')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <div className="text-4xl mb-3">🔔</div>
          <p>{app.t('notif.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.slice().reverse().map(notif => (
            <div
              key={notif.id}
              className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                notif.read ? 'opacity-60' : 'border-l-2 border-accent-cyan'
              }`}
              onClick={() => app.markNotificationRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{notif.read ? '📭' : '📬'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary font-bold text-sm">{notif.title}</h3>
                  <p className="text-text-secondary text-xs mt-1">{notif.message}</p>
                  <span className="text-text-muted text-[10px] mt-1 block">{formatDate(notif.createdAt)}</span>
                </div>
                {!notif.read && <span className="w-2 h-2 rounded-full bg-accent-cyan shrink-0 mt-2" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
