import React from 'react';
import { Zap, BrainCircuit, PlaySquare } from 'lucide-react';

export default function WorkflowSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4">
      <div className="mb-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Nodes</h3>
        <p className="text-xs text-slate-500">Drag items to the canvas</p>
      </div>
      
      <div 
        className="flex items-center gap-3 p-3 border-2 border-blue-500/20 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-grab hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        onDragStart={(event) => onDragStart(event, 'TRIGGER', 'New Trigger')}
        draggable
      >
        <div className="p-2 bg-blue-500 text-white rounded-md">
          <Zap className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm text-blue-900 dark:text-blue-100">Trigger</span>
      </div>

      <div 
        className="flex items-center gap-3 p-3 border-2 border-purple-500/20 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-grab hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
        onDragStart={(event) => onDragStart(event, 'AI_REASON', 'New AI Agent')}
        draggable
      >
        <div className="p-2 bg-purple-500 text-white rounded-md">
          <BrainCircuit className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm text-purple-900 dark:text-purple-100">AI Reasoning</span>
      </div>

      <div 
        className="flex items-center gap-3 p-3 border-2 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg cursor-grab hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
        onDragStart={(event) => onDragStart(event, 'ACTION', 'New Action')}
        draggable
      >
        <div className="p-2 bg-emerald-500 text-white rounded-md">
          <PlaySquare className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm text-emerald-900 dark:text-emerald-100">Action</span>
      </div>
    </aside>
  );
}
