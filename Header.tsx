import { useApp } from '@/contexts/AppContext';

export default function Header() {
  const app = useApp();
  const unreadCount = app.getUnreadCount();
  const cartCount = app.cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { key: 'home', icon: '🏠', label: app.t('nav.home') },
    { key: 'deposit', icon: '💰', label: app.t('nav.deposit') },
    { key: 'about', icon: 'ℹ️', label: app.t('nav.about') },
    { key: 'tickets', icon: '🎧', label: app.t('nav.tickets') },
  ];

  const authItems = app.currentUser
    ? [
        { key: 'cart', icon: '🛒', label: app.t('nav.cart'), badge: cartCount },
        { key: 'notifications', icon: '🔔', label: app.t('nav.notifications'), badge: unreadCount },
        { key: 'profile', icon: '👤', label: app.t('nav.profile') },
        ...(app.isAdmin ? [{ key: 'admin', icon: '⚙️', label: app.t('nav.admin') }] : []),
        { key: 'logout', icon: '🚪', label: app.t('nav.logout') },
      ]
    : [{ key: 'login', icon: '🔐', label: app.t('nav.login') }];

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button
              onClick={() => app.navigate('home')}
              className="flex items-center gap-2 group"
            >
              <span className="text-2xl group-hover:animate-float">🎮</span>
              <span className="font-heading font-bold text-lg gradient-text hidden sm:block">
                KNOX SHOP
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => app.navigate(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-bg-tertiary ${
                    app.page === item.key ? 'text-accent-cyan' : 'text-text-secondary'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              {/* Language toggle */}
              <button
                onClick={() => app.setLang(app.lang === 'vi' ? 'en' : 'vi')}
                className="px-2 py-1 rounded-lg text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all"
              >
                {app.lang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
              </button>

              {/* Auth items - desktop */}
              <div className="hidden md:flex items-center gap-1">
                {authItems.map(item => (
                  <button
                    key={item.key}
                    onClick={() => {
                      if (item.key === 'logout') app.logout();
                      else app.navigate(item.key);
                    }}
                    className={`relative px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-bg-tertiary ${
                      app.page === item.key ? 'text-accent-cyan' : 'text-text-secondary'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                    {item.badge ? (
                      <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={app.toggleMobileMenu}
                className="md:hidden p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary"
              >
                {app.mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {app.mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={app.toggleMobileMenu}
          />
          <div className="absolute right-0 top-14 w-64 h-[calc(100vh-56px)] bg-bg-secondary border-l border-border overflow-y-auto animate-slide-in">
            <div className="p-4 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => app.navigate(item.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    app.page === item.key
                      ? 'tab-active'
                      : 'text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="my-3 border-t border-border" />
              {authItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === 'logout') app.logout();
                    else app.navigate(item.key);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all relative ${
                    app.page === item.key
                      ? 'tab-active'
                      : 'text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                  {item.badge ? (
                    <span className="ml-2 bg-accent-red text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-border">
        <div className="flex items-center justify-around h-14">
          {[
            { key: 'home', icon: '🏠' },
            { key: 'deposit', icon: '💰' },
            { key: 'cart', icon: '🛒', badge: cartCount },
            { key: 'profile', icon: app.currentUser ? '👤' : '🔐' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'profile' && !app.currentUser) {
                  app.navigate('login');
                } else {
                  app.navigate(item.key);
                }
              }}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all ${
                app.page === item.key ? 'text-accent-cyan' : 'text-text-muted'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.badge ? (
                <span className="absolute top-1 right-1/4 bg-accent-red text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
