'use client';

import React, { useState } from 'react';
import { CheckCircle2, Key, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { currentOrg, whatsappAccount, refreshAccount } = useApp();

  const [providerMode, setProviderMode] = useState<'official' | 'demo'>(
    whatsappAccount?.providerMode || 'demo'
  );

  const [metaAppId, setMetaAppId] = useState(whatsappAccount?.metaAppId || '109283746591023');
  const [metaAppSecret, setMetaAppSecret] = useState(whatsappAccount?.metaAppSecret || '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d');
  const [wbaId, setWbaId] = useState(whatsappAccount?.wbaId || '100293847561029');
  const [phoneNumberId, setPhoneNumberId] = useState(whatsappAccount?.phoneNumberId || '105948372615492');
  const [accessToken, setAccessToken] = useState(whatsappAccount?.accessToken || 'EAAG9x8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d...');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState(whatsappAccount?.webhookVerifyToken || 'acme_whatsapp_webhook_secret_2026');

  const [saved, setSaved] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          providerMode,
          metaAppId,
          metaAppSecret,
          wbaId,
          phoneNumberId,
          accessToken,
          webhookVerifyToken
        })
      });

      if (res.ok) {
        setSaved(true);
        refreshAccount();
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">WhatsApp API & Tenant Settings</h1>
        <p className="text-xs text-slate-500">Configure Meta Cloud API credentials, secret tokens, and dual demo engine options.</p>
      </div>

      {/* Provider Mode Selection Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers size={18} className="text-emerald-600" />
          WhatsApp Engine Mode
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setProviderMode('demo')}
            className={`rounded-xl border p-4 text-left transition-all ${
              providerMode === 'demo'
                ? 'border-emerald-500 bg-emerald-50 text-slate-900 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">Interactive Demo Simulator Mode</div>
            <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
              Full product testing & chat simulation without active Meta billing.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setProviderMode('official')}
            className={`rounded-xl border p-4 text-left transition-all ${
              providerMode === 'official'
                ? 'border-emerald-500 bg-emerald-50 text-slate-900 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">Official Meta Cloud API Mode</div>
            <div className="mt-1 text-[11px] text-indigo-700 font-semibold">
              Production Meta Graph API dispatching with direct webhook verification.
            </div>
          </button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Account Status: CONNECTED</h3>
              <p className="text-xs text-slate-500">Display Name: Acme Official Store • Phone: +91 98765 00000</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            Quality: GREEN
          </span>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Key size={18} className="text-emerald-600" />
          Meta Cloud API Credentials
        </h2>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-semibold">Meta App ID</label>
            <input
              type="text"
              value={metaAppId}
              onChange={(e) => setMetaAppId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">Meta App Secret</label>
            <input
              type="password"
              value={metaAppSecret}
              onChange={(e) => setMetaAppSecret(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">WhatsApp Business Account ID (WBA ID)</label>
            <input
              type="text"
              value={wbaId}
              onChange={(e) => setWbaId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">Phone Number ID</label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-700 font-semibold">System User Access Token</label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-slate-700 font-semibold">Webhook Verify Token</label>
          <input
            type="text"
            value={webhookVerifyToken}
            onChange={(e) => setWebhookVerifyToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            {saved ? 'Saved Credentials!' : 'Save WhatsApp Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
