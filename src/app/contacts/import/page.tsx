'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import Papa from 'papaparse';
import { useApp } from '@/context/AppContext';

export default function ContactsImportPage() {
  const router = useRouter();
  const { currentOrg } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  // Column Mapping State
  const [mapping, setMapping] = useState({
    firstName: '',
    whatsappNumber: '',
    email: '',
    company: '',
    city: ''
  });

  const [importSummary, setImportSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // File Upload Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        if (rows.length > 0) {
          setRawRows(rows);
          const cols = Object.keys(rows[0]);
          setColumns(cols);

          // Auto-detect columns
          setMapping({
            firstName: cols.find((c) => /name|first/i.test(c)) || cols[0] || '',
            whatsappNumber: cols.find((c) => /phone|mobile|whatsapp|number/i.test(c)) || cols[1] || '',
            email: cols.find((c) => /email/i.test(c)) || '',
            company: cols.find((c) => /company|organization/i.test(c)) || '',
            city: cols.find((c) => /city|location/i.test(c)) || ''
          });

          setStep(2);
        }
      }
    });
  };

  const handleRunImport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          rows: rawRows,
          columnMapping: mapping
        })
      });

      if (res.ok) {
        const json = await res.json();
        setImportSummary(json.summary);
        setStep(3);
      }
    } catch (err) {
      console.error('Import error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/contacts"
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1"
          >
            <ChevronLeft size={14} /> Back to Contacts CRM
          </Link>
          <h1 className="text-xl font-bold text-slate-900">CSV / XLSX Bulk Contact Import Wizard</h1>
          <p className="text-xs text-slate-500">Map fields, validate WhatsApp numbers, and filter opt-outs</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: 1, label: '1. Upload File' },
          { num: 2, label: '2. Column Mapping & Validation' },
          { num: 3, label: '3. Import Summary' }
        ].map((s) => (
          <div
            key={s.num}
            className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
              step === s.num
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                : step > s.num
                ? 'border-slate-200 bg-white text-slate-700'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1: Upload File */}
      {step === 1 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <FileSpreadsheet size={32} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-slate-900">Drop your CSV or XLSX file here</h3>
          <p className="mt-1 text-xs text-slate-500">Supports standard customer export formats (.csv, .xlsx, .txt)</p>

          <label className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-emerald-700">
            <Upload size={16} />
            <span>Select File to Upload</span>
            <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Map CSV Columns to CRM Fields</h3>
            <p className="text-xs text-slate-500">File loaded: <strong className="text-emerald-700">{fileName}</strong> ({rawRows.length} rows found)</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold">First Name Column</label>
              <select
                value={mapping.firstName}
                onChange={(e) => setMapping({ ...mapping, firstName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:outline-none"
              >
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold">WhatsApp Number Column *</label>
              <select
                value={mapping.whatsappNumber}
                onChange={(e) => setMapping({ ...mapping, whatsappNumber: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 font-mono focus:outline-none"
              >
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold">Email Column</label>
              <select
                value={mapping.email}
                onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:outline-none"
              >
                <option value="">(None)</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold">Company Column</label>
              <select
                value={mapping.company}
                onChange={(e) => setMapping({ ...mapping, company: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:outline-none"
              >
                <option value="">(None)</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleRunImport}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              {loading ? 'Validating & Importing...' : 'Run Import Validation'} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Import Summary Report */}
      {step === 3 && importSummary && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import Execution Completed!</h3>
              <p className="text-xs text-slate-500">Detailed validation breakdown summary report</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Total Rows Processed</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">{importSummary.totalRows}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs text-emerald-800 font-bold">Successfully Imported</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-700">{importSummary.importedCount}</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs text-amber-800 font-bold">Skipped / Duplicates</div>
              <div className="mt-1 text-2xl font-extrabold text-amber-700">{importSummary.duplicateCount + importSummary.skippedCount}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => router.push('/contacts')}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              View Contacts in CRM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
