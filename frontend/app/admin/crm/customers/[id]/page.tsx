"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Customer360Profile({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [tasks, setTasks] = useState<any[]>([]);
  const [commLogs, setCommLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetch360View = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/crm/customers/${params.id}/360-view`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setCustomer(response.data.data.customer);
          setTimeline(response.data.data.timeline);
          setSummary(response.data.data.summary);
          setTasks(response.data.data.customer.followUpTasks || []);
          setCommLogs(response.data.data.customer.communicationLogs || []);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch customer data');
      } finally {
        setLoading(false);
      }
    };

    fetch360View();
  }, [params.id]);

  const handleSendComm = async (type: string) => {
    const content = prompt(`Enter ${type} content:`);
    if (!content) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/crm/communication', 
        { customerId: params.id, type, content, direction: 'OUTBOUND' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommLogs(prev => [response.data.data, ...prev]);
      toast.success(`${type} logged successfully!`);
    } catch {
      toast.error(`Failed to send ${type}`);
    }
  };

  const handleAddTask = async () => {
    const title = prompt('Enter task title:');
    if (!title) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/crm/tasks', 
        { customerId: params.id, title, description: '', dueDate: new Date(Date.now() + 86400000).toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(prev => [...prev, response.data.data]);
      toast.success('Task added!');
    } catch {
      toast.error('Failed to add task');
    }
  };

  if (loading) return <div className="p-10 text-center"><Sparkles className="animate-spin inline-block mr-2" /> Loading 360 View...</div>;
  if (error) return <div className="p-10 text-center text-red-500"><AlertTriangle className="inline-block mr-2" /> {error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/crm/dashboard">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <span>{customer.name}</span>
              <Badge variant={customer.aiPriority === 'HIGH' ? 'destructive' : 'default'}>
                {customer.aiPriority} Priority
              </Badge>
            </h1>
          </div>
          <div className="flex space-x-4 mt-2 text-muted-foreground text-sm">
            <span className="flex items-center"><Mail className="w-4 h-4 mr-1"/> {customer.email}</span>
            <span className="flex items-center"><Phone className="w-4 h-4 mr-1"/> {customer.phone}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">LTV: ₹{customer.lifetimeValue}</div>
          <div className="text-sm text-muted-foreground">Lead Score: {customer.globalLeadScore}</div>
        </div>
      </div>

      {/* AI Insights Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-400">
            <Sparkles className="w-5 h-5 mr-2" /> AI Insights & Next Best Action
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-blue-800 dark:text-blue-200"><strong>Summary:</strong> {customer.aiSummary}</p>
          <p className="text-sm text-blue-800 dark:text-blue-200"><strong>Next Action:</strong> {customer.aiNextBestAction}</p>
        </CardContent>
      </Card>

      {/* 360 View Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="pipelines">Deals & Pipelines</TabsTrigger>
          <TabsTrigger value="academic">Academic (Courses)</TabsTrigger>
          <TabsTrigger value="career">Career (Jobs)</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="communication">Comm Log</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Unified Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? <p className="text-muted-foreground text-sm">No activity recorded.</p> : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {item.type === 'LEAD_CREATED' && <Sparkles className="w-4 h-4 text-orange-500" />}
                        {item.type === 'TASK' && <AlertTriangle className="w-4 h-4 text-purple-500" />}
                        {item.type === 'COMMUNICATION' && <Phone className="w-4 h-4 text-green-500" />}
                        {item.type === 'ENROLLMENT' && <Sparkles className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border rounded shadow p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                          <time className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</time>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pipelines" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Active Deals</CardTitle></CardHeader>
            <CardContent>
              {customer.pipelines && customer.pipelines.length > 0 ? (
                <ul className="space-y-2">
                  {customer.pipelines.map((deal: any) => (
                    <li key={deal.id} className="p-3 border rounded">
                      <div className="font-bold">{deal.title} - ₹{deal.value}</div>
                      <div className="text-sm text-muted-foreground">Pipeline: {deal.pipeline?.name} | Stage: {deal.stage?.name} | Status: {deal.status}</div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No active deals found.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="agreements" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Client Agreements</CardTitle></CardHeader>
            <CardContent>
              {customer.agreements && customer.agreements.length > 0 ? (
                <div className="space-y-3">
                  {customer.agreements.map((agr: any) => (
                    <div key={agr.id} className="p-4 border rounded flex items-center justify-between">
                      <div>
                        <div className="font-bold">{agr.title} ({agr.agreementNum})</div>
                        <div className="text-sm text-muted-foreground">
                          Value: ₹{agr.grandTotal?.toLocaleString()} | Status: <Badge variant="outline">{agr.status}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Agreement</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border rounded border-dashed">
                  <p className="text-sm text-muted-foreground mb-4">No agreements found for this client.</p>
                  <Button>Create Agreement</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="communication" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Communication Logs</CardTitle>
              <div className="space-x-2">
                <button onClick={() => handleSendComm('EMAIL')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Send Email</button>
                <button onClick={() => handleSendComm('WHATSAPP')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">WhatsApp</button>
                <button onClick={() => handleSendComm('CALL')} className="px-3 py-1 bg-orange-600 text-white rounded text-sm">Log Call</button>
              </div>
            </CardHeader>
            <CardContent>
              {commLogs.length === 0 ? <p>No logs.</p> : (
                <ul className="space-y-3">
                  {commLogs.map(c => (
                    <li key={c.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                      <div className="font-bold text-sm">{c.type} - {c.direction}</div>
                      <div className="text-gray-700 dark:text-gray-300">{c.content}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(c.timestamp).toLocaleString()} | Status: {c.status}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="academic" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Course Enrollments</CardTitle></CardHeader>
            <CardContent>
              {customer.users && customer.users.length > 0 ? customer.users.map((u: any) => (
                <div key={u.id} className="mb-4">
                  <h4 className="font-semibold mb-2">Account: {u.email}</h4>
                  {u.enrollments && u.enrollments.length > 0 ? (
                    <ul className="space-y-2">
                      {u.enrollments.map((en: any) => (
                        <li key={en.id} className="p-2 border rounded text-sm bg-muted/20">
                           {en.course?.title} (Progress: {en.progress}%) - {en.status}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No courses enrolled.</p>}
                </div>
              )) : <p className="text-sm text-muted-foreground">No linked user account.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="career" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Job Applications & Profiles</CardTitle></CardHeader>
            <CardContent>
              {customer.candidateProfiles && customer.candidateProfiles.length > 0 ? (
                <ul className="space-y-2">
                  {customer.candidateProfiles.map((cp: any) => (
                    <li key={cp.id} className="p-2 border rounded text-sm">
                       Score: {cp.overallScore} | Status: {cp.status}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No career profile found.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
