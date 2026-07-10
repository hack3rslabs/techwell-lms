"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Play, Settings, Activity, Bot, Share2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function AutomationStudio() {
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  async function fetchData() {
    setIsLoading(true);
    try {
      if (activeTab === 'workflows') {
        const res = await axios.get(`${API_BASE}/admin/automation-studio/workflows`, { withCredentials: true });
        setWorkflows(res.data.data || []);
      } else if (activeTab === 'agents') {
        const res = await axios.get(`${API_BASE}/admin/automation-studio/agents`, { withCredentials: true });
        setAgents(res.data.data || []);
      } else if (activeTab === 'logs') {
        const res = await axios.get(`${API_BASE}/admin/automation-studio/logs`, { withCredentials: true });
        setLogs(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(`Failed to load ${activeTab}`);
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    fetchData();
  }, [activeTab]);
;

  const createWorkflow = async () => {
    try {
      const res = await axios.post(`${API_BASE}/admin/automation-studio/workflows`, {
        name: 'New Workflow',
        description: 'Auto-generated workflow',
        triggerType: 'EVENT',
        triggerData: { eventType: 'custom.event' },
        nodes: [
          { type: 'TRIGGER', label: 'Start Event', positionX: 250, positionY: 100 }
        ],
        edges: []
      }, { withCredentials: true });
      
      toast.success("Workflow created!");
      fetchData();
    } catch (err) {
      toast.error("Failed to create workflow");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Automation Studio</h1>
          <p className="text-slate-500 mt-1">Design AI workflows and manage autonomous agents.</p>
        </div>
        {activeTab === 'workflows' && (
          <button 
            onClick={createWorkflow}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" /> New Workflow
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'workflows' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Share2 className="w-4 h-4" /> Workflows
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'agents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Bot className="w-4 h-4" /> AI Agents
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Activity className="w-4 h-4" /> Execution Logs
        </button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'workflows' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map(wf => (
                  <div key={wf.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg">{wf.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${wf.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                        {wf.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2">{wf.description || 'No description provided.'}</p>
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
                      <span className="text-xs text-slate-400">Trigger: {wf.triggerType}</span>
                      <Link href={`/admin/automation-studio/builder/${wf.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                        <Settings className="w-4 h-4" /> Build
                      </Link>
                    </div>
                  </div>
                ))}
                {workflows.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    No workflows found. Create one to get started.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-xs text-slate-500">Model: {agent.model}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                      {agent.systemPrompt}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Workflow</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(log.startedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {log.workflow?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                            log.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {log.tokensUsed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
