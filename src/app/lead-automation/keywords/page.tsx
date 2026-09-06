'use client';

import React, { useState } from 'react';
import { Tag, Plus, MessageSquare, Sparkles, CheckCircle2, Search, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface KeywordRule {
  id: string;
  keyword: string;
  category: string;
  scoreBonus: number;
  triggerCount: number;
  autoDm: string;
  status: 'ACTIVE' | 'PAUSED';
}

const INITIAL_KEYWORDS: KeywordRule[] = [
  {
    id: 'kw1',
    keyword: 'PRICE',
    category: 'Commercial Inquiry',
    scoreBonus: 15,
    triggerCount: 420,
    autoDm: 'Hey! Thanks for asking about our pricing. Reply with your WhatsApp number to get our latest rate card PDF!',
    status: 'ACTIVE'
  },
  {
    id: 'kw2',
    keyword: 'GUIDE',
    category: 'Lead Magnet Download',
    scoreBonus: 25,
    triggerCount: 890,
    autoDm: 'Here is your free 2026 E-Commerce Growth Guide PDF! Follow us and reply with your WhatsApp phone number to unlock the download link.',
    status: 'ACTIVE'
  },
  {
    id: 'kw3',
    keyword: 'DISCOUNT',
    category: 'Promotional Offer',
    scoreBonus: 20,
    triggerCount: 310,
    autoDm: 'Enjoy 30% OFF festive discount! Share your WhatsApp number to get your custom single-use voucher code instantly.',
    status: 'ACTIVE'
  },
  {
    id: 'kw4',
    keyword: 'DEMO',
    category: 'High Intent Lead',
    scoreBonus: 30,
    triggerCount: 180,
    autoDm: 'Awesome! We would love to set up a live product demo for you. Reply with your phone number and preferred date/time.',
    status: 'ACTIVE'
  }
];

export default function KeywordsPage() {
  const { currentOrg } = useApp();
  const [keywords, setKeywords] = useState<KeywordRule[]>(INITIAL_KEYWORDS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newKw, setNewKw] = useState('');
  const [newCat, setNewCat] = useState('Product Inquiry');
  const [newScore, setNewScore] = useState(15);
  const [newDm, setNewDm] = useState('');

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKw || !newDm) return;

    const rule: KeywordRule = {
      id: `kw_${Date.now()}`,
      keyword: newKw.toUpperCase(),
      category: newCat,
      scoreBonus: newScore,
      triggerCount: 0,
      autoDm: newDm,
      status: 'ACTIVE'
    };

    setKeywords([rule, ...keywords]);
    setIsModalOpen(false);
    setNewKw('');
    setNewDm('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Tag size={24} className="text-purple-600" />
            Social Automation Keywords Dictionary
          </h1>
          <p className="text-xs text-slate-500">
            Define comment trigger keywords, lead score weighting, and automated DM responses.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700"
        >
          <Plus size={16} />
          <span>Add Keyword Trigger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {keywords.map((kw) => (
          <div key={kw.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-purple-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-mono font-extrabold text-purple-800 border border-purple-200">
                  "{kw.keyword}"
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{kw.category}</h3>
              </div>

              <span className="rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
                +{kw.scoreBonus} Lead Points
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Automated DM Template:
              </div>
              <p className="italic text-slate-800">"{kw.autoDm}"</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>{kw.triggerCount} Total Comment Matches</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Keyword Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Tag size={18} className="text-purple-600" />
              Add Keyword Rule
            </h3>

            <form onSubmit={handleAddKeyword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Keyword (e.g. PRICE, DETAILS) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUY"
                  value={newKw}
                  onChange={(e) => setNewKw(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <input
                  type="text"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Lead Score Bonus Points</label>
                <input
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Automated DM Response *</label>
                <textarea
                  rows={3}
                  required
                  value={newDm}
                  onChange={(e) => setNewDm(e.target.value)}
                  placeholder="Type auto reply DM..."
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
                >
                  Save Keyword
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
