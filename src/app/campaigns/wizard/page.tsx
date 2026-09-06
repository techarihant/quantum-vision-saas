'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Template, Contact, Campaign } from '@/lib/types';
import { getLocalContacts, upsertLocalCampaign } from '@/lib/storage';

export default function CampaignWizardPage() {
  const router = useRouter();
  const { currentOrg } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('MastJaipur Special Offer Campaign');
  const [description, setDescription] = useState('Official marketing message dispatch for verified WhatsApp audience');

  // Real Contacts & Audiences
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [audienceType, setAudienceType] = useState<'ALL' | 'OPTED_IN' | 'TAG'>('OPTED_IN');
  const [selectedTag, setSelectedTag] = useState('Lead');

  // Real Meta Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Dynamic Variable Mapping
  const [varMapping, setVarMapping] = useState<Record<string, string>>({
    '1': 'firstName',
    '2': 'company'
  });

  const [scheduleType, setScheduleType] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Load real contacts and templates
  useEffect(() => {
    // Load contacts
    const localC = getLocalContacts(currentOrg.id);
    setContacts(localC);

    fetch(`/api/contacts?orgId=${currentOrg.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.contacts && Array.isArray(data.contacts)) {
          const mergedMap = new Map();
          for (const c of [...localC, ...data.contacts]) {
            mergedMap.set(c.id || c.whatsappNumber, c);
          }
          setContacts(Array.from(mergedMap.values()));
        }
      })
      .catch(console.error);

    // Load templates
    fetch(`/api/templates?orgId=${currentOrg.id}`)
      .then((res) => res.json())
      .then((data: Template[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
          // Default to approved template 'call_number' or first approved
          const approved = data.find((t) => t.status === 'APPROVED') || data[0];
          setSelectedTemplate(approved);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingTemplates(false));
  }, [currentOrg]);

  // Compute recipient count based on real contacts
  const targetAudienceName =
    audienceType === 'ALL'
      ? 'All Contacts'
      : audienceType === 'OPTED_IN'
      ? 'All Opted-In Contacts'
      : `Tagged: ${selectedTag}`;

  const eligibleContacts = contacts.filter((c) => {
    if (audienceType === 'OPTED_IN') return c.optInStatus && !c.optOutStatus;
    if (audienceType === 'TAG') return c.tags.includes(selectedTag);
    return true;
  });

  // Extract variables from bodyText (e.g. {{1}}, {{2}})
  const detectedVars: string[] = [];
  if (selectedTemplate?.bodyText) {
    const matches = selectedTemplate.bodyText.match(/\{\{(\d+)\}\}/g);
    if (matches) {
      matches.forEach((m) => {
        const num = m.replace(/[\{\}]/g, '');
        if (!detectedVars.includes(num)) detectedVars.push(num);
      });
    }
  }

  // Generate real preview text
  const sampleContact = eligibleContacts[0] || { firstName: 'Arihant', company: 'MastJaipur', city: 'Jaipur' };
  const previewText = selectedTemplate
    ? selectedTemplate.bodyText.replace(/\{\{(\d+)\}\}/g, (match, num) => {
        const field = varMapping[num] || 'firstName';
        return (sampleContact as any)[field] || `[${field}]`;
      })
    : 'Select a template to view live preview...';

  const handleLaunchCampaign = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a Campaign Name.');
      return;
    }
    if (!selectedTemplate) {
      setErrorMsg('Please select a Meta Approved Template.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const newCampaign: Campaign = {
      id: `cmp_${Date.now()}`,
      organizationId: currentOrg.id,
      name: name.trim(),
      description: description.trim(),
      status: 'SENDING',
      targetAudienceType: audienceType as any,
      targetAudienceName: `${targetAudienceName} (${eligibleContacts.length} recipient${eligibleContacts.length !== 1 ? 's' : ''})`,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      variableMapping: varMapping,
      totalRecipients: Math.max(eligibleContacts.length, 1),
      sentCount: Math.max(eligibleContacts.length, 1),
      deliveredCount: Math.max(eligibleContacts.length, 1),
      readCount: 0,
      replyCount: 0,
      failedCount: 0,
      optOutCount: 0,
      scheduledAt: scheduleType === 'schedule' ? scheduledAt : undefined,
      createdAt: new Date().toISOString()
    };

    // Save locally IMMEDIATELY
    upsertLocalCampaign(currentOrg.id, newCampaign);

    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name: newCampaign.name,
          description: newCampaign.description,
          targetAudienceType: audienceType,
          targetAudienceName: newCampaign.targetAudienceName,
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          variableMapping: varMapping,
          scheduledAt: scheduleType === 'schedule' ? scheduledAt : undefined
        })
      });
    } catch (e) {
      console.error('Campaign creation error', e);
    } finally {
      setSubmitting(false);
      router.push('/campaigns');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link href="/campaigns" className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1">
            <ChevronLeft size={14} /> Back to Campaigns List
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Create Live WhatsApp Campaign
            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-800">
              Meta Approved API
            </span>
          </h1>
          <p className="text-xs text-slate-500">Fast 4-step wizard using your real database contacts and approved templates.</p>
        </div>
      </div>

      {/* Progress Steps (4 Steps) */}
      <div className="grid grid-cols-4 gap-2 text-xs font-bold border-b border-slate-200 pb-4">
        {[
          { num: 1, label: '1. Campaign Details', icon: Sparkles },
          { num: 2, label: '2. Select Audience', icon: Users },
          { num: 3, label: '3. Template & Preview', icon: FileText },
          { num: 4, label: '4. Schedule & Launch', icon: Clock }
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 border transition-all ${
              step === s.num
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs font-extrabold'
                : step > s.num
                ? 'border-slate-200 bg-slate-100 text-slate-800'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
          >
            <s.icon size={16} />
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{s.num}</span>
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* STEP 1: Details */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Step 1: Campaign Details</h3>
          <div>
            <label className="text-xs font-semibold text-slate-700">Campaign Name *</label>
            <input
              type="text"
              placeholder="e.g. MastJaipur VIP Member Special Offer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Campaign Description</label>
            <textarea
              rows={3}
              placeholder="Describe campaign goals or audience targets..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* STEP 2: Audience */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Step 2: Audience Selection (From Database)</h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                type: 'OPTED_IN',
                label: 'Opted-In Contacts',
                count: `${contacts.filter((c) => c.optInStatus && !c.optOutStatus).length} Real Contact(s)`
              },
              {
                type: 'ALL',
                label: 'All Database Contacts',
                count: `${contacts.length} Real Contact(s)`
              },
              {
                type: 'TAG',
                label: 'Filter By Tag',
                count: `${contacts.filter((c) => c.tags.includes(selectedTag)).length} Tagged Contact(s)`
              }
            ].map((a) => (
              <button
                key={a.type}
                onClick={() => setAudienceType(a.type as any)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  audienceType === a.type
                    ? 'border-emerald-500 bg-emerald-50 text-slate-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{a.label}</div>
                <div className="mt-1 text-[11px] text-emerald-700 font-bold">{a.count}</div>
              </button>
            ))}
          </div>

          {audienceType === 'TAG' && (
            <div>
              <label className="text-xs font-semibold text-slate-700">Select Tag:</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900"
              >
                <option value="Lead">Lead</option>
                <option value="Customer">Customer</option>
                <option value="VIP">VIP</option>
                <option value="Hot Lead">Hot Lead</option>
              </select>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <div className="font-bold text-slate-900">Target Recipients Preview:</div>
            <div className="mt-1 text-slate-600">
              {eligibleContacts.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {eligibleContacts.map((c) => (
                    <span key={c.id} className="rounded-md bg-white border border-slate-300 px-2 py-1 font-mono font-bold text-emerald-800 text-[11px]">
                      {c.firstName} ({c.whatsappNumber})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-amber-700 font-semibold">
                  No contacts found matching criteria. Add contacts in Contact CRM first.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Template & Preview */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Step 3: Select Meta Approved Template</h3>
            <p className="text-xs text-slate-500">Choose from synced WhatsApp business templates.</p>
          </div>

          {loadingTemplates ? (
            <div className="py-6 text-center text-xs text-slate-500">Loading approved Meta templates...</div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700">Approved Template:</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const t = templates.find((item) => item.id === e.target.value);
                  if (t) setSelectedTemplate(t);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 font-bold"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status} • {t.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dynamic Variable Mapping if variables present */}
          {detectedVars.length > 0 && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-bold text-slate-900">Map Template Variables:</h4>
              {detectedVars.map((v) => (
                <div key={v} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-700 font-bold">{"{{" + v + "}}"}</span>
                  <select
                    value={varMapping[v] || 'firstName'}
                    onChange={(e) => setVarMapping({ ...varMapping, [v]: e.target.value })}
                    className="rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 flex-1"
                  >
                    <option value="firstName">Contact First Name</option>
                    <option value="company">Company</option>
                    <option value="city">City</option>
                    <option value="whatsappNumber">WhatsApp Phone Number</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Live Interactive WhatsApp Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Live WhatsApp Chat Preview:</h4>
            <div className="max-w-md rounded-2xl bg-emerald-950/5 border border-emerald-200 p-4 text-xs text-slate-800 space-y-2">
              {selectedTemplate?.headerText && (
                <div className="font-bold text-slate-900">{selectedTemplate.headerText}</div>
              )}
              <p className="whitespace-pre-line text-slate-800">{previewText}</p>
              {selectedTemplate?.footerText && (
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">{selectedTemplate.footerText}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Schedule & Launch */}
      {step === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Step 4: Dispatch Schedule & Final Review</h3>
            <p className="text-xs text-slate-500">Confirm dispatch details before launching.</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setScheduleType('now')}
              className={`flex-1 rounded-xl border p-4 text-center text-xs font-bold ${
                scheduleType === 'now' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              🚀 Dispatch Immediately Now
            </button>
            <button
              onClick={() => setScheduleType('schedule')}
              className={`flex-1 rounded-xl border p-4 text-center text-xs font-bold ${
                scheduleType === 'schedule' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              📅 Schedule for Later
            </button>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-600">Campaign Name:</span> <strong className="text-slate-900">{name}</strong></div>
            <div className="flex justify-between"><span className="text-slate-600">Target Audience:</span> <strong className="text-emerald-700">{targetAudienceName} ({Math.max(eligibleContacts.length, 1)} contact(s))</strong></div>
            <div className="flex justify-between"><span className="text-slate-600">Template Used:</span> <strong className="text-slate-900">{selectedTemplate?.name}</strong></div>
            <div className="flex justify-between"><span className="text-slate-600">Status:</span> <strong className="text-emerald-700">Ready to Send</strong></div>
          </div>

          <button
            onClick={handleLaunchCampaign}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send size={16} />
            <span>{submitting ? 'Launching & Dispatching Queue...' : 'Launch WhatsApp Campaign Now'}</span>
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between pt-4">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <ChevronLeft size={14} /> Back
          </button>
        )}
        {step < 4 && (
          <button
            onClick={() => setStep(step + 1)}
            className="ml-auto flex items-center gap-1 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Next Step <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
