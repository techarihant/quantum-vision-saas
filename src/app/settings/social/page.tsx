'use client';

import React, { useState } from 'react';
import { Camera, Globe, ShieldCheck, CheckCircle2, Zap, RefreshCw, Key, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SocialSettingsPage() {
  const { currentOrg } = useApp();
  const [autoDmEnabled, setAutoDmEnabled] = useState(true);
  const [autoHandoffEnabled, setAutoHandoffEnabled] = useState(true);
  const [leadScoreBonus, setLeadScoreBonus] = useState(25);
  const [webhookStatus, setWebhookStatus] = useState('VERIFIED & CONNECTED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Camera size={24} className="text-purple-600" />
          Instagram & Facebook Connected Channels
        </h1>
        <p className="text-xs text-slate-500">
          Official Meta Graph API webhooks and channel configuration for social lead automation.
        </p>
      </div>

      {/* Connected Accounts Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Instagram Account */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold shadow-xs">
                <Camera size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Instagram Business Account</h3>
                <p className="text-xs text-slate-500">@dobcy_official</p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 size={13} /> Connected
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Meta Account ID:</span>
              <span className="font-mono font-bold text-slate-800">17841409823412</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Webhook Status:</span>
              <span className="font-bold text-emerald-600">Active (Comments + DMs)</span>
            </div>
          </div>

          <button
            onClick={() => alert('Refreshing Meta OAuth Token... Token Valid!')}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Re-authorize Meta OAuth</span>
          </button>
        </div>

        {/* Facebook Page */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-xs">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Facebook Official Page</h3>
                <p className="text-xs text-slate-500">Dobcy Technologies India</p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 size={13} /> Connected
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Page ID:</span>
              <span className="font-mono font-bold text-slate-800">1092837482910</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Messenger Bot:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>

          <button
            onClick={() => alert('Refreshing Facebook Page Access Token...')}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Refresh Page Token</span>
          </button>
        </div>
      </div>

      {/* Global Social Automation Rules */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Zap size={18} className="text-purple-600" />
          Global Automation Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Auto-DM on Keyword Comments</h4>
              <p className="text-[11px] text-slate-500">Automatically trigger direct message when user comments matching keyword on post.</p>
            </div>
            <input
              type="checkbox"
              checked={autoDmEnabled}
              onChange={(e) => setAutoDmEnabled(e.target.checked)}
              className="h-5 w-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Auto WhatsApp CRM Handoff</h4>
              <p className="text-[11px] text-slate-500">Create a WhatsApp CRM Contact immediately when user provides phone number in social DM.</p>
            </div>
            <input
              type="checkbox"
              checked={autoHandoffEnabled}
              onChange={(e) => setAutoHandoffEnabled(e.target.checked)}
              className="h-5 w-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Phone Number Collection Lead Bonus</h4>
              <p className="text-[11px] text-slate-500">Lead score points added when social contact submits WhatsApp number.</p>
            </div>
            <input
              type="number"
              value={leadScoreBonus}
              onChange={(e) => setLeadScoreBonus(Number(e.target.value))}
              className="w-20 rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-slate-900 text-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
