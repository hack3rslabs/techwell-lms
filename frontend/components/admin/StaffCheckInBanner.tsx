"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { format, differenceInSeconds } from 'date-fns'

interface AttendanceStatus {
    id: string;
    checkInTime: string;
    checkOutTime: string | null;
    totalHours: number | null;
}

export function StaffCheckInBanner() {
    const { user } = useAuth()
    const [attendance, setAttendance] = useState<AttendanceStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    const SHIFT_HOURS = 9
    const TARGET_SECONDS = SHIFT_HOURS * 3600

    async function fetchTodayAttendance() {
        try {
            const res = await api.get('/staff/attendance/today')
            setAttendance(res.data)
            if (res.data && !res.data.checkOutTime) {
                setElapsedSeconds(differenceInSeconds(new Date(), new Date(res.data.checkInTime)))
            } else if (res.data && res.data.totalHours) {
                setElapsedSeconds(Math.floor(res.data.totalHours * 3600))
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error)
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        if (user && ['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            fetchTodayAttendance()
        }
    }, [user])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (attendance && !attendance.checkOutTime) {
            interval = setInterval(() => {
                const diff = differenceInSeconds(new Date(), new Date(attendance.checkInTime))
                setElapsedSeconds(diff)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [attendance])


    const handleCheckIn = async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await api.post('/staff/attendance/check-in', {
                        location: `${position.coords.latitude},${position.coords.longitude}`
                    })
                    setAttendance(res.data.attendance)
                    toast.success('Checked in successfully!')
                } catch (error: any) {
                    toast.error(error.response?.data?.error || 'Failed to check in')
                }
            },
            (error) => {
                toast.error('Location access is required for check-in')
            }
        )
    }

    const handleCheckOut = async () => {
        try {
            const res = await api.post('/staff/attendance/check-out')
            setAttendance(res.data.attendance)
            toast.success('Checked out successfully!')
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to check out')
        }
    }

    const formatTime = (totalSeconds: number) => {
        if (totalSeconds < 0) return '0h 0m'
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        return `${h}h ${m}m`
    }

    if (isLoading || !user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        return null; // Only show for staff
    }

    const isCheckedIn = !!attendance;
    const isCheckedOut = isCheckedIn && !!attendance.checkOutTime;

    const pendingSeconds = TARGET_SECONDS - elapsedSeconds;
    const isOvertime = pendingSeconds < 0;

    return (
        <Card className={`mb-8 border-2 shadow-sm ${!isCheckedIn ? 'border-red-400 bg-red-50' : isCheckedOut ? 'border-green-400 bg-green-50' : 'border-indigo-400 bg-indigo-50'}`}>
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {!isCheckedIn ? (
                        <div className="p-3 bg-red-100 text-red-600 rounded-full">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                    ) : isCheckedOut ? (
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    ) : (
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full animate-pulse">
                            <Clock className="h-6 w-6" />
                        </div>
                    )}
                    <div>
                        <h3 className={`font-bold text-lg ${!isCheckedIn ? 'text-red-700' : isCheckedOut ? 'text-green-700' : 'text-indigo-700'}`}>
                            {!isCheckedIn ? 'Attendance Required' : isCheckedOut ? 'Shift Completed' : 'Currently Checked In'}
                        </h3>
                        <p className="text-sm text-slate-600">
                            {isCheckedIn ? `Checked in at ${format(new Date(attendance.checkInTime), 'hh:mm a')}` : 'Please check in to start your shift and access your tasks.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                    {/* Timer Stats */}
                    {isCheckedIn && (
                        <div className="flex gap-4 items-center">
                            <div className="text-center">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Worked</p>
                                <p className={`text-xl font-black ${isOvertime ? 'text-orange-600' : 'text-slate-800'}`}>{formatTime(elapsedSeconds)}</p>
                            </div>
                            <div className="h-8 w-px bg-slate-300"></div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending</p>
                                <p className="text-xl font-black text-slate-800">
                                    {isOvertime ? `+${formatTime(Math.abs(pendingSeconds))} (OT)` : formatTime(pendingSeconds)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {!isCheckedIn ? (
                        <Button onClick={handleCheckIn} className="bg-red-600 hover:bg-red-700 text-white shadow-lg shrink-0">
                            <MapPin className="mr-2 h-4 w-4" /> Check In Now
                        </Button>
                    ) : !isCheckedOut ? (
                        <Button onClick={handleCheckOut} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 shrink-0">
                            <LogOut className="mr-2 h-4 w-4" /> Check Out
                        </Button>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    )
}
