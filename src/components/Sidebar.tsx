'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Layers,
  FileCode,
  Send,
  GitFork,
  BarChart3,
  ListFilter,
  Ban,
  Webhook,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Share2,
  Sparkles,
  Zap,
  Gift,
  Key,
  PieChart,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { currentOrg, isDemoMode } = useApp();

  const mainNavItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inbox', href: '/inbox', icon: MessageSquare, badge: 3, badgeColor: 'bg-emerald-600' },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Segments', href: '/segments', icon: Layers },
    { name: 'Templates', href: '/templates', icon: FileCode },
    { name: 'Campaigns', href: '/campaigns', icon: Send },
    { name: 'Automations', href: '/automations', icon: GitFork },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 }
  ];

  const leadAutomationNavItems = [
    { name: 'Comment Triggers', href: '/lead-automation/triggers', icon: Zap },
    { name: 'Lead Magnets', href: '/lead-automation/magnets', icon: Gift },
    { name: 'Social Leads', href: '/lead-automation/leads', icon: Users },
    { name: 'Social Conversations', href: '/lead-automation/conversations', icon: MessageSquare },
    { name: 'Keywords', href: '/lead-automation/keywords', icon: Key },
    { name: 'Automation Analytics', href: '/lead-automation/analytics', icon: PieChart }
  ];

  const settingsNavItems = [
    { name: 'Message Logs', href: '/message-logs', icon: ListFilter },
    { name: 'Suppression List', href: '/suppression', icon: Ban },
    { name: 'Social Channels', href: '/settings/social', icon: Share2 },
    { name: 'Team & Roles', href: '/settings/roles', icon: ShieldCheck },
    { name: 'Integrations & API', href: '/integrations', icon: Webhook },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Billing', href: '/billing', icon: CreditCard }
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-white text-slate-800 transition-all duration-300 shadow-xs ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 font-bold text-white shadow-md shadow-emerald-500/20">
              QV
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900">Quantum Vision</h1>
              <p className="text-[10px] font-semibold text-emerald-600">quantumvision.in</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
            QV
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Organization Badge */}
      {!collapsed && (
        <div className="m-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-6 w-6 rounded-md bg-emerald-100 text-center text-xs font-bold text-emerald-700 flex items-center justify-center">
              {currentOrg.name[0]}
            </div>
            <div className="truncate text-xs font-semibold text-slate-800">{currentOrg.name}</div>
          </div>
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
            {currentOrg.plan}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {/* Main WhatsApp SaaS Group */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              WhatsApp Platform
            </div>
          )}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname === item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={17} className={isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-800'} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {item.badge && !collapsed && (
                    <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white bg-emerald-600">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Lead Automation Group (Quantum Vision Engine) */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center justify-between">
              <span>Social Automation</span>
              <Share2 size={12} />
            </div>
          )}
          <div className="space-y-1">
            {leadAutomationNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={17} className={isActive ? 'text-purple-600' : 'text-slate-500 group-hover:text-slate-800'} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings Group */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System Settings
            </div>
          )}
          <div className="space-y-1">
            {settingsNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={17} className={isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-800'} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Demo Mode Status Footer */}
      {!collapsed && (
        <div className="m-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Sparkles size={14} className="text-amber-600" />
            <span>ManyChat Simulator</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-800">
            Instagram comment DM triggers & WhatsApp handoff active.
          </p>
        </div>
      )}
    </aside>
  );
}
