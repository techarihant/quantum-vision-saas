'use client';

import React, { useState, useEffect } from 'react';
import { FileCode, RefreshCw, CheckCircle, Eye, Plus, Sparkles, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Template } from '@/lib/types';

export default function TemplatesPage() {
  const { currentOrg } = useApp();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [activePreview, setActivePreview] = useState<Template | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    headerText: '',
    bodyText: '',
    footerText: ''
  });

  const loadTemplates = async () => {
    try {
      let url = `/api/templates?organizationId=${currentOrg.id}`;
      const savedLocal = typeof window !== 'undefined' ? localStorage.getItem(`qv_settings_${currentOrg.id}`) : null;
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (parsed.wbaId && parsed.accessToken) {
            url += `&wbaId=${encodeURIComponent(parsed.wbaId)}&accessToken=${encodeURIComponent(parsed.accessToken)}`;
          }
        } catch (e) {}
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.templates)) {
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          setActivePreview(data.templates[0]);
        } else {
          setActivePreview(null);
        }
      }
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [currentOrg.id]);

  const handleSyncMetaTemplates = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      await loadTemplates();
      setFeedback({
        type: 'success',
        message: '✨ Templates synchronized with Meta Graph API & Workspace Database.'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Failed to sync with Meta: ${err.message}`
      });
    } finally {
      setSyncing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name || !newTemplate.bodyText) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name: newTemplate.name,
          category: newTemplate.category,
          language: newTemplate.language,
          headerText: newTemplate.headerText || undefined,
          bodyText: newTemplate.bodyText,
          footerText: newTemplate.footerText || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        setIsCreateOpen(false);
        setNewTemplate({
          name: '',
          category: 'MARKETING',
          language: 'en_US',
          headerText: '',
          bodyText: '',
          footerText: ''
        });

        await loadTemplates();
        if (data.template) {
          setActivePreview(data.template);
        }

        if (data.submittedToMeta) {
          setFeedback({
            type: 'success',
            message: `🎉 Success! Template "${data.template.name}" submitted directly to Meta Graph API! Status: ${data.template.status}`
          });
        } else {
          setFeedback({
            type: 'warning',
            message: `⚠️ Template created in local workspace. Meta Notice: ${data.metaError || 'Please configure Meta WBA credentials in Settings to auto-submit to Meta.'}`
          });
        }
      } else {
        setFeedback({
          type: 'error',
          message: `Failed to create template: ${data.error}`
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Network error creating template: ${err.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">WhatsApp Business HSM Templates</h1>
          <p className="text-xs text-slate-500">
            Create, manage, and synchronize Meta-approved WhatsApp Cloud API message templates for <strong className="text-slate-800">{currentOrg.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncMetaTemplates}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
            <span>{syncing ? 'Syncing with Meta...' : 'Sync Meta Templates'}</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus size={16} />
            <span>Create New Template</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-xs font-bold flex items-center gap-2 shadow-xs ${
            feedback.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : feedback.type === 'warning'
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : 'border-rose-300 bg-rose-50 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-3">
          {templates.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <FileCode size={36} className="mx-auto text-slate-300" />
              <h3 className="mt-3 text-sm font-bold text-slate-800">No Templates Found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                No HSM templates present in your workspace. Click <strong>Create New Template</strong> to submit a template directly to Meta or click <strong>Sync Meta Templates</strong>.
              </p>
            </div>
          ) : (
            templates.map((tpl) => {
              const isSelected = activePreview && tpl.id === activePreview.id;
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
                    <span>Variables: {tpl.variables?.length > 0 ? tpl.variables.map((v) => `{{${v}}}`).join(', ') : 'None'}</span>
                    <span>Language: {tpl.language}</span>
                  </div>
                </div>
              );
            })
          )}
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
              <span>MastJaipur - मस्त जयपुर</span>
              <span className="text-emerald-600 font-bold">● Official Business</span>
            </div>

            {/* Chat Bubble */}
            {activePreview ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-3.5 text-xs text-slate-900 space-y-2 shadow-xs">
                {activePreview.headerText && (
                  <div className="font-bold text-slate-900 text-xs">{activePreview.headerText}</div>
                )}
                <p className="text-[11px] leading-relaxed text-slate-700">{activePreview.bodyText}</p>
                {activePreview.footerText && (
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">{activePreview.footerText}</div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Select a template from the list to preview
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-600" />
                Create Meta WhatsApp HSM Template
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Template Name (snake_case) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mastjaipur_welcome_offer"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="MARKETING">MARKETING (Promotions, Discounts)</option>
                    <option value="UTILITY">UTILITY (Order Alerts, Billing)</option>
                    <option value="AUTHENTICATION">AUTHENTICATION (OTP Codes)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Header Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 🪔 MastJaipur Exclusive Offer!"
                  value={newTemplate.headerText}
                  onChange={(e) => setNewTemplate({ ...newTemplate, headerText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Message Body Text (Use {"{{1}}"}, {"{{2}}"} for dynamic variables) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Hello {{1}}, explore our exclusive collection of {{2}} at MastJaipur!"
                  value={newTemplate.bodyText}
                  onChange={(e) => setNewTemplate({ ...newTemplate, bodyText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Footer Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Reply STOP to opt out."
                  value={newTemplate.footerText}
                  onChange={(e) => setNewTemplate({ ...newTemplate, footerText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Submitting to Meta...' : 'Submit to Meta for Approval'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
