'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Send,
  Eye,
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const { currentOrg } = useApp();
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?orgId=${currentOrg.id}&range=${timeRange}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [currentOrg, timeRange]);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading Real-Time Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  const { kpis, funnel, activityData, campaigns } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Range Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Marketing & CRM Dashboard</h1>
          <p className="text-xs text-slate-500">
            Real-time performance overview for <strong className="text-emerald-700">{currentOrg.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {['today', '7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                timeRange === r
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total & Active Contacts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Contacts</span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {kpis.totalContacts.toLocaleString()}
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600">
              <TrendingUp size={14} className="mr-1" /> +14.2%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Active Opted-in: <strong className="text-slate-800">{kpis.activeContacts.toLocaleString()}</strong>
          </p>
        </div>

        {/* Messages Sent */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Messages Sent</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Send size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {kpis.totalSent.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700">
              Delivered: {kpis.rates.deliveryRate}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Successful Delivery: <strong className="text-slate-800">{kpis.totalDelivered.toLocaleString()}</strong>
          </p>
        </div>

        {/* Read Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Messages Read</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Eye size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {kpis.totalRead.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-indigo-700">
              Read Rate: {kpis.rates.readRate}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            High customer engagement
          </p>
        </div>

        {/* Customer Replies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Customer Replies</span>
            <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600">
              <MessageCircle size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {kpis.totalReplies.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-teal-700">
              Reply Rate: {kpis.rates.replyRate}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Opt-outs: <strong className="text-slate-800">{kpis.totalOptOuts}</strong> ({kpis.rates.failureRate} fail rate)
          </p>
        </div>
      </div>

      {/* Quantum Vision Social Lead Automation KPI Banner */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold shadow-xs">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Instagram & Facebook Lead Automation Active
              <span className="rounded-full bg-purple-100 border border-purple-200 px-2 py-0.5 text-[10px] font-extrabold text-purple-800">
                1,245 Comments Processed
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              540 Social Leads opted-in and handed off to WhatsApp CRM workflows this month (+43.3% lead conversion rate).
            </p>
          </div>
        </div>

        <Link
          href="/lead-automation/triggers"
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700 whitespace-nowrap self-start md:self-auto"
        >
          <span>Manage Comment Triggers</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Message Activity Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Message Activity Trends</h2>
              <p className="text-xs text-slate-500">Daily dispatches, deliveries, reads, and customer replies</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Sent</span>
              <span className="flex items-center gap-1 text-indigo-700"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Read</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                <Area type="monotone" dataKey="read" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRead)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Funnel Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Campaign Conversion Funnel</h2>
            <p className="text-xs text-slate-500">Message lifecycle efficiency breakdown</p>

            <div className="mt-6 space-y-4">
              {funnel.map((item: any, idx: number) => {
                const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-indigo-500', 'bg-purple-500'];
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.stage}</span>
                      <span>{item.count.toLocaleString()} ({item.percentage})</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors[idx % colors.length]}`}
                        style={{ width: item.percentage }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold">
            <Sparkles size={14} className="inline mr-1" />
            Highest performance conversion observed on Diwali Offer campaign!
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Campaign Performance</h2>
            <p className="text-xs text-slate-500">Detailed metric attribution per marketing campaign</p>
          </div>
          <Link
            href="/campaigns"
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
          >
            View All Campaigns <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Sent</th>
                <th className="py-3 px-4">Delivered</th>
                <th className="py-3 px-4">Read</th>
                <th className="py-3 px-4">Replies</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {campaigns.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{c.targetAudienceName}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.totalRecipients.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{c.deliveredCount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-indigo-600">{c.readCount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-teal-600">{c.replyCount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        c.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
