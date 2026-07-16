"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Phone, MessageCircle, Mail, Eye } from 'lucide-react';

export default function LeadLandingPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const router = useRouter();

  async function fetchIncomingLeads() {
    try {
      const res = await axios.get('/api/leads?status=NEW', { withCredentials: true });
      setLeads(res.data);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchIncomingLeads();
  }, []);
;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map((l: any) => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeads((prev) => 
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = async () => {
    if (!selectedLeads.length) return toast.error('Select leads to assign');
    const assignedToId = prompt('Enter User ID to assign (For now, testing purpose):');
    if (!assignedToId) return;

    try {
      await axios.put('/api/crm/leads/bulk/assign', {
        leadIds: selectedLeads,
        assignedToId
      }, { withCredentials: true });
      toast.success('Leads assigned successfully');
      fetchIncomingLeads();
      setSelectedLeads([]);
    } catch (error) {
      toast.error('Failed to assign leads');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Lead Landing (Incoming)</h1>
        <div className="space-x-3">
          <button 
            onClick={handleBulkAssign}
            disabled={!selectedLeads.length}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400"
          >
            Bulk Assign ({selectedLeads.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{lead.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                    <div>{lead.email}</div>
                    <div>{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 space-x-1 flex">
                    {lead.phone && (
                        <>
                            <a
                                href={`tel:${lead.phone}`}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Call Lead"
                            >
                                <Phone className="h-4 w-4" />
                            </a>
                            <a
                                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                                title="WhatsApp Lead"
                            >
                                <MessageCircle className="h-4 w-4" />
                            </a>
                        </>
                    )}
                    <a
                        href={`mailto:${lead.email}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        title="Email Lead"
                    >
                        <Mail className="h-4 w-4" />
                    </a>
                    <Link href={`/admin/crm/customers/${lead.id}`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            title="View 360 Profile"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No new incoming leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
