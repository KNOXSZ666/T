/**
 * Storage Layer - KNOX Shop
 * Sử dụng localStorage làm fallback khi chưa cấu hình Supabase.
 * Khi có Supabase credentials, thay thế các hàm này bằng Supabase API calls.
 * 
 * SUPABASE INTEGRATION:
 * Để kết nối Supabase, tạo client:
 *   import { createClient } from '@supabase/supabase-js'
 *   const supabase = createClient('YOUR_URL', 'YOUR_ANON_KEY')
 * 
 * Sau đó thay thế mỗi hàm storage dưới đây bằng Supabase query tương ứng.
 * Ví dụ: getUsers() => supabase.from('users').select('*')
 * 
 * TẮT RLS: Chạy SQL trong Supabase Dashboard:
 *   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
 *   (lặp cho mỗi bảng)
 */

import type { User, Product, Order, Deposit, Voucher, Review, Ticket, AppNotification, LoginHistory, Broadcast, AdminLog } from '@/data/constants';
import { INITIAL_PRODUCTS, INITIAL_VOUCHERS, generateId, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_ID, getVipLevel } from '@/data/constants';

const PREFIX = 'knox_';

// ========== Generic CRUD ==========
function getAll<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(PREFIX + key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return [];
  }
}

function saveAll<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

// ========== Initialize Data ==========
export function initializeData(): void {
  // Initialize products
  if (!localStorage.getItem(PREFIX + 'products')) {
    saveAll('products', INITIAL_PRODUCTS);
  }

  // Initialize vouchers
  if (!localStorage.getItem(PREFIX + 'vouchers')) {
    saveAll('vouchers', INITIAL_VOUCHERS);
  }

  // Initialize admin user
  const users = getAll<User>('users');
  if (!users.find(u => u.id === ADMIN_ID)) {
    const adminUser: User = {
      id: ADMIN_ID,
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      email: 'admin@knox.vn',
      balance: 0,
      totalDeposited: 0,
      vipLevel: 5,
      avatar: '👑',
      createdAt: new Date().toISOString(),
      banned: false,
    };
    saveAll('users', [adminUser, ...users.filter(u => u.id !== ADMIN_ID)]);
  }

  // Initialize empty arrays for other tables
  const tables = ['orders', 'deposits', 'reviews', 'tickets', 'notifications', 'login_history', 'broadcasts', 'admin_logs'];
  tables.forEach(table => {
    if (!localStorage.getItem(PREFIX + table)) {
      saveAll(table, []);
    }
  });
}

// ========== USERS ==========
// Supabase: SELECT * FROM users
export function getUsers(): User[] {
  return getAll<User>('users');
}

// Supabase: SELECT * FROM users WHERE username = ? AND password = ?
export function findUser(username: string, password: string): User | null {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password) || null;
}

// Supabase: SELECT * FROM users WHERE username = ?
export function findUserByUsername(username: string): User | null {
  const users = getUsers();
  return users.find(u => u.username === username) || null;
}

// Supabase: INSERT INTO users (...)
export function createUser(user: Omit<User, 'id' | 'createdAt' | 'vipLevel' | 'balance' | 'totalDeposited' | 'banned'>): User {
  const newUser: User = {
    ...user,
    id: generateId(),
    balance: 0,
    totalDeposited: 0,
    vipLevel: 0,
    avatar: '🎮',
    createdAt: new Date().toISOString(),
    banned: false,
  };
  const users = getUsers();
  users.push(newUser);
  saveAll('users', users);
  return newUser;
}

// Supabase: UPDATE users SET ... WHERE id = ?
export function updateUser(userId: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  // Recalculate VIP level
  users[index].vipLevel = getVipLevel(users[index].totalDeposited);
  saveAll('users', users);
  return users[index];
}

// Supabase: DELETE FROM users WHERE id = ?
export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  saveAll('users', users);
}

// ========== PRODUCTS ==========
// Supabase: SELECT * FROM products WHERE active = true
export function getProducts(): Product[] {
  return getAll<Product>('products');
}

export function getActiveProducts(): Product[] {
  return getProducts().filter(p => p.active);
}

// Supabase: INSERT INTO products (...)
export function addProduct(product: Omit<Product, 'id'>): Product {
  const newProduct: Product = { ...product, id: generateId() };
  const products = getProducts();
  products.push(newProduct);
  saveAll('products', products);
  return newProduct;
}

// Supabase: UPDATE products SET ... WHERE id = ?
export function updateProduct(productId: string, updates: Partial<Product>): void {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveAll('products', products);
  }
}

// Supabase: DELETE FROM products WHERE id = ?
export function deleteProduct(productId: string): void {
  const products = getProducts().filter(p => p.id !== productId);
  saveAll('products', products);
}

// ========== ORDERS ==========
// Supabase: SELECT * FROM orders ORDER BY created_at DESC
export function getOrders(): Order[] {
  return getAll<Order>('orders');
}

export function getOrdersByUser(userId: string): Order[] {
  return getOrders().filter(o => o.userId === userId);
}

// Supabase: INSERT INTO orders (...)
export function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const newOrder: Order = {
    ...order,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const orders = getOrders();
  orders.push(newOrder);
  saveAll('orders', orders);
  return newOrder;
}

// Supabase: UPDATE orders SET status = ? WHERE id = ?
export function updateOrderStatus(orderId: string, status: Order['status']): void {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    saveAll('orders', orders);
  }
}

// ========== DEPOSITS ==========
// Supabase: SELECT * FROM deposits ORDER BY created_at DESC
export function getDeposits(): Deposit[] {
  return getAll<Deposit>('deposits');
}

export function getDepositsByUser(userId: string): Deposit[] {
  return getDeposits().filter(d => d.userId === userId);
}

// Supabase: INSERT INTO deposits (...)
export function createDeposit(deposit: Omit<Deposit, 'id' | 'createdAt'>): Deposit {
  const newDeposit: Deposit = {
    ...deposit,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const deposits = getDeposits();
  deposits.push(newDeposit);
  saveAll('deposits', deposits);

  // Auto-complete deposit and update user balance
  if (newDeposit.status === 'pending') {
    newDeposit.status = 'completed';
    const idx = deposits.findIndex(d => d.id === newDeposit.id);
    if (idx !== -1) deposits[idx].status = 'completed';
    saveAll('deposits', deposits);
    
    const user = getUsers().find(u => u.id === deposit.userId);
    if (user) {
      updateUser(user.id, {
        balance: user.balance + deposit.amount,
        totalDeposited: user.totalDeposited + deposit.amount,
      });
    }
  }

  return newDeposit;
}

// ========== VOUCHERS ==========
// Supabase: SELECT * FROM vouchers WHERE active = true
export function getVouchers(): Voucher[] {
  return getAll<Voucher>('vouchers');
}

export function findVoucher(code: string): Voucher | null {
  return getVouchers().find(v => v.code.toUpperCase() === code.toUpperCase() && v.active) || null;
}

// Supabase: INSERT INTO vouchers (...)
export function addVoucher(voucher: Omit<Voucher, 'id'>): Voucher {
  const newVoucher: Voucher = { ...voucher, id: generateId() };
  const vouchers = getVouchers();
  vouchers.push(newVoucher);
  saveAll('vouchers', vouchers);
  return newVoucher;
}

export function useVoucher(voucherId: string): void {
  const vouchers = getVouchers();
  const index = vouchers.findIndex(v => v.id === voucherId);
  if (index !== -1) {
    vouchers[index].usedCount++;
    if (vouchers[index].usedCount >= vouchers[index].maxUses) {
      vouchers[index].active = false;
    }
    saveAll('vouchers', vouchers);
  }
}

// ========== REVIEWS ==========
export function getReviews(): Review[] {
  return getAll<Review>('reviews');
}

export function getReviewsByProduct(productId: string): Review[] {
  return getReviews().filter(r => r.productId === productId);
}

export function addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
  const newReview: Review = {
    ...review,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const reviews = getReviews();
  reviews.push(newReview);
  saveAll('reviews', reviews);
  return newReview;
}

// ========== TICKETS ==========
export function getTickets(): Ticket[] {
  return getAll<Ticket>('tickets');
}

export function getTicketsByUser(userId: string): Ticket[] {
  return getTickets().filter(t => t.userId === userId);
}

export function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt'>): Ticket {
  const newTicket: Ticket = {
    ...ticket,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const tickets = getTickets();
  tickets.push(newTicket);
  saveAll('tickets', tickets);
  return newTicket;
}

export function updateTicket(ticketId: string, updates: Partial<Ticket>): void {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index !== -1) {
    tickets[index] = { ...tickets[index], ...updates };
    saveAll('tickets', tickets);
  }
}

export function replyTicket(ticketId: string, message: string, isAdmin: boolean, sender: string): void {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index !== -1) {
    tickets[index].messages.push({
      sender,
      message,
      isAdmin,
      createdAt: new Date().toISOString(),
    });
    saveAll('tickets', tickets);
  }
}

// ========== NOTIFICATIONS ==========
export function getNotifications(): AppNotification[] {
  return getAll<AppNotification>('notifications');
}

export function getNotificationsByUser(userId: string): AppNotification[] {
  return getNotifications().filter(n => n.userId === userId);
}

export function addNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
  const newNotif: AppNotification = {
    ...notification,
    id: generateId(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  const notifs = getNotifications();
  notifs.push(newNotif);
  saveAll('notifications', notifs);
  return newNotif;
}

export function markNotificationRead(notifId: string): void {
  const notifs = getNotifications();
  const index = notifs.findIndex(n => n.id === notifId);
  if (index !== -1) {
    notifs[index].read = true;
    saveAll('notifications', notifs);
  }
}

export function markAllNotificationsRead(userId: string): void {
  const notifs = getNotifications();
  notifs.forEach(n => {
    if (n.userId === userId) n.read = true;
  });
  saveAll('notifications', notifs);
}

// ========== LOGIN HISTORY ==========
export function getLoginHistory(): LoginHistory[] {
  return getAll<LoginHistory>('login_history');
}

export function addLoginHistory(userId: string, username: string): void {
  const entry: LoginHistory = {
    id: generateId(),
    userId,
    username,
    device: navigator.userAgent.substring(0, 80),
    createdAt: new Date().toISOString(),
  };
  const history = getLoginHistory();
  history.push(entry);
  saveAll('login_history', history);
}

// ========== BROADCASTS ==========
export function getBroadcasts(): Broadcast[] {
  return getAll<Broadcast>('broadcasts');
}

export function createBroadcast(title: string, message: string): Broadcast {
  const broadcast: Broadcast = {
    id: generateId(),
    title,
    message,
    createdAt: new Date().toISOString(),
  };
  const broadcasts = getBroadcasts();
  broadcasts.push(broadcast);
  saveAll('broadcasts', broadcasts);

  // Create notifications for all users
  const users = getUsers();
  users.forEach(user => {
    addNotification({ userId: user.id, title, message });
  });

  return broadcast;
}

// ========== ADMIN LOGS ==========
export function getAdminLogs(): AdminLog[] {
  return getAll<AdminLog>('admin_logs');
}

export function addAdminLog(action: string, target: string, details: string): void {
  const log: AdminLog = {
    id: generateId(),
    adminId: ADMIN_ID,
    action,
    target,
    details,
    createdAt: new Date().toISOString(),
  };
  const logs = getAdminLogs();
  logs.push(log);
  saveAll('admin_logs', logs);
}
