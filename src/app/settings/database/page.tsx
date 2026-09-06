'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, CheckCircle2, Server, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function DatabaseSettingsPage() {
  const { currentOrg } = useApp();

  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // MySQL form inputs
  const [host, setHost] = useState('');
  const [port, setPort] = useState('3306');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchDbStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
        if (data.mysqlConfig) {
          setHost(data.mysqlConfig.host || '');
          setPort(String(data.mysqlConfig.port || 3306));
          setUser(data.mysqlConfig.user || '');
          setDatabase(data.mysqlConfig.database || '');
        }
      }
    } catch (e) {
      console.error('Failed to fetch DB status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleTestMySQL = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, user, password, database })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection error' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="text-emerald-600" size={24} />
            Database & Data Persistence Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure MySQL database connection, persistent storage engines, and verify zero-data-loss backup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            WhatsApp Settings
          </Link>
          <Link
            href="/settings/social"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Social Settings
          </Link>
        </div>
      </div>

      {/* Active Engine Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {loading ? 'Checking Database...' : dbStatus?.activeEngine || 'Persistent Dual-Layer Storage'}
              </h3>
              <p className="text-xs text-slate-600">
                All CRM contacts, campaigns, and WhatsApp templates are automatically synchronized and backed up.
              </p>
            </div>
          </div>

          <button
            onClick={fetchDbStatus}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Status
          </button>
        </div>

        {dbStatus?.dbStats && (
          <div className="grid grid-cols-4 gap-3 text-center pt-2">
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Contacts Stored</div>
              <div className="mt-1 text-lg font-extrabold text-emerald-700">{dbStatus.dbStats.contacts}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Campaigns Stored</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900">{dbStatus.dbStats.campaigns}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Templates Synced</div>
              <div className="mt-1 text-lg font-extrabold text-indigo-700">{dbStatus.dbStats.templates}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Social Accounts</div>
              <div className="mt-1 text-lg font-extrabold text-teal-700">{dbStatus.dbStats.socialAccounts}</div>
            </div>
          </div>
        )}
      </div>

      {/* MySQL Connection Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server size={18} className="text-sky-600" />
            Connect External MySQL Database
          </h3>
          <p className="text-xs text-slate-500">
            Connect your own MySQL / MariaDB server (e.g. AWS RDS, PlanetScale, DigitalOcean, or Localhost MySQL) for direct relational storage.
          </p>
        </div>

        {testResult && (
          <div
            className={`rounded-xl border p-4 text-xs font-bold flex items-center gap-2 ${
              testResult.success
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-rose-300 bg-rose-50 text-rose-900'
            }`}
          >
            {testResult.success ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-rose-600" />}
            <span>{testResult.message}</span>
          </div>
        )}

        <form onSubmit={handleTestMySQL} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-700">MySQL Host / Server Address</label>
              <input
                type="text"
                placeholder="e.g. db.mycompany.com or 127.0.0.1"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Port</label>
              <input
                type="text"
                placeholder="3306"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Database Name</label>
              <input
                type="text"
                placeholder="quantumvision_db"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">MySQL Username</label>
              <input
                type="text"
                placeholder="db_user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">MySQL Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={testing}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Testing MySQL Connection...
                </>
              ) : (
                <>
                  <Server size={14} />
                  Test & Connect MySQL Database
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
