"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, DollarSign, Download, CheckCircle, Calculator } from "lucide-react"

export default function PayrollDashboard() {
    const [roster, setRoster] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [selectedStaff, setSelectedStaff] = useState<any>(null)

    // Form states
    const [baseSalary, setBaseSalary] = useState(0)
    const [bonus, setBonus] = useState(0)
    const [deductions, setDeductions] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const fetchRoster = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/payroll/roster?month=${month}&year=${year}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            const data = await res.json()
            if (data.success) {
                setRoster(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRoster()
    }, [month, year])

    const processPayroll = async () => {
        if (!selectedStaff) return
        setIsProcessing(true)
        try {
            const res = await fetch(`/api/payroll/process`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({
                    userId: selectedStaff.id,
                    month,
                    year,
                    baseSalary,
                    bonus,
                    deductions,
                    notes: `Payroll for ${month}/${year}`
                })
            })
            const data = await res.json()
            if (data.success) {
                setIsDialogOpen(false)
                fetchRoster() // Refresh
            } else {
                alert(data.error)
            }
        } catch (error) {
            console.error(error)
            alert("Failed to process payroll")
        } finally {
            setIsProcessing(false)
        }
    }

    const netAmount = (parseFloat(baseSalary.toString() || '0') + parseFloat(bonus.toString() || '0') - parseFloat(deductions.toString() || '0'))

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Payroll</h1>
                    <p className="text-slate-500">Calculate salaries, bonuses, and deductions based on attendance.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <Label>Month</Label>
                        <select className="border p-2 rounded-md" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label>Year</Label>
                        <select className="border p-2 rounded-md" value={year} onChange={e => setYear(parseInt(e.target.value))}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        Payroll Roster - {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff Name</TableHead>
                                    <TableHead>Attendance (Days)</TableHead>
                                    <TableHead>Total Hours</TableHead>
                                    <TableHead>Payroll Status</TableHead>
                                    <TableHead>Net Payout</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roster.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center text-slate-500">No staff members found.</TableCell></TableRow>
                                ) : (
                                    roster.map(staff => (
                                        <TableRow key={staff.id}>
                                            <TableCell className="font-medium">
                                                {staff.name}<br/>
                                                <span className="text-xs text-slate-500 font-normal">{staff.email}</span>
                                            </TableCell>
                                            <TableCell>{staff.daysPresent} days</TableCell>
                                            <TableCell>{staff.totalHours} hrs</TableCell>
                                            <TableCell>
                                                {staff.payrollStatus === 'PAID' && <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Paid</Badge>}
                                                {staff.payrollStatus === 'PENDING' && <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>}
                                                {staff.payrollStatus === 'UNPROCESSED' && <Badge variant="outline" className="text-slate-500">Unprocessed</Badge>}
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-700">
                                                ₹{staff.netAmount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {staff.payrollStatus === 'PAID' ? (
                                                    <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200">
                                                        <Download className="w-4 h-4 mr-2" /> Payslip
                                                    </Button>
                                                ) : (
                                                    <Dialog open={isDialogOpen && selectedStaff?.id === staff.id} onOpenChange={(open) => {
                                                        if (open) {
                                                            setSelectedStaff(staff)
                                                            setBaseSalary(0)
                                                            setBonus(0)
                                                            setDeductions(0)
                                                        }
                                                        setIsDialogOpen(open)
                                                    }}>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" className="bg-indigo-600">
                                                                <Calculator className="w-4 h-4 mr-2" /> Process
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Process Payroll - {staff.name}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="flex justify-between bg-slate-50 p-3 rounded-md text-sm">
                                                                    <span>Days Present: {staff.daysPresent}</span>
                                                                    <span>Total Hours: {staff.totalHours} hrs</span>
                                                                </div>
                                                                
                                                                <div className="space-y-2">
                                                                    <Label>Base Salary (₹)</Label>
                                                                    <Input type="number" value={baseSalary} onChange={e => setBaseSalary(parseFloat(e.target.value))} />
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Bonus/Allowances (₹)</Label>
                                                                        <Input type="number" value={bonus} onChange={e => setBonus(parseFloat(e.target.value))} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Deductions (₹)</Label>
                                                                        <Input type="number" value={deductions} onChange={e => setDeductions(parseFloat(e.target.value))} />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex justify-between items-center p-4 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 mt-4">
                                                                    <span className="font-semibold text-lg">Net Amount:</span>
                                                                    <span className="font-bold text-2xl">₹{netAmount.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                                                <Button onClick={processPayroll} disabled={isProcessing} className="bg-indigo-600">
                                                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                                                    Save & Generate Slip
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
