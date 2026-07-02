import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Product, Order, OrderItem, Deposit, Voucher, Review, Ticket, AppNotification, LoginHistory, Broadcast, AdminLog, LangKey } from '@/data/constants';
import { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_ID, getVipLevel, t as translate } from '@/data/constants';
import * as storage from '@/utils/storage';

// ========== Toast ==========
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// ========== Cart Item ==========
export interface CartItem {
  product: Product;
  quantity: number;
}

// ========== App State ==========
interface AppState {
  currentUser: User | null;
  isAdmin: boolean;
  page: string;
  lang: LangKey;
  cart: CartItem[];
  toasts: Toast[];
  products: Product[];
  vouchers: Voucher[];
  appliedVoucher: Voucher | null;
  searchQuery: string;
  selectedCategory: string;
  loading: boolean;
  mobileMenuOpen: boolean;
}

// ========== App Actions ==========
interface AppActions {
  // Auth
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string, email: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;

  // Navigation
  navigate: (page: string) => void;

  // Language
  setLang: (lang: LangKey) => void;

  // Cart
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Voucher
  applyVoucher: (code: string) => boolean;
  removeVoucher: () => void;

  // Orders
  placeOrder: () => boolean;

  // Deposits
  createDeposit: (amount: number, method: string) => void;

  // Reviews
  addReview: (productId: string, rating: number, comment: string) => void;

  // Tickets
  createTicket: (subject: string, message: string) => void;
  replyTicket: (ticketId: string, message: string) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;

  // Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;

  // Toast
  showToast: (message: string, type?: Toast['type']) => void;

  // Search & Filter
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;

  // Mobile menu
  toggleMobileMenu: () => void;

  // Admin
  adminUpdateUser: (userId: string, updates: Partial<User>) => void;
  adminUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  adminAddProduct: (product: Omit<Product, 'id'>) => void;
  adminUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  adminDeleteProduct: (productId: string) => void;
  adminAddVoucher: (voucher: Omit<Voucher, 'id'>) => void;
  adminCreateBroadcast: (title: string, message: string) => void;
  adminReplyTicket: (ticketId: string, message: string) => void;

  // Getters
  getOrders: () => Order[];
  getOrdersByUser: () => Order[];
  getDepositsByUser: () => Deposit[];
  getLoginHistoryByUser: () => LoginHistory[];
  getNotificationsByUser: () => AppNotification[];
  getReviewsByProduct: (productId: string) => Review[];
  getTicketsByUser: () => Ticket[];
  getAllTickets: () => Ticket[];
  getAllUsers: () => User[];
  getAllOrders: () => Order[];
  getAllDeposits: () => Deposit[];
  getBroadcasts: () => Broadcast[];
  getAdminLogs: () => AdminLog[];
  refreshUser: () => void;

  // Helpers
  t: (key: string) => string;
  getCartTotal: () => number;
  getVipDiscount: () => number;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function useApp(): AppState & AppActions {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState('home');
  const [lang, setLangState] = useState<LangKey>(() => {
    return (localStorage.getItem('knox_lang') as LangKey) || 'vi';
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    try {
      storage.initializeData();
      setProducts(storage.getActiveProducts());
      setVouchers(storage.getVouchers());

      // Restore session
      const savedSession = localStorage.getItem('knox_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          const user = storage.findUserByUsername(session.username);
          if (user && !user.banned) {
            setCurrentUser(user);
            setIsAdmin(user.id === ADMIN_ID);
          }
        } catch {
          localStorage.removeItem('knox_session');
        }
      }

      // Restore cart
      const savedCart = localStorage.getItem('knox_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch {
          localStorage.removeItem('knox_cart');
        }
      }
    } catch (e) {
      console.error('Initialization error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem('knox_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast auto-remove
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  // ========== HELPERS ==========
  const t = useCallback((key: string) => translate(key, lang), [lang]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString(36);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const navigate = useCallback((newPage: string) => {
    setPage(newPage);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const setLang = useCallback((newLang: LangKey) => {
    setLangState(newLang);
    localStorage.setItem('knox_lang', newLang);
  }, []);

  // ========== AUTH ==========
  const login = useCallback((username: string, password: string): boolean => {
    // Check hardcoded admin first
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const adminUser = storage.findUserByUsername(ADMIN_USERNAME);
      if (adminUser) {
        setCurrentUser(adminUser);
        setIsAdmin(true);
        localStorage.setItem('knox_session', JSON.stringify({ username: ADMIN_USERNAME }));
        storage.addLoginHistory(adminUser.id, adminUser.username);
        showToast(t('auth.login_success'), 'success');
        return true;
      }
    }

    const user = storage.findUser(username, password);
    if (user && !user.banned) {
      setCurrentUser(user);
      setIsAdmin(user.id === ADMIN_ID);
      localStorage.setItem('knox_session', JSON.stringify({ username: user.username }));
      storage.addLoginHistory(user.id, user.username);
      showToast(t('auth.login_success'), 'success');
      return true;
    }

    showToast(t('auth.login_fail'), 'error');
    return false;
  }, [showToast, t]);

  const register = useCallback((username: string, password: string, email: string): boolean => {
    if (storage.findUserByUsername(username)) {
      showToast(t('auth.register_fail'), 'error');
      return false;
    }

    const user = storage.createUser({ username, password, email, avatar: '🎮' });
    setCurrentUser(user);
    setIsAdmin(false);
    localStorage.setItem('knox_session', JSON.stringify({ username: user.username }));
    storage.addLoginHistory(user.id, user.username);
    storage.addNotification({ userId: user.id, title: lang === 'vi' ? 'Chào mừng!' : 'Welcome!', message: lang === 'vi' ? 'Chào mừng bạn đến với KNOX Shop!' : 'Welcome to KNOX Shop!' });
    showToast(t('auth.register_success'), 'success');
    return true;
  }, [showToast, t, lang]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAdmin(false);
    setCart([]);
    setAppliedVoucher(null);
    localStorage.removeItem('knox_session');
    localStorage.removeItem('knox_cart');
    navigate('home');
    showToast(lang === 'vi' ? 'Đã đăng xuất!' : 'Logged out!', 'info');
  }, [navigate, showToast, lang]);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = storage.updateUser(currentUser.id, updates);
    if (updated) setCurrentUser(updated);
  }, [currentUser]);

  const changePassword = useCallback((oldPassword: string, newPassword: string): boolean => {
    if (!currentUser || currentUser.password !== oldPassword) return false;
    const updated = storage.updateUser(currentUser.id, { password: newPassword });
    if (updated) {
      setCurrentUser(updated);
      showToast(t('profile.password_changed'), 'success');
      return true;
    }
    return false;
  }, [currentUser, showToast, t]);

  // ========== CART ==========
  const addToCart = useCallback((product: Product) => {
    if (product.price === 0) {
      navigate('about');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(lang === 'vi' ? 'Đã thêm vào giỏ hàng!' : 'Added to cart!', 'success');
  }, [showToast, lang, navigate]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedVoucher(null);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const getVipDiscount = useCallback(() => {
    if (!currentUser) return 0;
    return getVipLevel(currentUser.totalDeposited);
  }, [currentUser]);

  // ========== VOUCHER ==========
  const applyVoucher = useCallback((code: string): boolean => {
    const voucher = storage.findVoucher(code);
    if (!voucher) {
      showToast(t('cart.voucher_invalid'), 'error');
      return false;
    }
    if (voucher.usedCount >= voucher.maxUses) {
      showToast(t('cart.voucher_invalid'), 'error');
      return false;
    }
    const now = new Date();
    if (new Date(voucher.expiresAt) < now) {
      showToast(t('cart.voucher_invalid'), 'error');
      return false;
    }
    if (getCartTotal() < voucher.minOrder) {
      showToast(t('cart.voucher_invalid'), 'error');
      return false;
    }
    setAppliedVoucher(voucher);
    showToast(t('cart.voucher_applied'), 'success');
    return true;
  }, [showToast, t, getCartTotal]);

  const removeVoucher = useCallback(() => {
    setAppliedVoucher(null);
  }, []);

  // ========== ORDERS ==========
  const placeOrder = useCallback((): boolean => {
    if (!currentUser) return false;
    if (cart.length === 0) return false;

    const subtotal = getCartTotal();
    const vipLevel = getVipLevel(currentUser.totalDeposited);
    const vipInfo = [0, 5, 10, 15, 20, 25];
    const vipDiscount = vipInfo[vipLevel] || 0;
    const voucherDiscount = appliedVoucher ? appliedVoucher.discount : 0;
    const totalDiscount = Math.min(vipDiscount + voucherDiscount, 100);
    const total = Math.floor(subtotal * (1 - totalDiscount / 100));

    if (currentUser.balance < total) {
      showToast(t('cart.insufficient_balance'), 'error');
      return false;
    }

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const order = storage.createOrder({
      userId: currentUser.id,
      username: currentUser.username,
      items: orderItems,
      total,
      status: 'completed',
      voucherCode: appliedVoucher?.code || '',
      discount: totalDiscount,
    });

    // Deduct balance
    storage.updateUser(currentUser.id, { balance: currentUser.balance - total });

    // Use voucher
    if (appliedVoucher) {
      storage.useVoucher(appliedVoucher.id);
    }

    // Add notification
    storage.addNotification({
      userId: currentUser.id,
      title: lang === 'vi' ? 'Đặt hàng thành công!' : 'Order placed!',
      message: lang === 'vi' ? `Đơn hàng #${order.id.slice(0, 8)} đã được xử lý.` : `Order #${order.id.slice(0, 8)} has been processed.`,
    });

    // Admin log
    storage.addAdminLog('ORDER', `Order #${order.id.slice(0, 8)}`, `User ${currentUser.username} placed order for ${total}đ`);

    // Refresh user data
    const refreshedUser = storage.findUserByUsername(currentUser.username);
    if (refreshedUser) setCurrentUser(refreshedUser);

    setCart([]);
    setAppliedVoucher(null);
    showToast(t('cart.checkout_success'), 'success');
    navigate('profile');
    return true;
  }, [currentUser, cart, getCartTotal, appliedVoucher, showToast, t, lang, navigate]);

  // ========== DEPOSITS ==========
  const createDeposit = useCallback((amount: number, method: string) => {
    if (!currentUser) return;
    storage.createDeposit({
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      method,
      status: 'pending',
    });

    // Refresh user
    const refreshedUser = storage.findUserByUsername(currentUser.username);
    if (refreshedUser) setCurrentUser(refreshedUser);

    storage.addNotification({
      userId: currentUser.id,
      title: lang === 'vi' ? 'Nạp tiền thành công!' : 'Deposit successful!',
      message: lang === 'vi' ? `Bạn đã nạp ${amount.toLocaleString()}đ qua ${method}` : `Deposited ${amount.toLocaleString()}đ via ${method}`,
    });

    showToast(t('deposit.success'), 'success');
  }, [currentUser, showToast, t, lang]);

  // ========== REVIEWS ==========
  const addReview = useCallback((productId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    storage.addReview({
      userId: currentUser.id,
      username: currentUser.username,
      productId,
      rating,
      comment,
    });
    showToast(lang === 'vi' ? 'Đã gửi đánh giá!' : 'Review submitted!', 'success');
  }, [currentUser, showToast, lang]);

  // ========== TICKETS ==========
  const createTicket = useCallback((subject: string, message: string) => {
    if (!currentUser) return;
    storage.createTicket({
      userId: currentUser.id,
      username: currentUser.username,
      subject,
      status: 'open',
      messages: [{
        sender: currentUser.username,
        message,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      }],
    });
    showToast(lang === 'vi' ? 'Đã tạo yêu cầu hỗ trợ!' : 'Support ticket created!', 'success');
  }, [currentUser, showToast, lang]);

  const replyTicket = useCallback((ticketId: string, message: string) => {
    if (!currentUser) return;
    storage.replyTicket(ticketId, message, false, currentUser.username);
  }, [currentUser]);

  const updateTicketStatus = useCallback((ticketId: string, status: Ticket['status']) => {
    storage.updateTicket(ticketId, { status });
  }, []);

  // ========== NOTIFICATIONS ==========
  const markNotificationRead = useCallback((notifId: string) => {
    storage.markNotificationRead(notifId);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    storage.markAllNotificationsRead(currentUser.id);
  }, [currentUser]);

  const getUnreadCount = useCallback((): number => {
    if (!currentUser) return 0;
    return storage.getNotificationsByUser(currentUser.id).filter(n => !n.read).length;
  }, [currentUser]);

  // ========== MOBILE MENU ==========
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // ========== ADMIN ==========
  const adminUpdateUser = useCallback((userId: string, updates: Partial<User>) => {
    storage.updateUser(userId, updates);
    storage.addAdminLog('UPDATE_USER', userId, `Updated: ${Object.keys(updates).join(', ')}`);
  }, []);

  const adminUpdateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    storage.updateOrderStatus(orderId, status);
    storage.addAdminLog('UPDATE_ORDER', orderId, `Status changed to ${status}`);
  }, []);

  const adminAddProduct = useCallback((product: Omit<Product, 'id'>) => {
    storage.addProduct(product);
    setProducts(storage.getActiveProducts());
    storage.addAdminLog('ADD_PRODUCT', product.name, 'Added new product');
  }, []);

  const adminUpdateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    storage.updateProduct(productId, updates);
    setProducts(storage.getActiveProducts());
    storage.addAdminLog('UPDATE_PRODUCT', productId, `Updated: ${Object.keys(updates).join(', ')}`);
  }, []);

  const adminDeleteProduct = useCallback((productId: string) => {
    storage.deleteProduct(productId);
    setProducts(storage.getActiveProducts());
    storage.addAdminLog('DELETE_PRODUCT', productId, 'Deleted product');
  }, []);

  const adminAddVoucher = useCallback((voucher: Omit<Voucher, 'id'>) => {
    storage.addVoucher(voucher);
    setVouchers(storage.getVouchers());
    storage.addAdminLog('ADD_VOUCHER', voucher.code, 'Added new voucher');
  }, []);

  const adminCreateBroadcast = useCallback((title: string, message: string) => {
    storage.createBroadcast(title, message);
    storage.addAdminLog('BROADCAST', title, message);
  }, []);

  const adminReplyTicket = useCallback((ticketId: string, message: string) => {
    storage.replyTicket(ticketId, message, true, ADMIN_USERNAME);
    storage.updateTicket(ticketId, { status: 'in_progress' });
  }, []);

  // ========== GETTERS ==========
  const refreshUser = useCallback(() => {
    if (!currentUser) return;
    const refreshed = storage.findUserByUsername(currentUser.username);
    if (refreshed) setCurrentUser(refreshed);
  }, [currentUser]);

  const getOrdersByUserFn = useCallback(() => {
    if (!currentUser) return [];
    return storage.getOrdersByUser(currentUser.id);
  }, [currentUser]);

  const getDepositsByUserFn = useCallback(() => {
    if (!currentUser) return [];
    return storage.getDepositsByUser(currentUser.id);
  }, [currentUser]);

  const getLoginHistoryByUserFn = useCallback(() => {
    if (!currentUser) return [];
    return storage.getLoginHistory().filter(l => l.userId === currentUser.id);
  }, [currentUser]);

  const getNotificationsByUserFn = useCallback(() => {
    if (!currentUser) return [];
    return storage.getNotificationsByUser(currentUser.id);
  }, [currentUser]);

  const getReviewsByProductFn = useCallback((productId: string) => {
    return storage.getReviewsByProduct(productId);
  }, []);

  const getTicketsByUserFn = useCallback(() => {
    if (!currentUser) return [];
    return storage.getTicketsByUser(currentUser.id);
  }, [currentUser]);

  const value: AppState & AppActions = {
    currentUser,
    isAdmin,
    page,
    lang,
    cart,
    toasts,
    products,
    vouchers,
    appliedVoucher,
    searchQuery,
    selectedCategory,
    loading,
    mobileMenuOpen,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    navigate,
    setLang,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    applyVoucher,
    removeVoucher,
    placeOrder,
    createDeposit,
    addReview,
    createTicket,
    replyTicket,
    updateTicketStatus,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadCount,
    showToast,
    setSearchQuery,
    setSelectedCategory,
    toggleMobileMenu,
    adminUpdateUser,
    adminUpdateOrderStatus,
    adminAddProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    adminAddVoucher,
    adminCreateBroadcast,
    adminReplyTicket,
    getOrders: storage.getOrders,
    getOrdersByUser: getOrdersByUserFn,
    getDepositsByUser: getDepositsByUserFn,
    getLoginHistoryByUser: getLoginHistoryByUserFn,
    getNotificationsByUser: getNotificationsByUserFn,
    getReviewsByProduct: getReviewsByProductFn,
    getTicketsByUser: getTicketsByUserFn,
    getAllTickets: storage.getTickets,
    getAllUsers: storage.getUsers,
    getAllOrders: storage.getOrders,
    getAllDeposits: storage.getDeposits,
    getBroadcasts: storage.getBroadcasts,
    getAdminLogs: storage.getAdminLogs,
    refreshUser,
    t,
    getCartTotal,
    getVipDiscount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
