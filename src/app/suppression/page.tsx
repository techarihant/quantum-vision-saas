'use client';

import React, { useState } from 'react';
import { Ban, ShieldAlert, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SuppressionRecord } from '@/lib/types';

export default function SuppressionListPage() {
  const { currentOrg } = useApp();

  const [suppressions, setSuppressions] = useState<SuppressionRecord[]>([
    {
      id: 'sup_1',
      organizationId: currentOrg.id,
      whatsappNumber: '+442079460912',
      reason: 'Customer replied STOP to marketing campaign',
      keyword: 'STOP',
      optedOutAt: '2026-09-02T16:20:00Z'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Ban size={24} className="text-rose-600" />
            Suppression List & Opt-Out Management
          </h1>
          <p className="text-xs text-slate-500">Enforces WhatsApp compliance by blocking marketing campaigns for opted-out numbers.</p>
        </div>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs">
          <Download size={14} className="text-emerald-600" />
          <span>Export Opt-Out List</span>
        </button>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center gap-3 shadow-xs">
        <ShieldAlert size={20} className="text-rose-600 shrink-0" />
        <div>
          <strong>Automatic Compliance Protection:</strong> Numbers in this list are automatically blocked from all outgoing promotional campaigns and automation flows when STOP, UNSUBSCRIBE, or CANCEL keywords are detected.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <th className="py-3.5 px-4">WhatsApp Phone Number</th>
              <th className="py-3.5 px-4">Keyword Trigger</th>
              <th className="py-3.5 px-4">Reason</th>
              <th className="py-3.5 px-4">Opt-Out Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {suppressions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-rose-700">{s.whatsappNumber}</td>
                <td className="py-3.5 px-4"><span className="rounded bg-rose-100 px-2 py-0.5 text-rose-800 font-bold">{s.keyword}</span></td>
                <td className="py-3.5 px-4 font-sans text-slate-700">{s.reason}</td>
                <td className="py-3.5 px-4 text-slate-500">{new Date(s.optedOutAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
