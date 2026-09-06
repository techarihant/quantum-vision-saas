'use client';

import React, { useState } from 'react';
import { ShieldCheck, Users, Plus, Mail, Check, X, Lock, Key, Sliders, CheckCircle2, UserPlus, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CustomRole, PermissionKey, UserRole } from '@/lib/types';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING_INVITE';
  avatar?: string;
  joinedAt: string;
}

const INITIAL_MEMBERS: MemberItem[] = [
  {
    id: 'usr_arihant',
    name: 'Arihant',
    email: 'arihant@quantumvision.in',
    role: 'Owner / Super Admin',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2025-01-10'
  },
  {
    id: 'usr_priya',
    name: 'Priya Patel',
    email: 'priya@quantumvision.in',
    role: 'Admin',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2025-01-12'
  },
  {
    id: 'usr_neha',
    name: 'Neha Singh',
    email: 'neha@quantumvision.in',
    role: 'Inbox Agent',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2025-01-20'
  }
];

const ALL_PERMISSIONS: { key: PermissionKey; label: string; group: string }[] = [
  { key: 'manage_organization', label: 'Manage Organization Settings', group: 'Administration' },
  { key: 'manage_team', label: 'Manage Team & Assign Roles', group: 'Administration' },
  { key: 'manage_billing', label: 'View & Manage Subscription Billing', group: 'Administration' },
  { key: 'manage_api_keys', label: 'Create & Revoke API Keys', group: 'Security & API' },
  { key: 'send_campaigns', label: 'Create & Dispatch WhatsApp Campaigns', group: 'Marketing' },
  { key: 'create_templates', label: 'Submit WhatsApp Templates to Meta', group: 'Marketing' },
  { key: 'manage_automations', label: 'Build & Edit Automation Workflows', group: 'Automation' },
  { key: 'manage_social_leads', label: 'Manage Instagram & Social Leads', group: 'Social Lead Automation' },
  { key: 'access_inbox', label: 'Access Shared Team Inbox', group: 'Shared Inbox' },
  { key: 'reply_messages', label: 'Send Outbound WhatsApp Replies', group: 'Shared Inbox' },
  { key: 'view_contacts', label: 'View Contact CRM Directory', group: 'CRM' },
  { key: 'export_contacts', label: 'Export Contacts to CSV/XLSX', group: 'CRM' }
];

const INITIAL_ROLES: CustomRole[] = [
  {
    id: 'role_owner',
    organizationId: 'org_dobcy',
    name: 'Owner / Super Admin',
    description: 'Full unrestricted system access, billing control, and security ownership.',
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    isSystemRole: true,
    userCount: 1,
    createdAt: '2025-01-01'
  },
  {
    id: 'role_admin',
    organizationId: 'org_dobcy',
    name: 'Admin',
    description: 'Full operational management excluding ownership transfer.',
    permissions: ALL_PERMISSIONS.filter((p) => p.key !== 'manage_billing').map((p) => p.key),
    isSystemRole: true,
    userCount: 1,
    createdAt: '2025-01-01'
  },
  {
    id: 'role_marketer',
    organizationId: 'org_dobcy',
    name: 'Marketing Manager',
    description: 'Can manage campaigns, templates, segments, and social lead triggers.',
    permissions: ['send_campaigns', 'create_templates', 'manage_automations', 'manage_social_leads', 'view_contacts', 'access_inbox'],
    isSystemRole: false,
    userCount: 0,
    createdAt: '2025-01-15'
  },
  {
    id: 'role_agent',
    organizationId: 'org_dobcy',
    name: 'Inbox Agent',
    description: 'Focused on customer conversation management in the Shared Inbox.',
    permissions: ['access_inbox', 'reply_messages', 'view_contacts'],
    isSystemRole: true,
    userCount: 1,
    createdAt: '2025-01-01'
  }
];

export default function TeamRoleManagementPage() {
  const { currentOrg } = useApp();
  const [activeTab, setActiveTab] = useState<'members' | 'matrix'>('members');
  const [members, setMembers] = useState<MemberItem[]>(INITIAL_MEMBERS);
  const [roles, setRoles] = useState<CustomRole[]>(INITIAL_ROLES);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Marketing Manager');

  // Custom Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<PermissionKey[]>([
    'access_inbox',
    'reply_messages',
    'view_contacts'
  ]);

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newMem: MemberItem = {
      id: `usr_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'PENDING_INVITE',
      joinedAt: new Date().toISOString().split('T')[0]
    };

    setMembers([...members, newMem]);
    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;

    const newRole: CustomRole = {
      id: `role_${Date.now()}`,
      organizationId: currentOrg.id,
      name: roleName,
      description: roleDesc || 'Custom team role',
      permissions: selectedPerms,
      isSystemRole: false,
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRoles([...roles, newRole]);
    setIsRoleModalOpen(false);
    setRoleName('');
    setRoleDesc('');
  };

  const togglePermission = (perm: PermissionKey) => {
    if (selectedPerms.includes(perm)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== perm));
    } else {
      setSelectedPerms([...selectedPerms, perm]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck size={24} className="text-emerald-600" />
            Team & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500">
            Manage team access permissions and custom roles for <strong className="text-slate-800">{currentOrg.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Sliders size={15} />
            <span>Create Custom Role</span>
          </button>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <UserPlus size={16} />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users size={16} />
          <span>Team Members ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders size={16} />
          <span>Roles & Permissions Matrix</span>
        </button>
      </div>

      {/* Tab 1: Team Members List */}
      {activeTab === 'members' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Team Member</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {members.map((mem) => (
                <tr key={mem.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {mem.avatar ? (
                        <img src={mem.avatar} alt={mem.name} className="h-9 w-9 rounded-full object-cover shadow-xs" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                          {mem.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{mem.name}</div>
                        <div className="text-[11px] text-slate-400">{mem.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono font-bold text-slate-800">{mem.email}</td>

                  <td className="px-5 py-4">
                    <select
                      value={mem.role}
                      onChange={(e) => {
                        const updatedRole = e.target.value;
                        setMembers(members.map((m) => (m.id === mem.id ? { ...m, role: updatedRole } : m)));
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase ${
                        mem.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {mem.status === 'ACTIVE' ? 'Active' : 'Invite Sent'}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">{mem.joinedAt}</td>

                  <td className="px-5 py-4 text-right">
                    {mem.role.includes('Owner') ? (
                      <span className="text-[11px] font-bold text-slate-400 italic">Primary Owner</span>
                    ) : (
                      <button
                        onClick={() => setMembers(members.filter((m) => m.id !== mem.id))}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Permissions Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Roles Cards Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{r.name}</span>
                  {r.isSystemRole && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                      System Role
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 min-h-[36px]">{r.description}</p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="font-semibold text-emerald-700">{r.permissions.length} Permissions</span>
                  <span className="text-slate-400">{r.userCount || 1} User(s)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Permission Capability</th>
                  <th className="px-5 py-3.5">Category</th>
                  {roles.map((r) => (
                    <th key={r.id} className="px-5 py-3.5 text-center">
                      {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {ALL_PERMISSIONS.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{perm.label}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">{perm.group}</td>
                    {roles.map((r) => {
                      const hasPerm = r.permissions.includes(perm.key);
                      return (
                        <td key={r.id} className="px-5 py-3.5 text-center">
                          {hasPerm ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check size={14} />
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                              <X size={14} />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus size={18} className="text-emerald-600" />
              Invite Team Member
            </h3>

            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@quantumvision.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Assign Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none font-bold"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders size={18} className="text-purple-600" />
              Create Custom Role & Assign Capabilities
            </h3>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campaign Supervisor"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of responsibilities..."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">
                  Select Permission Capabilities ({selectedPerms.length} Selected)
                </label>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  {ALL_PERMISSIONS.map((p) => {
                    const checked = selectedPerms.includes(p.key);
                    return (
                      <label key={p.key} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(p.key)}
                          className="h-4 w-4 rounded accent-purple-600"
                        />
                        <span className="font-semibold">{p.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
                >
                  Save Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
