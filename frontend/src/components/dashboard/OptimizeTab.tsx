import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8000';

interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  image: string | null;
  status: string;
}

export default function OptimizeTab({ onSelectProduct }: { onSelectProduct: (desc: string, title: string, image: string | null) => void }) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce'>('shopify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [platform]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/products?platform=${platform}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to fetch products');
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl">
        <div>
          <h2 className="text-3xl font-semibold text-white">Optimize Existing</h2>
          <p className="text-neutral-500 mt-2 text-lg">Select an active product from your store to run through the AI pipeline.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0f0f0f] border border-white/5 rounded-full p-1">
            <button 
              onClick={() => setPlatform('shopify')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${platform === 'shopify' ? 'bg-[#95bf47] text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              Shopify
            </button>
            <button 
              onClick={() => setPlatform('woocommerce')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${platform === 'woocommerce' ? 'bg-[#96588a] text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              WooCommerce
            </button>
          </div>
          <button 
            onClick={fetchProducts}
            disabled={loading}
            className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-[2rem] p-6 text-red-400">
          {error.includes('not connected') ? (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-16 h-16 bg-[#0f0f0f] rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-lg text-3xl">
                {platform === 'shopify' ? '🛍️' : '🛒'}
              </div>
              <h3 className="text-xl font-medium text-white mb-2">{platform === 'shopify' ? 'Shopify' : 'WooCommerce'} not connected</h3>
              <p className="text-neutral-400">Please go to the Integrations tab to connect your store.</p>
            </div>
          ) : (
            <p className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Error: {error}</p>
          )}
        </div>
      )}

      {loading && !products.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg animate-pulse flex flex-col h-full">
              <div className="w-full h-48 bg-[#0f0f0f] rounded-xl mb-6"></div>
              <div className="h-5 w-3/4 bg-white/10 rounded mb-3"></div>
              <div className="h-4 w-1/2 bg-white/5 rounded"></div>
              <div className="mt-auto pt-6"><div className="h-10 w-full bg-white/10 rounded-full"></div></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-neutral-900 border border-white/5 rounded-[2rem] p-5 shadow-lg flex flex-col group hover:border-white/10 transition-colors">
              <div className="w-full h-48 bg-[#0f0f0f] border border-white/5 rounded-xl mb-5 overflow-hidden relative flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white rounded-md uppercase tracking-widest font-semibold">
                  {product.status}
                </div>
              </div>
              <h3 className="text-white font-medium mb-2 line-clamp-2" title={product.title}>{product.title}</h3>
              <p className="text-sm text-neutral-500 line-clamp-2 mb-6" dangerouslySetInnerHTML={{ __html: product.description || 'No description provided.' }}></p>
              
              <button 
                onClick={() => {
                  const temp = document.createElement("div");
                  temp.innerHTML = product.description;
                  const cleanDesc = temp.textContent || temp.innerText || "";
                  const combined = `Title: ${product.title}\n\nDescription:\n${cleanDesc}`;
                  onSelectProduct(combined, product.title, product.image);
                }}
                className="mt-auto w-full py-2.5 bg-[#0f0f0f] border border-white/5 text-neutral-300 hover:bg-white hover:text-black font-medium rounded-full text-sm transition-all flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Optimize Now
              </button>
            </div>
          ))}
          {!loading && products.length === 0 && !error && (
            <div className="col-span-full py-24 text-center">
              <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-lg text-neutral-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
              <p className="text-neutral-500">There are no products in your {platform === 'shopify' ? 'Shopify' : 'WooCommerce'} store.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
