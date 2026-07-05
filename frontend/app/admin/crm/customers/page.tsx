"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  lastContact: string;
}

export default function GlobalCustomerDatabase() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In a real app, fetch from /api/crm/customers?search=...
    setCustomers([
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', score: 85, lastContact: '2026-07-04' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', score: 92, lastContact: '2026-07-03' },
    ]);
  }, [search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Global Customer Database</h1>
        <Button>Add Customer</Button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Input 
          placeholder="Search by name, email, or phone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button variant="outline">Advanced Filters</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Lead Score</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell><Badge variant="secondary">{c.score}</Badge></TableCell>
                <TableCell>{c.lastContact}</TableCell>
                <TableCell>
                  <Link href={`/admin/crm/customers/${c.id}`}>
                    <Button variant="ghost" size="sm">View 360° Profile</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
