'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('rahul@acme.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 font-bold text-white shadow-md">
            WA
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">WhatsApp Marketing SaaS</h1>
            <p className="text-xs text-emerald-700 font-bold">Production Multi-Tenant Portal</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900">Sign In to Your Workspace</h2>
        <p className="mt-1 text-xs text-slate-500">Enter your credentials to access your organization dashboard.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
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

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-bold text-emerald-700 hover:underline">
            Create Organization
          </Link>
        </div>
      </div>
    </div>
  );
}
