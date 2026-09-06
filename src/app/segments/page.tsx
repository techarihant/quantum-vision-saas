'use client';

import React, { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Segment } from '@/lib/types';

export default function SegmentsPage() {
  const { currentOrg } = useApp();

  const [segments, setSegments] = useState<Segment[]>([
    {
      id: 'seg_high_intent',
      organizationId: currentOrg.id,
      name: 'High-Intent Indian Customers',
      description: 'Opted-in contacts in India with VIP or Hot Lead tag',
      matchType: 'AND',
      conditions: [
        { field: 'country', operator: 'equals', value: 'India' },
        { field: 'optInStatus', operator: 'is_true', value: 'true' },
        { field: 'tag', operator: 'contains', value: 'VIP' }
      ],
      contactCount: 1200,
      updatedAt: '2026-09-05T14:30:00Z'
    },
    {
      id: 'seg_active_leads',
      organizationId: currentOrg.id,
      name: 'Active Marketing Leads',
      description: 'Leads who are opted in for promo notifications',
      matchType: 'AND',
      conditions: [
        { field: 'tag', operator: 'contains', value: 'Lead' },
        { field: 'optInStatus', operator: 'is_true', value: 'true' }
      ],
      contactCount: 4250,
      updatedAt: '2026-09-06T10:00:00Z'
    }
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSeg, setNewSeg] = useState({
    name: '',
    description: '',
    matchType: 'AND' as 'AND' | 'OR',
    conditions: [
      { field: 'country' as any, operator: 'equals' as any, value: 'India' }
    ]
  });

  const handleAddCondition = () => {
    setNewSeg({
      ...newSeg,
      conditions: [...newSeg.conditions, { field: 'tag', operator: 'contains', value: 'Customer' }]
    });
  };

  const handleSaveSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeg.name) return;

    const created: Segment = {
      id: `seg_${Date.now()}`,
      organizationId: currentOrg.id,
      name: newSeg.name,
      description: newSeg.description,
      matchType: newSeg.matchType,
      conditions: newSeg.conditions,
      contactCount: Math.floor(Math.random() * 2000) + 500,
      updatedAt: new Date().toISOString()
    };

    setSegments([created, ...segments]);
    setIsCreateOpen(false);
    setNewSeg({
      name: '',
      description: '',
      matchType: 'AND',
      conditions: [{ field: 'country', operator: 'equals', value: 'India' }]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dynamic Audience Segments</h1>
          <p className="text-xs text-slate-500">Build filter rules to target high-intent customer segments for marketing campaigns.</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus size={16} />
          <span>Create Segment</span>
        </button>
      </div>

      {/* Segments Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {segments.map((seg) => (
          <div key={seg.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={18} className="text-emerald-600" />
                  {seg.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{seg.description}</p>
              </div>
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                {seg.contactCount.toLocaleString()} Contacts
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Match Rule: <strong className="text-emerald-700">{seg.matchType}</strong>
              </div>
              {seg.conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-700 font-mono text-[11px]">
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 font-bold text-emerald-800">{c.field}</span>
                  <span>{c.operator}</span>
                  <span className="font-bold text-slate-900">"{c.value}"</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Updated: {new Date(seg.updatedAt).toLocaleDateString()}</span>
              <button
                onClick={() => setSegments(segments.filter((s) => s.id !== seg.id))}
                className="text-slate-400 hover:text-rose-600 font-semibold"
              >
                Delete Segment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Segment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Build Dynamic Audience Segment</h3>

            <form onSubmit={handleSaveSegment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Segment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., VIP Indian E-Commerce Buyers"
                  value={newSeg.name}
                  onChange={(e) => setNewSeg({ ...newSeg, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of audience logic..."
                  value={newSeg.description}
                  onChange={(e) => setNewSeg({ ...newSeg, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Condition Match Type</label>
                <select
                  value={newSeg.matchType}
                  onChange={(e) => setNewSeg({ ...newSeg, matchType: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900"
                >
                  <option value="AND">Match ALL Conditions (AND)</option>
                  <option value="OR">Match ANY Condition (OR)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Filter Conditions</label>
                {newSeg.conditions.map((cond, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={cond.field}
                      onChange={(e) => {
                        const updated = [...newSeg.conditions];
                        updated[idx].field = e.target.value as any;
                        setNewSeg({ ...newSeg, conditions: updated });
                      }}
                      className="rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900"
                    >
                      <option value="country">Country</option>
                      <option value="city">City</option>
                      <option value="tag">Tag</option>
                      <option value="optInStatus">Opt-In Status</option>
                    </select>

                    <select
                      value={cond.operator}
                      onChange={(e) => {
                        const updated = [...newSeg.conditions];
                        updated[idx].operator = e.target.value as any;
                        setNewSeg({ ...newSeg, conditions: updated });
                      }}
                      className="rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="is_true">Is True</option>
                    </select>

                    <input
                      type="text"
                      value={cond.value}
                      onChange={(e) => {
                        const updated = [...newSeg.conditions];
                        updated[idx].value = e.target.value;
                        setNewSeg({ ...newSeg, conditions: updated });
                      }}
                      className="flex-1 rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  + Add Condition Rule
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
