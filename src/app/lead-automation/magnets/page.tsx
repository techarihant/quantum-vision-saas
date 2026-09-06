'use client';

import React, { useEffect, useState } from 'react';
import { Gift, Plus, Download, FileText, Sparkles, Tag, CheckCircle2, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LeadMagnet } from '@/lib/types';

export default function LeadMagnetsPage() {
  const { currentOrg } = useApp();
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'PDF_GUIDE' | 'DISCOUNT_COUPON' | 'PRODUCT_CATALOG' | 'FREE_DEMO'>('PDF_GUIDE');
  const [fileUrl, setFileUrl] = useState('https://storage.googleapis.com/lead-assets/whatsapp-guide-2026.pdf');
  const [triggerKeyword, setTriggerKeyword] = useState('GUIDE');
  const [deliveryMessage, setDeliveryMessage] = useState('Here is your requested guide! 🚀 Click below to download:');

  const fetchMagnets = async () => {
    try {
      const res = await fetch(`/api/social/magnets?orgId=${currentOrg.id}`);
      if (res.ok) {
        const json = await res.json();
        setMagnets(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagnets();
  }, [currentOrg]);

  const handleCreateMagnet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !triggerKeyword) return;

    try {
      const res = await fetch('/api/social/magnets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          title,
          category,
          fileUrl,
          triggerKeyword,
          deliveryMessage
        })
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setTitle('');
        fetchMagnets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Gift size={24} className="text-purple-600" />
            Lead Magnets Library
          </h1>
          <p className="text-xs text-slate-500">
            Digital incentives (PDF Guides, Discount Coupons, Catalogs) auto-delivered upon Instagram/Facebook comment triggers.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700"
        >
          <Plus size={16} />
          <span>Add Lead Magnet</span>
        </button>
      </div>

      {/* Grid of Lead Magnets */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {magnets.map((mag) => (
          <div key={mag.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-purple-100 p-2.5 text-purple-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
                      {(mag.category || mag.type || 'PDF_GUIDE').replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{mag.title}</h3>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Trigger Keyword:</span>
                  <span className="font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                    "{mag.triggerKeyword}"
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] italic">"{mag.deliveryMessage}"</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Download size={14} className="text-emerald-600" />
                  <span>{mag.downloadsCount} Deliveries</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                  <Sparkles size={14} />
                  <span>{mag.leadsConverted} Leads Opted In</span>
                </div>
              </div>

              <a
                href={mag.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <ExternalLink size={14} />
                <span>View Asset / Link</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Create Lead Magnet Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Gift size={18} className="text-purple-600" />
              Add New Lead Magnet Asset
            </h3>

            <form onSubmit={handleCreateMagnet} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Asset Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 E-Commerce Growth Guide PDF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category *</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="PDF_GUIDE">PDF Guide / E-book</option>
                  <option value="DISCOUNT_COUPON">Discount Coupon Code</option>
                  <option value="PRODUCT_CATALOG">Product Catalog / Brochure</option>
                  <option value="FREE_DEMO">Free Trial / Demo Pass</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Trigger Keyword *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GUIDE, DISCOUNT, CAT"
                  value={triggerKeyword}
                  onChange={(e) => setTriggerKeyword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Download / Asset URL *</label>
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">DM Delivery Message *</label>
                <textarea
                  rows={2}
                  required
                  value={deliveryMessage}
                  onChange={(e) => setDeliveryMessage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
                >
                  Save Lead Magnet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
