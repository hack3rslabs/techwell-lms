"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'
import ExcelJS from 'exceljs'

export default function FinancePage() {
    const [stats, setStats] = React.useState({ totalIncome: 0, totalExpenses: 0, profit: 0 })
    interface Expense {
        id: string
        title: string
        amount: number
        category: string
        date: string
    }
    const [expenses, setExpenses] = React.useState<Expense[]>([])
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [newExpense, setNewExpense] = React.useState({
        title: '',
        amount: '',
        category: 'Office',
        date: format(new Date(), 'yyyy-MM-dd')
    })

    const fetchData = React.useCallback(async () => {
        try {
            const [statsRes, expensesRes] = await Promise.all([
                api.get('/finance/stats'),
                api.get('/finance/expenses')
            ])
            setStats(statsRes.data)
            setExpenses(expensesRes.data)
        } catch {
            // Error handling
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleAddExpense = async () => {
        try {
            await api.post('/finance/expenses', newExpense)
            toast.success("Expense added")
            setIsAddOpen(false)
            fetchData()
        } catch {
            toast.error("Failed to add expense")
        }
    }

    const handleExportExcel = () => {
        try {
            const dataToExport = expenses.map(exp => ({
                'Title': exp.title,
                'Category': exp.category,
                'Date': format(new Date(exp.date), 'dd MMM yyyy'),
                'Amount': exp.amount
            }))
            
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Expenses");
        
        if (dataToExport && dataToExport.length > 0) {
            worksheet.columns = Object.keys(dataToExport[0]).map(key => ({ header: key, key }));
            worksheet.addRows(dataToExport);
        }
        
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Expenses_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
            toast.success("Exported to Excel successfully")
        } catch (error) {
            toast.error("Failed to export to Excel")
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalIncome.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From student fees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalExpenses.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Operational costs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{stats.profit.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses */}
            <div className="flex justify-between items-center mt-8">
                <h2 className="text-xl font-semibold">Expense Tracker</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportExcel} disabled={expenses.length === 0}>
                        <Download className="h-4 w-4 mr-2" /> Export Excel
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Expense
                    </Button>
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.map((exp) => (
                            <TableRow key={exp.id}>
                                <TableCell className="font-medium">{exp.title}</TableCell>
                                <TableCell>{exp.category}</TableCell>
                                <TableCell>{format(new Date(exp.date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="text-right text-red-600">-₹{exp.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Expense</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Title</Label>
                            <Input value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Amount</Label>
                            <Input type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Input value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Date</Label>
                            <Input type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddExpense}>Save Expense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
