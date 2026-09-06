'use client';

import React from 'react';
import { BarChart3, TrendingUp, MessageSquare, Camera, Download, PhoneCall, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SocialAnalyticsPage() {
  const { currentOrg } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BarChart3 size={24} className="text-purple-600" />
          Lead Automation & Social Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Conversion funnels and ROI metrics from Instagram comment triggers to WhatsApp opt-in handoffs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Post Comments Captured</span>
            <Camera size={18} className="text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">1,245</div>
          <p className="mt-1 text-[11px] font-bold text-emerald-600">↑ 34% from last week</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Automated DMs Dispatched</span>
            <MessageSquare size={18} className="text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">1,180</div>
          <p className="mt-1 text-[11px] font-bold text-emerald-600">94.7% Delivery Rate</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Lead Magnets Delivered</span>
            <Download size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">840</div>
          <p className="mt-1 text-[11px] font-bold text-purple-600">71.1% Download Rate</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">WhatsApp Opt-in Handoffs</span>
            <PhoneCall size={18} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">540</div>
          <p className="mt-1 text-[11px] font-bold text-emerald-600">43.3% Total Lead Conversion</p>
        </div>
      </div>

      {/* Social Conversion Funnel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp size={18} className="text-purple-600" />
          Social to WhatsApp Conversion Funnel
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Step 1: Instagram/Facebook Post Comments</span>
              <span>1,245 Comments (100%)</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Step 2: Automated Instagram DMs Delivered</span>
              <span>1,180 DMs (94.7%)</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '94.7%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Step 3: User Replied with Phone Number</span>
              <span>680 Phone Numbers (54.6%)</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '54.6%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Step 4: WhatsApp Opt-in CRM Contact Created</span>
              <span>540 WhatsApp Leads (43.3%)</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '43.3%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Social Posts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Top Performing Instagram Posts & Reels</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Post Caption / Title</th>
                <th className="px-4 py-3">Comments</th>
                <th className="px-4 py-3">Auto DMs</th>
                <th className="px-4 py-3">Phone Collected</th>
                <th className="px-4 py-3">WhatsApp Opt-in %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3.5 font-bold text-slate-900">Diwali Festive Offer Reel 🎥</td>
                <td className="px-4 py-3.5">540</td>
                <td className="px-4 py-3.5">520</td>
                <td className="px-4 py-3.5">310</td>
                <td className="px-4 py-3.5 font-bold text-emerald-600">57.4%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3.5 font-bold text-slate-900">2026 E-Commerce Growth Guide PDF 📗</td>
                <td className="px-4 py-3.5">420</td>
                <td className="px-4 py-3.5">390</td>
                <td className="px-4 py-3.5">240</td>
                <td className="px-4 py-3.5 font-bold text-emerald-600">57.1%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3.5 font-bold text-slate-900">VIP Early Access Pass Demo Reel 🌟</td>
                <td className="px-4 py-3.5">285</td>
                <td className="px-4 py-3.5">270</td>
                <td className="px-4 py-3.5">130</td>
                <td className="px-4 py-3.5 font-bold text-emerald-600">45.6%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
