'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Create SaaS Account & Organization</h2>
        <p className="mt-1 text-xs text-slate-500">Set up your business workspace to connect official WhatsApp Cloud API.</p>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Your Full Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                required
                placeholder="Arihant Jain"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Organization / Business Name</label>
            <div className="relative mt-1">
              <Building className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                required
                placeholder="Acme Global E-Commerce"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Work Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="email"
                required
                placeholder="name@company.com"
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
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <span>Create Workspace</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/auth/login" className="font-bold text-emerald-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
