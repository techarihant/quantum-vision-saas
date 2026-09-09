'use client';

import React, { useEffect, useState } from 'react';
import { Zap, Plus, Camera, Share2, MessageSquare, ArrowRight, CheckCircle2, Sparkles, FileText, Image as ImageIcon, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CommentTrigger } from '@/lib/types';

export default function CommentTriggersPage() {
  const { currentOrg } = useApp();
  const [triggers, setTriggers] = useState<CommentTrigger[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simUsername, setSimUsername] = useState('rahul_test');
  const [simCommentText, setSimCommentText] = useState('PRICE');
  const [simStep, setSimStep] = useState<1 | 2>(1);
  const [simResult, setSimResult] = useState<any>(null);
  const [simUnlockResult, setSimUnlockResult] = useState<any>(null);

  // New Trigger State
  const [name, setName] = useState('Catalog Request & Follower Gate Flow');
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>('instagram');
  const [matchType, setMatchType] = useState<'ANY' | 'KEYWORD'>('KEYWORD');
  const [keywordsText, setKeywordsText] = useState('PRICE, CATALOG, COST, DETAILS, INFO, PDF');
  const [requireFollow, setRequireFollow] = useState(true);
  const [followMessage, setFollowMessage] = useState(
    "👋 Hey! We noticed you are not following us yet on Instagram. Click '✨ Follow @mastjaipur & Unlock' below to get your PDF Catalog!"
  );
  const [followButtonText, setFollowButtonText] = useState('✨ Follow @mastjaipur & Unlock');
  const [fileUrl, setFileUrl] = useState('https://quantum-vision-saas.vercel.app/docs/mastjaipur_catalog.pdf');
  const [fileType, setFileType] = useState<'PDF' | 'PHOTO' | 'DOC' | 'LINK'>('PDF');
  const [deliveryMessage, setDeliveryMessage] = useState(
    '🎉 Thank you for following MastJaipur! Here is your requested PDF catalog:'
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
    if (!name) return;

    try {
      const res = await fetch('/api/social/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name,
          platform,
          postTitle: 'Diwali & Summer Collection Reel',
          matchType,
          keywords: keywordsText.split(',').map((k) => k.trim()),
          requireFollow,
          followMessage,
          followButtonText,
          fileUrl,
          fileType,
          deliveryMessage
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

  // Step 1 Simulation: User Comments on Post
  const handleSimulateComment = async () => {
    setSimStep(1);
    setSimResult(null);
    setSimUnlockResult(null);

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
        setSimResult(json);
        fetchTriggers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Step 2 Simulation: User Taps 'Follow & Unlock' Button in DM
  const handleSimulateUnlock = async () => {
    try {
      const res = await fetch('/api/social/trigger-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          username: simUsername
        })
      });
      if (res.ok) {
        const json = await res.json();
        setSimUnlockResult(json);
        setSimStep(2);
        fetchTriggers();
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
            <Zap size={24} className="text-purple-600" />
            Instagram & Facebook Comment Triggers
          </h1>
          <p className="text-xs text-slate-500">ManyChat-style follower-gated lead generation and file/PDF catalog delivery.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSimStep(1);
              setSimResult(null);
              setSimUnlockResult(null);
              setSimModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-xs"
          >
            <Sparkles size={14} className="text-amber-600" />
            <span>Simulate Comment & DM Flow</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700"
          >
            <Plus size={16} />
            <span>Create Follower-Gated Trigger</span>
          </button>
        </div>
      </div>

      {/* Meta Webhook Live Status & Setup Banner */}
      <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-950">
            <Sparkles size={18} className="text-purple-600" />
            Instagram Live Comment DM & Document Delivery Checklist
          </div>
          <span className="rounded-full bg-purple-100 border border-purple-300 px-3 py-0.5 text-[11px] font-extrabold text-purple-800">
            Live Webhook Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-purple-900">
          <div className="rounded-xl border border-purple-200 bg-white p-3 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              1. Comment from a Different Instagram Account
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
                <p className="text-xs text-slate-500 mt-1">Target Reel/Post: <strong className="text-slate-800">{trig.postTitle}</strong></p>
              </div>

              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                {trig.leadsCaptured} Leads Captured
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Trigger Keywords:
              </div>
              <div className="flex flex-wrap gap-1">
                {trig.keywords.map((kw) => (
                  <span key={kw} className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-mono font-bold text-purple-800 border border-purple-200">
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span>Step 1: Follower-Gated DM Message</span>
                <span className="text-purple-700">Follow Gate Active</span>
              </div>
              <p className="italic text-slate-800">{trig.followMessage || trig.autoDmText}</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1 text-[11px] font-extrabold text-purple-800">
                Button: {trig.followButtonText || '✨ Follow & Unlock'}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900 space-y-1">
              <div className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                <FileText size={12} /> Step 2: Delivery File ({trig.fileType || 'PDF'})
              </div>
              <div className="font-mono text-[11px] font-bold truncate text-emerald-950">{trig.fileUrl || 'mastjaipur_catalog.pdf'}</div>
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

      {/* Create Follower-Gated Trigger Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera size={18} className="text-purple-600" />
              Create Instagram Follower-Gated Comment DM Trigger
            </h3>

            <form onSubmit={handleCreateTrigger} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Trigger Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summer Collection Catalog Follower Gate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Trigger Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="PRICE, CATALOG, PDF, COST, INFO"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Step 1: Follower Gate */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-purple-600" />
                  Step 1: Follower Verification Gate
                </h4>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Initial DM Message (Sent when user comments)</label>
                  <textarea
                    rows={2}
                    value={followMessage}
                    onChange={(e) => setFollowMessage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Interactive Follow Button Text</label>
                  <input
                    type="text"
                    value={followButtonText}
                    onChange={(e) => setFollowButtonText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 2: File Delivery */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <FileText size={16} className="text-emerald-600" />
                  Step 2: Document / PDF / Photo / File Delivery
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-700">File / Document / Photo URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Type</label>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value as any)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 font-bold"
                    >
                      <option value="PDF">PDF</option>
                      <option value="PHOTO">PHOTO</option>
                      <option value="DOC">DOC</option>
                      <option value="LINK">LINK</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Delivery Confirmation Message</label>
                  <input
                    type="text"
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs"
                >
                  Save Comment Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive 2-Step Comment Simulator Modal */}
      {simModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Simulate Instagram Follower-Gated Flow
              </h3>
              <button onClick={() => setSimModalOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Username</label>
                  <input
                    type="text"
                    value={simUsername}
                    onChange={(e) => setSimUsername(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">Comment Text</label>
                  <input
                    type="text"
                    value={simCommentText}
                    onChange={(e) => setSimCommentText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-bold text-purple-900"
                  />
                </div>
              </div>

              {/* Step 1 Button */}
              <button
                onClick={handleSimulateComment}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                <span>1. Post Comment on Reel/Post</span>
              </button>

              {/* Step 1 Output (Follow Gate Message + Button) */}
              {simResult && (
                <div className="rounded-2xl bg-purple-950/5 border border-purple-200 p-4 space-y-3">
                  <div className="text-[10px] font-extrabold uppercase text-purple-800">📩 Step 1 DM Received (Follower Gate):</div>
                  <p className="text-xs text-slate-800 font-medium whitespace-pre-line">{simResult.autoText}</p>

                  <button
                    onClick={handleSimulateUnlock}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-purple-700"
                  >
                    <span>{simResult.buttonTitle || '✨ Follow @mastjaipur & Unlock'}</span>
                  </button>
                </div>
              )}

              {/* Step 2 Output (Lead Magnet File Delivery) */}
              {simUnlockResult && (
                <div className="rounded-2xl bg-emerald-950/5 border border-emerald-300 p-4 space-y-2">
                  <div className="text-[10px] font-extrabold uppercase text-emerald-800 flex items-center gap-1">
                    <FileText size={12} /> 🎉 Step 2 Document Delivered:
                  </div>
                  <p className="text-xs text-slate-800 whitespace-pre-line font-medium">{simUnlockResult.fullContent}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSimModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
