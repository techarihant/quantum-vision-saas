'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ChevronDown,
  Plus,
  Bell,
  User as UserIcon,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function Header() {
  const { currentOrg, setCurrentOrg, orgs, currentUser, setCurrentUser, users, isDemoMode, whatsappAccount } = useApp();
  const [orgOpen, setOrgOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [simText, setSimText] = useState('Hi, I want to know the price for Enterprise');
  const [simContactId, setSimContactId] = useState('cnt_101');
  const [simStatus, setSimStatus] = useState('');

  const handleSimulateIncoming = async () => {
    setSimStatus('Sending simulated message...');
    try {
      const res = await fetch('/api/demo/trigger-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          contactId: simContactId,
          content: simText
        })
      });
      if (res.ok) {
        setSimStatus('✅ Simulated customer WhatsApp message received! Open Inbox to view.');
        setTimeout(() => setSimStatus(''), 4000);
      } else {
        setSimStatus('❌ Simulation error');
      }
    } catch (e) {
      setSimStatus('❌ Failed to trigger');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md shadow-xs">
      {/* Search & Org Selector */}
      <div className="flex items-center gap-4">
        {/* Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setOrgOpen(!orgOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
          >
            <Building2 size={16} className="text-emerald-600" />
            <span>{currentOrg.name}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {orgOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Organization
              </div>
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setCurrentOrg(org);
                    setOrgOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left ${
                    org.id === currentOrg.id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div>{org.name}</div>
                    <div className="text-[10px] text-slate-400">{org.plan} Plan</div>
                  </div>
                  {org.id === currentOrg.id && <CheckCircle2 size={14} className="text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Session Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-900 font-bold text-[11px] flex items-center gap-1">
            🟢 Live Session: <span className="font-mono text-emerald-700">07h 58m</span>
          </span>
        </div>
      </div>

      {/* Action Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Simulate Incoming Button */}
        <button
          onClick={() => setDemoModalOpen(!demoModalOpen)}
          className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-xs"
        >
          <Zap size={14} className="text-amber-600" />
          <span>Simulate Incoming Chat</span>
        </button>

        {/* New Campaign Button */}
        <Link
          href="/campaigns/wizard"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 pr-2 hover:bg-slate-100"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-lg object-cover"
            />
            <span className="hidden sm:inline text-xs font-bold text-slate-800">{currentUser.name}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 space-y-2">
              <div className="border-b border-slate-100 px-2 pb-2">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">arihant@quantumvision.in</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 border border-emerald-200">
                    Master Admin (Live)
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 font-mono">Session: 8h</span>
                </div>
              </div>

              <Link
                href="/auth/login"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    document.cookie = 'qv_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  }
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <span>🔒 Lock / Sign Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Demo incoming trigger modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Zap size={18} className="text-amber-500" />
              Simulate Incoming Customer Message
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Trigger a realistic incoming WhatsApp webhook message to test real-time Inbox reception & automations.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Customer Contact</label>
                <select
                  value={simContactId}
                  onChange={(e) => setSimContactId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="cnt_101">Arihant Jain (+91 98765 43210)</option>
                  <option value="cnt_102">Ananya Rao (+91 98123 45678)</option>
                  <option value="cnt_103">Vikram Mehta (+91 99887 76655)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Message Content</label>
                <textarea
                  rows={3}
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  placeholder="Type message text... (e.g. 'STOP' to test opt-out suppression)"
                />
              </div>

              {simStatus && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-medium">
                  {simStatus}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDemoModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handleSimulateIncoming}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                Send Incoming Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
