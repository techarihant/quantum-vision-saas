'use client';

import React, { useState } from 'react';
import { Webhook, Key, Plus, Copy, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ApiKey, CustomerWebhook } from '@/lib/types';

export default function IntegrationsPage() {
  const { currentOrg } = useApp();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key_live_1',
      organizationId: currentOrg.id,
      name: 'Production Server Integration Key',
      key: 'wa_live_sec_99a8b7c6d5e4f3a2b1c0d9e8',
      lastUsedAt: '2026-09-06T16:25:00Z',
      createdAt: '2026-01-15T00:00:00Z'
    }
  ]);

  const [webhooks, setWebhooks] = useState<CustomerWebhook[]>([
    {
      id: 'wh_crm_sync',
      organizationId: currentOrg.id,
      name: 'External CRM Sync Endpoint',
      url: 'https://api.acme-crm.com/webhooks/whatsapp-events',
      events: ['message.received', 'message.delivered', 'contact.opted_out'],
      secret: 'whsec_99a8b7c6d5e4f3a2',
      isEnabled: true,
      createdAt: '2026-02-01T10:00:00Z'
    }
  ]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Integrations & REST API</h1>
        <p className="text-xs text-slate-500">Developer API Keys, OpenAPI Endpoints, and Outbound Webhooks.</p>
      </div>

      {/* API Keys Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Key size={18} className="text-emerald-600" />
            SaaS REST API Keys
          </h2>
          <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
            <Plus size={14} /> Create API Key
          </button>
        </div>

        <div className="space-y-3">
          {apiKeys.map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <div className="font-bold text-slate-900">{k.name}</div>
                <div className="mt-1 font-mono text-emerald-700 font-bold">{k.key}</div>
              </div>
              <button
                onClick={() => handleCopy(k.key, k.id)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:bg-slate-100 font-semibold"
              >
                {copiedKey === k.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedKey === k.id ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Outbound Webhooks Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Webhook size={18} className="text-teal-600" />
            Outbound Event Webhooks
          </h2>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100">
            <Plus size={14} /> Add Webhook Endpoint
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.map((w) => (
            <div key={w.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{w.name}</span>
                <span className="text-emerald-700 font-mono">Status: Enabled</span>
              </div>
              <div className="font-mono text-slate-600">{w.url}</div>
              <div className="flex gap-2 pt-1">
                {w.events.map((ev) => (
                  <span key={ev} className="rounded bg-slate-200 px-2 py-0.5 text-[10px] text-teal-800 font-mono font-bold">
                    {ev}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
