// ========== TYPES ==========
export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  balance: number;
  totalDeposited: number;
  vipLevel: number;
  avatar: string;
  createdAt: string;
  banned: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  priceText: string;
  description: string;
  descriptionEn: string;
  icon: string;
  hot: boolean;
  popular: boolean;
  active: boolean;
}

export interface Order {
  id: string;
  userId: string;
  username: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  voucherCode: string;
  discount: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Deposit {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: TicketMessage[];
  createdAt: string;
}

export interface TicketMessage {
  sender: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  username: string;
  device: string;
  createdAt: string;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
}

export type LangKey = 'vi' | 'en';

// ========== ADMIN CREDENTIALS (HARDCODED) ==========
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'nguyenmm2803';
export const ADMIN_ID = 'admin-001';

// ========== VIP LEVELS ==========
export const VIP_LEVELS = [
  { level: 0, name: 'None', nameVi: 'Chưa VIP', minDeposit: 0, discount: 0, color: '#6B6B80', icon: '⭐' },
  { level: 1, name: 'Bronze', nameVi: 'Đồng', minDeposit: 50000, discount: 5, color: '#CD7F32', icon: '🥉' },
  { level: 2, name: 'Silver', nameVi: 'Bạc', minDeposit: 200000, discount: 10, color: '#C0C0C0', icon: '🥈' },
  { level: 3, name: 'Gold', nameVi: 'Vàng', minDeposit: 500000, discount: 15, color: '#FFD700', icon: '🥇' },
  { level: 4, name: 'Platinum', nameVi: 'Bạch Kim', minDeposit: 2000000, discount: 20, color: '#E5E4E2', icon: '💎' },
  { level: 5, name: 'Diamond', nameVi: 'Kim Cương', minDeposit: 5000000, discount: 25, color: '#00D2FF', icon: '👑' },
];

export function getVipLevel(totalDeposited: number): number {
  for (let i = VIP_LEVELS.length - 1; i >= 0; i--) {
    if (totalDeposited >= VIP_LEVELS[i].minDeposit) return VIP_LEVELS[i].level;
  }
  return 0;
}

// ========== PRODUCTS ==========
export const INITIAL_PRODUCTS: Product[] = [
  // MOD GAME - CÂU CÁ VẠN CÂN
  {
    id: 'mod-skill',
    name: 'Mod Skill',
    nameEn: 'Skill Mod',
    category: 'mod-game',
    price: 10000,
    priceText: '10k',
    description: 'Mod kỹ năng câu cá - Tăng kỹ năng đánh cá lên mức tối đa',
    descriptionEn: 'Fishing skill mod - Max out your fishing skills',
    icon: '🎯',
    hot: true,
    popular: true,
    active: true,
  },
  {
    id: 'mod-fish',
    name: 'Mod Cá',
    nameEn: 'Fish Mod',
    category: 'mod-game',
    price: 20000,
    priceText: '20k',
    description: 'Mod cá - Câu được cá hiếm và cá lớn mọi lúc',
    descriptionEn: 'Fish mod - Catch rare and large fish every time',
    icon: '🐟',
    hot: true,
    popular: true,
    active: true,
  },
  {
    id: 'mod-level',
    name: 'Mod Level',
    nameEn: 'Level Mod',
    category: 'mod-game',
    price: 10000,
    priceText: '10k',
    description: 'Mod cấp độ - Tăng level nhanh chóng',
    descriptionEn: 'Level mod - Level up quickly',
    icon: '📊',
    hot: false,
    popular: true,
    active: true,
  },
  {
    id: 'mod-item',
    name: 'Mod Item',
    nameEn: 'Item Mod',
    category: 'mod-game',
    price: 20000,
    priceText: '20k',
    description: 'Mod vật phẩm - Nhận tất cả vật phẩm hiếm',
    descriptionEn: 'Item mod - Get all rare items',
    icon: '🎒',
    hot: true,
    popular: false,
    active: true,
  },
  {
    id: 'mod-pet',
    name: 'Mod Pet',
    nameEn: 'Pet Mod',
    category: 'mod-game',
    price: 20000,
    priceText: '20k',
    description: 'Mod thú cưng - Mở khóa tất cả pet',
    descriptionEn: 'Pet mod - Unlock all pets',
    icon: '🐾',
    hot: false,
    popular: true,
    active: true,
  },
  {
    id: 'mod-diamond',
    name: 'Mod Kim Cương',
    nameEn: 'Diamond Mod',
    category: 'mod-game',
    price: 30000,
    priceText: '30k/1tr KC',
    description: 'Mod kim cương - Nhận kim cương không giới hạn (30k/1tr KC)',
    descriptionEn: 'Diamond mod - Unlimited diamonds (30k/1m diamonds)',
    icon: '💎',
    hot: true,
    popular: true,
    active: true,
  },
  {
    id: 'mod-full',
    name: 'Câu Cá Vạn Cân Full',
    nameEn: 'Full Fishing Mod Pack',
    category: 'mod-game',
    price: 0,
    priceText: 'Liên hệ',
    description: 'Bản mod đầy đủ - Tất cả tính năng mod câu cá vạn cân. Liên hệ để biết giá.',
    descriptionEn: 'Full mod pack - All fishing mod features. Contact for pricing.',
    icon: '🏆',
    hot: true,
    popular: true,
    active: true,
  },
  // SCRIPT ROBLOX
  {
    id: 'script-sniper',
    name: 'Sniper Arena',
    nameEn: 'Sniper Arena Script',
    category: 'script-roblox',
    price: 15000,
    priceText: '15k',
    description: 'Script Sniper Arena cho Roblox - Auto aim, ESP, và nhiều tính năng khác',
    descriptionEn: 'Sniper Arena script for Roblox - Auto aim, ESP, and more',
    icon: '🔫',
    hot: true,
    popular: true,
    active: true,
  },
  // SẢN PHẨM KHÁC
  {
    id: 'other-banmod',
    name: 'Bản Mod',
    nameEn: 'Mod Pack',
    category: 'other',
    price: 85000,
    priceText: '85k',
    description: 'Bản mod tổng hợp - Đầy đủ tính năng mod cho game',
    descriptionEn: 'Complete mod pack - All mod features for your game',
    icon: '📦',
    hot: false,
    popular: true,
    active: true,
  },
  {
    id: 'other-cauchung',
    name: 'Câu Chung',
    nameEn: 'Shared Fishing',
    category: 'other',
    price: 20000,
    priceText: '20k/giờ',
    description: 'Dịch vụ câu chung - 20k/giờ, chia sẻ tài khoản câu cá',
    descriptionEn: 'Shared fishing service - 20k/hour, shared fishing account',
    icon: '🎣',
    hot: false,
    popular: false,
    active: true,
  },
];

// ========== CATEGORIES ==========
export const CATEGORIES = [
  { id: 'all', name: 'Tất cả', nameEn: 'All' },
  { id: 'mod-game', name: 'Mod Game', nameEn: 'Game Mods' },
  { id: 'script-roblox', name: 'Script Roblox', nameEn: 'Roblox Scripts' },
  { id: 'other', name: 'Khác', nameEn: 'Other' },
];

// ========== INITIAL VOUCHERS ==========
export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'KNOX2024',
    discount: 10,
    minOrder: 20000,
    maxUses: 100,
    usedCount: 0,
    expiresAt: '2025-12-31',
    active: true,
  },
  {
    id: 'v2',
    code: 'WELCOME',
    discount: 5,
    minOrder: 10000,
    maxUses: 500,
    usedCount: 0,
    expiresAt: '2025-12-31',
    active: true,
  },
  {
    id: 'v3',
    code: 'VIP50',
    discount: 50,
    minOrder: 50000,
    maxUses: 10,
    usedCount: 0,
    expiresAt: '2025-06-30',
    active: true,
  },
];

// ========== TRANSLATIONS ==========
export const TRANSLATIONS: Record<string, Record<LangKey, string>> = {
  // Navigation
  'nav.home': { vi: 'Trang chủ', en: 'Home' },
  'nav.products': { vi: 'Sản phẩm', en: 'Products' },
  'nav.cart': { vi: 'Giỏ hàng', en: 'Cart' },
  'nav.profile': { vi: 'Tài khoản', en: 'Account' },
  'nav.admin': { vi: 'Quản trị', en: 'Admin' },
  'nav.login': { vi: 'Đăng nhập', en: 'Login' },
  'nav.about': { vi: 'Giới thiệu', en: 'About' },
  'nav.deposit': { vi: 'Nạp tiền', en: 'Deposit' },
  'nav.tickets': { vi: 'Hỗ trợ', en: 'Support' },
  'nav.notifications': { vi: 'Thông báo', en: 'Notifications' },
  'nav.logout': { vi: 'Đăng xuất', en: 'Logout' },

  // Home
  'home.hero.title': { vi: 'KNOX SHOP', en: 'KNOX SHOP' },
  'home.hero.subtitle': { vi: 'Cửa hàng Mod Game & Script hàng đầu', en: 'Premium Game Mod & Script Shop' },
  'home.hero.desc': { vi: 'Uy tín - Chất lượng - Giá tốt', en: 'Trusted - Quality - Best Price' },
  'home.hot': { vi: '🔥 HOT DEALS', en: '🔥 HOT DEALS' },
  'home.popular': { vi: '⭐ Phổ biến', en: '⭐ Popular' },
  'home.vip.title': { vi: '👑 QUYỀN LỢI VIP', en: '👑 VIP BENEFITS' },
  'home.vip.desc': { vi: 'Nạp tiền để nâng cấp VIP và nhận ưu đãi', en: 'Deposit to upgrade VIP and get benefits' },
  'home.stats.users': { vi: 'Thành viên', en: 'Members' },
  'home.stats.products': { vi: 'Sản phẩm', en: 'Products' },
  'home.stats.orders': { vi: 'Đơn hàng', en: 'Orders' },

  // Auth
  'auth.login': { vi: 'Đăng nhập', en: 'Login' },
  'auth.register': { vi: 'Đăng ký', en: 'Register' },
  'auth.username': { vi: 'Tên đăng nhập', en: 'Username' },
  'auth.password': { vi: 'Mật khẩu', en: 'Password' },
  'auth.email': { vi: 'Email', en: 'Email' },
  'auth.confirm_password': { vi: 'Xác nhận mật khẩu', en: 'Confirm password' },
  'auth.no_account': { vi: 'Chưa có tài khoản?', en: "Don't have an account?" },
  'auth.has_account': { vi: 'Đã có tài khoản?', en: 'Already have an account?' },
  'auth.login_success': { vi: 'Đăng nhập thành công!', en: 'Login successful!' },
  'auth.register_success': { vi: 'Đăng ký thành công!', en: 'Registration successful!' },
  'auth.login_fail': { vi: 'Sai tên đăng nhập hoặc mật khẩu!', en: 'Wrong username or password!' },
  'auth.register_fail': { vi: 'Tên đăng nhập đã tồn tại!', en: 'Username already exists!' },
  'auth.password_mismatch': { vi: 'Mật khẩu không khớp!', en: 'Passwords do not match!' },

  // Product
  'product.add_to_cart': { vi: 'Thêm vào giỏ', en: 'Add to Cart' },
  'product.buy_now': { vi: 'Mua ngay', en: 'Buy Now' },
  'product.contact': { vi: 'Liên hệ', en: 'Contact' },
  'product.price': { vi: 'Giá', en: 'Price' },
  'product.review': { vi: 'Đánh giá', en: 'Review' },

  // Cart
  'cart.title': { vi: 'Giỏ hàng', en: 'Shopping Cart' },
  'cart.empty': { vi: 'Giỏ hàng trống', en: 'Cart is empty' },
  'cart.total': { vi: 'Tổng cộng', en: 'Total' },
  'cart.voucher': { vi: 'Mã giảm giá', en: 'Voucher code' },
  'cart.apply': { vi: 'Áp dụng', en: 'Apply' },
  'cart.checkout': { vi: 'Thanh toán', en: 'Checkout' },
  'cart.remove': { vi: 'Xóa', en: 'Remove' },
  'cart.discount': { vi: 'Giảm giá', en: 'Discount' },
  'cart.vip_discount': { vi: 'Ưu đãi VIP', en: 'VIP Discount' },
  'cart.voucher_invalid': { vi: 'Mã giảm giá không hợp lệ!', en: 'Invalid voucher code!' },
  'cart.voucher_applied': { vi: 'Đã áp dụng mã giảm giá!', en: 'Voucher applied!' },
  'cart.insufficient_balance': { vi: 'Số dư không đủ!', en: 'Insufficient balance!' },
  'cart.checkout_success': { vi: 'Đặt hàng thành công!', en: 'Order placed successfully!' },

  // Deposit
  'deposit.title': { vi: 'Nạp tiền', en: 'Deposit' },
  'deposit.amount': { vi: 'Số tiền', en: 'Amount' },
  'deposit.method': { vi: 'Phương thức', en: 'Method' },
  'deposit.confirm': { vi: 'Xác nhận nạp', en: 'Confirm Deposit' },
  'deposit.history': { vi: 'Lịch sử nạp', en: 'Deposit History' },
  'deposit.success': { vi: 'Nạp tiền thành công!', en: 'Deposit successful!' },
  'deposit.bank': { vi: 'Chuyển khoản ngân hàng', en: 'Bank Transfer' },
  'deposit.momo': { vi: 'Ví MoMo', en: 'MoMo Wallet' },
  'deposit.card': { vi: 'Thẻ cào', en: 'Phone Card' },

  // Profile
  'profile.title': { vi: 'Tài khoản', en: 'Account' },
  'profile.balance': { vi: 'Số dư', en: 'Balance' },
  'profile.vip': { vi: 'Cấp VIP', en: 'VIP Level' },
  'profile.orders': { vi: 'Đơn hàng', en: 'Orders' },
  'profile.deposits': { vi: 'Lịch sử nạp', en: 'Deposit History' },
  'profile.login_history': { vi: 'Lịch sử đăng nhập', en: 'Login History' },
  'profile.change_password': { vi: 'Đổi mật khẩu', en: 'Change Password' },
  'profile.reviews': { vi: 'Đánh giá của tôi', en: 'My Reviews' },
  'profile.old_password': { vi: 'Mật khẩu cũ', en: 'Old Password' },
  'profile.new_password': { vi: 'Mật khẩu mới', en: 'New Password' },
  'profile.password_changed': { vi: 'Đổi mật khẩu thành công!', en: 'Password changed successfully!' },

  // About
  'about.title': { vi: 'Giới thiệu KNOX Shop', en: 'About KNOX Shop' },
  'about.desc': { vi: 'KNOX Shop là cửa hàng mod game và script hàng đầu Việt Nam. Chúng tôi cung cấp các sản phẩm chất lượng cao với giá cả phải chăng.', en: 'KNOX Shop is the leading game mod and script shop in Vietnam. We provide high-quality products at affordable prices.' },
  'about.features': { vi: 'Tính năng nổi bật', en: 'Key Features' },
  'about.contact': { vi: 'Liên hệ', en: 'Contact' },

  // Ticket
  'ticket.title': { vi: 'Hỗ trợ', en: 'Support' },
  'ticket.create': { vi: 'Tạo yêu cầu', en: 'Create Ticket' },
  'ticket.subject': { vi: 'Chủ đề', en: 'Subject' },
  'ticket.message': { vi: 'Nội dung', en: 'Message' },
  'ticket.send': { vi: 'Gửi', en: 'Send' },
  'ticket.reply': { vi: 'Phản hồi', en: 'Reply' },
  'ticket.status.open': { vi: 'Mở', en: 'Open' },
  'ticket.status.in_progress': { vi: 'Đang xử lý', en: 'In Progress' },
  'ticket.status.resolved': { vi: 'Đã giải quyết', en: 'Resolved' },
  'ticket.status.closed': { vi: 'Đã đóng', en: 'Closed' },

  // Notification
  'notif.title': { vi: 'Thông báo', en: 'Notifications' },
  'notif.empty': { vi: 'Không có thông báo', en: 'No notifications' },
  'notif.mark_read': { vi: 'Đánh dấu đã đọc', en: 'Mark as read' },

  // Admin
  'admin.dashboard': { vi: 'Dashboard', en: 'Dashboard' },
  'admin.users': { vi: 'Người dùng', en: 'Users' },
  'admin.orders': { vi: 'Đơn hàng', en: 'Orders' },
  'admin.products': { vi: 'Sản phẩm', en: 'Products' },
  'admin.vouchers': { vi: 'Voucher', en: 'Vouchers' },
  'admin.tickets': { vi: 'Ticket', en: 'Tickets' },
  'admin.broadcasts': { vi: 'Thông báo', en: 'Broadcasts' },
  'admin.logs': { vi: 'Nhật ký', en: 'Logs' },
  'admin.total_revenue': { vi: 'Tổng doanh thu', en: 'Total Revenue' },
  'admin.total_users': { vi: 'Tổng người dùng', en: 'Total Users' },
  'admin.total_orders': { vi: 'Tổng đơn hàng', en: 'Total Orders' },
  'admin.pending_orders': { vi: 'Đơn chờ xử lý', en: 'Pending Orders' },

  // Common
  'common.search': { vi: 'Tìm kiếm...', en: 'Search...' },
  'common.save': { vi: 'Lưu', en: 'Save' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.delete': { vi: 'Xóa', en: 'Delete' },
  'common.edit': { vi: 'Sửa', en: 'Edit' },
  'common.confirm': { vi: 'Xác nhận', en: 'Confirm' },
  'common.close': { vi: 'Đóng', en: 'Close' },
  'common.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'common.no_data': { vi: 'Không có dữ liệu', en: 'No data' },
  'common.vnd': { vi: 'đ', en: 'VND' },
  'common.back': { vi: 'Quay lại', en: 'Back' },
  'common.status': { vi: 'Trạng thái', en: 'Status' },
  'common.date': { vi: 'Ngày', en: 'Date' },
  'common.amount': { vi: 'Số tiền', en: 'Amount' },
  'common.complete': { vi: 'Hoàn thành', en: 'Complete' },
  'common.pending': { vi: 'Chờ xử lý', en: 'Pending' },
  'common.copy': { vi: 'Sao chép', en: 'Copy' },
  'common.copied': { vi: 'Đã sao chép!', en: 'Copied!' },
};

export function t(key: string, lang: LangKey): string {
  return TRANSLATIONS[key]?.[lang] || key;
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ========== DEPOSIT AMOUNTS ==========
export const DEPOSIT_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];
