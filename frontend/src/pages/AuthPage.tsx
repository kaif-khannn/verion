import React, { useState } from 'react';

const API = 'http://localhost:8000';

interface AuthPageProps {
  onSuccess: (token: string) => void;
  onBack: () => void;
}

export default function AuthPage({ onSuccess, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      let body;
      let headers: Record<string, string> = {};

      if (isLogin) {
        body = new URLSearchParams();
        body.append('username', email);
        body.append('password', password);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        body = JSON.stringify({ name, email, password });
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers,
        body
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Authentication failed');
      }

      const data = await res.json();
      
      if (isLogin) {
        onSuccess(data.access_token);
      } else {
        setIsLogin(true);
        setSuccess('Account created successfully! Please log in.');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>

      <div className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
        
        <button onClick={onBack} className="absolute top-6 left-6 text-neutral-500 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-lg">
            <span className="text-black font-bold text-xl">V</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
          <p className="text-neutral-500 text-sm mt-2 text-center">
            {isLogin ? 'Enter your details to access your workspace.' : 'Sign up to start automating your e-commerce workflow.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2 block">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-white/30 transition-colors"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-white text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors mt-6 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-white hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
