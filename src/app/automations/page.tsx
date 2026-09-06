'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GitFork, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Automation } from '@/lib/types';

export default function AutomationsPage() {
  const { currentOrg } = useApp();

  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: 'auto_welcome',
      organizationId: currentOrg.id,
      name: 'New Lead Onboarding & Instant Response',
      description: 'Triggers when a new contact is created or tag Lead is added. Sends welcome template.',
      status: 'ACTIVE',
      triggerType: 'Tag Added: Lead',
      nodes: [],
      edges: [],
      totalRuns: 1420,
      lastRunAt: '2026-09-06T16:00:00Z',
      createdAt: '2026-08-10T12:00:00Z'
    },
    {
      id: 'auto_cart_recovery',
      organizationId: currentOrg.id,
      name: 'Post-Campaign Automated Follow-Up Workflow',
      description: 'Waits 24 hours after campaign dispatch. Checks if customer replied. Sends follow-up template if no reply.',
      status: 'ACTIVE',
      triggerType: 'Campaign Completed',
      nodes: [],
      edges: [],
      totalRuns: 890,
      lastRunAt: '2026-09-06T14:30:00Z',
      createdAt: '2026-08-18T10:00:00Z'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visual Marketing Workflows</h1>
          <p className="text-xs text-slate-500 font-normal">Automated WhatsApp message sequences, conditional follow-ups, and auto-stop reply triggers.</p>
        </div>

        <Link
          href="/automations/builder/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
        >
          <Plus size={16} />
          <span>New Automation Workflow</span>
        </Link>
      </div>

      {/* Automations Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {automations.map((auto) => (
          <div key={auto.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GitFork size={18} className="text-emerald-600" />
                  {auto.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{auto.description}</p>
              </div>

              <span
                className={`rounded-full px-3 py-0.5 text-xs font-extrabold uppercase ${
                  auto.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {auto.status}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Trigger Event:</span>
                <strong className="text-emerald-700 font-mono">{auto.triggerType}</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Total Executions:</span>
                <strong className="text-slate-900 font-bold">{auto.totalRuns.toLocaleString()} runs</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Safety Feature:</span>
                <span className="text-teal-700 font-bold">Auto-Stops when customer replies</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">Last run: {new Date(auto.lastRunAt!).toLocaleTimeString()}</span>
              <Link
                href={`/automations/builder/${auto.id}`}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                Open Workflow Builder <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
