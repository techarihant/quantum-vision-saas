'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BillingPage() {
  const { currentOrg } = useApp();

  const usage = {
    messagesSent: 84320,
    messagesLimit: 100000,
    contactsCount: 12450,
    contactsLimit: 50000,
    campaignsCount: 15,
    teamMembers: 5
  };

  const messagePercent = Math.min(100, Math.round((usage.messagesSent / usage.messagesLimit) * 100));
  const contactPercent = Math.min(100, Math.round((usage.contactsCount / usage.contactsLimit) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">SaaS Subscription & Monthly Usage</h1>
        <p className="text-xs text-slate-500">Manage plan tiers, active usage allowances, and billing quotas.</p>
      </div>

      {/* Warning if approaching limit */}
      {messagePercent >= 80 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-center gap-3 shadow-xs">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <div>
            <strong>Usage Notice:</strong> You have used {messagePercent}% of your monthly WhatsApp message allowance. Upgrade to Enterprise to prevent message queue pausing.
          </div>
        </div>
      )}

      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex justify-between text-xs font-bold text-slate-900">
            <span>WhatsApp Messages (Monthly)</span>
            <span className="text-emerald-700 font-extrabold">{usage.messagesSent.toLocaleString()} / {usage.messagesLimit.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-3 rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${messagePercent}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">{100 - messagePercent}% allowance remaining for current billing cycle.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex justify-between text-xs font-bold text-slate-900">
            <span>CRM Contacts Capacity</span>
            <span className="text-indigo-700 font-extrabold">{usage.contactsCount.toLocaleString()} / {usage.contactsLimit.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-3 rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${contactPercent}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">{usage.contactsLimit - usage.contactsCount} contact slots remaining.</p>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { name: 'Free', price: '$0', msgs: '1,000 msgs/mo', contacts: '500 contacts', current: false },
          { name: 'Starter', price: '$49', msgs: '25,000 msgs/mo', contacts: '10,000 contacts', current: false },
          { name: 'Growth', price: '$199', msgs: '100,000 msgs/mo', contacts: '50,000 contacts', current: true },
          { name: 'Enterprise', price: '$499', msgs: '500,000 msgs/mo', contacts: '200,000 contacts', current: false }
        ].map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
              plan.current
                ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white shadow-xs'
            }`}
          >
            <div>
              <div className="text-sm font-bold text-slate-900 flex justify-between">
                <span>{plan.name}</span>
                {plan.current && <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">Active</span>}
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900">{plan.price}<span className="text-xs text-slate-500 font-normal">/mo</span></div>
              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> {plan.msgs}</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> {plan.contacts}</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Unlimited Team Inbox</li>
              </ul>
            </div>

            <button
              disabled={plan.current}
              className={`mt-6 w-full rounded-xl py-2 text-xs font-bold transition-all ${
                plan.current
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {plan.current ? 'Current Active Plan' : 'Upgrade Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
