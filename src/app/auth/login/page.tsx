'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('arihant@quantumvision.in');
  const [password, setPassword] = useState('Quantum@Vision2026!');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      if (email.toLowerCase() === 'arihant@quantumvision.in' && password === 'Quantum@Vision2026!') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('qv_auth_user', JSON.stringify({
            id: 'usr_arihant',
            name: 'Arihant',
            email: 'arihant@quantumvision.in',
            role: 'owner'
          }));
          document.cookie = 'qv_auth_session=active; path=/; max-age=86400; SameSite=Lax';
        }
        router.push('/');
      } else {
        setErrorMsg('Invalid Login ID or Password. Please check credentials.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 font-bold text-white shadow-md text-lg">
            QV
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Quantum Vision SaaS</h1>
            <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck size={14} /> Production Live Portal (Dobcy Workspace)
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Live Production Sign In</h2>
          <p className="mt-1 text-xs text-slate-500">Enter your administrative credentials to access Dobcy CRM.</p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Login ID / Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-[11px] text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" /> Default Master Admin Credentials:
            </div>
            <div><strong>Login ID:</strong> <code className="font-mono text-emerald-800">arihant@quantumvision.in</code></div>
            <div><strong>Password:</strong> <code className="font-mono text-emerald-800">Quantum@Vision2026!</code></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Production Workspace'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Quantum Vision Multi-Tenant Security System • Encrypted SSL Session
        </div>
      </div>
    </div>
  );
}
