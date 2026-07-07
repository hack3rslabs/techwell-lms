"use client"

import React, { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatasetImporter } from '@/components/analytics/DatasetImporter'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import { StudioWidget } from '@/components/analytics/StudioWidget'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon, Download, SlidersHorizontal, RefreshCcw } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function AnalyticsStudioPage() {
    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date()
    })

    
    const handleExportPDF = async () => {
        try {
            const dashboardElement = document.getElementById('pdf-export-area');
            if (!dashboardElement) return;
            
            const canvas = await html2canvas(dashboardElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Techwell_BI_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
            toast.success("PDF Exported Successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF.");
        }
    }

    const handleRefresh = () => {
        // Simple force re-render trick by updating object ref slightly or we can just rely on state
        setDateRange({...dateRange})
        toast.success("Dashboard Refreshed")
    }

    return (
        <div className="space-y-8 min-h-screen bg-gray-50/30 dark:bg-gray-900/10 pb-10">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                        Techwell BI Studio
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Interactive Looker-Style Analytics & Custom Reports
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[280px] justify-start text-left font-normal border-gray-300">
                                <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange.from}
                                selected={dateRange}
                                onSelect={(range: any) => {
                                    if (range?.from) setDateRange({ from: range.from, to: range.to || new Date() })
                                }}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh Data">
                        <RefreshCcw className="h-4 w-4 text-gray-500" />
                    </Button>

                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleExportPDF}>
                        <Download className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                </div>
            </div>

            
            {/* Dashboard Workspace */}
            <div id="pdf-export-area" className="p-1 bg-transparent">
                <Tabs defaultValue="overview" className="space-y-6">
                    <div className="flex justify-between items-center" data-html2canvas-ignore="true">
                        <TabsList className="bg-white border shadow-sm">
                            <TabsTrigger value="overview">CRM Overview</TabsTrigger>
                            <TabsTrigger value="financials">Financials & P&L</TabsTrigger>
                            <TabsTrigger value="custom">Custom Datasets</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-6 m-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Scorecards */}
                            <div className="md:col-span-1">
                                <StudioWidget title="Total Active Leads" type="kpi" metric="leads" dimension="status" startDate={dateRange.from} endDate={dateRange.to} />
                            </div>
                            <div className="md:col-span-1">
                                <StudioWidget title="Total Revenue" type="kpi" metric="revenue" dimension="time_daily" startDate={dateRange.from} endDate={dateRange.to} />
                            </div>
                            <div className="md:col-span-2">
                                <StudioWidget title="Enrollment Velocity" type="line" metric="enrollments" dimension="time_daily" startDate={dateRange.from} endDate={dateRange.to} color="#78C1B5" />
                            </div>

                            {/* Second Row */}
                            <div className="md:col-span-2">
                                <StudioWidget title="Leads Over Time" type="bar" metric="leads" dimension="time_daily" startDate={dateRange.from} endDate={dateRange.to} color="#1469E2" />
                            </div>
                            <div className="md:col-span-2">
                                <StudioWidget title="Leads by Source" type="pie" metric="leads" dimension="source" startDate={dateRange.from} endDate={dateRange.to} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="financials" className="space-y-6 m-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2">
                                <StudioWidget title="Net Profit & Loss (P&L)" type="bar" metric="profit_loss" dimension="time_daily" startDate={dateRange.from} endDate={dateRange.to} color="#10b981" />
                            </div>
                            <div className="md:col-span-2">
                                <StudioWidget title="Business Expenses" type="bar" metric="expenses" dimension="category" startDate={dateRange.from} endDate={dateRange.to} color="#ef4444" />
                            </div>
                            
                            <div className="md:col-span-2">
                                <StudioWidget title="Revenue by Payment Method" type="bar" metric="revenue" dimension="payment_method" startDate={dateRange.from} endDate={dateRange.to} color="#f59e0b" />
                            </div>
                            <div className="md:col-span-2">
                                <StudioWidget title="Enrollments by Course" type="pie" metric="enrollments" dimension="course" startDate={dateRange.from} endDate={dateRange.to} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-6 m-0">
                        <DatasetImporter />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
