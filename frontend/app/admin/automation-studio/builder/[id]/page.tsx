"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import WorkflowCanvas from '../../../../../components/automation-studio/WorkflowCanvas';

export default function WorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const [workflow, setWorkflow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  async function fetchWorkflow() {
    try {
      const res = await axios.get(`${API_BASE}/admin/automation-studio/workflows`, { withCredentials: true });
      const found = res.data.data.find((w: any) => w.id === params.id);
      
      if (found) {
        setWorkflow(found);
      } else {
        toast.error("Workflow not found");
        router.push('/admin/automation-studio');
      }
    } catch (err) {
      toast.error("Failed to load workflow");
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    // In a real scenario, fetch specific workflow by ID.
    // For this prototype, we'll fetch all and find it, or just use a mock if new.
    fetchWorkflow();
  }, [params.id]);
;

  const handleSave = async (nodes: any[], edges: any[]) => {
    try {
      const payload = {
        ...workflow,
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type,
          label: n.data?.label || '',
          positionX: n.position.x,
          positionY: n.position.y,
          config: n.data
        })),
        edges: edges.map(e => ({
          id: e.id,
          sourceNodeId: e.source,
          targetNodeId: e.target,
          condition: e.data
        }))
      };

      await axios.post(`${API_BASE}/admin/automation-studio/workflows`, payload, { withCredentials: true });
      toast.success("Workflow saved successfully!");
    } catch (error) {
      toast.error("Failed to save workflow");
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!workflow) return null;

  // Transform backend models to React Flow format
  const initialNodes = workflow.nodes?.map((n: any) => ({
    id: n.id,
    type: n.type,
    position: { x: n.positionX, y: n.positionY },
    data: { ...n.config, label: n.label }
  })) || [];

  const initialEdges = workflow.edges?.map((e: any) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    data: e.condition
  })) || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/automation-studio" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-white leading-tight">{workflow.name}</h1>
            <p className="text-xs text-slate-500">{workflow.status} • {workflow.triggerType} Trigger</p>
          </div>
        </div>
        <div className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Draft Mode
        </div>
      </div>
      
      <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950">
        <WorkflowCanvas 
          initialNodes={initialNodes} 
          initialEdges={initialEdges} 
          onSave={handleSave} 
        />
      </div>
    </div>
  );
}
