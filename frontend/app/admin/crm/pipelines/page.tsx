"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PipelineKanbanBoard() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('1');

  useEffect(() => {
    // In a real app, fetch from /api/crm/pipelines
    setPipelines([
      { id: '1', name: 'Training Enquiries', vertical: 'Training' },
      { id: '2', name: 'B2B Sales', vertical: 'IT Solutions' }
    ]);
  }, []);

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Pipelines</h1>
        <div className="flex space-x-4">
          <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>Add Deal</Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex space-x-4 overflow-x-auto pb-4">
        {/* Mocking Stages */}
        {['New Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'].map(stage => (
          <div key={stage} className="w-80 flex-shrink-0 bg-muted/50 rounded-lg flex flex-col">
            <div className="p-3 font-semibold flex justify-between items-center border-b">
              {stage}
              <span className="bg-muted text-xs px-2 py-1 rounded-full">0</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[500px]">
              {/* Deal Cards would go here */}
              <Card className="cursor-grab active:cursor-grabbing hover:border-primary">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Sample Deal</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xs text-muted-foreground mb-2">Acme Corp</div>
                  <div className="font-bold">₹50,000</div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
