'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Key, Layers, Check, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';


export default function SettingsPage() {
  const { currentOrg, whatsappAccount, saveAccountSettings } = useApp();

  const [providerMode, setProviderMode] = useState<'official' | 'demo'>('official');

  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [wbaId, setWbaId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('qv_verify_token_dobcy_2026');

  const [saved, setSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (whatsappAccount) {
      setProviderMode(whatsappAccount.providerMode || 'official');
      setMetaAppId(whatsappAccount.metaAppId || '');
      setMetaAppSecret(whatsappAccount.metaAppSecret || '');
      setWbaId(whatsappAccount.wbaId || '');
      setPhoneNumberId(whatsappAccount.phoneNumberId || '');
      setAccessToken(whatsappAccount.accessToken || '');
      setWebhookVerifyToken(whatsappAccount.webhookVerifyToken || 'qv_verify_token_dobcy_2026');
    }
  }, [whatsappAccount, currentOrg]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAccountSettings({
        providerMode,
        metaAppId,
        metaAppSecret,
        wbaId,
        phoneNumberId,
        accessToken,
        webhookVerifyToken
      });

      setSaved(true);
      setToastMsg('✅ Meta API Configuration Saved & Persisted (Survives Refresh & Server Restart)!');
      setTimeout(() => {
        setSaved(false);
        setToastMsg('');
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestMetaConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await fetch('/api/settings/whatsapp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          phoneNumberId,
          accessToken
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnectionResult({
          success: true,
          message: `🟢 Live Meta Connection Verified! Phone: ${data.displayPhoneNumber || phoneNumberId} (${data.verifiedName || currentOrg.name}), Quality: ${data.qualityRating}`
        });
      } else {
        setConnectionResult({
          success: false,
          message: `🔴 ${data.error || 'Meta API Connection Failed. Please verify your Access Token & Phone Number ID.'}`
        });
      }
    } catch (err: any) {
      setConnectionResult({
        success: false,
        message: `🔴 Connection check error: ${err.message}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearDemoData = () => {
    if (confirm('Clear saved credentials and reset to clean production state?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`qv_settings_${currentOrg.id}`);
      }
      setMetaAppId('');
      setMetaAppSecret('');
      setWbaId('');
      setPhoneNumberId('');
      setAccessToken('');
      setWebhookVerifyToken('qv_verify_token_dobcy_2026');
      saveAccountSettings({
        providerMode: 'official',
        metaAppId: '',
        metaAppSecret: '',
        wbaId: '',
        phoneNumberId: '',
        accessToken: '',
        webhookVerifyToken: 'qv_verify_token_dobcy_2026'
      });
      setToastMsg('✨ Saved settings cleared and reset to clean Live mode.');
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handlePurgeAllData = async () => {
    if (confirm('Are you sure you want to permanently purge all demo contacts, conversations, templates, and tags from Vercel?')) {
      try {
        const res = await fetch('/api/admin/purge', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          if (typeof window !== 'undefined') {
            localStorage.clear();
          }
          setToastMsg('🧹 ' + data.message);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (err: any) {
        alert('Error purging data: ' + err.message);
      }
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">WhatsApp API & Tenant Settings</h1>
          <p className="text-xs text-slate-500">
            Configure Meta Cloud API credentials, access tokens, and webhook secrets for <strong className="text-slate-800">{currentOrg.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings/database"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            🐬 Database Connection
          </Link>
          <Link
            href="/settings/social"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            ✨ Social Auto-Connect
          </Link>
        </div>
      </div>


      {toastMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

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
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
              Official Meta Cloud API Mode <Sparkles size={14} className="text-purple-600" />
            </div>
            <div className="mt-1 text-[11px] text-indigo-700 font-semibold">
              Production Meta Graph API dispatching with direct webhook verification.
            </div>
          </button>
        </div>
      </div>

      {/* Connection Status & Diagnostic Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Account Status: {whatsappAccount?.accountStatus || 'CONNECTED'} ({providerMode.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-500">
                Client Tenant: <strong className="text-slate-800">{currentOrg.name}</strong> • Phone ID: {phoneNumberId || 'Configured'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestMetaConnection}
            disabled={testingConnection}
            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-xs"
          >
            {testingConnection ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Testing Meta Graph API...
              </>
            ) : (
              '⚡ Test Meta API Connection'
            )}
          </button>
        </div>

        {connectionResult && (
          <div
            className={`rounded-xl border p-4 text-xs font-bold ${
              connectionResult.success
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-rose-300 bg-rose-50 text-rose-900'
            }`}
          >
            {connectionResult.message}
          </div>
        )}
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
              required
              placeholder="e.g. 109283746591023"
              value={metaAppId}
              onChange={(e) => setMetaAppId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">Meta App Secret</label>
            <input
              type="password"
              required
              placeholder="Paste 32-character Meta App Secret..."
              value={metaAppSecret}
              onChange={(e) => setMetaAppSecret(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">WhatsApp Business Account ID (WBA ID)</label>
            <input
              type="text"
              required
              placeholder="e.g. 1425897962783772"
              value={wbaId}
              onChange={(e) => setWbaId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">Phone Number ID</label>
            <input
              type="text"
              required
              placeholder="e.g. 1323990514132399"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-700 font-semibold">System User Permanent Access Token</label>
          <input
            type="password"
            required
            placeholder="Paste permanent access token (starts with EAAG...)"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-700 font-semibold">Webhook Verify Token</label>
          <input
            type="text"
            required
            value={webhookVerifyToken}
            onChange={(e) => setWebhookVerifyToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearDemoData}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Reset Inputs
            </button>
            <button
              type="button"
              onClick={handlePurgeAllData}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 flex items-center gap-1.5"
            >
              <span>🧹 Purge All Demo Data</span>
            </button>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 flex items-center gap-2 shadow-xs"
          >
            {saved ? <Check size={16} /> : null}
            <span>{saved ? 'Saved Successfully!' : 'Save Meta Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
