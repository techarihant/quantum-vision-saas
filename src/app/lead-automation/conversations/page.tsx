'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle, Camera, Send, CheckCircle2, PhoneCall, Sparkles, User, Tag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SocialLead } from '@/lib/types';

export default function SocialConversationsPage() {
  const { currentOrg } = useApp();
  const [leads, setLeads] = useState<SocialLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<SocialLead | null>(null);
  const [replyText, setReplyText] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const loadLeadMessages = async (lead: SocialLead) => {
    try {
      const convId = `conv_social_${lead.id}`;
      const res = await fetch(`/api/inbox/messages?orgId=${currentOrg.id}&conversationId=${convId}`);
      if (res.ok) {
        const msgs = await res.json();
        if (msgs && msgs.length > 0) {
          setChatMessages(
            msgs.map((m: any) => ({
              id: m.id,
              sender: m.direction === 'OUTBOUND' ? 'system' : 'user',
              text: m.content,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          );
          return;
        }
      }
    } catch (e) {}

    // Fallback default message list
    setChatMessages([
      {
        id: 'm1',
        sender: 'user',
        text: `Commented: "${lead.commentText || lead.keyword || 'PRICE'}" on Instagram Post`,
        time: 'Just now'
      },
      {
        id: 'm2',
        sender: 'system',
        text: `Hi @${lead.username}! 👋 Thanks for commenting. Reply with your WhatsApp phone number to get instant discount codes & offers.`,
        time: 'Just now'
      }
    ]);
  };

  useEffect(() => {
    fetch(`/api/social/leads?orgId=${currentOrg.id}`)
      .then((res) => res.json())
      .then((data: SocialLead[]) => {
        setLeads(data);
        if (data.length > 0) {
          setSelectedLead(data[0]);
          loadLeadMessages(data[0]);
        }
      });
  }, [currentOrg]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedLead) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'system',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <MessageCircle size={24} className="text-purple-600" />
          Instagram & Facebook Social DM Inbox
        </h1>
        <p className="text-xs text-slate-500">
          Direct messaging Threads for comment-triggered automated leads and live conversation management.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[550px]">
        {/* Left Column: Lead Conversations List */}
        <div className="col-span-12 md:col-span-4 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-700">
            Active Social DM Threads
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {leads.map((lead) => {
              const displayName = lead.name || lead.profileName || lead.username;
              return (
                <div
                  key={lead.id}
                  onClick={() => {
                    setSelectedLead(lead);
                    loadLeadMessages(lead);
                  }}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                    selectedLead?.id === lead.id ? 'bg-purple-50/70 border-l-4 border-purple-600' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-sm shadow-xs">
                    {displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate">{displayName}</span>
                      <span className="text-[10px] text-slate-400">Instagram</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">@{lead.username}</div>
                    <div className="text-[10px] text-purple-700 font-semibold mt-1">
                      Keyword: "{lead.keyword || lead.triggerKeyword}" • Score: {lead.leadScore}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Active DM Thread */}
        <div className="col-span-12 md:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
          {selectedLead ? (
            <>
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs">
                    {(selectedLead.name || selectedLead.profileName || selectedLead.username).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">
                      {selectedLead.name || selectedLead.profileName || selectedLead.username}
                    </h3>
                    <p className="text-[10px] text-slate-500">@{selectedLead.username} • Instagram Direct</p>
                  </div>
                </div>

                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                  Lead Score {selectedLead.leadScore}
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'system' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                        msg.sender === 'system'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium'
                          : 'bg-white border border-slate-200 text-slate-900 font-medium'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[9px] mt-1 block text-right ${
                          msg.sender === 'system' ? 'text-purple-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Type an automated Instagram DM reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 flex items-center gap-1 shadow-xs"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to view messages
            </div>
          )}
        </div>

        {/* Right Column: Social CRM Sidebar */}
        <div className="col-span-12 md:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
          {selectedLead && (
            <>
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-lg shadow-sm mb-2">
                  {(selectedLead.name || selectedLead.profileName || selectedLead.username).charAt(0)}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedLead.name || selectedLead.profileName || selectedLead.username}
                </h3>
                <p className="text-xs text-slate-400">@{selectedLead.username}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comment Trigger</span>
                  <p className="font-bold text-slate-900 mt-0.5">"{selectedLead.commentText || selectedLead.source}"</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matched Keyword</span>
                  <p className="font-mono font-bold text-purple-700 mt-0.5">"{selectedLead.keyword || selectedLead.triggerKeyword}"</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Phone</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedLead.phone || 'Not collected yet'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lead Status</span>
                  <div className="mt-1">
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                      {selectedLead.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => alert(`WhatsApp Handoff initiated for @${selectedLead.username}!`)}
                  className="w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <PhoneCall size={14} />
                  <span>Handoff to WhatsApp CRM</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
