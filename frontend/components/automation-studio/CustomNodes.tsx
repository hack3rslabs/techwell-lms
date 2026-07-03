import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Zap, BrainCircuit, PlaySquare } from 'lucide-react';

export const TriggerNode = memo(({ id, data, isConnectable }: any) => {
  const { updateNodeData } = useReactFlow();

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { triggerType: e.target.value, label: e.target.value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-lg shadow-sm w-64">
      <div className="bg-blue-500 text-white px-3 py-2 rounded-t-sm flex items-center gap-2 font-medium text-sm">
        <Zap className="w-4 h-4" /> Trigger
      </div>
      <div className="p-4 flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300 nodrag">
        <label className="text-xs font-semibold text-slate-500">Event Source</label>
        <select 
          className="w-full border rounded-md p-1 bg-slate-50 dark:bg-slate-800 text-sm"
          value={data.triggerType || ''}
          onChange={onSelectChange}
        >
          <option value="" disabled>Select Event...</option>
          <option value="student.enrolled">Student Enrolled (Course Checkout)</option>
          <option value="incoming_whatsapp">Incoming WhatsApp</option>
          <option value="student_signup">Student Signup</option>
          <option value="lead_created">Lead Created</option>
          <option value="webhook">Webhook URL</option>
        </select>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
});

export const AiReasonNode = memo(({ id, data, isConnectable }: any) => {
  const { updateNodeData } = useReactFlow();

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { systemPrompt: e.target.value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-purple-500 rounded-lg shadow-sm w-64">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
      <div className="bg-purple-500 text-white px-3 py-2 rounded-t-sm flex items-center gap-2 font-medium text-sm">
        <BrainCircuit className="w-4 h-4" /> AI Reasoning (RAG)
      </div>
      <div className="p-4 flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300 nodrag">
        <label className="text-xs font-semibold text-slate-500">System Persona / Instructions</label>
        <textarea 
          className="w-full border rounded-md p-2 bg-slate-50 dark:bg-slate-800 text-sm resize-none"
          rows={3}
          placeholder="You are a helpful assistant..."
          value={data.systemPrompt || ''}
          onChange={onTextChange}
        />
        <div className="text-[10px] text-purple-500 font-medium mt-1">
          ✓ RAG Vector DB Connected
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
});

export const ActionNode = memo(({ id, data, isConnectable }: any) => {
  const { updateNodeData } = useReactFlow();

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { actionType: e.target.value, label: e.target.value });
  };

  const onWebhookUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { webhookUrl: e.target.value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-lg shadow-sm w-64">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500"
      />
      <div className="bg-emerald-500 text-white px-3 py-2 rounded-t-sm flex items-center gap-2 font-medium text-sm">
        <PlaySquare className="w-4 h-4" /> Action
      </div>
      <div className="p-4 flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300 nodrag">
        <label className="text-xs font-semibold text-slate-500">Execute</label>
        <select 
          className="w-full border rounded-md p-1 bg-slate-50 dark:bg-slate-800 text-sm"
          value={data.actionType || ''}
          onChange={onSelectChange}
        >
          <option value="" disabled>Select Action...</option>
          <option value="SEND_WHATSAPP">Send WhatsApp Reply</option>
          <option value="SEND_EMAIL">Send Email</option>
          <option value="ASSIGN_LEAD">Assign to Sales Team</option>
          <option value="PUSH_WEBHOOK">Push to External CRM (Webhook)</option>
        </select>
        {data.actionType === 'PUSH_WEBHOOK' && (
          <div className="mt-2">
            <label className="text-xs font-semibold text-slate-500">Webhook URL</label>
            <input 
              type="text"
              placeholder="https://hooks.zapier.com/..."
              className="w-full border rounded-md p-1 bg-slate-50 dark:bg-slate-800 text-sm mt-1"
              value={data.webhookUrl || ''}
              onChange={onWebhookUrlChange}
            />
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
AiReasonNode.displayName = 'AiReasonNode';
ActionNode.displayName = 'ActionNode';
