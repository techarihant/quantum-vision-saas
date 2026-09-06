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
import { ChevronLeft, Save, Sparkles, Camera, Plus, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const initialSocialNodes: Node[] = [
  {
    id: 'snode_1',
    type: 'default',
    data: { label: '📸 TRIGGER: User Comments "PRICE" on Instagram Reel' },
    position: { x: 250, y: 50 },
    style: {
      background: '#f3e8ff',
      color: '#6b21a8',
      border: '2px solid #a855f7',
      borderRadius: '12px',
      padding: '12px',
      fontWeight: 'bold',
      fontSize: '12px'
    }
  },
  {
    id: 'snode_2',
    type: 'default',
    data: { label: '💬 ACTION: Send Automated Instagram DM ("Hey @user! Reply with your WhatsApp # to get 30% OFF")' },
    position: { x: 250, y: 160 },
    style: {
      background: '#e0e7ff',
      color: '#3730a3',
      border: '1px solid #6366f1',
      borderRadius: '12px',
      padding: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  },
  {
    id: 'snode_3',
    type: 'default',
    data: { label: '❓ CONDITION: Did user reply with phone number?' },
    position: { x: 250, y: 280 },
    style: {
      background: '#fef3c7',
      color: '#92400e',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '12px',
      fontWeight: 'bold',
      fontSize: '12px'
    }
  },
  {
    id: 'snode_4',
    type: 'default',
    data: { label: '⭐ ACTION: Add Lead Score (+25 Points)' },
    position: { x: 420, y: 390 },
    style: {
      background: '#d1fae5',
      color: '#065f46',
      border: '1px solid #10b981',
      borderRadius: '12px',
      padding: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  },
  {
    id: 'snode_5',
    type: 'default',
    data: { label: '📱 HANDOFF: Create WhatsApp CRM Contact & Trigger WhatsApp Welcome Sequence' },
    position: { x: 420, y: 500 },
    style: {
      background: '#ecfdf5',
      color: '#047857',
      border: '2px solid #059669',
      borderRadius: '12px',
      padding: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    }
  },
  {
    id: 'snode_6',
    type: 'default',
    data: { label: '⏱️ DELAY: Wait 2 Hours & Send Reminder DM' },
    position: { x: 50, y: 390 },
    style: {
      background: '#f1f5f9',
      color: '#334155',
      border: '1px solid #cbd5e1',
      borderRadius: '12px',
      padding: '12px',
      fontSize: '12px'
    }
  }
];

const initialSocialEdges: Edge[] = [
  { id: 'se1-2', source: 'snode_1', target: 'snode_2' },
  { id: 'se2-3', source: 'snode_2', target: 'snode_3' },
  { id: 'se3-4', source: 'snode_3', target: 'snode_4', label: 'YES (Phone Received)' },
  { id: 'se4-5', source: 'snode_4', target: 'snode_5' },
  { id: 'se3-6', source: 'snode_3', target: 'snode_6', label: 'NO (No Response)' }
];

export default function ManyChatFlowBuilderPage() {
  const { currentOrg } = useApp();
  const [nodes, setNodes] = useState<Node[]>(initialSocialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialSocialEdges);
  const [saved, setSaved] = useState(false);

  const onNodesChange = (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds));

  const handleSaveWorkflow = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddNode = () => {
    const newNode: Node = {
      id: `snode_${Date.now()}`,
      type: 'default',
      data: { label: '⚡ NEW ACTION: Send Custom Offer Link' },
      position: { x: 250, y: 620 },
      style: {
        background: '#f3e8ff',
        color: '#6b21a8',
        border: '1px solid #a855f7',
        borderRadius: '12px',
        padding: '12px',
        fontSize: '12px'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col bg-slate-50">
      {/* Builder Header Bar */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <Link href="/lead-automation/triggers" className="text-slate-500 hover:text-slate-900">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Camera size={14} className="text-purple-600" />
              Quantum Vision Visual Flow Builder: Instagram Comment-to-WhatsApp Flow
            </h2>
            <p className="text-[10px] text-slate-500">
              Drag-and-drop workflow canvas connecting Instagram social triggers to WhatsApp CRM handoff.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNode}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Plus size={14} />
            <span>Add Flow Node</span>
          </button>

          <button
            onClick={handleSaveWorkflow}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 shadow-xs"
          >
            <Save size={14} />
            <span>{saved ? 'Saved!' : 'Save Social Flow'}</span>
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
