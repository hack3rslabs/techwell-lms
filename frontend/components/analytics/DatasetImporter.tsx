"use client"

import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { UploadCloud, FileSpreadsheet, AlertCircle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-hot-toast'

const COLORS = ['#1469E2', '#78C1B5', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#10b981']

export function DatasetImporter() {
    const [dataset, setDataset] = useState<any[]>([])
    const [columns, setColumns] = useState<string[]>([])
    const [xAxis, setXAxis] = useState<string>('')
    const [yAxis, setYAxis] = useState<string>('')
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState('')

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        const reader = new FileReader()
        
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws)
                
                if (data.length > 0) {
                    const cols = Object.keys(data[0] as object)
                    setColumns(cols)
                    setDataset(data)
                    // Auto-select first string col as X and first number col as Y
                    const defaultX = cols[0]
                    const defaultY = cols.find(c => typeof (data[0] as any)[c] === 'number') || cols[1] || cols[0]
                    
                    setXAxis(defaultX)
                    setYAxis(defaultY)
                    toast.success('Dataset loaded successfully!')
                } else {
                    toast.error('The uploaded sheet is empty.')
                }
            } catch (err) {
                console.error(err)
                toast.error('Failed to parse Excel file.')
            }
        }
        
        reader.readAsBinaryString(file)
    }

    // Process data for charting (group by X axis and sum Y axis)
    const processedData = React.useMemo(() => {
        if (!dataset.length || !xAxis || !yAxis) return []
        
        const grouped: Record<string, number> = {}
        
        dataset.forEach(row => {
            const xVal = String(row[xAxis] || 'Unknown')
            const yVal = Number(row[yAxis]) || 0
            
            if (!grouped[xVal]) grouped[xVal] = 0
            grouped[xVal] += yVal
        })
        
        return Object.keys(grouped).map(key => ({
            name: key,
            value: grouped[key]
        }))
    }, [dataset, xAxis, yAxis])

    return (
        <div className="space-y-6">
            {!dataset.length ? (
                <Card className="border-dashed border-2 bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Import Custom Dataset</h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-6">
                            Upload an Excel (.xlsx) or CSV file. All processing is done instantly in your browser—no data is sent to our servers, ensuring 100% privacy.
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Browse Files
                        </Button>
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Data Configuration Panel */}
                    <Card className="md:col-span-1 border shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm flex items-center justify-between">
                                Data Source
                                <Button variant="ghost" size="sm" onClick={() => setDataset([])} className="text-red-500 hover:text-red-600 h-6 px-2 text-xs">Clear</Button>
                            </CardTitle>
                            <CardDescription className="text-xs truncate">{fileName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Chart Type</label>
                                <div className="flex bg-muted rounded-lg p-1 gap-1">
                                    <Button variant={chartType === 'bar' ? 'default' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => setChartType('bar')}>
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                    <Button variant={chartType === 'line' ? 'default' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => setChartType('line')}>
                                        <LineChartIcon className="h-4 w-4" />
                                    </Button>
                                    <Button variant={chartType === 'pie' ? 'default' : 'ghost'} size="sm" className="flex-1 h-8" onClick={() => setChartType('pie')}>
                                        <PieChartIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Dimension (X-Axis)</label>
                                <Select value={xAxis} onValueChange={setXAxis}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select Dimension" /></SelectTrigger>
                                    <SelectContent>
                                        {columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Metric (Y-Axis)</label>
                                <Select value={yAxis} onValueChange={setYAxis}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select Metric" /></SelectTrigger>
                                    <SelectContent>
                                        {columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground flex items-center mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" /> Auto-sums numeric values
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart Visualization Area */}
                    <Card className="md:col-span-3 border shadow-sm">
                        <CardHeader className="border-b pb-3">
                            <CardTitle>{yAxis} by {xAxis}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'bar' ? (
                                        <BarChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="value" fill="#1469E2" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    ) : chartType === 'line' ? (
                                        <LineChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Line type="monotone" dataKey="value" stroke="#78C1B5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    ) : (
                                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <Pie data={processedData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                                                {processedData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        </PieChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
