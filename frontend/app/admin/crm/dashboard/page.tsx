"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, PhoneCall, TrendingUp } from 'lucide-react';

export default function CRMDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Central CRM Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground">+15.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue Pipeline</CardTitle>
            <BarChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1.2M</div>
            <p className="text-xs text-muted-foreground">+5.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Today</CardTitle>
            <PhoneCall className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">34 High Priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Add more charts and analytics here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-muted-foreground">
            Chart Placeholder
          </CardContent>
        </Card>
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Revenue by Vertical</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center text-muted-foreground">
            Chart Placeholder
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
