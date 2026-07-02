import { AppProvider, useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import { CartPage, DepositPage, AboutPage, TicketPage, NotificationPage } from '@/pages/OtherPages';
import type { Toast } from '@/contexts/AppContext';

function AppContent() {
  const app = useApp();

  if (app.loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">🎮</div>
          <h1 className="font-heading text-2xl gradient-text font-bold mb-2">KNOX SHOP</h1>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-accent-pink animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (app.page) {
      case 'home': return <HomePage />;
      case 'login': return <AuthPage />;
      case 'profile': return <ProfilePage />;
      case 'admin': return <AdminPage />;
      case 'cart': return <CartPage />;
      case 'deposit': return <DepositPage />;
      case 'about': return <AboutPage />;
      case 'tickets': return <TicketPage />;
      case 'notifications': return <NotificationPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main>{renderPage()}</main>
      <Footer />
      <ToastContainer toasts={app.toasts} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="hidden md:block border-t border-border bg-bg-secondary mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between text-text-muted text-xs">
          <div className="flex items-center gap-2">
            <span>🎮</span>
            <span className="font-heading font-bold gradient-text">KNOX SHOP</span>
            <span>© 2024</span>
          </div>
          <div className="flex gap-4">
            <span>Mod Game & Script</span>
            <span>•</span>
            <span>Uy tín - Chất lượng</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 space-y-2 max-w-xs">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`animate-slide-in rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success' ? 'bg-accent-green/90 text-white' :
            toast.type === 'error' ? 'bg-accent-red/90 text-white' :
            toast.type === 'warning' ? 'bg-accent-yellow/90 text-bg-primary' :
            'bg-accent-cyan/90 text-bg-primary'
          }`}
        >
          {toast.type === 'success' ? '✅ ' : toast.type === 'error' ? '❌ ' : toast.type === 'warning' ? '⚠️ ' : 'ℹ️ '}
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
