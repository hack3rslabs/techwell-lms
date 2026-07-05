"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Globe, Link as LinkIcon, BarChart3, AlertTriangle } from "lucide-react";

export default function SeoDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Manager</h1>
        <p className="text-muted-foreground mt-2">Manage metadata, redirects, and monitor crawl errors.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">440+</div>
            <p className="text-xs text-muted-foreground">Generated programmatically</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Redirects</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">301 Permanent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">404 Errors (7d)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Core Web Vitals</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98/100</div>
            <p className="text-xs text-muted-foreground">Passing Desktop & Mobile</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metadata" className="mt-6">
        <TabsList>
          <TabsTrigger value="metadata">Metadata Overrides</TabsTrigger>
          <TabsTrigger value="redirects">301/302 Redirects</TabsTrigger>
          <TabsTrigger value="analytics">Crawl Errors</TabsTrigger>
        </TabsList>
        <TabsContent value="metadata" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Metadata Overrides</CardTitle>
              <CardDescription>Override the auto-generated titles and descriptions for specific routes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input placeholder="Search routes..." className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" />
                </div>
                <Button>Add Override</Button>
              </div>
              <div className="border rounded-md">
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No manual overrides configured. System is using AI-generated defaults.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="redirects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Redirect Manager</CardTitle>
              <CardDescription>Manage permanent and temporary URL redirections to preserve link equity.</CardDescription>
            </CardHeader>
            <CardContent>
               <Button className="mb-4">Create Redirect Rule</Button>
               <div className="border rounded-md">
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No redirect rules configured.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>404 Crawl Errors</CardTitle>
              <CardDescription>Log of missing pages requested by users or search bots.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="border rounded-md">
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No recent 404 errors detected.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
