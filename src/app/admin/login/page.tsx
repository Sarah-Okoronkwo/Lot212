'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ fontFamily: 'var(--font-syne)' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #e8ff47 0%, transparent 70%)' }}
        />
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'rgba(35,35,45,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--color-accent)', color: '#18181f', fontFamily: 'var(--font-dm-mono)' }}
          >
            212
          </div>
          <div>
            <p className="text-white font-bold text-base">Lot 212</p>
            <p className="text-ink-500 text-xs" style={{ fontFamily: 'var(--font-dm-mono)' }}>Admin Access</p>
          </div>
        </div>

        <h1 className="text-white text-2xl font-bold mb-1">Sign in</h1>
        <p className="text-ink-400 text-sm mb-7">Enter your admin credentials to continue.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-ink-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-ink-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="admin-input"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
            style={{ background: loading ? '#9aaa20' : 'var(--color-accent)', color: '#18181f' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <a href="/" className="block text-center text-ink-500 text-xs mt-6 hover:text-ink-300 transition-colors">
          Back to stories
        </a>
      </div>
    </div>
  );
}