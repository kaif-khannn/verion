import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8000';

interface Connection {
  id: string;
  platform: string;
  shop_domain: string;
  connected_at: string;
}

export default function IntegrationsTab() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [shopifyToken, setShopifyToken] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/connections`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => setConnections(data))
      .catch(() => { });
  }, []);

  const handleConnect = async () => {
    setConnectLoading(true); setConnectError(null);
    try {
      const r = await fetch(`${API}/api/connections/shopify`, {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ shop_domain: shopifyDomain, access_token: shopifyToken }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.detail); }
      const data = await r.json();
      setConnections(prev => [...prev.filter(c => c.platform !== 'shopify'), data]);
      setShowConnectModal(false);
    } catch (e: any) { setConnectError(e.message); }
    finally { setConnectLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const r = await fetch(`${API}/api/connections/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (r.ok) setConnections(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6 max-w-[1400px">
      <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl">
        <h2 className="text-3xl font-semibold text-white">Integrations</h2>
        <p className="text-neutral-500 mt-2 text-lg">Connect your store and external platforms.</p>
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 shadow-2xl rounded-[2rem] p-8 w-full max-w-md mx-4 space-y-6 relative">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                Connect Shopify
              </h2>
              <button onClick={() => setShowConnectModal(false)} className="text-neutral-500 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed bg-[#0f0f0f] border border-white/5 p-4 rounded-xl">
              Create a <strong className="text-white">Custom App</strong> in your Shopify Admin → Apps → Develop apps.<br /><br />
              Enable scopes: <code className="text-white bg-white/10 px-1 py-0.5 rounded">write_products</code> and <code className="text-white bg-white/10 px-1 py-0.5 rounded">read_products</code>, then copy the access token.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-widest mb-1 block">Shop Domain</label>
                <input
                  value={shopifyDomain} onChange={e => setShopifyDomain(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="w-full p-3 rounded-xl bg-[#0f0f0f] border border-white/10 text-white text-sm focus:border-white/20 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-widest mb-1 block">Access Token</label>
                <input
                  type="password" value={shopifyToken} onChange={e => setShopifyToken(e.target.value)}
                  placeholder="shpat_…"
                  className="w-full p-3 rounded-xl bg-[#0f0f0f] border border-white/10 text-white text-sm focus:border-white/20 outline-none transition-colors"
                />
              </div>
            </div>
            {connectError && <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/30">{connectError}</p>}
            <button
              disabled={connectLoading || !shopifyDomain || !shopifyToken}
              onClick={handleConnect}
              className="w-full py-3 bg-white text-black font-medium rounded-full disabled:opacity-50 transition-opacity flex justify-center items-center gap-2 hover:bg-neutral-200"
            >
              {connectLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : 'Connect Store'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify Card */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#95bf47] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#0f0f0f] flex items-center justify-center text-3xl border border-white/5 shadow-lg">
              🛍️
            </div>
            {connections.some(c => c.platform === 'shopify') ? (
              <span className="text-xs px-3 py-1.5 rounded-full bg-[#95bf47]/10 text-[#95bf47] border border-[#95bf47]/20 font-medium">Connected</span>
            ) : (
              <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-neutral-400 border border-white/5 font-medium">Not Connected</span>
            )}
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-medium text-white mb-2">Shopify</h3>
            <p className="text-neutral-500 mb-8">Publish optimized listings directly to your storefront and fetch existing products.</p>
            {connections.some(c => c.platform === 'shopify') ? (
              <button onClick={() => handleDelete(connections.find(c => c.platform === 'shopify')!.id)} className="w-full py-3 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors font-medium">
                Disconnect
              </button>
            ) : (
              <button onClick={() => setShowConnectModal(true)} className="w-full py-3 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors font-medium">
                Connect Shopify
              </button>
            )}
          </div>
        </div>

        {/* Amazon Card */}
        <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff9900] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#0f0f0f] flex items-center justify-center text-3xl border border-white/5 shadow-lg">
              📦
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-neutral-400 border border-white/5 font-medium">Coming Soon</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-medium text-white mb-2">Amazon SP-API</h3>
            <p className="text-neutral-500 mb-8">Manage Amazon Seller Central listings automatically. Waitlist available.</p>
            <button disabled className="w-full py-3 rounded-full bg-[#0f0f0f] text-neutral-600 border border-white/5 cursor-not-allowed font-medium">
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
