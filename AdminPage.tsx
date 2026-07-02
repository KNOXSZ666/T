import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatPrice, formatDate } from '@/data/constants';
import type { Product, Voucher } from '@/data/constants';

export default function AdminPage() {
  const app = useApp();
  const [tab, setTab] = useState<'dashboard' | 'users' | 'orders' | 'products' | 'vouchers' | 'tickets' | 'broadcasts' | 'logs'>('dashboard');

  if (!app.currentUser || !app.isAdmin) {
    app.navigate('home');
    return null;
  }

  const users = app.getAllUsers().filter(u => u.id !== 'admin-001');
  const orders = app.getAllOrders();
  const tickets = app.getAllTickets();
  const broadcasts = app.getBroadcasts();
  const logs = app.getAdminLogs();

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const tabs = [
    { key: 'dashboard' as const, icon: '📊', label: app.t('admin.dashboard') },
    { key: 'users' as const, icon: '👥', label: app.t('admin.users') },
    { key: 'orders' as const, icon: '🛒', label: app.t('admin.orders') },
    { key: 'products' as const, icon: '📦', label: app.t('admin.products') },
    { key: 'vouchers' as const, icon: '🎟️', label: app.t('admin.vouchers') },
    { key: 'tickets' as const, icon: '🎫', label: app.t('admin.tickets') },
    { key: 'broadcasts' as const, icon: '📢', label: app.t('admin.broadcasts') },
    { key: 'logs' as const, icon: '📝', label: app.t('admin.logs') },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold gradient-text mb-6">⚙️ {app.t('nav.admin')}</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              tab === t.key ? 'tab-active' : 'bg-bg-tertiary text-text-secondary hover:bg-bg-card'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '💰', label: app.t('admin.total_revenue'), value: formatPrice(totalRevenue), color: '#00E676' },
              { icon: '👥', label: app.t('admin.total_users'), value: users.length.toString(), color: '#00D2FF' },
              { icon: '🛒', label: app.t('admin.total_orders'), value: orders.length.toString(), color: '#6C5CE7' },
              { icon: '⏳', label: app.t('admin.pending_orders'), value: pendingOrders.toString(), color: '#FFD600' },
            ].map(stat => (
              <div key={stat.label} className="glass rounded-xl p-4 card-hover">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="font-heading font-bold text-lg" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-text-muted text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold text-text-primary mb-3">🛒 {app.lang === 'vi' ? 'Đơn hàng gần đây' : 'Recent Orders'}</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orders.slice(-5).reverse().map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-text-primary text-sm font-medium">{order.username}</span>
                    <span className="text-text-muted text-xs ml-2">#{order.id.slice(0, 8)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-accent-cyan font-bold text-sm">{formatPrice(order.total)}</span>
                    <span className={`ml-2 text-xs font-bold ${
                      order.status === 'completed' ? 'text-accent-green' : order.status === 'pending' ? 'text-accent-yellow' : 'text-accent-red'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-bold text-text-primary">👥 {app.t('admin.users')} ({users.length})</h3>
          {users.map(user => (
            <div key={user.id} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{user.avatar}</span>
                  <div>
                    <span className="text-text-primary font-medium text-sm">{user.username}</span>
                    {user.banned && <span className="ml-2 text-xs text-accent-red font-bold">BANNED</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      app.adminUpdateUser(user.id, { balance: user.balance + 50000 });
                      app.showToast(`+50,000đ for ${user.username}`, 'success');
                    }}
                    className="text-xs bg-accent-green/20 text-accent-green px-3 py-1 rounded-lg hover:bg-accent-green/30 transition-all"
                  >
                    +50k
                  </button>
                  <button
                    onClick={() => {
                      app.adminUpdateUser(user.id, { banned: !user.banned });
                      app.showToast(user.banned ? `Unbanned ${user.username}` : `Banned ${user.username}`, 'info');
                    }}
                    className={`text-xs px-3 py-1 rounded-lg transition-all ${
                      user.banned ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'
                    }`}
                  >
                    {user.banned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-text-muted">
                <span>{app.t('profile.balance')}: <span className="text-accent-cyan">{formatPrice(user.balance)}</span></span>
                <span>VIP: {user.vipLevel}</span>
                <span>{app.t('profile.deposits')}: {formatPrice(user.totalDeposited)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-bold text-text-primary">🛒 {app.t('admin.orders')} ({orders.length})</h3>
          {orders.slice().reverse().map(order => (
            <div key={order.id} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-text-primary font-medium text-sm">{order.username}</span>
                  <span className="text-text-muted text-xs ml-2">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent-cyan font-bold">{formatPrice(order.total)}</span>
                  <select
                    value={order.status}
                    onChange={e => app.adminUpdateOrderStatus(order.id, e.target.value as any)}
                    className="bg-bg-primary text-text-primary text-xs rounded px-2 py-1 border border-border"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="text-text-muted text-xs">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.productName} x{item.quantity}
                    {i < order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
              <div className="text-text-muted text-xs mt-1">{formatDate(order.createdAt)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <ProductsAdmin app={app} />
      )}

      {/* Vouchers */}
      {tab === 'vouchers' && (
        <VouchersAdmin app={app} />
      )}

      {/* Tickets */}
      {tab === 'tickets' && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-bold text-text-primary">🎫 {app.t('admin.tickets')} ({tickets.length})</h3>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <div className="text-3xl mb-2">🎫</div>
              <p>{app.t('common.no_data')}</p>
            </div>
          ) : (
            tickets.slice().reverse().map(ticket => (
              <TicketAdminCard key={ticket.id} ticket={ticket} app={app} />
            ))
          )}
        </div>
      )}

      {/* Broadcasts */}
      {tab === 'broadcasts' && (
        <BroadcastsAdmin app={app} broadcasts={broadcasts} />
      )}

      {/* Logs */}
      {tab === 'logs' && (
        <div className="space-y-2 animate-fade-in">
          <h3 className="font-bold text-text-primary mb-3">📝 {app.t('admin.logs')} ({logs.length})</h3>
          {logs.slice().reverse().slice(0, 50).map(log => (
            <div key={log.id} className="bg-bg-tertiary rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-accent-purple font-bold">{log.action}</span>
                <span className="text-text-muted">{log.target}</span>
              </div>
              <p className="text-text-secondary text-xs mt-1">{log.details}</p>
              <span className="text-text-muted text-[10px]">{formatDate(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== Products Admin ==========
function ProductsAdmin({ app }: { app: any }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', nameEn: '', category: 'mod-game', price: 0, priceText: '',
    description: '', descriptionEn: '', icon: '🎮', hot: false, popular: false, active: true,
  });

  const handleAdd = () => {
    if (!form.name) return;
    app.adminAddProduct({ ...form });
    setShowForm(false);
    setForm({ name: '', nameEn: '', category: 'mod-game', price: 0, priceText: '', description: '', descriptionEn: '', icon: '🎮', hot: false, popular: false, active: true });
    app.showToast(app.lang === 'vi' ? 'Đã thêm sản phẩm!' : 'Product added!', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text-primary">📦 {app.t('admin.products')}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-neon text-white text-xs px-4 py-2 rounded-lg font-bold"
        >
          {showForm ? '✕' : '+ ' + (app.lang === 'vi' ? 'Thêm' : 'Add')}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-5 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Tên (VI)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
            <input placeholder="Name (EN)" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
            <input placeholder="Giá (số)" type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
            <input placeholder="Giá (text)" value={form.priceText} onChange={e => setForm({...form, priceText: e.target.value})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary">
              <option value="mod-game">Mod Game</option>
              <option value="script-roblox">Script Roblox</option>
              <option value="other">Khác</option>
            </select>
            <input placeholder="Icon (emoji)" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
          </div>
          <input placeholder="Mô tả (VI)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-gaming w-full px-3 py-2 rounded-lg text-sm text-text-primary" />
          <input placeholder="Description (EN)" value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})} className="input-gaming w-full px-3 py-2 rounded-lg text-sm text-text-primary" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-text-secondary text-sm">
              <input type="checkbox" checked={form.hot} onChange={e => setForm({...form, hot: e.target.checked})} /> 🔥 Hot
            </label>
            <label className="flex items-center gap-2 text-text-secondary text-sm">
              <input type="checkbox" checked={form.popular} onChange={e => setForm({...form, popular: e.target.checked})} /> ⭐ Popular
            </label>
          </div>
          <button onClick={handleAdd} className="btn-neon text-white px-6 py-2 rounded-lg text-sm font-bold">
            {app.lang === 'vi' ? 'Thêm sản phẩm' : 'Add Product'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {app.products.map((p: Product) => (
          <div key={p.id} className="glass rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <span className="text-text-primary text-sm font-medium">{p.name}</span>
                <span className="text-text-muted text-xs ml-2">{p.price === 0 ? p.priceText : formatPrice(p.price)}</span>
                <div className="flex gap-1 mt-0.5">
                  {p.hot && <span className="text-[10px] bg-accent-red/20 text-accent-red px-1.5 py-0.5 rounded">HOT</span>}
                  {p.popular && <span className="text-[10px] bg-accent-yellow/20 text-accent-yellow px-1.5 py-0.5 rounded">POPULAR</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => app.adminUpdateProduct(p.id, { active: !p.active })}
                className={`text-xs px-3 py-1 rounded-lg ${p.active ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'}`}
              >
                {p.active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => {
                  if (confirm(app.lang === 'vi' ? 'Xóa sản phẩm này?' : 'Delete this product?')) {
                    app.adminDeleteProduct(p.id);
                    app.showToast(app.lang === 'vi' ? 'Đã xóa!' : 'Deleted!', 'info');
                  }
                }}
                className="text-xs bg-accent-red/20 text-accent-red px-3 py-1 rounded-lg"
              >
                {app.t('common.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== Vouchers Admin ==========
function VouchersAdmin({ app }: { app: any }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount: 10, minOrder: 0, maxUses: 100, expiresAt: '2025-12-31' });

  const vouchers = app.vouchers;

  const handleAdd = () => {
    if (!form.code) return;
    app.adminAddVoucher({
      code: form.code.toUpperCase(),
      discount: form.discount,
      minOrder: form.minOrder,
      maxUses: form.maxUses,
      usedCount: 0,
      expiresAt: form.expiresAt,
      active: true,
    });
    setShowForm(false);
    setForm({ code: '', discount: 10, minOrder: 0, maxUses: 100, expiresAt: '2025-12-31' });
    app.showToast(app.lang === 'vi' ? 'Đã thêm voucher!' : 'Voucher added!', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text-primary">🎟️ {app.t('admin.vouchers')}</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-neon text-white text-xs px-4 py-2 rounded-lg font-bold">
          {showForm ? '✕' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-5 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
            <input placeholder="Discount %" type="number" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
            <input placeholder="Min Order" type="number" value={form.minOrder} onChange={e => setForm({...form, minOrder: Number(e.target.value)})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
            <input placeholder="Max Uses" type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: Number(e.target.value)})} className="input-gaming px-3 py-2 rounded-lg text-sm text-text-primary" />
          </div>
          <button onClick={handleAdd} className="btn-neon text-white px-6 py-2 rounded-lg text-sm font-bold">
            {app.lang === 'vi' ? 'Thêm voucher' : 'Add Voucher'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {vouchers.map((v: Voucher) => (
          <div key={v.id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-accent-cyan font-bold font-mono">{v.code}</span>
              <div className="flex gap-3 text-xs text-text-muted mt-1">
                <span>-{v.discount}%</span>
                <span>Min: {formatPrice(v.minOrder)}</span>
                <span>{v.usedCount}/{v.maxUses}</span>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${v.active ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'}`}>
              {v.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== Ticket Admin Card ==========
function TicketAdminCard({ ticket, app }: { ticket: any; app: any }) {
  const [reply, setReply] = useState('');
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-text-primary font-medium text-sm">{ticket.subject}</span>
          <span className="text-text-muted text-xs ml-2">by {ticket.username}</span>
        </div>
        <select
          value={ticket.status}
          onChange={e => app.updateTicketStatus(ticket.id, e.target.value)}
          className="bg-bg-primary text-text-primary text-xs rounded px-2 py-1 border border-border"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
        {ticket.messages.map((msg: any, i: number) => (
          <div key={i} className={`text-xs p-2 rounded-lg ${msg.isAdmin ? 'bg-accent-purple/10 ml-4' : 'bg-bg-primary mr-4'}`}>
            <span className="font-bold text-text-primary">{msg.sender}: </span>
            <span className="text-text-secondary">{msg.message}</span>
          </div>
        ))}
      </div>

      {showReply ? (
        <div className="flex gap-2">
          <input
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Reply..."
            className="input-gaming flex-1 px-3 py-2 rounded-lg text-xs text-text-primary"
          />
          <button
            onClick={() => {
              if (reply.trim()) {
                app.adminReplyTicket(ticket.id, reply.trim());
                setReply('');
                setShowReply(false);
              }
            }}
            className="btn-neon text-white px-4 py-2 rounded-lg text-xs font-bold"
          >
            Send
          </button>
        </div>
      ) : (
        <button onClick={() => setShowReply(true)} className="text-xs text-accent-cyan hover:underline">
          💬 Reply
        </button>
      )}
    </div>
  );
}

// ========== Broadcasts Admin ==========
function BroadcastsAdmin({ app, broadcasts }: { app: any; broadcasts: any[] }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    app.adminCreateBroadcast(title.trim(), message.trim());
    setTitle('');
    setMessage('');
    app.showToast(app.lang === 'vi' ? 'Đã gửi thông báo!' : 'Broadcast sent!', 'success');
  };

  return (
    <div className="animate-fade-in">
      <h3 className="font-bold text-text-primary mb-4">📢 {app.t('admin.broadcasts')}</h3>

      <div className="glass rounded-xl p-5 mb-6 space-y-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={app.lang === 'vi' ? 'Tiêu đề thông báo' : 'Broadcast title'}
          className="input-gaming w-full px-3 py-2 rounded-lg text-sm text-text-primary"
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={app.lang === 'vi' ? 'Nội dung thông báo' : 'Broadcast message'}
          rows={3}
          className="input-gaming w-full px-3 py-2 rounded-lg text-sm text-text-primary resize-none"
        />
        <button onClick={handleSend} className="btn-neon text-white px-6 py-2 rounded-lg text-sm font-bold">
          📢 {app.lang === 'vi' ? 'Gửi thông báo' : 'Send Broadcast'}
        </button>
      </div>

      <div className="space-y-2">
        {broadcasts.slice().reverse().map((bc: any) => (
          <div key={bc.id} className="glass rounded-xl p-4">
            <h4 className="text-text-primary font-medium text-sm">{bc.title}</h4>
            <p className="text-text-secondary text-xs mt-1">{bc.message}</p>
            <span className="text-text-muted text-[10px]">{formatDate(bc.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
