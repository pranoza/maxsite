
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- لطفا اینجا را ویرایش کنید ---
const DIRECTUS_URL = 'https://app.maxsite.ir'; 
const DIRECTUS_ACCESS_TOKEN = 'q6x-7yC1xcDEwiWBjwytAZZJb3ZPlxkk'; // توکن دسترسی ثابت
// ---------------------------------

interface Product {
  id: number;
  title: string;
  base_price: number | null;
  feature_image: string | null;
}

interface FullProduct extends Product {
    description: string | null;
}

const formatPrice = (price: number | null) => {
  if (price === null || isNaN(price)) {
    return 'نامشخص';
  }
  return `${price.toLocaleString('fa-IR')} تومان`;
};

const Loader = () => (
  <div style={{
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     justifyContent: 'center',
     minHeight: '50vh'
  }}>
     <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid var(--primary-color)',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite',
     }}></div>
     <p style={{marginTop: '20px', color: '#7f8c8d'}}>در حال بارگذاری...</p>
     <style>{`
       @keyframes spin {
         0% { transform: rotate(0deg); }
         100% { transform: rotate(360deg); }
       }
     `}</style>
  </div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void; }) => (
    <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: 'var(--card-background-color)',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px var(--shadow-color)',
        maxWidth: '650px',
        margin: '50px auto'
    }}>
        <h2 style={{ color: 'var(--error-color)', marginBottom: '15px' }}>خطا در بارگذاری</h2>
        <p style={{ 
            color: '#34495e', 
            lineHeight: '1.7', 
            whiteSpace: 'pre-wrap',
            textAlign: 'right',
            direction: 'rtl'
        }}>{message}</p>
        {onRetry && (
            <button onClick={onRetry} style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '25px',
                transition: 'background-color 0.2s'
            }}>
                تلاش مجدد
            </button>
        )}
    </div>
);

const ProductCard = ({ product }: { product: Product }) => (
  <a href={`/product/${product.id}`} className="product-card" style={{
    backgroundColor: 'var(--card-background-color)',
    borderRadius: '12px',
    boxShadow: '0 4px 15px -2px var(--shadow-color)',
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: '2 / 3',
    color: 'white',
    display: 'flex',
    alignItems: 'flex-end',
    textDecoration: 'none'
  }}>
    {product.feature_image ? (
        <img 
            src={`${DIRECTUS_URL}/assets/${product.feature_image}?width=400&height=600&fit=cover&access_token=${DIRECTUS_ACCESS_TOKEN}`}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            loading="lazy"
        />
    ) : (
        <div style={{
            width: '100%', 
            height: '100%', 
            display:'flex', 
            alignItems:'center', 
            justifyContent: 'center', 
            backgroundColor: '#ecf0f1',
            color: '#bdc3c7',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
        }}>
            بدون تصویر
        </div>
    )}
    <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        padding: '20px',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
        boxSizing: 'border-box'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{product.title}</h3>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '10px'
      }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {formatPrice(product.base_price)}
        </span>
        <button style={{
          backgroundColor: '#2ecc71',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          افزودن به سبد
        </button>
      </div>
    </div>
  </a>
);

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const apiUrl = `${DIRECTUS_URL}/items/Products?fields=id,title,base_price,feature_image&access_token=${DIRECTUS_ACCESS_TOKEN}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        if(response.status === 401 || response.status === 403) {
            throw new Error(`خطای احراز هویت (کد ${response.status}): توکن دسترسی نامعتبر است یا مجوز کافی برای خواندن اطلاعات وجود ندارد. لطفا توکن و دسترسی‌های نقش مربوطه را در Directus بررسی کنید.`);
        }
        throw new Error(`خطا در ارتباط با سرور: سرور با کد وضعیت ${response.status} پاسخ داد.`);
      }
      const result = await response.json();
      setProducts(result.data && Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
          const networkErrorMessage = `مرورگر نتوانست به سرور متصل شود. این مشکل می‌تواند به دلایل زیر باشد:\n- مشکل در اتصال اینترنت شما.\n- خاموش بودن یا در دسترس نبودن سرور.\n- تنظیمات امنیتی سرور (مانند CORS) که جلوی درخواست‌های مرورگر را می‌گیرد.\n\nلطفاً اتصال خود را بررسی کرده و از در دسترس بودن سرور اطمینان حاصل کنید.`;
          setError(networkErrorMessage);
      } else {
          setError(err instanceof Error ? err.message : 'یک خطای ناشناخته در هنگام دریافت اطلاعات رخ داد.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', color: 'var(--text-color)' }}>فروشگاه محصولات</h1>
        <p style={{ margin: 0, fontSize: '1.2rem', color: '#7f8c8d' }}>آخرین محصولات اضافه شده را مشاهده کنید</p>
      </header>
      <main>
        {loading && <Loader />}
        {error && <ErrorMessage message={error} onRetry={fetchProductsData} />}
        {!loading && !error && products.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {!loading && !error && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'var(--card-background-color)', borderRadius: '12px', boxShadow: '0 10px 25px -5px var(--shadow-color)', maxWidth: '500px', margin: '50px auto' }}>
                <h2 style={{color: '#34495e'}}>محصولی یافت نشد</h2>
                <p style={{color: '#7f8c8d'}}>در حال حاضر محصولی برای نمایش در این فروشگاه وجود ندارد.</p>
            </div>
        )}
      </main>
    </>
  );
};

const ProductDetail = ({ productId }: { productId: number }) => {
    const [product, setProduct] = useState<FullProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const apiUrl = `${DIRECTUS_URL}/items/Products/${productId}?fields=id,title,base_price,feature_image,description&access_token=${DIRECTUS_ACCESS_TOKEN}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if(response.status === 404) throw new Error('محصول مورد نظر یافت نشد.');
                if(response.status === 401 || response.status === 403) throw new Error('خطای احراز هویت. دسترسی به این محصول مجاز نیست.');
                throw new Error(`خطا در ارتباط با سرور: کد ${response.status}`);
            }
            const result = await response.json();
            setProduct(result.data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'خطای ناشناخته‌ای رخ داد.');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProductData();
    }, [fetchProductData]);
    
    return (
        <main>
            <div style={{ marginBottom: '30px' }}>
                <a href="/" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>
                    &larr; بازگشت به محصولات
                </a>
            </div>
            {loading && <Loader />}
            {error && <ErrorMessage message={error} />}
            {!loading && product && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr', 
                    gap: '40px',
                    backgroundColor: 'var(--card-background-color)',
                    borderRadius: '12px',
                    padding: '30px',
                    boxShadow: '0 10px 25px -5px var(--shadow-color)',
                }}>
                    <style>{`
                        @media (min-width: 768px) {
                            .product-detail-grid {
                                grid-template-columns: 1fr 1fr !important;
                            }
                        }
                        .product-description h2 { margin-top: 0; }
                        .product-description p { line-height: 1.8; }
                        .product-description a { color: var(--primary-color); }
                    `}</style>
                    <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'flex-start' }}>
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '100%', /* 1:1 Aspect Ratio */
                            backgroundColor: 'var(--background-color)',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            {product.feature_image ? (
                                <img 
                                    src={`${DIRECTUS_URL}/assets/${product.feature_image}?width=600&access_token=${DIRECTUS_ACCESS_TOKEN}`} 
                                    alt={product.title} 
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                    }} 
                                />
                            ) : (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#bdc3c7',
                                    fontSize: '1.2rem'
                                }}>بدون تصویر</div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 style={{ margin: '0 0 15px 0', fontSize: '2.5rem' }}>{product.title}</h1>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '30px' }}>
                                {formatPrice(product.base_price)}
                            </span>
                            <div 
                                className="product-description"
                                style={{ flexGrow: 1, color: '#34495e' }}
                                dangerouslySetInnerHTML={{ __html: product.description || '<p>توضیحاتی برای این محصول وجود ندارد.</p>' }}
                            ></div>
                            <button style={{
                                backgroundColor: '#2ecc71',
                                color: 'white',
                                border: 'none',
                                padding: '15px 30px',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '30px',
                                width: '100%'
                            }}>
                                افزودن به سبد خرید
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};


const App = () => {
  const [route, setRoute] = useState({ page: 'list', id: null as number | null });

  const handleLocationChange = useCallback(() => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);

    if (parts[0] === 'product' && parts[1] && !isNaN(parseInt(parts[1], 10))) {
        setRoute({ page: 'detail', id: parseInt(parts[1], 10) });
    } else {
        setRoute({ page: 'list', id: null });
    }
  }, []);

  useEffect(() => {
      const handleLinkClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const anchor = target.closest('a');
          
          if (
              anchor &&
              anchor.target !== '_blank' &&
              !e.metaKey &&
              !e.ctrlKey &&
              anchor.origin === window.location.origin
          ) {
              e.preventDefault();
              window.history.pushState({}, '', anchor.href);
              handleLocationChange();
          }
      };

      window.addEventListener('popstate', handleLocationChange);
      document.addEventListener('click', handleLinkClick);

      handleLocationChange(); // Initial route

      return () => {
          window.removeEventListener('popstate', handleLocationChange);
          document.removeEventListener('click', handleLinkClick);
      };
  }, [handleLocationChange]);
  
  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', boxSizing: 'border-box' }}>
      {route.page === 'list' && <ProductList />}
      {route.page === 'detail' && route.id !== null && <ProductDetail productId={route.id} />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
}
