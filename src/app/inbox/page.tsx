'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  CheckCheck,
  Clock,
  Check,
  Send,
  Lock,
  Building,
  Mail,
  MapPin,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Conversation, Message, InternalNote, Contact } from '@/lib/types';

export default function SharedInboxPage() {
  const { currentOrg, currentUser, users } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [contactDetail, setContactDetail] = useState<Contact | null>(null);

  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ASSIGNED_TO_ME' | 'UNASSIGNED' | 'OPEN' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  const [replyMode, setReplyMode] = useState<'whatsapp' | 'internal_note'>('whatsapp');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch Conversations list
  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `/api/inbox/conversations?orgId=${currentOrg.id}&filter=${filter}&search=${encodeURIComponent(search)}&currentUserId=${currentUser.id}`
      );
      if (res.ok) {
        const json: Conversation[] = await res.json();
        setConversations(json);
        if (!activeConvId && json.length > 0) {
          setActiveConvId(json[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentOrg, filter, search]);

  // Real-Time SSE Stream Subscription
  useEffect(() => {
    const sse = new EventSource(`/api/inbox/stream?orgId=${currentOrg.id}`);
    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'SYNC_CONVERSATIONS') {
          setConversations(payload.conversations);
        }
      } catch (e) {}
    };

    return () => {
      sse.close();
    };
  }, [currentOrg]);

  // Fetch Active Conversation Messages & Contact Info
  const fetchActiveDetails = async (convId: string) => {
    try {
      // Fetch Messages
      const msgRes = await fetch(`/api/inbox/messages?orgId=${currentOrg.id}&conversationId=${convId}`);
      if (msgRes.ok) {
        const msgs: Message[] = await msgRes.json();
        setMessages(msgs);
      }

      // Fetch Internal Notes
      const noteRes = await fetch(`/api/inbox/notes?orgId=${currentOrg.id}&conversationId=${convId}`);
      if (noteRes.ok) {
        const notes: InternalNote[] = await noteRes.json();
        setInternalNotes(notes);
      }

      // Find Contact Info
      const activeConv = conversations.find((c) => c.id === convId);
      if (activeConv) {
        const cntRes = await fetch(`/api/contacts?orgId=${currentOrg.id}&search=${encodeURIComponent(activeConv.whatsappNumber)}`);
        if (cntRes.ok) {
          const json = await cntRes.json();
          if (json.contacts && json.contacts.length > 0) {
            setContactDetail(json.contacts[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch conversation details', e);
    }
  };

  useEffect(() => {
    if (activeConvId) {
      fetchActiveDetails(activeConvId);
    }
  }, [activeConvId, conversations]);

  // Auto scroll to chat bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, internalNotes]);

  // Handle Reply Dispatch
  const handleSend = async () => {
    if (!replyText.trim() || !activeConvId) return;
    setSending(true);

    const activeConv = conversations.find((c) => c.id === activeConvId);

    try {
      if (replyMode === 'whatsapp') {
        const res = await fetch('/api/inbox/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: currentOrg.id,
            conversationId: activeConvId,
            contactId: contactDetail?.id || activeConv?.contactId,
            content: replyText,
            messageType: 'TEXT'
          })
        });
        if (res.ok) {
          setReplyText('');
          fetchActiveDetails(activeConvId);
          fetchConversations();
        }
      } else {
        // Internal Note
        const res = await fetch('/api/inbox/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: currentOrg.id,
            conversationId: activeConvId,
            userId: currentUser.id,
            userName: currentUser.name,
            note: replyText
          })
        });
        if (res.ok) {
          setReplyText('');
          fetchActiveDetails(activeConvId);
        }
      }
    } catch (err) {
      console.error('Send error', err);
    } finally {
      setSending(false);
    }
  };

  // Status & Agent Assignment Handlers
  const handleAssign = async (targetUserId: string, targetUserName: string) => {
    if (!activeConvId) return;
    await fetch('/api/inbox/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: currentOrg.id,
        conversationId: activeConvId,
        action: 'assign',
        assignedUserId: targetUserId,
        assignedUserName: targetUserName
      })
    });
    fetchConversations();
  };

  const handleToggleStatus = async () => {
    if (!activeConvId) return;
    const activeConv = conversations.find((c) => c.id === activeConvId);
    const newStatus = activeConv?.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';

    await fetch('/api/inbox/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: currentOrg.id,
        conversationId: activeConvId,
        action: 'update_status',
        status: newStatus
      })
    });
    fetchConversations();
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] w-[calc(100%+3rem)] overflow-hidden bg-slate-100">
      {/* LEFT COLUMN: Conversations List */}
      <div className="flex w-80 flex-col border-r border-slate-200 bg-white">
        {/* Header & Search */}
        <div className="border-b border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Shared Inbox
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] text-emerald-800 font-extrabold">
                {conversations.filter((c) => c.unreadCount > 0).length} Unread
              </span>
            </h2>
          </div>

          {/* Platform Channel Tabs */}
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-bold">
            <button className="rounded-lg bg-white py-1 text-slate-900 shadow-2xs">All</button>
            <button className="rounded-lg py-1 text-slate-600 hover:text-slate-900">WhatsApp</button>
            <button className="rounded-lg py-1 text-slate-600 hover:text-slate-900">Instagram</button>
            <button className="rounded-lg py-1 text-slate-600 hover:text-slate-900">Facebook</button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Quick Filters Pill bar */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'UNREAD', label: 'Unread' },
              { id: 'ASSIGNED_TO_ME', label: 'Mine' },
              { id: 'OPEN', label: 'Open' },
              { id: 'RESOLVED', label: 'Resolved' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No conversations found.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`flex w-full items-start gap-3 p-3.5 text-left transition-all ${
                    isActive ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 font-bold text-white text-xs shadow-xs">
                      {conv.contactName[0]}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-xs font-bold text-slate-900">{conv.contactName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="truncate text-[11px] text-slate-600 mt-0.5">
                      {conv.lastMessageDirection === 'OUTBOUND' && <span className="text-emerald-600 font-bold mr-1">You:</span>}
                      {conv.lastMessage}
                    </div>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500">{conv.whatsappNumber}</span>
                      {conv.assignedUserName && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
                          👤 {conv.assignedUserName}
                        </span>
                      )}
                      {conv.status === 'RESOLVED' && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MIDDLE COLUMN: Chat Workspace */}
      <div className="flex flex-1 flex-col bg-slate-50">
        {activeConv ? (
          <>
            {/* Chat Top Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 bg-white shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-bold text-white text-xs">
                  {activeConv.contactName[0]}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    {activeConv.contactName}
                    <span className="text-[11px] font-mono text-emerald-700">{activeConv.whatsappNumber}</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Status: <strong className={activeConv.status === 'OPEN' ? 'text-emerald-700' : 'text-slate-700'}>{activeConv.status}</strong>
                    {activeConv.assignedUserName && ` • Assigned to ${activeConv.assignedUserName}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Agent Assignment dropdown */}
                <select
                  value={activeConv.assignedUserId || ''}
                  onChange={(e) => {
                    const u = users.find((usr) => usr.id === e.target.value);
                    handleAssign(e.target.value, u ? u.name : 'Unassigned');
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      Assign: {u.name}
                    </option>
                  ))}
                </select>

                {/* Resolve/Reopen button */}
                <button
                  onClick={handleToggleStatus}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                    activeConv.status === 'RESOLVED'
                      ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {activeConv.status === 'RESOLVED' ? <RotateCcw size={14} /> : <CheckCircle size={14} />}
                  {activeConv.status === 'RESOLVED' ? 'Reopen' : 'Mark Resolved'}
                </button>
              </div>
            </div>

            {/* Chat Timeline (Messages + Internal Notes) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-100">
              {messages.map((msg) => {
                const isOutbound = msg.direction === 'OUTBOUND';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl p-4 text-xs shadow-xs ${
                        isOutbound
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                      <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] opacity-80">
                        <span>
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOutbound && (
                          <span title={msg.status}>
                            {msg.status === 'READ' && <CheckCheck size={14} className="text-sky-200" />}
                            {msg.status === 'DELIVERED' && <CheckCheck size={14} className="text-white" />}
                            {msg.status === 'SENT' && <Check size={14} className="text-white" />}
                            {msg.status === 'QUEUED' && <Clock size={14} className="text-white" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Internal Notes Displayed in Chat Timeline */}
              {internalNotes.map((note) => (
                <div key={note.id} className="mx-auto max-w-lg rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 shadow-xs">
                  <div className="flex items-center justify-between font-bold text-amber-900 text-[11px] mb-1">
                    <span className="flex items-center gap-1"><Lock size={12} /> Internal Note by {note.userName}</span>
                    <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p>{note.note}</p>
                </div>
              ))}

              <div ref={chatBottomRef} />
            </div>

            {/* Reply Composer Bar */}
            <div className="border-t border-slate-200 bg-white p-4">
              {/* Tab Selector: WhatsApp Message vs Internal Note */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setReplyMode('whatsapp')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold ${
                    replyMode === 'whatsapp'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Send size={12} /> WhatsApp Reply
                </button>
                <button
                  onClick={() => setReplyMode('internal_note')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold ${
                    replyMode === 'internal_note'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock size={12} /> Internal Note (Hidden from Customer)
                </button>
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    replyMode === 'whatsapp'
                      ? 'Type WhatsApp reply... (Press Enter to send)'
                      : 'Add an internal note for team members...'
                  }
                  className={`flex-1 rounded-xl border p-3 text-xs text-slate-900 focus:outline-none ${
                    replyMode === 'whatsapp'
                      ? 'border-slate-200 bg-slate-50 focus:border-emerald-500'
                      : 'border-amber-300 bg-amber-50 focus:border-amber-500'
                  }`}
                />

                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className={`flex items-center justify-center rounded-xl px-5 font-bold text-xs text-white transition-opacity ${
                    replyMode === 'whatsapp'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  } ${sending || !replyText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 text-xs">
            Select a conversation from the left inbox panel to begin chatting.
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Contact CRM Sidebar */}
      {contactDetail && (
        <div className="w-80 border-l border-slate-200 bg-white p-5 overflow-y-auto">
          <div className="flex flex-col items-center text-center pb-5 border-b border-slate-200">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-2xl text-white shadow-md">
              {contactDetail.firstName[0]}
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              {contactDetail.firstName} {contactDetail.lastName}
            </h3>
            <span className="text-xs text-emerald-700 font-mono font-bold mt-0.5">{contactDetail.whatsappNumber}</span>

            <div className="mt-3 flex gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  contactDetail.optInStatus && !contactDetail.optOutStatus
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {contactDetail.optInStatus && !contactDetail.optOutStatus ? '✓ Opted In' : '✗ Opted Out'}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">CRM Contact Information</h4>
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span>{contactDetail.email || 'No email specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-slate-400" />
                  <span>{contactDetail.company || 'No company specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{contactDetail.city}, {contactDetail.country}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Applied Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {contactDetail.tags.map((t) => (
                  <span key={t} className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-800">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {contactDetail.lastCampaignName && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Received Campaign</h4>
                <p className="font-bold text-emerald-700 text-xs">{contactDetail.lastCampaignName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
