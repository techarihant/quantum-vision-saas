'use client';

import React, { useEffect, useState } from 'react';
import { Zap, Plus, Camera, Share2, MessageSquare, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CommentTrigger, SocialPost } from '@/lib/types';

export default function CommentTriggersPage() {
  const { currentOrg } = useApp();
  const [triggers, setTriggers] = useState<CommentTrigger[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simUsername, setSimUsername] = useState('rahul123');
  const [simCommentText, setSimCommentText] = useState('PRICE');
  const [simResult, setSimResult] = useState('');

  // New Trigger State
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>('instagram');
  const [matchType, setMatchType] = useState<'ANY' | 'KEYWORD'>('KEYWORD');
  const [keywordsText, setKeywordsText] = useState('PRICE, COST, RATE, DETAILS');
  const [autoDmText, setAutoDmText] = useState(
    'Thanks for commenting! 👋 Please follow our page and reply with your WhatsApp phone number to get instant 30% OFF discount codes!'
  );

  const fetchTriggers = async () => {
    try {
      const res = await fetch(`/api/social/triggers?orgId=${currentOrg.id}`);
      if (res.ok) {
        const json = await res.json();
        setTriggers(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, [currentOrg]);

  const handleCreateTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !autoDmText) return;

    try {
      const res = await fetch('/api/social/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name,
          platform,
          postTitle: 'Diwali Festive Offer Reel',
          matchType,
          keywords: keywordsText.split(',').map((k) => k.trim()),
          autoDmText
        })
      });

      if (res.ok) {
        setIsCreateOpen(false);
        fetchTriggers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateComment = async () => {
    setSimResult('Triggering Instagram comment webhook...');
    try {
      const res = await fetch('/api/social/trigger-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          platform: 'instagram',
          username: simUsername,
          commentText: simCommentText
        })
      });
      if (res.ok) {
        const json = await res.json();
        setSimResult(`✅ Matched Keyword "${json.matchedTrigger?.keywords[0] || 'PRICE'}"! DM sent to @${simUsername}. Lead Score updated.`);
        fetchTriggers();
      }
    } catch (e) {
      setSimResult('❌ Simulation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Zap size={24} className="text-purple-600" />
            Instagram & Facebook Comment Triggers
          </h1>
          <p className="text-xs text-slate-500">Quantum Vision automated comment-to-DM lead generation workflows.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSimModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-xs"
          >
            <Sparkles size={14} className="text-amber-600" />
            <span>Simulate Post Comment</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700"
          >
            <Plus size={16} />
            <span>Create Comment Trigger</span>
          </button>
        </div>
      </div>

      {/* Meta Webhook Live Status & Setup Banner */}
      <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-950">
            <Sparkles size={18} className="text-purple-600" />
            Meta Live Instagram Comment DM Setup & Checklist
          </div>
          <span className="rounded-full bg-purple-100 border border-purple-300 px-3 py-0.5 text-[11px] font-extrabold text-purple-800">
            Live Webhook Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-purple-900">
          <div className="rounded-xl border border-purple-200 bg-white p-3 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              1. Comment from a Different IG Account
            </div>
            <p className="text-slate-600 text-[11px]">
              Meta blocks automated DMs when commenting on your <strong>own</strong> account post. Comment on <strong className="text-purple-800">@mastjaipur</strong> from a <strong>personal account</strong> to test!
            </p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-white p-3 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              2. Meta Webhook Subscription URL
            </div>
            <p className="text-slate-600 text-[11px]">
              Point Callback URL to: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">https://quantum-vision-saas.vercel.app/api/webhooks/social</code>
            </p>
          </div>
        </div>
      </div>

      {/* Triggers Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {triggers.map((trig) => (
          <div key={trig.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">{trig.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Post: <strong className="text-slate-800">{trig.postTitle}</strong></p>
              </div>

              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                {trig.leadsCaptured} Leads Captured
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Keywords:
              </div>
              <div className="flex flex-wrap gap-1">
                {trig.keywords.map((kw) => (
                  <span key={kw} className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-mono font-bold text-purple-800 border border-purple-200">
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
              <div className="text-[10px] font-bold text-slate-500 mb-1">Automated DM Response:</div>
              <p className="italic text-slate-800">"{trig.autoDmText}"</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Total Trigger Executions: {trig.totalTriggers}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Trigger Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera size={18} className="text-purple-600" />
              Create Instagram Comment-to-DM Trigger
            </h3>

            <form onSubmit={handleCreateTrigger} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Trigger Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summer Reel Price Inquiry DM"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Automated DM Response Text *</label>
                <textarea
                  rows={3}
                  required
                  value={autoDmText}
                  onChange={(e) => setAutoDmText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                />
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
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
                >
                  Save Comment Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Simulator Modal */}
      {simModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              Simulate Instagram Post Comment
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Instagram Username</label>
                <input
                  type="text"
                  value={simUsername}
                  onChange={(e) => setSimUsername(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Comment Text</label>
                <input
                  type="text"
                  value={simCommentText}
                  onChange={(e) => setSimCommentText(e.target.value)}
                  placeholder="e.g. PRICE or GUIDE"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-bold focus:outline-none"
                />
              </div>

              {simResult && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold">
                  {simResult}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSimModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handleSimulateComment}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                Post Simulated Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
