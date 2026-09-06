'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Contact } from '@/lib/types';

export default function ContactsCrmPage() {
  const { currentOrg } = useApp();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [optInOnly, setOptInOnly] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Add Contact Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    whatsappNumber: '',
    email: '',
    company: '',
    country: 'India',
    city: '',
    tags: 'Lead'
  });

  const fetchContactsList = async () => {
    setLoading(true);
    try {
      const url = `/api/contacts?orgId=${currentOrg.id}&search=${encodeURIComponent(search)}&tag=${encodeURIComponent(
        selectedTag
      )}&optInOnly=${optInOnly}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setContacts(json.contacts || []);
        setTotal(json.total || 0);
      }
    } catch (e) {
      console.error('Failed to load contacts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactsList();
  }, [currentOrg, search, selectedTag, optInOnly]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorMsg('');

    if (!newContact.firstName.trim() || !newContact.whatsappNumber.trim()) {
      setSaveErrorMsg('First Name and WhatsApp Phone Number are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          firstName: newContact.firstName.trim(),
          lastName: newContact.lastName.trim(),
          whatsappNumber: newContact.whatsappNumber.trim(),
          email: newContact.email.trim(),
          company: newContact.company.trim(),
          country: newContact.country.trim(),
          city: newContact.city.trim(),
          tags: newContact.tags ? newContact.tags.split(',').map((t) => t.trim()).filter(Boolean) : ['Lead']
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsAddOpen(false);
        setSaveSuccessMsg(`✅ Contact "${newContact.firstName}" saved successfully!`);
        setNewContact({
          firstName: '',
          lastName: '',
          whatsappNumber: '',
          email: '',
          company: '',
          country: 'India',
          city: '',
          tags: 'Lead'
        });
        fetchContactsList();
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        setSaveErrorMsg(data.error || 'Failed to save contact. Please check details and try again.');
      }
    } catch (err: any) {
      console.error('Save contact error:', err);
      setSaveErrorMsg(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Contact CRM
            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-800">
              {total.toLocaleString()} Contacts ({currentOrg.name})
            </span>
          </h1>
          <p className="text-xs text-slate-500">Manage audience contacts, custom fields, consent tags, and segments.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contacts/import"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Upload size={14} className="text-emerald-600" />
            <span>CSV / XLSX Import</span>
          </Link>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus size={16} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, WhatsApp number, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none"
          >
            <option value="">Filter by Tag (All)</option>
            <option value="Lead">Lead</option>
            <option value="Customer">Customer</option>
            <option value="VIP">VIP</option>
            <option value="Hot Lead">Hot Lead</option>
            <option value="Interested">Interested</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={optInOnly}
              onChange={(e) => setOptInOnly(e.target.checked)}
              className="rounded border-slate-300 bg-white text-emerald-600 focus:ring-0"
            />
            Opted-In Only
          </label>
        </div>
      </div>

      {/* Contacts Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">WhatsApp Number</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4">Opt-In Status</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading CRM contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No contacts found matching search filters.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          {c.firstName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-[10px] text-slate-500">{c.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{c.whatsappNumber}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{c.company || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.city ? `${c.city}, ${c.country}` : c.country}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          c.optInStatus && !c.optOutStatus
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {c.optInStatus && !c.optOutStatus ? (
                          <>
                            <CheckCircle size={12} /> Opted In
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Opted Out
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{c.source}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/inbox`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Chat
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add New CRM Contact</h3>

            {saveErrorMsg && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                ⚠️ {saveErrorMsg}
              </div>
            )}

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newContact.firstName}
                    onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={newContact.lastName}
                    onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">WhatsApp Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={newContact.whatsappNumber}
                  onChange={(e) => setNewContact({ ...newContact, whatsappNumber: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Company</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Country</label>
                  <input
                    type="text"
                    value={newContact.country}
                    onChange={(e) => setNewContact({ ...newContact, country: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newContact.tags}
                    onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving Contact...
                    </>
                  ) : (
                    'Save Contact'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
