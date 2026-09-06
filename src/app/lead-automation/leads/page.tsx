'use client';

import React, { useEffect, useState } from 'react';
import { Users, Camera, Share2, MessageSquare, ArrowUpRight, CheckCircle2, Sparkles, Filter, PhoneCall } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SocialLead } from '@/lib/types';
import Link from 'next/link';

export default function SocialLeadsPage() {
  const { currentOrg } = useApp();
  const [leads, setLeads] = useState<SocialLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [handoffMsg, setHandoffMsg] = useState('');

  const fetchLeads = async () => {
    try {
      const res = await fetch(`/api/social/leads?orgId=${currentOrg.id}`);
      if (res.ok) {
        const json = await res.json();
        setLeads(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentOrg]);

  const handleHandoffToWhatsApp = async (leadId: string) => {
    try {
      const res = await fetch('/api/social/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          organizationId: currentOrg.id
        })
      });

      if (res.ok) {
        setHandoffMsg('✅ Social Lead successfully handed off to WhatsApp CRM!');
        fetchLeads();
        setTimeout(() => setHandoffMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users size={24} className="text-purple-600" />
            Social Automation Leads
          </h1>
          <p className="text-xs text-slate-500">
            Leads captured from Instagram and Facebook post comments & DMs with lead scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Lead Statuses</option>
              <option value="NEW">New Comments</option>
              <option value="ENGAGED">Engaged in DM</option>
              <option value="QUALIFIED">Phone Collected</option>
              <option value="CONVERTED">WhatsApp Converted</option>
            </select>
          </div>
        </div>
      </div>

      {handoffMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{handoffMsg}</span>
        </div>
      )}

      {/* Table of Leads */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">User Profile</th>
              <th className="px-5 py-3.5">Platform</th>
              <th className="px-5 py-3.5">Comment / Keyword</th>
              <th className="px-5 py-3.5">Phone Number</th>
              <th className="px-5 py-3.5">Lead Score</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">WhatsApp Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                      {(lead.name || lead.profileName || lead.username || 'U').charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{lead.name || lead.profileName || lead.username}</div>
                      <div className="text-[11px] text-slate-400">@{lead.username}</div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 border border-purple-200">
                    <Camera size={12} />
                    <span>Instagram</span>
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="text-slate-800 font-bold">"{lead.commentText || lead.source}"</div>
                  <div className="text-[10px] font-mono text-purple-600 mt-0.5">
                    Matched Keyword: <strong>{lead.keyword || lead.triggerKeyword}</strong>
                  </div>
                </td>

                <td className="px-5 py-4 font-mono font-bold text-slate-900">
                  {lead.phone || <span className="text-slate-400 font-normal italic">Pending DM reply</span>}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-16 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.min(100, lead.leadScore)}%` }}
                      />
                    </div>
                    <span className="font-bold text-purple-700 text-xs">{lead.leadScore} pts</span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase ${
                      lead.status === 'CONVERTED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : lead.status === 'QUALIFIED'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  {lead.status === 'CONVERTED' ? (
                    <Link
                      href="/inbox"
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <MessageSquare size={13} />
                      <span>Open WhatsApp Chat</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleHandoffToWhatsApp(lead.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700"
                    >
                      <PhoneCall size={13} />
                      <span>Handoff to WhatsApp</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
