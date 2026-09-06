'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChevronLeft, Save, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const initialNodes: Node[] = [
  {
    id: 'node_1',
    type: 'default',
    data: { label: '⚡ TRIGGER: Contact Tagged (Lead)' },
    position: { x: 250, y: 50 },
    style: { background: '#d1fae5', color: '#065f46', border: '2px solid #10b981', borderRadius: '12px', padding: '12px', fontWeight: 'bold', fontSize: '12px' }
  },
  {
    id: 'node_2',
    type: 'default',
    data: { label: '⏱️ DELAY: Wait 5 Minutes' },
    position: { x: 250, y: 150 },
    style: { background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', fontSize: '12px' }
  },
  {
    id: 'node_3',
    type: 'default',
    data: { label: '💬 ACTION: Send Template (lead_welcome_series)' },
    position: { x: 250, y: 250 },
    style: { background: '#e0e7ff', color: '#3730a3', border: '1px solid #6366f1', borderRadius: '12px', padding: '12px', fontSize: '12px', fontWeight: 'bold' }
  },
  {
    id: 'node_4',
    type: 'default',
    data: { label: '⏱️ DELAY: Wait 24 Hours' },
    position: { x: 250, y: 350 },
    style: { background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', fontSize: '12px' }
  },
  {
    id: 'node_5',
    type: 'default',
    data: { label: '❓ CONDITION: Did Customer Reply?' },
    position: { x: 250, y: 450 },
    style: { background: '#fef3c7', color: '#92400e', border: '2px solid #f59e0b', borderRadius: '12px', padding: '12px', fontWeight: 'bold', fontSize: '12px' }
  },
  {
    id: 'node_6',
    type: 'default',
    data: { label: '🛑 STOP: Customer Replied (Halt Workflow)' },
    position: { x: 50, y: 560 },
    style: { background: '#ffe4e6', color: '#9f1239', border: '1px solid #f43f5e', borderRadius: '12px', padding: '12px', fontSize: '12px', fontWeight: 'bold' }
  },
  {
    id: 'node_7',
    type: 'default',
    data: { label: '💬 ACTION: Send Follow-Up Template (abandoned_cart_reminder)' },
    position: { x: 420, y: 560 },
    style: { background: '#ccfbf1', color: '#115e59', border: '1px solid #14b8a6', borderRadius: '12px', padding: '12px', fontSize: '12px' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'node_1', target: 'node_2' },
  { id: 'e2-3', source: 'node_2', target: 'node_3' },
  { id: 'e3-4', source: 'node_3', target: 'node_4' },
  { id: 'e4-5', source: 'node_4', target: 'node_5' },
  { id: 'e5-6', source: 'node_5', target: 'node_6', label: 'YES (Customer Replied)' },
  { id: 'e5-7', source: 'node_5', target: 'node_7', label: 'NO (No Reply Received)' }
];

export default function WorkflowBuilderCanvasPage() {
  const { currentOrg } = useApp();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [saved, setSaved] = useState(false);

  const onNodesChange = (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds));

  const handleSaveWorkflow = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col bg-slate-50">
      {/* Builder Top Bar */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <Link href="/automations" className="text-slate-500 hover:text-slate-900">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Visual Workflow Builder: New Lead Onboarding</h2>
            <p className="text-[10px] text-slate-500">Drag & drop nodes, configure delays, conditional branches and auto-stop reply triggers.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 font-bold flex items-center gap-1">
            <Sparkles size={14} /> Auto-Stop Reply Logic Enabled
          </span>
          <button
            onClick={handleSaveWorkflow}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Save size={14} />
            <span>{saved ? 'Saved!' : 'Save Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="flex-1 w-full bg-slate-100">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
