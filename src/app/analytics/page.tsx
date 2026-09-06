'use client';

import React, { useEffect, useState } from 'react';
import { FileCode } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useApp } from '@/context/AppContext';

export default function AnalyticsPage() {
  const { currentOrg } = useApp();
  const [range, setRange] = useState('30d');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch(`/api/analytics?orgId=${currentOrg.id}&range=${range}`);
        if (res.ok) {
          const json = await res.json();
          setAnalytics(json);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadAnalytics();
  }, [currentOrg, range]);

  if (!analytics) return null;

  const { kpis, activityData } = analytics;

  const templatePerformance = [
    { name: 'diwali_special_offer', category: 'MARKETING', sent: 5420, delivered: 5210, read: 4380, replies: 940, readRate: '84.0%', replyRate: '21.4%' },
    { name: 'lead_welcome_series', category: 'MARKETING', sent: 12450, delivered: 11980, read: 9120, replies: 1420, readRate: '76.1%', replyRate: '15.5%' },
    { name: 'abandoned_cart_reminder', category: 'UTILITY', sent: 2100, delivered: 1790, read: 1350, replies: 280, readRate: '75.4%', replyRate: '20.7%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Full Platform Analytics</h1>
          <p className="text-xs text-slate-500">Comprehensive delivery intelligence, template comparisons, and engagement reports.</p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {['today', '7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1 text-xs font-bold uppercase ${
                range === r ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Total Dispatched</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{kpis.totalSent.toLocaleString()}</div>
          <div className="mt-1 text-xs text-emerald-700 font-bold">Delivery Rate: {kpis.rates.deliveryRate}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Read Receipts</div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-700">{kpis.totalRead.toLocaleString()}</div>
          <div className="mt-1 text-xs text-indigo-700 font-bold">Read Rate: {kpis.rates.readRate}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Inbound Replies</div>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">{kpis.totalReplies.toLocaleString()}</div>
          <div className="mt-1 text-xs text-teal-700 font-bold">Reply Conversion: {kpis.rates.replyRate}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Opt-Out Suppressions</div>
          <div className="mt-2 text-2xl font-extrabold text-rose-700">{kpis.totalOptOuts}</div>
          <div className="mt-1 text-xs text-rose-700 font-bold">Opt-Out Trend: Low</div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Volume & Engagement Trends</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }} />
              <Legend />
              <Bar dataKey="sent" fill="#10b981" name="Sent" radius={[4, 4, 0, 0]} />
              <Bar dataKey="read" fill="#6366f1" name="Read" radius={[4, 4, 0, 0]} />
              <Bar dataKey="replies" fill="#14b8a6" name="Replies" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Template Performance Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileCode size={18} className="text-emerald-600" />
          Template Conversion Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                <th className="pb-3 px-2">Template Name</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2">Sent</th>
                <th className="pb-3 px-2">Delivered</th>
                <th className="pb-3 px-2">Read</th>
                <th className="pb-3 px-2">Replies</th>
                <th className="pb-3 px-2">Read Rate</th>
                <th className="pb-3 px-2">Reply Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {templatePerformance.map((tpl) => (
                <tr key={tpl.name} className="hover:bg-slate-50">
                  <td className="py-3 px-2 font-bold text-slate-900 font-mono">{tpl.name}</td>
                  <td className="py-3 px-2 text-slate-500">{tpl.category}</td>
                  <td className="py-3 px-2 font-bold text-slate-900">{tpl.sent.toLocaleString()}</td>
                  <td className="py-3 px-2 text-emerald-700 font-bold">{tpl.delivered.toLocaleString()}</td>
                  <td className="py-3 px-2 text-indigo-700 font-bold">{tpl.read.toLocaleString()}</td>
                  <td className="py-3 px-2 text-teal-700 font-bold">{tpl.replies.toLocaleString()}</td>
                  <td className="py-3 px-2 font-bold text-indigo-700">{tpl.readRate}</td>
                  <td className="py-3 px-2 font-bold text-emerald-700">{tpl.replyRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
