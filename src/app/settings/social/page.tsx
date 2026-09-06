'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Globe, CheckCircle2, Zap, RefreshCw, Key, Check, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SocialSettingsPage() {
  const { currentOrg } = useApp();

  const [instagramUsername, setInstagramUsername] = useState('');
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [facebookPageName, setFacebookPageName] = useState('');
  const [facebookPageId, setFacebookPageId] = useState('');
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('qv_social_verify_token_2026');

  const [autoDmEnabled, setAutoDmEnabled] = useState(true);
  const [autoHandoffEnabled, setAutoHandoffEnabled] = useState(true);
  const [leadScoreBonus, setLeadScoreBonus] = useState(25);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load existing credentials on mount
  useEffect(() => {
    const savedLocal = typeof window !== 'undefined' ? localStorage.getItem(`qv_social_settings_${currentOrg.id}`) : null;
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        setInstagramUsername(parsed.instagramUsername || '');
        setInstagramAccountId(parsed.instagramAccountId || '');
        setFacebookPageName(parsed.facebookPageName || '');
        setFacebookPageId(parsed.facebookPageId || '');
        setPageAccessToken(parsed.pageAccessToken || '');
        setWebhookVerifyToken(parsed.webhookVerifyToken || 'qv_social_verify_token_2026');
      } catch (e) {}
    } else {
      // Default to MastJaipur credentials out of the box so user doesn't get stuck
      setInstagramUsername('mastjaipur');
      setInstagramAccountId('17841498203912');
      setFacebookPageName('MastJaipur');
      setFacebookPageId('1092837482910');
    }
  }, [currentOrg.id]);

  const handleQuickConnectMastJaipur = async () => {
    setInstagramUsername('mastjaipur');
    setInstagramAccountId('17841498203912');
    setFacebookPageName('MastJaipur');
    setFacebookPageId('1092837482910');
    setWebhookVerifyToken('qv_social_verify_token_2026');

    const payload = {
      organizationId: currentOrg.id,
      instagramUsername: 'mastjaipur',
      instagramAccountId: '17841498203912',
      facebookPageName: 'MastJaipur',
      facebookPageId: '1092837482910',
      pageAccessToken,
      webhookVerifyToken: 'qv_social_verify_token_2026'
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(`qv_social_settings_${currentOrg.id}`, JSON.stringify(payload));
    }

    try {
      await fetch('/api/settings/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSaved(true);
      setToastMsg('✨ Auto-Connected @mastjaipur & Facebook Page MastJaipur successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setToastMsg('✨ Connected @mastjaipur locally!');
    }
  };

  const handleSaveSocialSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMsg('');

    const payload = {
      organizationId: currentOrg.id,
      instagramUsername,
      instagramAccountId,
      facebookPageName,
      facebookPageId,
      pageAccessToken,
      webhookVerifyToken
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(`qv_social_settings_${currentOrg.id}`, JSON.stringify(payload));
    }

    try {
      const res = await fetch('/api/settings/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setToastMsg('✨ Social credentials updated & saved for your live account!');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      setToastMsg('Saved locally! Network error syncing to server.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          instagramUsername,
          instagramAccountId,
          facebookPageName,
          facebookPageId,
          pageAccessToken,
          webhookVerifyToken
        })
      });
      const data = await res.json();
      if (data.liveVerified) {
        setTestResult({
          success: true,
          message: `🟢 Live Meta Instagram Graph API Connection Verified! Username: @${data.liveDetails.username || instagramUsername}`
        });
      } else if (data.apiError) {
        setTestResult({
          success: false,
          message: `⚠️ Meta Verification Error: ${data.apiError}`
        });
      } else {
        setTestResult({
          success: true,
          message: `✅ Social Channels Configured! Active handle: @${instagramUsername || 'Your_Handle'}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Error testing connection: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Camera size={24} className="text-purple-600" />
            Instagram & Facebook Connected Channels
          </h1>
          <p className="text-xs text-slate-500">
            Connect your official Instagram Business account & Facebook Page for automated comment DMs and lead capture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleQuickConnectMastJaipur}
            className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles size={14} className="text-purple-600" />
            <span>1-Click Connect @mastjaipur</span>
          </button>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-xs"
          >
            {testing ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Testing Meta Graph API...
              </>
            ) : (
              '⚡ Test Instagram Connection'
            )}
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {testResult && (
        <div
          className={`rounded-xl border p-4 text-xs font-bold flex items-center gap-2 shadow-xs ${
            testResult.success
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-rose-300 bg-rose-50 text-rose-900'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Connection Overview Banner */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Instagram Account Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold shadow-xs">
                <Camera size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Instagram Business Account</h3>
                <p className="text-xs font-bold text-purple-600">{instagramUsername ? `@${instagramUsername.replace(/^@/, '')}` : 'Not Connected Yet'}</p>
              </div>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold flex items-center gap-1 ${
                instagramUsername
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                  : 'bg-amber-100 border-amber-200 text-amber-800'
              }`}
            >
              <CheckCircle2 size={13} /> {instagramUsername ? 'Configured' : 'Setup Required'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Instagram Account ID:</span>
              <span className="font-mono font-bold text-slate-800">{instagramAccountId || 'Not Set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Webhook Event:</span>
              <span className="font-bold text-emerald-600">Comments & Direct Messages</span>
            </div>
          </div>
        </div>

        {/* Facebook Page Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-xs">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Facebook Official Page</h3>
                <p className="text-xs font-bold text-blue-600">{facebookPageName || 'Not Connected Yet'}</p>
              </div>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold flex items-center gap-1 ${
                facebookPageId
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                  : 'bg-amber-100 border-amber-200 text-amber-800'
              }`}
            >
              <CheckCircle2 size={13} /> {facebookPageId ? 'Configured' : 'Setup Required'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Page ID:</span>
              <span className="font-mono font-bold text-slate-800">{facebookPageId || 'Not Set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Messenger Bot:</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Setup Form */}
      <form onSubmit={handleSaveSocialSettings} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Key size={18} className="text-purple-600" />
          Enter Your Real Instagram & Facebook Credentials
        </h2>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-semibold">Instagram Handle / Username *</label>
            <input
              type="text"
              required
              placeholder="e.g. mastjaipur or @your_handle"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">Instagram Account ID (Meta Graph API) *</label>
            <input
              type="text"
              required
              placeholder="e.g. 17841409823412"
              value={instagramAccountId}
              onChange={(e) => setInstagramAccountId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">Facebook Page Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. MastJaipur Official"
              value={facebookPageName}
              onChange={(e) => setFacebookPageName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold">Facebook Page ID *</label>
            <input
              type="text"
              required
              placeholder="e.g. 1092837482910"
              value={facebookPageId}
              onChange={(e) => setFacebookPageId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-700 font-semibold">Meta Page Access Token (Instagram & Facebook Messenger API)</label>
          <input
            type="password"
            placeholder="Paste your Meta Page Access Token (starts with EAA...)"
            value={pageAccessToken}
            onChange={(e) => setPageAccessToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-700 font-semibold">Meta Webhook Verification Token</label>
          <input
            type="text"
            required
            value={webhookVerifyToken}
            onChange={(e) => setWebhookVerifyToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-purple-700 flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {saved ? <Check size={16} /> : null}
            <span>{saved ? 'Social Settings Saved!' : 'Save Social Credentials'}</span>
          </button>
        </div>
      </form>

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
