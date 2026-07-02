import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { CATEGORIES, VIP_LEVELS, formatPrice } from '@/data/constants';

export default function HomePage() {
  const app = useApp();
  const [showVipModal, setShowVipModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const filteredProducts = app.products.filter(p => {
    const matchCategory = app.selectedCategory === 'all' || p.category === app.selectedCategory;
    const matchSearch = !app.searchQuery ||
      p.name.toLowerCase().includes(app.searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(app.searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(app.searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const hotProducts = app.products.filter(p => p.hot);
  const popularProducts = app.products.filter(p => p.popular);

  const totalUsers = app.getAllUsers().length;
  const totalOrders = app.getAllOrders().length;

  const handleAddReview = (productId: string) => {
    if (!app.currentUser) {
      app.navigate('login');
      return;
    }
    if (!reviewComment.trim()) return;
    app.addReview(productId, reviewRating, reviewComment);
    setReviewComment('');
    setReviewRating(5);
    setSelectedProduct(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-bg relative overflow-hidden">
        <div className="bg-dots absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="animate-float inline-block mb-4">
            <span className="text-6xl sm:text-8xl">🎮</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-black gradient-text mb-4 tracking-wider">
            KNOX SHOP
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl mb-2">
            {app.t('home.hero.subtitle')}
          </p>
          <p className="text-accent-cyan font-medium text-base sm:text-lg mb-8">
            {app.t('home.hero.desc')}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 sm:gap-16">
            {[
              { value: totalUsers + '+', label: app.t('home.stats.users'), icon: '👥' },
              { value: app.products.length, label: app.t('home.stats.products'), icon: '📦' },
              { value: totalOrders + '+', label: app.t('home.stats.orders'), icon: '🛒' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-heading font-bold text-xl sm:text-2xl text-accent-cyan">{stat.value}</div>
                <div className="text-text-muted text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-24 md:pb-8">
        {/* Hot Deals */}
        {hotProducts.length > 0 && (
          <section className="mb-10">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-red mb-4 flex items-center gap-2">
              {app.t('home.hot')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {hotProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  app={app}
                  onSelect={setSelectedProduct}
                  lang={app.lang}
                />
              ))}
            </div>
          </section>
        )}

        {/* Search & Filter */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder={app.t('common.search')}
              value={app.searchQuery}
              onChange={e => app.setSearchQuery(e.target.value)}
              className="input-gaming flex-1 px-4 py-2.5 rounded-lg text-sm text-text-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => app.setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  app.selectedCategory === cat.id
                    ? 'btn-neon text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-bg-card'
                }`}
              >
                {app.lang === 'vi' ? cat.name : cat.nameEn}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section className="mb-10">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary mb-4">
            {app.lang === 'vi' ? '📦 Tất cả sản phẩm' : '📦 All Products'}
          </h2>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <div className="text-4xl mb-3">🔍</div>
              <p>{app.t('common.no_data')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  app={app}
                  onSelect={setSelectedProduct}
                  lang={app.lang}
                />
              ))}
            </div>
          )}
        </section>

        {/* Popular */}
        {popularProducts.length > 0 && app.selectedCategory === 'all' && !app.searchQuery && (
          <section className="mb-10">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-yellow mb-4">
              {app.t('home.popular')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {popularProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  app={app}
                  onSelect={setSelectedProduct}
                  lang={app.lang}
                />
              ))}
            </div>
          </section>
        )}

        {/* VIP Benefits */}
        <section className="mb-10">
          <div
            className="glass rounded-xl p-6 cursor-pointer card-hover"
            onClick={() => setShowVipModal(!showVipModal)}
          >
            <h2 className="font-heading text-xl sm:text-2xl font-bold gradient-text-gold mb-2">
              {app.t('home.vip.title')}
            </h2>
            <p className="text-text-secondary text-sm">{app.t('home.vip.desc')}</p>
            {app.currentUser && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl">{VIP_LEVELS[app.currentUser.vipLevel]?.icon || '⭐'}</span>
                <div>
                  <div className="font-bold text-accent-yellow">
                    VIP {VIP_LEVELS[app.currentUser.vipLevel]?.name || 'None'}
                  </div>
                  <div className="text-text-muted text-xs">
                    {app.lang === 'vi' ? 'Giảm giá' : 'Discount'}: {VIP_LEVELS[app.currentUser.vipLevel]?.discount || 0}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {showVipModal && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3 animate-slide-up">
              {VIP_LEVELS.filter(v => v.level > 0).map(vip => (
                <div
                  key={vip.level}
                  className="glass rounded-lg p-4 text-center card-hover"
                  style={{ borderColor: vip.color + '40', borderWidth: '1px' }}
                >
                  <div className="text-3xl mb-2">{vip.icon}</div>
                  <div className="font-heading font-bold text-sm" style={{ color: vip.color }}>
                    VIP {vip.level} - {app.lang === 'vi' ? vip.nameVi : vip.name}
                  </div>
                  <div className="text-text-muted text-xs mt-1">
                    {app.lang === 'vi' ? 'Nạp từ' : 'From'} {(vip.minDeposit / 1000).toFixed(0)}k
                  </div>
                  <div className="text-accent-green font-bold text-sm mt-1">
                    -{vip.discount}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          productId={selectedProduct}
          app={app}
          onClose={() => setSelectedProduct(null)}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          onAddReview={handleAddReview}
        />
      )}
    </div>
  );
}

// ========== Product Card ==========
function ProductCard({ product, app, onSelect, lang }: {
  product: any;
  app: ReturnType<typeof useApp>;
  onSelect: (id: string) => void;
  lang: string;
}) {
  return (
    <div
      className="glass rounded-xl overflow-hidden card-hover cursor-pointer group"
      onClick={() => onSelect(product.id)}
    >
      {/* Image/Icon area */}
      <div className="product-img h-28 sm:h-36 relative">
        <span className="text-4xl sm:text-5xl group-hover:animate-float transition-transform">
          {product.icon}
        </span>
        {product.hot && (
          <span className="absolute top-2 left-2 bg-accent-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-count-pulse">
            HOT
          </span>
        )}
        {product.popular && (
          <span className="absolute top-2 right-2 bg-accent-yellow text-bg-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
            ⭐
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-sm sm:text-base text-text-primary mb-1 line-clamp-1">
          {lang === 'vi' ? product.name : product.nameEn}
        </h3>
        <p className="text-text-muted text-xs line-clamp-2 mb-2">
          {lang === 'vi' ? product.description : product.descriptionEn}
        </p>
        <div className="flex items-center justify-between">
          <span className={`font-heading font-bold text-sm ${product.price === 0 ? 'text-accent-yellow' : 'text-accent-cyan'}`}>
            {product.price === 0 ? product.priceText : formatPrice(product.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              app.addToCart(product);
            }}
            className="btn-neon text-white text-xs px-3 py-1.5 rounded-lg font-medium"
          >
            {product.price === 0 ? '📞' : '🛒'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== Product Modal ==========
function ProductModal({ productId, app, onClose, reviewRating, setReviewRating, reviewComment, setReviewComment, onAddReview }: any) {
  const product = app.products.find((p: any) => p.id === productId);
  if (!product) return null;

  const reviews = app.getReviewsByProduct(productId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-bg-secondary rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-border"
        onClick={(e: any) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="product-img h-40 relative">
          <span className="text-6xl">{product.icon}</span>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
          >
            ✕
          </button>
          {product.hot && (
            <span className="absolute top-3 left-3 bg-accent-red text-white text-xs font-bold px-3 py-1 rounded-full">
              🔥 HOT
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Product Info */}
          <h2 className="font-heading font-bold text-xl text-text-primary mb-1">
            {app.lang === 'vi' ? product.name : product.nameEn}
          </h2>
          <p className="text-text-secondary text-sm mb-4">
            {app.lang === 'vi' ? product.description : product.descriptionEn}
          </p>

          <div className="flex items-center gap-4 mb-5">
            <span className={`font-heading font-bold text-2xl ${product.price === 0 ? 'text-accent-yellow' : 'text-accent-cyan'}`}>
              {product.price === 0 ? product.priceText : formatPrice(product.price)}
            </span>
            <span className="text-text-muted text-sm">
              {app.lang === 'vi' ? 'Danh mục' : 'Category'}: {product.category === 'mod-game' ? 'Mod Game' : product.category === 'script-roblox' ? 'Script Roblox' : 'Khác'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                app.addToCart(product);
                onClose();
              }}
              className="btn-neon flex-1 text-white py-3 rounded-lg font-bold text-sm"
            >
              {product.price === 0 ? '📞 ' + app.t('product.contact') : '🛒 ' + app.t('product.add_to_cart')}
            </button>
            {product.price > 0 && app.currentUser && (
              <button
                onClick={() => {
                  app.addToCart(product);
                  app.navigate('cart');
                  onClose();
                }}
                className="bg-accent-green/20 text-accent-green flex-1 py-3 rounded-lg font-bold text-sm hover:bg-accent-green/30 transition-all"
              >
                ⚡ {app.t('product.buy_now')}
              </button>
            )}
          </div>

          {/* Reviews */}
          <div className="border-t border-border pt-4">
            <h3 className="font-bold text-text-primary mb-3">
              {app.t('product.review')} ({reviews.length})
            </h3>

            {reviews.length > 0 && (
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {reviews.map((review: any) => (
                  <div key={review.id} className="bg-bg-primary rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-text-primary text-sm font-medium">{review.username}</span>
                      <span className="text-accent-yellow text-xs">
                        {'⭐'.repeat(review.rating)}
                      </span>
                    </div>
                    <p className="text-text-secondary text-xs">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {app.currentUser && product.price > 0 && (
              <div className="bg-bg-primary rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-text-secondary text-xs">{app.t('product.review')}:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-lg ${star <= reviewRating ? 'text-accent-yellow' : 'text-text-muted'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder={app.lang === 'vi' ? 'Viết đánh giá...' : 'Write a review...'}
                    className="input-gaming flex-1 px-3 py-2 rounded-lg text-xs text-text-primary"
                  />
                  <button
                    onClick={() => onAddReview(productId)}
                    className="btn-neon text-white px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    {app.t('ticket.send')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
