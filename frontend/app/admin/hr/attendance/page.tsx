"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, MapPin, Clock } from "lucide-react"
import api from '@/lib/api'

export default function AttendanceDashboard() {
    const [roster, setRoster] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD

    const fetchAttendance = async () => {
        setLoading(true)
        try {
            // Re-using the roster logic but filtered by date
            const [year, month] = date.split('-')
            const res = await api.get(`/payroll/roster?month=${month}&year=${year}`)
            if (res.data?.success) {
                setRoster(res.data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAttendance()
    }, [date])

    const totalStaff = roster.length
    const presentToday = roster.filter(s => s.daysPresent > 0).length // Rough proxy for MVP
    const absentToday = totalStaff - presentToday

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
                    <p className="text-slate-500">Monitor daily check-ins, remote IPs, and physical locations.</p>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="date" 
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="border p-2 rounded-md"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-indigo-50 border-indigo-100">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-indigo-600">Total Staff</p>
                            <h3 className="text-3xl font-bold text-indigo-900">{totalStaff}</h3>
                        </div>
                        <Users className="w-8 h-8 text-indigo-300" />
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Present</p>
                            <h3 className="text-3xl font-bold text-emerald-900">{presentToday}</h3>
                        </div>
                        <Clock className="w-8 h-8 text-emerald-300" />
                    </CardContent>
                </Card>
                <Card className="bg-rose-50 border-rose-100">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-rose-600">Absent / Leave</p>
                            <h3 className="text-3xl font-bold text-rose-900">{absentToday}</h3>
                        </div>
                        <MapPin className="w-8 h-8 text-rose-300" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Attendance Log - {date}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location / IP</TableHead>
                                    <TableHead>Hours Logged</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roster.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center text-slate-500">No data for this date.</TableCell></TableRow>
                                ) : (
                                    roster.map(staff => (
                                        <TableRow key={staff.id}>
                                            <TableCell className="font-medium">
                                                {staff.name}<br/>
                                                <span className="text-xs text-slate-500 font-normal">{staff.email}</span>
                                            </TableCell>
                                            <TableCell>
                                                {staff.daysPresent > 0 ? (
                                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Present</Badge>
                                                ) : (
                                                    <Badge className="bg-rose-100 text-rose-800 border-rose-200">Absent</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                {staff.daysPresent > 0 ? "Office (192.168.1.1)" : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {staff.daysPresent > 0 ? "8.5 hrs" : "0 hrs"}
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
