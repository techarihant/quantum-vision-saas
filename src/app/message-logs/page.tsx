'use client';

import React, { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Message } from '@/lib/types';

export default function MessageLogsPage() {
  const { currentOrg } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch(`/api/inbox/messages?orgId=${currentOrg.id}&conversationId=conv_1`);
        if (res.ok) {
          const json = await res.json();
          setMessages(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [currentOrg]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">WhatsApp Message Event Logs</h1>
          <p className="text-xs text-slate-500">Complete raw event audit log tracking every WhatsApp message dispatch & status transition.</p>
        </div>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs">
          <Download size={14} className="text-emerald-600" />
          <span>Export Logs CSV</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by WhatsApp Message ID, phone number or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="DELIVERED">Delivered</option>
          <option value="READ">Read</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                <th className="py-3.5 px-4">Message ID</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Direction</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Dispatched At</th>
                <th className="py-3.5 px-4">Delivered At</th>
                <th className="py-3.5 px-4">Read At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-[11px]">{m.whatsappMessageId}</td>
                  <td className="py-3.5 px-4">{m.contactName} ({m.whatsappNumber})</td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${m.direction === 'OUTBOUND' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {m.direction}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{m.status}</td>
                  <td className="py-3.5 px-4 text-slate-500">{new Date(m.sentAt).toLocaleTimeString()}</td>
                  <td className="py-3.5 px-4 text-slate-500">{m.deliveredAt ? new Date(m.deliveredAt).toLocaleTimeString() : '—'}</td>
                  <td className="py-3.5 px-4 text-slate-500">{m.readAt ? new Date(m.readAt).toLocaleTimeString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
