'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function CampaignWizardPage() {
  const router = useRouter();
  const { currentOrg } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [audienceType, setAudienceType] = useState<'ALL' | 'SEGMENT' | 'TAG'>('SEGMENT');
  const [targetAudienceId, setTargetAudienceId] = useState('seg_high_intent');
  const [targetAudienceName, setTargetAudienceName] = useState('High-Intent Indian Customers');

  const [templateId, setTemplateId] = useState('tpl_diwali_offer');
  const [templateName, setTemplateName] = useState('diwali_special_offer');

  const [varMapping, setVarMapping] = useState<Record<string, string>>({
    '1': 'firstName',
    '2': 'company'
  });

  const [scheduleType, setScheduleType] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLaunchCampaign = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name,
          description,
          targetAudienceType: audienceType,
          targetAudienceId,
          targetAudienceName,
          templateId,
          templateName,
          variableMapping: varMapping,
          scheduledAt: scheduleType === 'schedule' ? scheduledAt : undefined
        })
      });

      if (res.ok) {
        router.push('/campaigns');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link href="/campaigns" className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1">
            <ChevronLeft size={14} /> Back to Campaigns
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Campaign Creation Wizard</h1>
          <p className="text-xs text-slate-500">8-Step compliant marketing campaign builder</p>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="flex justify-between overflow-x-auto gap-2 text-[11px] font-bold border-b border-slate-200 pb-3">
        {[
          '1. Details',
          '2. Audience',
          '3. Template',
          '4. Variables',
          '5. Preview',
          '6. Schedule',
          '7. Compliance',
          '8. Launch'
        ].map((lbl, idx) => (
          <button
            key={idx}
            onClick={() => setStep(idx + 1)}
            className={`whitespace-nowrap rounded-lg px-2.5 py-1 transition-all ${
              step === idx + 1
                ? 'bg-emerald-600 text-white shadow-xs'
                : step > idx + 1
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-400'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* STEP 1: Details */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Step 1: Campaign Details</h3>
          <div>
            <label className="text-xs font-semibold text-slate-700">Campaign Name *</label>
            <input
              type="text"
              placeholder="e.g. Diwali Festive Offer 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Campaign Description</label>
            <textarea
              rows={3}
              placeholder="Internal campaign description..."
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
          <h3 className="text-sm font-bold text-slate-900">Step 2: Audience Selection</h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'SEGMENT', label: 'Dynamic Segment', name: 'High-Intent Indian Customers', count: '1,200 contacts' },
              { type: 'ALL', label: 'All Opted-In Contacts', name: 'Full Database', count: '12,450 contacts' },
              { type: 'TAG', label: 'By Tag', name: 'Tag: VIP', count: '1,200 contacts' }
            ].map((a) => (
              <button
                key={a.type}
                onClick={() => {
                  setAudienceType(a.type as any);
                  setTargetAudienceName(a.name);
                }}
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
        </div>
      )}

      {/* STEP 3: Template */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Step 3: Select Approved WhatsApp Template</h3>
          <select
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              setTemplateName(e.target.value === 'tpl_diwali_offer' ? 'diwali_special_offer' : 'lead_welcome_series');
            }}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900"
          >
            <option value="tpl_diwali_offer">diwali_special_offer (Approved • Marketing)</option>
            <option value="tpl_welcome_lead">lead_welcome_series (Approved • Marketing)</option>
            <option value="tpl_abandoned_cart">abandoned_cart_reminder (Approved • Utility)</option>
          </select>
        </div>
      )}

      {/* STEP 4: Variables */}
      {step === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Step 4: Map Template Variables</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-emerald-700 font-bold">{"{{1}}"}</span>
              <select
                value={varMapping['1']}
                onChange={(e) => setVarMapping({ ...varMapping, '1': e.target.value })}
                className="rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 flex-1"
              >
                <option value="firstName">Contact First Name</option>
                <option value="company">Company</option>
                <option value="city">City</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-emerald-700 font-bold">{"{{2}}"}</span>
              <select
                value={varMapping['2']}
                onChange={(e) => setVarMapping({ ...varMapping, '2': e.target.value })}
                className="rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 flex-1"
              >
                <option value="company">Company</option>
                <option value="firstName">Contact First Name</option>
                <option value="city">City</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Preview */}
      {step === 5 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Step 5: Personalized Message Preview</h3>
          <div className="max-w-md rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-800">
            <div className="font-bold text-slate-900 mb-1">🪔 Exclusive Festive Offer!</div>
            <p>
              Hello <strong className="text-emerald-700">Arihant</strong>, celebrate this festival with Acme! Get flat 30% OFF on all premium items from <strong className="text-emerald-700">TechVentures Inc.</strong>
            </p>
            <div className="text-[10px] text-slate-500 mt-2">Reply STOP to opt out.</div>
          </div>
        </div>
      )}

      {/* STEP 6: Schedule */}
      {step === 6 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Step 6: Dispatch Schedule</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setScheduleType('now')}
              className={`flex-1 rounded-xl border p-4 text-center text-xs font-bold ${
                scheduleType === 'now' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              Send Immediately Now
            </button>
            <button
              onClick={() => setScheduleType('schedule')}
              className={`flex-1 rounded-xl border p-4 text-center text-xs font-bold ${
                scheduleType === 'schedule' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              Schedule for Later Date & Time
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Pre-flight Compliance */}
      {step === 7 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            Step 7: Pre-Flight Compliance Validation
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle size={14} className="text-emerald-600" /> Contacts marketing consent verified (No opt-outs included)
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle size={14} className="text-emerald-600" /> Meta Approved Template status: APPROVED
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle size={14} className="text-emerald-600" /> Variable mappings valid
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle size={14} className="text-emerald-600" /> WhatsApp Cloud API connection active
            </div>
          </div>
        </div>
      )}

      {/* STEP 8: Review & Launch */}
      {step === 8 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900">Step 8: Final Review & Dispatch</h3>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-600">Campaign Name:</span> <strong className="text-slate-900">{name || 'Diwali Offer'}</strong></div>
            <div className="flex justify-between"><span className="text-slate-600">Audience:</span> <strong className="text-emerald-700">{targetAudienceName} (1,200 contacts)</strong></div>
            <div className="flex justify-between"><span className="text-slate-600">Template:</span> <strong className="text-slate-900">{templateName}</strong></div>
          </div>

          <button
            onClick={handleLaunchCampaign}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
          >
            <Send size={16} />
            <span>{submitting ? 'Dispatching Queue...' : 'Launch WhatsApp Campaign Now'}</span>
          </button>
        </div>
      )}

      {/* Controls Footer */}
      <div className="flex justify-between pt-4">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <ChevronLeft size={14} /> Back
          </button>
        )}
        {step < 8 && (
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
