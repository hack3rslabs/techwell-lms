"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function PipelineKanbanBoard() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [boardData, setBoardData] = useState<any>(null);
  
  // Add Deal state
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [newDeal, setNewDeal] = useState({ title: '', value: '', customerId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch pipelines list
    api.get('/crm/pipelines')
      .then(res => {
        const data = res.data;
        if (data.success && data.data.length > 0) {
          setPipelines(data.data);
          setSelectedPipeline(data.data[0].id);
        }
      })
      .catch(console.error);
      
    // Fetch customers for Add Deal dropdown
    api.get('/crm/customers')
      .then(res => {
        if (res.data.success) {
          setCustomers(res.data.data);
        }
      })
      .catch(console.error);
  }, []);

  const fetchBoard = () => {
    if (selectedPipeline) {
      api.get(`/crm/pipelines/${selectedPipeline}/board`)
        .then(res => {
          const data = res.data;
          if (data.success) {
            setBoardData(data.data);
          } else {
            setBoardData(null);
          }
        })
        .catch(() => setBoardData(null));
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [selectedPipeline]);

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPipeline || !newDeal.title || !newDeal.customerId) return;
    
    setIsSubmitting(true);
    try {
      await api.post(`/crm/pipelines/${selectedPipeline}/deals`, newDeal);
      setIsAddDealOpen(false);
      setNewDeal({ title: '', value: '', customerId: '' });
      fetchBoard(); // refresh board
    } catch (error) {
      console.error("Failed to add deal", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
            <DialogTrigger asChild>
              <Button>Add Deal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDeal} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Deal Title</Label>
                  <Input 
                    placeholder="e.g. Website Redesign" 
                    value={newDeal.title} 
                    onChange={e => setNewDeal({...newDeal, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Value (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 50000" 
                    value={newDeal.value} 
                    onChange={e => setNewDeal({...newDeal, value: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={newDeal.customerId} onValueChange={v => setNewDeal({...newDeal, customerId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Create Deal"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex space-x-4 overflow-x-auto pb-4">
        {boardData?.stages?.map((stage: any) => (
          <div 
            key={stage.id} 
            className="w-80 flex-shrink-0 bg-muted/50 rounded-lg flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dealId = e.dataTransfer.getData("dealId");
              if (!dealId) return;
              
              const sourceStageId = e.dataTransfer.getData("sourceStageId");
              if (sourceStageId === stage.id) return; // Dropped in same stage
              
              // Immutable update
              const newStages = boardData.stages.map((s: any) => ({ ...s, deals: [...(s.deals || [])] }));
              
              let movedDeal = null;
              for (const s of newStages) {
                const idx = s.deals.findIndex((d: any) => d.id === dealId);
                if (idx !== -1) {
                  movedDeal = s.deals.splice(idx, 1)[0];
                  break;
                }
              }
              
              if (movedDeal) {
                const targetStage = newStages.find((s: any) => s.id === stage.id);
                if (targetStage) {
                  targetStage.deals.push(movedDeal);
                  setBoardData({ ...boardData, stages: newStages });
                  
                  // Update backend
                  api.post(`/crm/pipelines/deals/move`, { dealId: dealId, targetStageId: stage.id }).catch(() => {
                    // Revert logic would go here if needed
                    fetchBoard();
                  });
                }
              }
            }}
          >
            <div className="p-3 font-semibold flex justify-between items-center border-b">
              {stage.name}
              <span className="bg-muted text-xs px-2 py-1 rounded-full">{stage.deals?.length || 0}</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[500px]">
              {stage.deals?.map((deal: any) => (
                <Card 
                  key={deal.id} 
                  className="cursor-grab active:cursor-grabbing hover:border-primary"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("dealId", deal.id);
                    e.dataTransfer.setData("sourceStageId", stage.id);
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">{deal.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-xs text-muted-foreground mb-2">{deal.customer?.name}</div>
                    <div className="font-bold">₹{deal.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
