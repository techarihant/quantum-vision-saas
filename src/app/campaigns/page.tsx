'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Campaign } from '@/lib/types';

export default function CampaignsPage() {
  const { currentOrg } = useApp();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAnalytics, setActiveAnalytics] = useState<Campaign | null>(null);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch(`/api/campaigns?orgId=${currentOrg.id}`);
        if (res.ok) {
          const json = await res.json();
          setCampaigns(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();
  }, [currentOrg]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">WhatsApp Marketing Campaigns</h1>
          <p className="text-xs text-slate-500">Monitor bulk dispatches, delivery metrics, read rates, and customer replies.</p>
        </div>

        <Link
          href="/campaigns/wizard"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
        >
          <Plus size={16} />
          <span>Create New Campaign</span>
        </Link>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Campaign</th>
                <th className="py-3.5 px-4">Audience</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Sent</th>
                <th className="py-3.5 px-4">Delivered</th>
                <th className="py-3.5 px-4">Read</th>
                <th className="py-3.5 px-4">Replies</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading campaigns...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No marketing campaigns created yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Template: {c.templateName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{c.targetAudienceName}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : c.status === 'SENDING'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200 animate-pulse'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.totalRecipients.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{c.deliveredCount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">{c.readCount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-teal-700">{c.replyCount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveAnalytics(c)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Analytics
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Detailed Analytics Modal */}
      {activeAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{activeAnalytics.name}</h3>
                <p className="text-xs text-slate-500">Campaign Analytics & Funnel</p>
              </div>
              <button
                onClick={() => setActiveAnalytics(null)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] text-slate-500">Total Sent</div>
                <div className="mt-1 font-extrabold text-slate-900 text-base">{activeAnalytics.sentCount}</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-[10px] text-emerald-800 font-bold">Delivered</div>
                <div className="mt-1 font-extrabold text-emerald-700 text-base">{activeAnalytics.deliveredCount}</div>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <div className="text-[10px] text-indigo-800 font-bold">Read</div>
                <div className="mt-1 font-extrabold text-indigo-700 text-base">{activeAnalytics.readCount}</div>
              </div>
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
                <div className="text-[10px] text-teal-800 font-bold">Replies</div>
                <div className="mt-1 font-extrabold text-teal-700 text-base">{activeAnalytics.replyCount}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveAnalytics(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
