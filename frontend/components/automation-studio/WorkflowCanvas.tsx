"use client";

import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import our custom nodes and sidebar
import { TriggerNode, AiReasonNode, ActionNode } from './CustomNodes';
import WorkflowSidebar from './WorkflowSidebar';

const nodeTypes = {
  TRIGGER: TriggerNode,
  AI_REASON: AiReasonNode,
  ACTION: ActionNode,
};

function WorkflowCanvas({ initialNodes, initialEdges, onSave }: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);

  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...(params as Edge), animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleSave = () => {
    onSave(nodes, edges);
  };

  return (
    <div className="flex w-full h-full">
      <WorkflowSidebar />
      <div className="flex-1 h-full relative" ref={(ref) => {
          // ensure container is ready
      }}>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Save Workflow
          </button>
        </div>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50 dark:bg-slate-950"
        >
          <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 fill-slate-700 dark:fill-slate-300" />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'TRIGGER': return '#3b82f6';
                case 'AI_REASON': return '#8b5cf6';
                case 'ACTION': return '#10b981';
                default: return '#cbd5e1';
              }
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
          <Background color="#94a3b8" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function WorkflowCanvasWrapper(props: any) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
}
