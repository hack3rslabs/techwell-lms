"use client"

import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { subDays, format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts'
import {
    Loader2, TrendingUp, Download, PieChart as PieChartIcon, BarChart as BarChartIcon, Activity, UploadCloud, FileSpreadsheet
} from 'lucide-react'
import api from '@/lib/api'
import ExcelJS from 'exceljs'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

export default function AnalyticsBuilderPage() {
    // Mode State
    const [dataSource, setDataSource] = useState<'SYSTEM' | 'CUSTOM'>('SYSTEM')

    // System Report Configuration State
    const [dataset, setDataset] = useState('LEADS')
    const [dimension, setDimension] = useState('STATUS')
    const [metric, setMetric] = useState('COUNT')
    const [chartType, setChartType] = useState('BAR')
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

    // Custom Data State
    const [customRawData, setCustomRawData] = useState<any[]>([])
    const [customColumns, setCustomColumns] = useState<string[]>([])
    const [customDimension, setCustomDimension] = useState('')
    const [customMetricCol, setCustomMetricCol] = useState('')
    const [customMetricType, setCustomMetricType] = useState('COUNT') // COUNT, SUM
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Data State
    const [reportData, setReportData] = useState<any[]>([])
    const [summaryTotal, setSummaryTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    // --- SYSTEM REPORT GENERATOR ---
    const generateSystemReport = async () => {
        setIsLoading(true)
        try {
            const res = await api.post(`/admin/reports/generate`, {
                dataset,
                dimension,
                metric,
                startDate,
                endDate
            })
            setReportData(res.data.data)
            setSummaryTotal(res.data.summary.total)
        } catch (error) {
            console.error("Failed to generate system report:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-generate on first load if system
    useEffect(() => {
        if (dataSource === 'SYSTEM') {
            generateSystemReport()
        }
    }, [dataSource])

    // --- CUSTOM DATA GENERATOR ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const arrayBuffer = await file.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer as any);
            const ws = workbook.worksheets[0];
            
            if (ws) {
                const data: any[] = [];
                const cols: string[] = [];
                
                ws.getRow(1).eachCell((cell, colNumber) => {
                    cols.push(cell.value ? cell.value.toString() : `Col${colNumber}`);
                });
                
                ws.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) {
                        const rowData: any = {};
                        cols.forEach((colName, index) => {
                            rowData[colName] = row.getCell(index + 1).value;
                        });
                        data.push(rowData);
                    }
                });
                
                if (data.length > 0) {
                    setCustomRawData(data);
                    setCustomColumns(cols);
                    setCustomDimension(cols[0] || '');
                    setCustomMetricCol(cols[1] || cols[0] || '');
                    setReportData([]); // clear previous
                    setSummaryTotal(0);
                }
            }
        } catch (error) {
            console.error("Error parsing Excel:", error);
            alert("Failed to parse the uploaded file.");
        } finally {
            setIsLoading(false);
        }
    }

    const generateCustomReport = () => {
        if (!customRawData.length || !customDimension) return;
        setIsLoading(true);

        setTimeout(() => {
            // Aggregate in JS
            const groupMap: Record<string, number> = {};
            let total = 0;

            customRawData.forEach(row => {
                const key = String(row[customDimension] || 'Unknown');
                let valToAdd = 1; // For COUNT

                if (customMetricType === 'SUM') {
                    const num = parseFloat(row[customMetricCol]);
                    valToAdd = isNaN(num) ? 0 : num;
                }

                groupMap[key] = (groupMap[key] || 0) + valToAdd;
                total += valToAdd;
            });

            const finalData = Object.keys(groupMap).map(k => ({
                name: k,
                value: Number(groupMap[k].toFixed(2))
            }));

            // Sort by value desc
            finalData.sort((a, b) => b.value - a.value);

            setReportData(finalData.slice(0, 50)); // cap at 50 to prevent chart lag
            setSummaryTotal(total);
            setIsLoading(false);
        }, 100);
    }

    // --- EXPORT TO EXCEL (.XLSX) ---
    const exportToExcel = async () => {
        if (!reportData.length) return;
        
        const dataToExport = reportData.map(d => ({
            Label: d.name,
            Value: d.value
        }));
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("AnalyticsReport");
        
        if (dataToExport && dataToExport.length > 0) {
            worksheet.columns = Object.keys(dataToExport[0]).map(key => ({ header: key, key }));
            worksheet.addRows(dataToExport);
        }
        
        const filename = dataSource === 'SYSTEM' 
            ? `Analytics_${dataset}_by_${dimension}.xlsx`
            : `Custom_Analytics_${customDimension}.xlsx`;
            
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    const renderChart = () => {
        if (reportData.length === 0) {
            return (
                <div className="flex flex-col h-[400px] items-center justify-center text-muted-foreground">
                    <Activity className="h-16 w-16 mb-4 opacity-20" />
                    <p>No data found or generated yet.</p>
                </div>
            )
        }

        switch (chartType) {
            case 'PIE':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie data={reportData} cx="50%" cy="50%" labelLine={true} label={({name, percent}) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`} outerRadius={130} fill="#8884d8" dataKey="value">
                                {reportData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => { const n = Number(val); return dataset === 'REVENUE' && dataSource === 'SYSTEM' ? `₹${n.toLocaleString()}` : n.toLocaleString(); }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )
            case 'LINE':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(val) => { const n = Number(val); return dataset === 'REVENUE' && dataSource === 'SYSTEM' ? `₹${n.toLocaleString()}` : n.toLocaleString(); }} />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name="Value" />
                        </LineChart>
                    </ResponsiveContainer>
                )
            case 'AREA':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(val) => { const n = Number(val); return dataset === 'REVENUE' && dataSource === 'SYSTEM' ? `₹${n.toLocaleString()}` : n.toLocaleString(); }} />
                            <Legend />
                            <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Value" />
                        </AreaChart>
                    </ResponsiveContainer>
                )
            case 'BAR':
            default:
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(val) => { const n = Number(val); return dataset === 'REVENUE' && dataSource === 'SYSTEM' ? `₹${n.toLocaleString()}` : n.toLocaleString(); }} />
                            <Legend />
                            <Bar dataKey="value" fill="#6366f1" name="Value">
                                {reportData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Report Builder</h1>
                    <p className="text-muted-foreground">Dynamic BI analytics with Excel support.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToExcel} disabled={reportData.length === 0 || isLoading}>
                        <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Export to Excel
                    </Button>
                    <Button onClick={dataSource === 'SYSTEM' ? generateSystemReport : generateCustomReport} disabled={isLoading || (dataSource === 'CUSTOM' && !customRawData.length)}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChartIcon className="mr-2 h-4 w-4" />}
                        Generate Chart
                    </Button>
                </div>
            </div>

            <Tabs value={dataSource} onValueChange={(v: any) => { setDataSource(v); setReportData([]); setSummaryTotal(0); }} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="SYSTEM">System Database</TabsTrigger>
                    <TabsTrigger value="CUSTOM">Custom Excel Upload</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Configuration Panel */}
                <Card className="lg:col-span-1 border-primary/20 shadow-md h-fit">
                    <CardHeader className="bg-slate-50/50 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-primary" />
                            Data Source
                        </CardTitle>
                        <CardDescription>Select metrics to build your report</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-4">
                        
                        {dataSource === 'SYSTEM' ? (
                            <>
                                <div className="space-y-2">
                                    <Label>Dataset</Label>
                                    <Select value={dataset} onValueChange={(val) => { setDataset(val); setDimension('DATE'); }}>
                                        <SelectTrigger><SelectValue placeholder="Select Dataset" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LEADS">Leads</SelectItem>
                                            <SelectItem value="REVENUE">Revenue (Payments)</SelectItem>
                                            <SelectItem value="ENROLLMENTS">Enrollments</SelectItem>
                                            <SelectItem value="TASKS">Tasks</SelectItem>
                                            <SelectItem value="PAYROLL">HR Payroll</SelectItem>
                                            <SelectItem value="ATTENDANCE">HR Attendance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Dimension (Group By)</Label>
                                    <Select value={dimension} onValueChange={setDimension}>
                                        <SelectTrigger><SelectValue placeholder="Select Dimension" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DATE">Date / Time</SelectItem>
                                            {dataset === 'LEADS' && <SelectItem value="STATUS">Lead Status</SelectItem>}
                                            {dataset === 'LEADS' && <SelectItem value="SOURCE">Lead Source</SelectItem>}
                                            {dataset === 'ENROLLMENTS' && <SelectItem value="STATUS">Enrollment Status</SelectItem>}
                                            {dataset === 'ENROLLMENTS' && <SelectItem value="COURSE">Course</SelectItem>}
                                            {dataset === 'REVENUE' && <SelectItem value="COURSE">Course</SelectItem>}
                                            {dataset === 'TASKS' && <SelectItem value="STATUS">Task Status</SelectItem>}
                                            {dataset === 'TASKS' && <SelectItem value="PRIORITY">Task Priority</SelectItem>}
                                            {dataset === 'PAYROLL' && <SelectItem value="STATUS">Payroll Status</SelectItem>}
                                            {dataset === 'ATTENDANCE' && <SelectItem value="STATUS">Attendance Status</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Upload Dataset (.xlsx, .csv)</Label>
                                    <div 
                                        className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Click to upload file</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {customRawData.length > 0 ? `${customRawData.length} rows loaded` : 'No file selected'}
                                        </p>
                                        <input 
                                            type="file" 
                                            accept=".xlsx, .xls, .csv" 
                                            className="hidden" 
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                        />
                                    </div>
                                </div>

                                {customColumns.length > 0 && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Dimension (X-Axis / Group By)</Label>
                                            <Select value={customDimension} onValueChange={setCustomDimension}>
                                                <SelectTrigger><SelectValue placeholder="Select Column" /></SelectTrigger>
                                                <SelectContent>
                                                    {customColumns.map(col => (
                                                        <SelectItem key={col} value={col}>{col}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Metric Type</Label>
                                            <Select value={customMetricType} onValueChange={setCustomMetricType}>
                                                <SelectTrigger><SelectValue placeholder="Select Metric Type" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="COUNT">Count Records</SelectItem>
                                                    <SelectItem value="SUM">Sum of Column</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {customMetricType === 'SUM' && (
                                            <div className="space-y-2">
                                                <Label>Value Column (to sum)</Label>
                                                <Select value={customMetricCol} onValueChange={setCustomMetricCol}>
                                                    <SelectTrigger><SelectValue placeholder="Select Column" /></SelectTrigger>
                                                    <SelectContent>
                                                        {customColumns.map(col => (
                                                            <SelectItem key={col} value={col}>{col}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        <div className="space-y-2 pt-2 border-t">
                            <Label>Chart Type</Label>
                            <Select value={chartType} onValueChange={setChartType}>
                                <SelectTrigger><SelectValue placeholder="Select Chart Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BAR">Bar Chart</SelectItem>
                                    <SelectItem value="LINE">Line Trend</SelectItem>
                                    <SelectItem value="AREA">Area Chart</SelectItem>
                                    <SelectItem value="PIE">Pie Chart</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Display Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-indigo-600 mb-1">
                                    {dataSource === 'SYSTEM' ? `Total ${dataset}` : `Total ${customMetricType}`}
                                </p>
                                <h3 className="text-3xl font-bold text-indigo-900 truncate">
                                    {dataSource === 'SYSTEM' && dataset === 'REVENUE' 
                                        ? `₹${summaryTotal.toLocaleString()}` 
                                        : summaryTotal.toLocaleString()}
                                </h3>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-emerald-600 mb-1">Grouping Insight</p>
                                <h3 className="text-lg font-semibold text-emerald-900 mt-2 truncate">
                                    {dataSource === 'SYSTEM' ? `By ${dimension}` : (customDimension ? `By ${customDimension}` : 'No Grouping')}
                                </h3>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b bg-slate-50/30">
                            <CardTitle className="text-xl flex items-center justify-between">
                                <span>Generated Chart</span>
                                {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {renderChart()}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}