'use client';

import React, { useState } from 'react';
import { FileCode, RefreshCw, CheckCircle, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Template } from '@/lib/types';

export default function TemplatesPage() {
  const { currentOrg } = useApp();

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 'tpl_diwali_offer',
      organizationId: currentOrg.id,
      name: 'diwali_special_offer',
      category: 'MARKETING',
      language: 'en_US',
      status: 'APPROVED',
      headerText: '🪔 Exclusive Festive Offer!',
      bodyText: 'Hello {{1}}, celebrate this festival with Acme! Get flat 30% OFF on all premium items from {{2}}. Click below to claim your discount coupon.',
      footerText: 'Reply STOP to opt out of marketing messages.',
      variables: ['1', '2'],
      updatedAt: '2026-09-01T12:00:00Z'
    },
    {
      id: 'tpl_order_confirm',
      organizationId: currentOrg.id,
      name: 'order_confirmation',
      category: 'UTILITY',
      language: 'en_US',
      status: 'APPROVED',
      headerText: 'Order Confirmed! 🛍️',
      bodyText: 'Hi {{1}}, your order {{2}} has been confirmed and is being processed. Total amount: {{3}}.',
      footerText: 'Thank you for shopping with Acme.',
      variables: ['1', '2', '3'],
      updatedAt: '2026-08-20T09:00:00Z'
    },
    {
      id: 'tpl_welcome_lead',
      organizationId: currentOrg.id,
      name: 'lead_welcome_series',
      category: 'MARKETING',
      language: 'en_US',
      status: 'APPROVED',
      headerText: 'Welcome to Acme Global! 👋',
      bodyText: 'Hi {{1}}, welcome! We are thrilled to have you here at {{2}}. Have questions regarding pricing or catalog?',
      footerText: 'Reply directly to chat with our team.',
      variables: ['1', '2'],
      updatedAt: '2026-08-15T10:00:00Z'
    },
    {
      id: 'tpl_abandoned_cart',
      organizationId: currentOrg.id,
      name: 'abandoned_cart_reminder',
      category: 'MARKETING',
      language: 'en_US',
      status: 'APPROVED',
      headerText: 'Did you leave something behind? 🛒',
      bodyText: 'Hey {{1}}, items in your cart are selling fast! Complete your purchase for order {{2}} now and enjoy free express delivery.',
      footerText: 'Limited time stock available.',
      variables: ['1', '2'],
      updatedAt: '2026-08-28T11:00:00Z'
    }
  ]);

  const [activePreview, setActivePreview] = useState<Template>(templates[0]);
  const [syncing, setSyncing] = useState(false);

  const handleSyncMetaTemplates = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">WhatsApp Business Templates</h1>
          <p className="text-xs text-slate-500">Synchronized approved WhatsApp Cloud API message templates with variable mapping.</p>
        </div>

        <button
          onClick={handleSyncMetaTemplates}
          disabled={syncing}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
          <span>{syncing ? 'Syncing with Meta...' : 'Sync from Meta Graph API'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-3">
          {templates.map((tpl) => {
            const isSelected = tpl.id === activePreview.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setActivePreview(tpl)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode size={16} className="text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 font-mono">{tpl.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      {tpl.category}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                      <CheckCircle size={10} /> {tpl.status}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-700 line-clamp-2">{tpl.bodyText}</p>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                  <span>Variables: {tpl.variables.map((v) => `{{${v}}}`).join(', ')}</span>
                  <span>Language: {tpl.language}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Mobile Preview Canvas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Eye size={14} className="text-emerald-600" />
            Live WhatsApp Message Preview
          </h3>

          {/* Smartphone Mockup */}
          <div className="w-full max-w-[280px] rounded-[36px] border-4 border-slate-800 bg-slate-100 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-[10px] text-slate-600 font-bold">
              <span>Acme Official Store</span>
              <span className="text-emerald-600 font-bold">● Online</span>
            </div>

            {/* Chat Bubble */}
            <div className="rounded-2xl bg-white border border-slate-200 p-3.5 text-xs text-slate-900 space-y-2 shadow-xs">
              {activePreview.headerText && (
                <div className="font-bold text-slate-900 text-xs">{activePreview.headerText}</div>
              )}
              <p className="text-[11px] leading-relaxed text-slate-700">{activePreview.bodyText}</p>
              {activePreview.footerText && (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">{activePreview.footerText}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
